/**
 * Locks the portfolio rollup to the SAME worklist + journey semantics the
 * conformity client uses per-assessment (next-actions.ts / journey.ts). The
 * server re-implements that pure logic (cross-package sharing is out of scope),
 * so this test is the guard against the two drifting apart. If it fails after a
 * client rule change, the server mirror in ../portfolioRollup.ts must be updated
 * in lockstep — do not "fix" the test to match a silent server regression.
 */
import { describe, it, expect } from "vitest";
import { computePortfolio, type PortfolioInput } from "../portfolioRollup";
import type {
  ConformityProductRow,
  ConformityAssessmentRow,
  ConformityEvaluationRow,
  ConformityIncidentRow,
  ConformityArtifactRow,
  ConformityGradeRow,
  ConformityEvidenceRow,
} from "@workspace/db";

// Fixed clock so overdue / due-soon classification is deterministic.
const NOW = Date.UTC(2026, 0, 15, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;
const at = (days: number) => NOW + days * DAY;
const iso = (ms: number) => new Date(ms).toISOString();

// --- row factories (cast is encapsulated; the rollup only reads a few fields) ---
let seq = 0;
const nextId = () => ++seq;

function product(id: number, name = `Product ${id}`, manufacturerName = `Maker ${id}`): ConformityProductRow {
  return { id, name, manufacturerName } as unknown as ConformityProductRow;
}
function assessment(
  id: number,
  productId: number,
  opts: { regulationKey?: string; scopeResult?: string | null; classKey?: string | null; routeKey?: string | null } = {},
): ConformityAssessmentRow {
  return {
    id,
    productId,
    regulationKey: opts.regulationKey ?? "cra",
    scopeResult: opts.scopeResult ?? null,
    classKey: opts.classKey ?? null,
    routeKey: opts.routeKey ?? null,
  } as unknown as ConformityAssessmentRow;
}
function evaluation(
  assessmentId: number,
  status: string,
  refCode: string,
  riskRating: string | null = "medium",
): ConformityEvaluationRow {
  return { id: nextId(), assessmentId, status, riskRating, requirementRefCode: refCode } as unknown as ConformityEvaluationRow;
}
function incident(
  assessmentId: number,
  opts: {
    status?: string;
    severity?: string;
    title?: string;
    ewDue: number;
    ewDone?: number | null;
    ntDue?: number;
    ntDone?: number | null;
    frDue?: number;
    frDone?: number | null;
  },
): ConformityIncidentRow {
  return {
    id: nextId(),
    assessmentId,
    title: opts.title ?? "Exploited vulnerability",
    severity: opts.severity ?? "high",
    status: opts.status ?? "open",
    earlyWarningDueAt: new Date(opts.ewDue),
    earlyWarningDoneAt: opts.ewDone != null ? new Date(opts.ewDone) : null,
    notificationDueAt: new Date(opts.ntDue ?? at(30)),
    notificationDoneAt: opts.ntDone != null ? new Date(opts.ntDone) : null,
    finalReportDueAt: new Date(opts.frDue ?? at(60)),
    finalReportDoneAt: opts.frDone != null ? new Date(opts.frDone) : null,
  } as unknown as ConformityIncidentRow;
}
function artifact(assessmentId: number, sectionsComplete: boolean[]): ConformityArtifactRow {
  return {
    id: nextId(),
    assessmentId,
    content: {
      sections: sectionsComplete.map((complete, i) => ({ key: `k${i}`, label: `S${i}`, body: "", complete })),
    },
  } as unknown as ConformityArtifactRow;
}
function evidence(assessmentId: number, refCode: string | null): ConformityEvidenceRow {
  return { id: nextId(), assessmentId, requirementRefCode: refCode } as unknown as ConformityEvidenceRow;
}
function grade(
  assessmentId: number,
  overallGrade: string,
  overallScore: number,
  blockerCount: number,
  computedAtMs: number,
): ConformityGradeRow {
  return { id: nextId(), assessmentId, overallGrade, overallScore, blockerCount, computedAt: new Date(computedAtMs) } as unknown as ConformityGradeRow;
}

const byAssessment = (p: ReturnType<typeof computePortfolio>, id: number) =>
  p.products.find((r) => r.assessmentId === id)!;

describe("computePortfolio — five representative assessments", () => {
  // A1 blocked by a not_met requirement.
  // A2 blocked by an OVERDUE statutory incident deadline (reqs otherwise clean).
  // A3 ready for review (all stages done, grade A, no blockers/incidents).
  // A4 not started (nothing captured).
  // A5 in progress (one open low-risk requirement, no blockers).
  const input: PortfolioInput = {
    products: [product(1), product(2), product(3), product(4), product(5)],
    assessments: [
      assessment(1, 1, { scopeResult: "in_scope", classKey: "class-i", routeKey: "self" }),
      assessment(2, 2, { scopeResult: "in_scope", classKey: "class-i", routeKey: "self" }),
      assessment(3, 3, { scopeResult: "in_scope", classKey: "class-i", routeKey: "self" }),
      assessment(4, 4),
      assessment(5, 5, { scopeResult: "in_scope", classKey: "class-i", routeKey: "self" }),
    ],
    evaluations: [
      evaluation(1, "not_met", "A1-R1"),
      evaluation(1, "met", "A1-R2"),
      evaluation(2, "met", "A2-R1"),
      evaluation(2, "met", "A2-R2"),
      evaluation(3, "met", "A3-R1"),
      evaluation(3, "met", "A3-R2"),
      evaluation(5, "in_progress", "A5-R1"),
    ],
    incidents: [
      // Early warning 3 days overdue; later stages pending but NOT the "next"
      // clock, so they must not add a due-soon count (one clock per incident).
      incident(2, { ewDue: at(-3), ntDue: at(10), frDue: at(20) }),
    ],
    artifacts: [artifact(1, [true, false]), artifact(3, [true, true])],
    evidence: [evidence(1, "A1-R2"), evidence(3, "A3-R1")],
    grades: [
      // Older B then newer A for A3 — latest must win.
      grade(3, "B", 82, 0, at(-10)),
      grade(3, "A", 95, 0, at(-1)),
    ],
    deliveredAlerts: [],
    maxReminders: 5,
  };

  const p = computePortfolio(input, NOW);

  it("stamps generatedAt from the injected clock", () => {
    expect(p.generatedAt).toBe(iso(NOW));
  });

  it("buckets each assessment into exactly one readiness state that sums to the total", () => {
    expect(byAssessment(p, 1).readiness).toBe("blocked");
    expect(byAssessment(p, 2).readiness).toBe("blocked");
    expect(byAssessment(p, 3).readiness).toBe("ready");
    expect(byAssessment(p, 4).readiness).toBe("not_started");
    expect(byAssessment(p, 5).readiness).toBe("in_progress");
    expect(p.totals).toEqual({
      products: 5,
      assessments: 5,
      notStarted: 1,
      inProgress: 1,
      blocked: 2,
      readyForReview: 1,
    });
    const sum = p.totals.notStarted + p.totals.inProgress + p.totals.blocked + p.totals.readyForReview;
    expect(sum).toBe(p.totals.assessments);
  });

  it("aggregates risk the same way the per-assessment worklist counts it", () => {
    expect(p.risk).toEqual({
      openBlockers: 1, // A1 not_met
      highRiskGaps: 0,
      openIncidents: 1, // A2
      overdueDeadlines: 1, // A2 early warning
      dueSoonDeadlines: 0, // A2's later stages are not the live clock
      silencedDeadlines: 0, // no delivered breach alerts at all
    });
  });

  it("orders the triage board most-urgent-first and sinks ready below all active work", () => {
    expect(p.products.map((r) => r.assessmentId)).toEqual([2, 1, 5, 4, 3]);
    expect(byAssessment(p, 3).urgencyScore).toBeLessThan(0);
    expect(byAssessment(p, 2).urgencyScore).toBeGreaterThan(byAssessment(p, 1).urgencyScore);
  });

  it("derives an honest one-line headline per assessment", () => {
    expect(byAssessment(p, 2).headline).toBe("1 statutory deadline overdue");
    expect(byAssessment(p, 1).headline).toBe("1 blocker to resolve");
    expect(byAssessment(p, 5).headline).toBe("1 requirement open");
    expect(byAssessment(p, 4).headline).toBe("Not started");
    expect(byAssessment(p, 3).headline).toBe("Ready for internal review");
  });

  it("uses the latest grade snapshot (append-only history)", () => {
    expect(byAssessment(p, 3).grade).toBe("A");
    expect(byAssessment(p, 3).score).toBe(95);
    expect(byAssessment(p, 1).grade).toBeNull();
    expect(p.grades).toEqual([
      { grade: "A", count: 1 },
      { grade: "ungraded", count: 4 },
    ]);
  });

  it("reports evidence coverage per applicable requirement, null when nothing applies", () => {
    expect(byAssessment(p, 1).evidenceCoverage).toBe(50); // 1 of 2 applicable evidenced
    expect(byAssessment(p, 4).evidenceCoverage).toBeNull(); // no applicable requirements
    expect(p.evidence.requirementCoverage).toBe(71); // 5 resolved / 7 total
    expect(p.evidence.evidenceCoverage).toBe(29); // 2 evidenced / 7 applicable
    expect(p.evidence.documentationCoverage).toBe(75); // 3 complete / 4 sections
    expect(p.evidence.totalRequirements).toBe(7);
    expect(p.evidence.applicableRequirements).toBe(7);
    expect(p.evidence.evidencedRequirements).toBe(2);
  });

  it("emits one live deadline clock per open incident, soonest first, overdue flagged", () => {
    expect(p.deadlines).toHaveLength(1);
    expect(p.deadlines[0]).toMatchObject({
      assessmentId: 2,
      kind: "early_warning",
      overdue: true,
      dueAt: iso(at(-3)),
    });
  });
});

describe("computePortfolio — honesty on empty / no-op input", () => {
  it("returns zeroed totals, empty arrays, and NULL coverage (never a fake 0/100)", () => {
    const p = computePortfolio(
      { products: [], assessments: [], evaluations: [], incidents: [], artifacts: [], evidence: [], grades: [], deliveredAlerts: [], maxReminders: 5 },
      NOW,
    );
    expect(p.totals).toEqual({ products: 0, assessments: 0, notStarted: 0, inProgress: 0, blocked: 0, readyForReview: 0 });
    expect(p.products).toEqual([]);
    expect(p.deadlines).toEqual([]);
    expect(p.grades).toEqual([]);
    expect(p.evidence.requirementCoverage).toBeNull();
    expect(p.evidence.evidenceCoverage).toBeNull();
    expect(p.evidence.documentationCoverage).toBeNull();
  });

  it("excludes resolved/closed incidents and never double-counts a done deadline", () => {
    const p = computePortfolio(
      {
        products: [product(1)],
        assessments: [assessment(1, 1, { scopeResult: "in_scope", classKey: "c", routeKey: "r" })],
        evaluations: [evaluation(1, "met", "R1")],
        incidents: [
          incident(1, { status: "closed", ewDue: at(-5) }), // resolved-ish → ignored
          incident(1, { status: "open", ewDue: at(-2), ewDone: at(-2), ntDue: at(2) }), // ew done → next clock is notification (due soon)
        ],
        artifacts: [],
        evidence: [],
        grades: [],
        deliveredAlerts: [],
        maxReminders: 5,
      },
      NOW,
    );
    expect(p.risk.openIncidents).toBe(1); // only the open one
    expect(p.risk.overdueDeadlines).toBe(0); // its early warning is DONE
    expect(p.risk.dueSoonDeadlines).toBe(1); // notification due in 2 days is the live clock
    expect(p.deadlines).toHaveLength(1);
    expect(p.deadlines[0]).toMatchObject({ kind: "notification", overdue: false });
  });
});

describe("computePortfolio — silenced alerting on overdue clocks", () => {
  // One assessment, two open incidents, both early-warning overdue:
  //  I1 — breach + reminders up to the cap delivered → alerting stopped.
  //  I2 — breach + one reminder (below cap) → still being nudged.
  const i1 = incident(1, { ewDue: at(-10) });
  const i2 = incident(1, { ewDue: at(-3) });
  const base = {
    products: [product(1)],
    assessments: [assessment(1, 1, { scopeResult: "in_scope", classKey: "c", routeKey: "r" })],
    evaluations: [evaluation(1, "met", "R1")],
    incidents: [i1, i2],
    artifacts: [],
    evidence: [],
    grades: [],
  };
  const p = computePortfolio(
    {
      ...base,
      deliveredAlerts: [
        { incidentId: i1.id, alertKey: `incident:${i1.id}:early_warning:breached` },
        { incidentId: i1.id, alertKey: `incident:${i1.id}:early_warning:breached:reminder:2` },
        { incidentId: i2.id, alertKey: `incident:${i2.id}:early_warning:breached` },
        { incidentId: i2.id, alertKey: `incident:${i2.id}:early_warning:breached:reminder:1` },
      ],
      maxReminders: 2,
    },
    NOW,
  );

  it("flags only the exhausted overdue clock, and aggregates the count", () => {
    const silenced = p.deadlines.find((d) => d.dueAt === iso(at(-10)))!;
    const nudged = p.deadlines.find((d) => d.dueAt === iso(at(-3)))!;
    expect(silenced.alertsSilenced).toBe(true);
    expect(nudged.alertsSilenced).toBe(false);
    expect(p.risk.silencedDeadlines).toBe(1);
    expect(byAssessment(p, 1).silencedDeadlines).toBe(1);
    expect(byAssessment(p, 1).headline).toBe(
      "2 statutory deadlines overdue — alerting stopped on 1",
    );
  });

  it("never flags a stage with no delivered breach alert, even at maxReminders 0", () => {
    const q = computePortfolio({ ...base, deliveredAlerts: [], maxReminders: 0 }, NOW);
    expect(q.deadlines.every((d) => !d.alertsSilenced)).toBe(true);
    expect(q.risk.silencedDeadlines).toBe(0);
  });

  it("with reminders off (maxReminders 0), a delivered breach email alone means silence", () => {
    const q = computePortfolio(
      {
        ...base,
        deliveredAlerts: [
          { incidentId: i1.id, alertKey: `incident:${i1.id}:early_warning:breached` },
        ],
        maxReminders: 0,
      },
      NOW,
    );
    expect(q.deadlines.find((d) => d.dueAt === iso(at(-10)))!.alertsSilenced).toBe(true);
    expect(q.deadlines.find((d) => d.dueAt === iso(at(-3)))!.alertsSilenced).toBe(false);
  });

  it("ignores exhausted alerts for a stage that is not the live clock or not overdue", () => {
    // Early warning DONE → live clock is notification (due soon, not overdue):
    // even exhausted early-warning reminders must not flag the clock.
    const i3 = incident(1, { ewDue: at(-5), ewDone: at(-5), ntDue: at(2) });
    const q = computePortfolio(
      {
        ...base,
        incidents: [i3],
        deliveredAlerts: [
          { incidentId: i3.id, alertKey: `incident:${i3.id}:early_warning:breached` },
          { incidentId: i3.id, alertKey: `incident:${i3.id}:early_warning:breached:reminder:2` },
        ],
        maxReminders: 2,
      },
      NOW,
    );
    expect(q.deadlines).toHaveLength(1);
    expect(q.deadlines[0]).toMatchObject({ kind: "notification", alertsSilenced: false });
    expect(q.risk.silencedDeadlines).toBe(0);
  });
});

describe("computePortfolio — high-volume deadlines are never truncated or hidden", () => {
  // 65 open incidents (> the old 60-item cap) on one assessment. Each contributes
  // exactly one live early-warning clock at a distinct day offset from -40..+24;
  // the default later stages stay far out, so the early warning is always the
  // soonest pending clock. This locks the credibility invariant that an overdue
  // statutory deadline can NEVER be dropped by a response-size cap.
  const OFFSETS = Array.from({ length: 65 }, (_, i) => i - 40); // -40 .. +24
  const overdueExpected = OFFSETS.filter((d) => d < 0).length; // 40
  const input: PortfolioInput = {
    products: [product(1)],
    assessments: [assessment(1, 1, { scopeResult: "in_scope", classKey: "c", routeKey: "r" })],
    evaluations: [evaluation(1, "met", "R1")],
    incidents: OFFSETS.map((d) => incident(1, { ewDue: at(d) })),
    artifacts: [],
    evidence: [],
    grades: [],
    deliveredAlerts: [],
    maxReminders: 5,
  };
  const p = computePortfolio(input, NOW);

  it("returns every open statutory clock (no 60-item cap)", () => {
    expect(p.deadlines).toHaveLength(65);
    expect(p.risk.openIncidents).toBe(65);
  });

  it("keeps every overdue deadline — the array count matches the risk aggregate exactly", () => {
    expect(p.deadlines.filter((d) => d.overdue)).toHaveLength(overdueExpected);
    expect(p.risk.overdueDeadlines).toBe(overdueExpected);
  });

  it("orders the horizon soonest-first, with the most-overdue clock leading", () => {
    const times = p.deadlines.map((d) => new Date(d.dueAt).getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(p.deadlines[0]).toMatchObject({ overdue: true, dueAt: iso(at(-40)) });
  });
});
