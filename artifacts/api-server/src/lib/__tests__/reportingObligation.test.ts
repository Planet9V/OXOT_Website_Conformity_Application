/**
 * Article 14 reporting as an obligation status.
 *
 * Acceptance criterion: a filing is evidenced by the append-only submission
 * ledger, not by a checkbox, and "no incidents" never reads as "compliant".
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import {
  assessReportingObligation,
  type IncidentForObligation,
  type SubmissionForObligation,
} from "../reportingObligation";

const NOW = new Date("2026-08-15T12:00:00Z");

function incident(over: Partial<IncidentForObligation> = {}): IncidentForObligation {
  return {
    id: 1,
    title: "Actively exploited RCE in the update agent",
    kind: "exploited_vulnerability",
    status: "open",
    earlyWarningDueAt: "2026-08-10T00:00:00Z",
    earlyWarningDoneAt: null,
    notificationDueAt: "2026-08-12T00:00:00Z",
    notificationDoneAt: null,
    finalReportDueAt: "2026-08-30T00:00:00Z",
    finalReportDoneAt: null,
    ...over,
  };
}

function sub(stage: string, incidentId = 1, reference = "SRP-2026-0001"): SubmissionForObligation {
  return { incidentId, stage, reference };
}

describe("when nothing has happened", () => {
  /**
   * The distinction that matters. "Met" here would tell a reader the
   * organisation is discharging a duty it has never been called on to discharge.
   */
  it("reports that the duty is not engaged, never that it is met", () => {
    const r = assessReportingObligation([], [], NOW);
    expect(r.status).toBe("no_reportable_events");
    expect(r.message).toMatch(/has not been engaged/);
    expect(r.message).toMatch(/not a finding that the duty has been met/);
  });
});

describe("evidence comes from the submission ledger", () => {
  it("is met when every stage has a submission", () => {
    const r = assessReportingObligation(
      [incident()],
      [sub("early_warning"), sub("notification"), sub("final_report")],
      NOW,
    );
    expect(r.status).toBe("met");
    expect(r.overdueCount).toBe(0);
  });

  it("is not met when a stage is past its deadline and unfiled", () => {
    const r = assessReportingObligation([incident()], [sub("early_warning")], NOW);
    expect(r.status).toBe("not_met");
    // Notification was due 2026-08-12; final report is not due until 08-30.
    expect(r.overdueCount).toBe(1);
    expect(r.message).toMatch(/past the statutory deadline/);
  });

  it("is in progress when reports are outstanding but none is late", () => {
    const r = assessReportingObligation(
      [incident()],
      [sub("early_warning"), sub("notification")],
      NOW,
    );
    expect(r.status).toBe("in_progress");
    expect(r.message).toMatch(/none has passed its statutory deadline/);
  });

  /**
   * The case the whole module exists for: the workbench says the report went
   * out, but nothing was ever filed. Previously this read as compliant.
   */
  it("does not accept a workbench checkbox as proof of filing", () => {
    const r = assessReportingObligation(
      [incident({ earlyWarningDoneAt: "2026-08-09T10:00:00Z" })],
      [],
      NOW,
    );
    expect(r.status).toBe("not_met");
    expect(r.unevidencedCount).toBeGreaterThan(0);
    expect(r.message).toMatch(/no submission recorded on the ledger/);
    const ew = r.findings.find((f) => f.stage === "early_warning")!;
    expect(ew.claimedButUnevidenced).toBe(true);
    expect(ew.filed).toBe(false);
  });

  it("carries the authority's reference through for each filed stage", () => {
    const r = assessReportingObligation(
      [incident()],
      [sub("early_warning", 1, "CSIRT-NL-2026-4417")],
      NOW,
    );
    expect(r.findings.find((f) => f.stage === "early_warning")!.reference).toBe(
      "CSIRT-NL-2026-4417",
    );
  });
});

describe("closed incidents", () => {
  it("stop accruing overdue findings once resolved", () => {
    const r = assessReportingObligation([incident({ status: "resolved" })], [], NOW);
    expect(r.overdueCount).toBe(0);
    expect(r.status).toBe("in_progress");
  });
});

describe("multiple incidents", () => {
  it("aggregates across them and keeps each finding attributable", () => {
    const r = assessReportingObligation(
      [incident(), incident({ id: 2, title: "Severe incident in telemetry", kind: "severe_incident" })],
      [sub("early_warning", 1), sub("notification", 1), sub("final_report", 1)],
      NOW,
    );
    expect(r.incidentCount).toBe(2);
    expect(r.status).toBe("not_met");
    expect(r.findings.filter((f) => f.incidentId === 2 && f.overdue)).toHaveLength(2);
    expect(r.findings.every((f) => f.incidentTitle.length > 0)).toBe(true);
  });
});
