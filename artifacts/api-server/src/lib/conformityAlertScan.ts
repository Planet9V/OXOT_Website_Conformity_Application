import {
  db,
  conformityIncidentsTable,
  conformityAssessmentsTable,
  conformityProductsTable,
  conformityAlertStateTable,
} from "@workspace/db";
import { and, eq, lt, notInArray } from "drizzle-orm";
import {
  getConformityAlertsConfig,
  getAlertRecipient,
  recordIntegrationEvent,
} from "./integrationSettings";
import { sendEmail, isMailConfigured } from "./mailer";
import { absoluteWebUrl } from "./publicUrl";
import { logger } from "./logger";
import {
  planIncidentAlerts,
  summarizeForDigest,
  digestKeyFor,
  buildAlertEmail,
  buildDigestEmail,
  clampLeadTimeHours,
  clampReminderIntervalHours,
  clampMaxReminders,
  type IncidentForAlerts,
} from "./conformityAlerts";

/**
 * CRA deadline alert scan orchestrator.
 *
 * Safely re-runnable: each logical alert is claimed in `conformity_alert_state`
 * (INSERT .. ON CONFLICT DO NOTHING) BEFORE sending, so overlapping or repeated
 * runs never double-send. A failed send releases its claim so the next run
 * retries, and stale undelivered claims (crashed runs) are reclaimed after
 * STALE_CLAIM_MS. Shared by the admin "run now" endpoint, the in-process dev
 * timer, and the standalone production script.
 */

export interface AlertScanResult {
  ranAt: string;
  enabled: boolean;
  emailConfigured: boolean;
  incidentsChecked: number;
  alertsSent: number;
  alertsFailed: number;
  digestSent: boolean;
}

async function loadOpenIncidents(): Promise<IncidentForAlerts[]> {
  return db
    .select({
      id: conformityIncidentsTable.id,
      title: conformityIncidentsTable.title,
      kind: conformityIncidentsTable.kind,
      severity: conformityIncidentsTable.severity,
      status: conformityIncidentsTable.status,
      assessmentId: conformityIncidentsTable.assessmentId,
      productName: conformityProductsTable.name,
      earlyWarningDueAt: conformityIncidentsTable.earlyWarningDueAt,
      earlyWarningDoneAt: conformityIncidentsTable.earlyWarningDoneAt,
      notificationDueAt: conformityIncidentsTable.notificationDueAt,
      notificationDoneAt: conformityIncidentsTable.notificationDoneAt,
      finalReportDueAt: conformityIncidentsTable.finalReportDueAt,
      finalReportDoneAt: conformityIncidentsTable.finalReportDoneAt,
    })
    .from(conformityIncidentsTable)
    .innerJoin(
      conformityAssessmentsTable,
      eq(conformityIncidentsTable.assessmentId, conformityAssessmentsTable.id),
    )
    .innerJoin(
      conformityProductsTable,
      eq(conformityAssessmentsTable.productId, conformityProductsTable.id),
    )
    .where(notInArray(conformityIncidentsTable.status, ["resolved", "closed"]));
}

/**
 * A crash between claiming a key and recording the send outcome leaves a
 * delivered=false row behind; without recovery it would suppress that alert
 * forever. Undelivered claims older than this (wall-clock age — sends finish
 * in seconds) are treated as crashed and taken over by the next scan.
 */
const STALE_CLAIM_MS = 15 * 60 * 1000;

/**
 * Claim a dedupe key. Returns the claim row id, or null if already claimed.
 *
 * If the key is held by a stale undelivered claim (crashed earlier run), take
 * it over: the conditional UPDATE is atomic under READ COMMITTED — concurrent
 * scanners re-check `createdAt < cutoff` after the row lock, so exactly one
 * wins. A FRESH undelivered claim means another run is mid-send; leave it.
 */
async function claimAlertKey(alertKey: string, incidentId: number | null): Promise<number | null> {
  let rows: { id: number }[];
  try {
    rows = await db
      .insert(conformityAlertStateTable)
      .values({ alertKey, incidentId })
      .onConflictDoNothing({ target: conformityAlertStateTable.alertKey })
      .returning({ id: conformityAlertStateTable.id });
  } catch (err) {
    // The incident was deleted between the scan's read and this claim (FK
    // 23503). The alert is moot — skip it rather than aborting the whole scan.
    const code = (err as { cause?: { code?: string }; code?: string }).cause?.code ?? (err as { code?: string }).code;
    if (code === "23503") return null;
    throw err;
  }
  if (rows[0]) return rows[0].id;

  const wallNow = Date.now(); // staleness is real elapsed time, not the scan's logical clock
  const reclaimed = await db
    .update(conformityAlertStateTable)
    .set({ createdAt: new Date(wallNow) })
    .where(
      and(
        eq(conformityAlertStateTable.alertKey, alertKey),
        eq(conformityAlertStateTable.delivered, false),
        lt(conformityAlertStateTable.createdAt, new Date(wallNow - STALE_CLAIM_MS)),
      ),
    )
    .returning({ id: conformityAlertStateTable.id });
  if (reclaimed[0]) {
    logger.warn(
      { alertKey },
      "Reclaimed stale undelivered alert claim (previous run likely crashed mid-send)",
    );
    return reclaimed[0].id;
  }
  return null;
}

async function markClaimDelivered(claimId: number, detail: string): Promise<void> {
  await db
    .update(conformityAlertStateTable)
    .set({ delivered: true, detail: detail.slice(0, 500) })
    .where(eq(conformityAlertStateTable.id, claimId));
}

/** Release a claim after a failed send so the next scan retries it. */
async function releaseClaim(claimId: number): Promise<void> {
  await db.delete(conformityAlertStateTable).where(eq(conformityAlertStateTable.id, claimId));
}

export async function runConformityAlertScan(now: number = Date.now()): Promise<AlertScanResult> {
  const result: AlertScanResult = {
    ranAt: new Date(now).toISOString(),
    enabled: false,
    emailConfigured: false,
    incidentsChecked: 0,
    alertsSent: 0,
    alertsFailed: 0,
    digestSent: false,
  };

  const cfg = await getConformityAlertsConfig();
  if (!cfg.enabled) return result;
  result.enabled = true;

  const recipient = cfg.recipient?.trim() || (await getAlertRecipient());
  const mailReady = await isMailConfigured();
  result.emailConfigured = Boolean(mailReady && recipient);
  if (!result.emailConfigured || !recipient) {
    // Don't claim dedupe keys while nothing can be sent — pending alerts fire
    // once email becomes configured instead of being burned silently.
    logger.warn("Conformity alerts enabled but email/recipient not configured; skipping scan");
    return result;
  }

  const incidents = await loadOpenIncidents();
  result.incidentsChecked = incidents.length;

  const leadTimeMs = clampLeadTimeHours(cfg.leadTimeHours) * 60 * 60 * 1000;
  const reminderPolicy = {
    reminderIntervalMs: clampReminderIntervalHours(cfg.reminderIntervalHours) * 60 * 60 * 1000,
    maxReminders: clampMaxReminders(cfg.maxReminders),
  };
  const planned = incidents.flatMap((incident) =>
    planIncidentAlerts(incident, now, leadTimeMs, reminderPolicy),
  );

  for (const alert of planned) {
    const claimId = await claimAlertKey(alert.alertKey, alert.incidentId);
    if (claimId == null) continue; // already alerted (or another run owns it)
    const link = absoluteWebUrl(`/conformity/assessments/${alert.incident.assessmentId}`);
    const { subject, html } = buildAlertEmail(alert, now, link);
    const sent = await sendEmail({ to: recipient, subject, html });
    if (sent.delivered) {
      result.alertsSent++;
      await markClaimDelivered(claimId, subject);
      void recordIntegrationEvent({
        integration: "email",
        kind: "conformity_alert",
        success: true,
        detail: `${alert.alertKey} → ${recipient}`,
      });
    } else {
      result.alertsFailed++;
      await releaseClaim(claimId);
      void recordIntegrationEvent({
        integration: "email",
        kind: "conformity_alert",
        success: false,
        detail: `${alert.alertKey}: ${sent.error ?? "not delivered"}`,
      });
    }
  }

  if (cfg.digestEnabled) {
    const items = summarizeForDigest(incidents, now);
    if (items.length > 0) {
      const digestKey = digestKeyFor(now);
      const claimId = await claimAlertKey(digestKey, null);
      if (claimId != null) {
        const { subject, html } = buildDigestEmail(items, now, absoluteWebUrl("/conformity"));
        const sent = await sendEmail({ to: recipient, subject, html });
        if (sent.delivered) {
          result.digestSent = true;
          await markClaimDelivered(claimId, subject);
          void recordIntegrationEvent({
            integration: "email",
            kind: "conformity_digest",
            success: true,
            detail: `${digestKey} → ${recipient}`,
          });
        } else {
          result.alertsFailed++;
          await releaseClaim(claimId);
          void recordIntegrationEvent({
            integration: "email",
            kind: "conformity_digest",
            success: false,
            detail: `${digestKey}: ${sent.error ?? "not delivered"}`,
          });
        }
      }
    }
  }

  return result;
}
