/**
 * NIS2 Article 23(4) — the staged reporting clocks for a significant
 * incident, as the Directive writes them:
 *
 *   (a) an early warning within 24 hours of becoming aware;
 *   (b) an incident notification within 72 hours of becoming aware;
 *   (d) a final report not later than ONE MONTH AFTER THE SUBMISSION OF THE
 *       INCIDENT NOTIFICATION under point (b).
 *
 * The final-report anchor is the trap: it runs from the (b) SUBMISSION, not
 * from awareness — so before the notification is submitted there is no
 * final-report deadline at all, and this module returns null rather than
 * inventing one. (Contrast CRA Art. 14, whose final report runs from the
 * availability of a corrective measure — a different anchor again.)
 *
 * "One month" is a calendar month, computed by month arithmetic, not 30
 * days. Which CSIRT or competent authority receives the reports depends on
 * the Member State transposition (W2.4, deferred) — this module computes
 * clocks, never destinations.
 */

export interface EntityIncidentClockInput {
  /** When the entity became aware of the significant incident (ISO). */
  awareAt: string;
  earlyWarningAt?: string | null;
  notificationAt?: string | null;
  finalReportAt?: string | null;
}

export interface StageClock {
  stage: "early_warning" | "notification" | "final_report";
  citation: string;
  dueAt: string | null;
  doneAt: string | null;
  state: "met" | "overdue" | "pending" | "not_yet_running";
  message: string;
}

const HOUR = 3600_000;

function addMonth(iso: string): string {
  const d = new Date(iso);
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + 1);
  // Month arithmetic overflow (e.g. 31 Jan + 1 month) clamps to month end.
  if (d.getUTCDate() < day) d.setUTCDate(0);
  return d.toISOString();
}

function clock(
  stage: StageClock["stage"],
  citation: string,
  dueAt: string | null,
  doneAt: string | null,
  now: Date,
  notRunningMessage?: string,
): StageClock {
  if (doneAt) {
    const late = dueAt !== null && Date.parse(doneAt) > Date.parse(dueAt);
    return {
      stage,
      citation,
      dueAt,
      doneAt,
      state: "met",
      message: late ? `Submitted, but after the deadline (${dueAt}).` : "Submitted within the deadline.",
    };
  }
  if (dueAt === null) {
    return {
      stage,
      citation,
      dueAt: null,
      doneAt: null,
      state: "not_yet_running",
      message: notRunningMessage ?? "The clock has not started.",
    };
  }
  const overdue = now.getTime() > Date.parse(dueAt);
  return {
    stage,
    citation,
    dueAt,
    doneAt: null,
    state: overdue ? "overdue" : "pending",
    message: overdue ? `Overdue since ${dueAt}.` : `Due by ${dueAt}.`,
  };
}

export function assessEntityIncident(input: EntityIncidentClockInput, now: Date): {
  stages: StageClock[];
  overdueCount: number;
} {
  const aware = Date.parse(input.awareAt);
  const earlyDue = new Date(aware + 24 * HOUR).toISOString();
  const notifDue = new Date(aware + 72 * HOUR).toISOString();

  const early = clock("early_warning", "NIS2 Art. 23(4)(a)", earlyDue, input.earlyWarningAt ?? null, now);
  const notif = clock("notification", "NIS2 Art. 23(4)(b)", notifDue, input.notificationAt ?? null, now);

  // The final report's clock starts only when the notification is submitted.
  const finalDue = input.notificationAt ? addMonth(input.notificationAt) : null;
  const final = clock(
    "final_report",
    "NIS2 Art. 23(4)(d)",
    finalDue,
    input.finalReportAt ?? null,
    now,
    "Not yet running: NIS2 Art. 23(4)(d) anchors the one-month final-report period on the SUBMISSION of the incident notification, which has not been submitted.",
  );

  const stages = [early, notif, final];
  return { stages, overdueCount: stages.filter((s) => s.state === "overdue").length };
}
