/**
 * Article 14 as an OBLIGATION STATUS, not just a set of clocks.
 *
 * The incident workbench already tracks the three stages and their deadlines
 * correctly, including the two different final-report anchors (14 days after a
 * corrective or mitigating measure is available for a vulnerability under
 * 14(2)(c); one month after the notification was submitted for an incident
 * under 14(4)(c)). What it did not do was feed that back into "how are we doing
 * on Article 14?" — the obligation carried whatever status somebody had typed
 * into an evaluation row, which could say "met" while a 24-hour early warning
 * sat unfiled and overdue.
 *
 * The one judgement worth being careful about: what to report when there are no
 * incidents at all. "Met" would be a false assurance — Art. 14 has not been
 * satisfied, it has not been ENGAGED, and the difference matters to anyone
 * reading a compliance view. It also cannot be "not met", which would imply a
 * breach that has not occurred. It gets its own status.
 *
 * A stage counts as filed only where the append-only submission ledger has a row
 * for it. A *DoneAt timestamp on the incident is an internal state change — the
 * workbench saying "we did this" — whereas a submission row records the actual
 * filing, its channel and the authority's reference. Where the two disagree the
 * ledger wins, and the discrepancy is reported rather than hidden.
 */

export type ReportingStage = "early_warning" | "notification" | "final_report";

export type ReportingObligationStatus =
  | "no_reportable_events"
  | "met"
  | "in_progress"
  | "not_met";

export interface IncidentForObligation {
  id: number;
  title: string;
  kind: string;
  status: string;
  earlyWarningDueAt: Date | string;
  earlyWarningDoneAt: Date | string | null;
  notificationDueAt: Date | string;
  notificationDoneAt: Date | string | null;
  finalReportDueAt: Date | string;
  finalReportDoneAt: Date | string | null;
}

export interface SubmissionForObligation {
  incidentId: number;
  stage: string;
  reference: string;
}

export interface StageFinding {
  incidentId: number;
  incidentTitle: string;
  stage: ReportingStage;
  dueAt: string;
  filed: boolean;
  overdue: boolean;
  /** Marked done in the workbench but with no submission on the ledger. */
  claimedButUnevidenced: boolean;
  reference: string;
}

export interface ReportingObligationAssessment {
  status: ReportingObligationStatus;
  citation: string;
  incidentCount: number;
  overdueCount: number;
  unevidencedCount: number;
  findings: StageFinding[];
  message: string;
}

const STAGES: ReportingStage[] = ["early_warning", "notification", "final_report"];

function toIso(v: Date | string | null | undefined): string | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Stages stop mattering once the incident is closed out. */
const CLOSED = ["resolved", "closed"];

export function assessReportingObligation(
  incidents: IncidentForObligation[],
  submissions: SubmissionForObligation[],
  now: Date,
): ReportingObligationAssessment {
  if (!incidents.length) {
    return {
      status: "no_reportable_events",
      citation: "Article 14",
      incidentCount: 0,
      overdueCount: 0,
      unevidencedCount: 0,
      findings: [],
      message:
        "No actively exploited vulnerability or severe incident has been recorded, so the Article 14 reporting duty has not been engaged. This is not a finding that the duty has been met.",
    };
  }

  const filed = new Set(submissions.map((s) => `${s.incidentId}::${s.stage}`));
  const referenceFor = new Map(
    submissions.map((s) => [`${s.incidentId}::${s.stage}`, s.reference]),
  );

  const findings: StageFinding[] = [];
  for (const incident of incidents) {
    const due: Record<ReportingStage, string | null> = {
      early_warning: toIso(incident.earlyWarningDueAt),
      notification: toIso(incident.notificationDueAt),
      final_report: toIso(incident.finalReportDueAt),
    };
    const done: Record<ReportingStage, string | null> = {
      early_warning: toIso(incident.earlyWarningDoneAt),
      notification: toIso(incident.notificationDoneAt),
      final_report: toIso(incident.finalReportDoneAt),
    };

    for (const stage of STAGES) {
      const key = `${incident.id}::${stage}`;
      const hasSubmission = filed.has(key);
      const dueAt = due[stage];
      const isOverdue =
        !hasSubmission &&
        dueAt !== null &&
        new Date(dueAt).getTime() < now.getTime() &&
        !CLOSED.includes(incident.status);

      findings.push({
        incidentId: incident.id,
        incidentTitle: incident.title,
        stage,
        dueAt: dueAt ?? "",
        filed: hasSubmission,
        overdue: isOverdue,
        claimedButUnevidenced: !hasSubmission && done[stage] !== null,
        reference: referenceFor.get(key) ?? "",
      });
    }
  }

  const overdueCount = findings.filter((f) => f.overdue).length;
  const unevidencedCount = findings.filter((f) => f.claimedButUnevidenced).length;
  const allFiled = findings.every((f) => f.filed);

  const status: ReportingObligationStatus = overdueCount
    ? "not_met"
    : allFiled
      ? "met"
      : "in_progress";

  const parts: string[] = [];
  if (overdueCount) {
    parts.push(
      `${overdueCount} Article 14 report${overdueCount === 1 ? " is" : "s are"} past the statutory deadline and not filed.`,
    );
  }
  if (unevidencedCount) {
    parts.push(
      `${unevidencedCount} stage${unevidencedCount === 1 ? " is" : "s are"} marked done in the workbench with no submission recorded on the ledger — the filing itself is not evidenced.`,
    );
  }
  if (!parts.length) {
    parts.push(
      allFiled
        ? "Every Article 14 report due for the recorded events has been filed and evidenced by a submission reference."
        : "Reports are outstanding but none has passed its statutory deadline.",
    );
  }

  return {
    status,
    citation: "Article 14",
    incidentCount: incidents.length,
    overdueCount,
    unevidencedCount,
    findings,
    message: parts.join(" "),
  };
}
