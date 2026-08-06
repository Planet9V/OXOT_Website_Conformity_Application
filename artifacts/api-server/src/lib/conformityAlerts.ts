/**
 * Pure planning logic for CRA incident deadline alert emails.
 *
 * No I/O here: given incidents + "now", decide which alerts are due and build
 * the email content. The scan orchestrator (conformityAlertScan.ts) owns
 * claiming dedupe keys and actually sending. Keeping this pure makes the
 * clock-boundary rules unit-testable without a database or mailer.
 */

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Digest "due soon" window — mirrors the command-center rollup (14 days). */
export const DUE_SOON_MS = 14 * DAY_MS;

export const DEFAULT_LEAD_TIME_HOURS = 6;
export const MIN_LEAD_TIME_HOURS = 1;
export const MAX_LEAD_TIME_HOURS = 168;

export const DEFAULT_REMINDER_INTERVAL_HOURS = 24;
export const MIN_REMINDER_INTERVAL_HOURS = 1;
export const MAX_REMINDER_INTERVAL_HOURS = 168;

export const DEFAULT_MAX_REMINDERS = 5;
export const MIN_MAX_REMINDERS = 0; // 0 = reminders off (breach email only)
export const MAX_MAX_REMINDERS = 30;

// Incident statuses that no longer need alerts (mirror portfolioRollup).
const CLOSED_INCIDENT_STATUSES = ["resolved", "closed"];

export type AlertStage = "early_warning" | "notification" | "final_report";
export type AlertPhase = "approaching" | "breached";

export const STAGE_LABELS: Record<AlertStage, string> = {
  early_warning: "24-hour early warning",
  notification: "72-hour notification",
  final_report: "final report",
};

export const TRACK_LABELS: Record<string, string> = {
  exploited_vulnerability: "Actively exploited vulnerability",
  severe_incident: "Severe incident",
};

export function trackLabelFor(kind: string): string {
  return TRACK_LABELS[kind] ?? TRACK_LABELS.exploited_vulnerability!;
}

/**
 * Stage label, track-aware for the final report: its statutory anchor differs
 * per Art 14 track (14 days after fix available vs 1 month after notification).
 */
export function stageLabelFor(stage: AlertStage, kind: string): string {
  if (stage !== "final_report") return STAGE_LABELS[stage];
  return kind === "severe_incident"
    ? "final report (1 month after notification)"
    : "final report (14 days after corrective measure available)";
}

/** Minimal structural view of an incident row (+ product name for context). */
export interface IncidentForAlerts {
  id: number;
  title: string;
  kind: string;
  severity: string;
  status: string;
  assessmentId: number;
  productName: string;
  earlyWarningDueAt: Date;
  earlyWarningDoneAt: Date | null;
  notificationDueAt: Date;
  notificationDoneAt: Date | null;
  finalReportDueAt: Date;
  finalReportDoneAt: Date | null;
}

export interface PlannedAlert {
  alertKey: string;
  incidentId: number;
  stage: AlertStage;
  phase: AlertPhase;
  dueAt: Date;
  incident: IncidentForAlerts;
  /**
   * null for the initial approaching/breached alert; n >= 1 for the n-th
   * repeat "still overdue" reminder of a breached stage.
   */
  reminderNumber: number | null;
}

export function clampLeadTimeHours(hours: number | undefined): number {
  if (typeof hours !== "number" || !Number.isFinite(hours)) return DEFAULT_LEAD_TIME_HOURS;
  return Math.min(MAX_LEAD_TIME_HOURS, Math.max(MIN_LEAD_TIME_HOURS, Math.trunc(hours)));
}

export function clampReminderIntervalHours(hours: number | undefined): number {
  if (typeof hours !== "number" || !Number.isFinite(hours)) return DEFAULT_REMINDER_INTERVAL_HOURS;
  return Math.min(
    MAX_REMINDER_INTERVAL_HOURS,
    Math.max(MIN_REMINDER_INTERVAL_HOURS, Math.trunc(hours)),
  );
}

export function clampMaxReminders(count: number | undefined): number {
  if (typeof count !== "number" || !Number.isFinite(count)) return DEFAULT_MAX_REMINDERS;
  return Math.min(MAX_MAX_REMINDERS, Math.max(MIN_MAX_REMINDERS, Math.trunc(count)));
}

export function isClosedIncidentStatus(status: string): boolean {
  return CLOSED_INCIDENT_STATUSES.includes(status);
}

function pendingStages(incident: IncidentForAlerts): { stage: AlertStage; dueAt: Date }[] {
  const all = [
    {
      stage: "early_warning" as const,
      dueAt: incident.earlyWarningDueAt,
      doneAt: incident.earlyWarningDoneAt,
    },
    {
      stage: "notification" as const,
      dueAt: incident.notificationDueAt,
      doneAt: incident.notificationDoneAt,
    },
    {
      stage: "final_report" as const,
      dueAt: incident.finalReportDueAt,
      doneAt: incident.finalReportDoneAt,
    },
  ];
  return all.filter((s) => !s.doneAt).map(({ stage, dueAt }) => ({ stage, dueAt }));
}

/**
 * Delivered breach-family alert keys:
 *   incident:<id>:<stage>:breached
 *   incident:<id>:<stage>:breached:reminder:<n>
 * Shared by the per-assessment alert-history endpoint and the portfolio
 * rollup so their "reminders exhausted" semantics can never drift apart.
 */
export const BREACH_ALERT_KEY_RE =
  /^incident:\d+:(early_warning|notification|final_report):breached(?::reminder:(\d+))?$/;

/**
 * From DELIVERED alert-state rows, compute which incident stages have gone
 * silent: at least one breach-family email reached someone AND the highest
 * delivered reminder number has hit the configured cap — no further nudges
 * will ever fire for that stage. Mirrors the alert-history endpoint's
 * `remindersExhausted` (reminderCount >= maxReminders), including the
 * maxReminders = 0 case (breach email only, then silence).
 *
 * Returns a Set of "<incidentId>:<stage>" keys.
 */
export function exhaustedStageKeys(
  deliveredRows: { incidentId: number | null; alertKey: string }[],
  maxReminders: number,
): Set<string> {
  const highestReminder = new Map<string, number>();
  for (const row of deliveredRows) {
    const m = BREACH_ALERT_KEY_RE.exec(row.alertKey);
    if (!m || row.incidentId == null) continue;
    const key = `${row.incidentId}:${m[1]}`;
    const n = m[2] ? Number(m[2]) : 0;
    highestReminder.set(key, Math.max(highestReminder.get(key) ?? 0, n));
  }
  const out = new Set<string>();
  for (const [key, n] of highestReminder) {
    if (n >= maxReminders) out.add(key);
  }
  return out;
}

export function alertKeyFor(incidentId: number, stage: AlertStage, phase: AlertPhase): string {
  return `incident:${incidentId}:${stage}:${phase}`;
}

export function reminderKeyFor(incidentId: number, stage: AlertStage, n: number): string {
  return `incident:${incidentId}:${stage}:breached:reminder:${n}`;
}

/**
 * Which alerts does this incident need right now?
 *
 * Boundary rule per pending (not-done) stage, delta = dueAt - now:
 *   delta <= 0            → "breached"
 *   0 < delta <= leadTime → "approaching"
 * Every pending stage alerts independently; closed/resolved incidents never
 * alert. "approaching" and "breached" are distinct dedupe keys, so a stage
 * that already warned still escalates once when the deadline passes.
 *
 * Repeat reminders: while a breached stage stays pending, every full
 * `reminderIntervalMs` of overdue time plans ONE additional "still overdue"
 * reminder — the LATEST due one (n = floor(overdue / interval), capped at
 * `maxReminders`). Each n has its own dedupe key (`…:breached:reminder:<n>`),
 * so a scan that runs late sends a single catch-up reminder rather than a
 * backlog, and re-runs never double-send. After the cap, the stage goes quiet.
 */
export interface ReminderPolicy {
  reminderIntervalMs: number;
  maxReminders: number;
}

const DEFAULT_REMINDER_POLICY: ReminderPolicy = {
  reminderIntervalMs: DEFAULT_REMINDER_INTERVAL_HOURS * HOUR_MS,
  maxReminders: DEFAULT_MAX_REMINDERS,
};

export function planIncidentAlerts(
  incident: IncidentForAlerts,
  now: number,
  leadTimeMs: number,
  reminderPolicy: ReminderPolicy = DEFAULT_REMINDER_POLICY,
): PlannedAlert[] {
  if (isClosedIncidentStatus(incident.status)) return [];
  const out: PlannedAlert[] = [];
  for (const { stage, dueAt } of pendingStages(incident)) {
    const delta = dueAt.getTime() - now;
    const phase: AlertPhase | null =
      delta <= 0 ? "breached" : delta <= leadTimeMs ? "approaching" : null;
    if (!phase) continue;
    out.push({
      alertKey: alertKeyFor(incident.id, stage, phase),
      incidentId: incident.id,
      stage,
      phase,
      dueAt,
      incident,
      reminderNumber: null,
    });
    if (phase === "breached" && reminderPolicy.maxReminders > 0) {
      const n = Math.min(
        Math.floor(-delta / reminderPolicy.reminderIntervalMs),
        reminderPolicy.maxReminders,
      );
      if (n >= 1) {
        out.push({
          alertKey: reminderKeyFor(incident.id, stage, n),
          incidentId: incident.id,
          stage,
          phase: "breached",
          dueAt,
          incident,
          reminderNumber: n,
        });
      }
    }
  }
  return out;
}

// ---------- Daily digest ----------

/** One digest per UTC day, regardless of how often the scan runs. */
export function digestKeyFor(now: number): string {
  return `digest:${new Date(now).toISOString().slice(0, 10)}`;
}

export interface DigestItem {
  incident: IncidentForAlerts;
  stage: AlertStage;
  dueAt: Date;
  overdue: boolean;
}

/**
 * Soonest pending stage per open incident, kept when overdue or due within
 * 14 days — the same convention as the command-center rollup, so digest counts
 * match what the admin sees in the app.
 */
export function summarizeForDigest(incidents: IncidentForAlerts[], now: number): DigestItem[] {
  const items: DigestItem[] = [];
  for (const incident of incidents) {
    if (isClosedIncidentStatus(incident.status)) continue;
    const pending = pendingStages(incident);
    if (pending.length === 0) continue;
    const soonest = pending.reduce((a, b) => (a.dueAt.getTime() <= b.dueAt.getTime() ? a : b));
    const delta = soonest.dueAt.getTime() - now;
    if (delta > DUE_SOON_MS) continue;
    items.push({ incident, stage: soonest.stage, dueAt: soonest.dueAt, overdue: delta <= 0 });
  }
  items.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  return items;
}

// ---------- Email content ----------

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatUtc(d: Date): string {
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

/** "overdue by 5h" / "due in 3d" — coarse, for subject lines and summaries. */
export function describeRemaining(dueAt: Date, now: number): string {
  const delta = dueAt.getTime() - now;
  const abs = Math.abs(delta);
  const amount = abs >= DAY_MS ? `${Math.round(abs / DAY_MS)}d` : `${Math.max(1, Math.round(abs / HOUR_MS))}h`;
  return delta <= 0 ? `overdue by ${amount}` : `due in ${amount}`;
}

export function buildAlertEmail(
  alert: PlannedAlert,
  now: number,
  link: string,
): { subject: string; html: string } {
  const { incident, stage, phase, dueAt, reminderNumber } = alert;
  const stageLabel = stageLabelFor(stage, incident.kind);
  const trackLabel = trackLabelFor(incident.kind);
  const subject = reminderNumber
    ? `CRA deadline still overdue (reminder ${reminderNumber}): ${stageLabel} — ${incident.title}`
    : phase === "breached"
      ? `CRA deadline breached: ${stageLabel} — ${incident.title}`
      : `CRA deadline approaching: ${stageLabel} — ${incident.title}`;
  const heading = reminderNumber
    ? `The <strong>${stageLabel}</strong> deadline is <strong>still overdue</strong> (${escapeHtml(describeRemaining(dueAt, now))}) and has not been marked as submitted. This is reminder ${reminderNumber}.`
    : phase === "breached"
      ? `The <strong>${stageLabel}</strong> deadline has been <strong>breached</strong>.`
      : `The <strong>${stageLabel}</strong> deadline is approaching.`;
  const html = `
    <p>${heading}</p>
    <table cellpadding="4" cellspacing="0" border="0">
      <tr><td><strong>Incident</strong></td><td>${escapeHtml(incident.title)}</td></tr>
      <tr><td><strong>Track</strong></td><td>${escapeHtml(trackLabel)}</td></tr>
      <tr><td><strong>Product</strong></td><td>${escapeHtml(incident.productName)}</td></tr>
      <tr><td><strong>Severity</strong></td><td>${escapeHtml(incident.severity)}</td></tr>
      <tr><td><strong>Deadline</strong></td><td>${formatUtc(dueAt)} (${describeRemaining(dueAt, now)})</td></tr>
    </table>
    <p><a href="${escapeHtml(link)}">Open the assessment</a> to record the submission and stop further alerts for this stage.</p>
    <p style="color:#666;font-size:12px">CRA Article 14 reporting clocks — early warning &le; 24h and notification &le; 72h of awareness; final report &le; 14 days after a corrective measure is available (exploited vulnerability) or &le; 1 month after the notification (severe incident).</p>
  `;
  return { subject, html };
}

export function buildDigestEmail(
  items: DigestItem[],
  now: number,
  link: string,
): { subject: string; html: string } {
  const overdue = items.filter((i) => i.overdue).length;
  const dueSoon = items.length - overdue;
  const subject = `CRA deadline digest: ${overdue} overdue, ${dueSoon} due soon`;
  const rows = items
    .map(
      (i) => `
      <tr>
        <td>${escapeHtml(i.incident.title)} <span style="color:#666">(${escapeHtml(trackLabelFor(i.incident.kind))})</span></td>
        <td>${escapeHtml(i.incident.productName)}</td>
        <td>${stageLabelFor(i.stage, i.incident.kind)}</td>
        <td>${i.overdue ? "<strong>overdue</strong>" : "due soon"} — ${formatUtc(i.dueAt)} (${describeRemaining(i.dueAt, now)})</td>
      </tr>`,
    )
    .join("");
  const html = `
    <p>Daily summary of open CRA incident reporting deadlines (${overdue} overdue, ${dueSoon} due within 14 days).</p>
    <table cellpadding="4" cellspacing="0" border="1" style="border-collapse:collapse">
      <tr><th>Incident</th><th>Product</th><th>Next stage</th><th>Status</th></tr>
      ${rows}
    </table>
    <p><a href="${escapeHtml(link)}">Open the conformity workspace</a> for details.</p>
  `;
  return { subject, html };
}
