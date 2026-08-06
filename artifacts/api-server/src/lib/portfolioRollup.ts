/**
 * Portfolio rollup — the operational "command centre" aggregate across every
 * product assessment (urgency + evidence coverage).
 *
 * IMPORTANT (one source of truth): this MUST stay semantically identical to the
 * per-assessment client worklist + journey. The predicates below are a faithful
 * server-side mirror of:
 *   - artifacts/conformity/src/lib/next-actions.ts (summarizeWork / buildActionGroups)
 *   - artifacts/conformity/src/lib/journey.ts       (computeJourney)
 * Cross-package code sharing is out of scope, so the rules are duplicated here
 * on purpose. If either client module changes how it counts blockers, open
 * requirements, statutory deadlines, or readiness, update this in lockstep (and
 * the unit test that locks the shared semantics).
 *
 * Credibility invariants carried over: journey (workflow progress) is never
 * conflated with the readiness grade; blockers/overdue deadlines outrank
 * positive states; "ready for review" is an internal milestone, never legal
 * certification. Coverage percentages are null when there is nothing to measure
 * rather than a misleading 0 or 100 — we never fabricate a number.
 *
 * Pure + deterministic: it takes raw rows plus an injected `now`, so it is
 * unit-testable; the route supplies Date.now().
 */
import type {
  ConformityProductRow,
  ConformityAssessmentRow,
  ConformityEvaluationRow,
  ConformityIncidentRow,
  ConformityArtifactRow,
  ConformityGradeRow,
  ConformityEvidenceRow,
} from "@workspace/db";
import type {
  ConformityPortfolio,
  PortfolioProduct,
  PortfolioDeadline,
} from "@workspace/api-zod";
import { exhaustedStageKeys } from "./conformityAlerts";

const DAY = 24 * 60 * 60 * 1000;
const DUE_SOON_MS = 14 * DAY;
// Terminal requirement statuses need no further action (mirror next-actions.ts).
const TERMINAL_STATUSES = ["met", "not_applicable"];
const HIGH_RISK = ["critical", "high"];
// Incident statuses that are no longer "open" (mirror next-actions.ts).
const CLOSED_INCIDENT = ["resolved", "closed"];

export interface PortfolioInput {
  products: ConformityProductRow[];
  assessments: ConformityAssessmentRow[];
  evaluations: ConformityEvaluationRow[];
  incidents: ConformityIncidentRow[];
  artifacts: ConformityArtifactRow[];
  evidence: ConformityEvidenceRow[];
  grades: ConformityGradeRow[];
  /**
   * DELIVERED breach-family alert rows (conformity_alert_state) — used to flag
   * overdue clocks whose reminder emails have been exhausted ("gone silent").
   */
  deliveredAlerts: { incidentId: number | null; alertKey: string }[];
  /** Configured reminder cap (already clamped by the route). */
  maxReminders: number;
}

type Readiness = "not_started" | "in_progress" | "blocked" | "ready";

function toMs(d: Date | string | null | undefined): number | null {
  if (!d) return null;
  const t = d instanceof Date ? d.getTime() : new Date(d).getTime();
  return Number.isNaN(t) ? null : t;
}

function groupBy<T>(rows: T[], key: (r: T) => number): Map<number, T[]> {
  const m = new Map<number, T[]>();
  for (const r of rows) {
    const k = key(r);
    const arr = m.get(k);
    if (arr) arr.push(r);
    else m.set(k, [r]);
  }
  return m;
}

/** Whole-number percentage, or null when there is nothing to measure. */
function pct(numer: number, denom: number): number | null {
  if (denom <= 0) return null;
  return Math.round((numer / denom) * 100);
}

function plural(n: number): string {
  return n === 1 ? "" : "s";
}

export function computePortfolio(input: PortfolioInput, now: number): ConformityPortfolio {
  const evalsByA = groupBy(input.evaluations, (e) => e.assessmentId);
  const incByA = groupBy(input.incidents, (i) => i.assessmentId);
  const artByA = groupBy(input.artifacts, (a) => a.assessmentId);
  const evidByA = groupBy(input.evidence, (e) => e.assessmentId);
  const productById = new Map(input.products.map((p) => [p.id, p]));

  // Latest grade per assessment — grades are an append-only history.
  const latestGrade = new Map<number, ConformityGradeRow>();
  for (const g of input.grades) {
    const cur = latestGrade.get(g.assessmentId);
    if (!cur || (toMs(g.computedAt) ?? 0) > (toMs(cur.computedAt) ?? 0)) {
      latestGrade.set(g.assessmentId, g);
    }
  }

  // "<incidentId>:<stage>" pairs whose breach reminders are exhausted — the
  // stages nobody will be nudged about again.
  const silencedStages = exhaustedStageKeys(input.deliveredAlerts, input.maxReminders);

  const isTerminal = (s: string) => TERMINAL_STATUSES.includes(s);
  const isHighRisk = (r: string | null | undefined) => !!r && HIGH_RISK.includes(r);
  const isOpenIncident = (s: string) => !CLOSED_INCIDENT.includes(s);

  const rows: PortfolioProduct[] = [];
  const deadlines: PortfolioDeadline[] = [];

  let notStarted = 0;
  let inProgress = 0;
  let blockedCount = 0;
  let readyCount = 0;
  let sumBlockers = 0;
  let sumHighRisk = 0;
  let sumOpenIncidents = 0;
  let sumOverdue = 0;
  let sumDueSoon = 0;
  let sumSilenced = 0;
  let totalReq = 0;
  let resolvedReq = 0;
  let applicableReq = 0;
  let evidencedReq = 0;
  let totalSections = 0;
  let completeSections = 0;
  const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0, ungraded: 0 };

  for (const a of input.assessments) {
    const evals = evalsByA.get(a.id) ?? [];
    const incs = incByA.get(a.id) ?? [];
    const arts = artByA.get(a.id) ?? [];
    const evid = evidByA.get(a.id) ?? [];
    const grade = latestGrade.get(a.id) ?? null;
    const product = productById.get(a.productId);
    const productName = product?.name ?? "Unknown product";

    // --- requirement worklist (mirror next-actions.ts) ---
    const blockers = evals.filter((e) => e.status === "not_met").length;
    const highRiskGaps = evals.filter(
      (e) => isHighRisk(e.riskRating) && !isTerminal(e.status) && e.status !== "not_met",
    ).length;
    const inProgressReq = evals.filter(
      (e) => !isTerminal(e.status) && e.status !== "not_met" && !isHighRisk(e.riskRating),
    ).length;
    const openRequirements = blockers + highRiskGaps + inProgressReq;

    // --- incident statutory deadlines (mirror next-actions.ts) ---
    // Each open incident contributes exactly one "live clock" — its soonest
    // pending statutory deadline — so the horizon markers and the overdue /
    // due-soon counts can never disagree with the per-assessment worklist.
    let overdue = 0;
    let dueSoon = 0;
    let silencedDeadlines = 0;
    let openIncidents = 0;
    let nextDeadlineMs: number | null = null;
    for (const i of incs) {
      if (!isOpenIncident(i.status)) continue;
      openIncidents++;
      const stages = [
        { kind: "early_warning" as const, dueAt: i.earlyWarningDueAt, doneAt: i.earlyWarningDoneAt },
        { kind: "notification" as const, dueAt: i.notificationDueAt, doneAt: i.notificationDoneAt },
        { kind: "final_report" as const, dueAt: i.finalReportDueAt, doneAt: i.finalReportDoneAt },
      ];
      const next = stages
        .filter((s) => s.dueAt && !s.doneAt)
        .sort((x, y) => (toMs(x.dueAt) ?? 0) - (toMs(y.dueAt) ?? 0))[0];
      if (!next) continue; // open, but every statutory deadline task is done
      const dueTime = toMs(next.dueAt);
      if (dueTime === null) continue;
      const delta = dueTime - now;
      const overdueFlag = delta < 0;
      // "Alerting stopped": the breached stage's reminder emails are exhausted,
      // so nobody will be nudged about this overdue clock again.
      const alertsSilenced = overdueFlag && silencedStages.has(`${i.id}:${next.kind}`);
      if (overdueFlag) overdue++;
      else if (delta <= DUE_SOON_MS) dueSoon++;
      if (alertsSilenced) silencedDeadlines++;
      if (nextDeadlineMs === null || dueTime < nextDeadlineMs) nextDeadlineMs = dueTime;
      deadlines.push({
        assessmentId: a.id,
        productId: a.productId,
        productName,
        regulationKey: a.regulationKey,
        incidentTitle: i.title,
        incidentKind: i.kind,
        severity: i.severity,
        kind: next.kind,
        dueAt: new Date(dueTime).toISOString(),
        overdue: overdueFlag,
        alertsSilenced,
      });
    }

    // --- evidence coverage (per applicable requirement) ---
    const evidencedRefs = new Set(
      evid.map((e) => e.requirementRefCode).filter((c): c is string => !!c),
    );
    const applicableEvals = evals.filter((e) => e.status !== "not_applicable");
    const evidencedApplicable = applicableEvals.filter((e) =>
      evidencedRefs.has(e.requirementRefCode),
    ).length;

    // --- documentation completeness (artifact sections) ---
    let secTotal = 0;
    let secComplete = 0;
    for (const art of arts) {
      const sections = art.content?.sections ?? [];
      secTotal += sections.length;
      secComplete += sections.filter((s) => s.complete).length;
    }
    const openDocSections = secTotal - secComplete;

    // --- journey (mirror journey.ts computeJourney) ---
    const hasReqs = evals.length > 0;
    const evidenceDone = evid.length > 0;
    const scopeDone = a.scopeResult != null;
    const classifyDone = a.classKey != null;
    const routeDone = a.routeKey != null;
    const gapsClosed = hasReqs && openRequirements === 0;
    const hasArtifacts = arts.length > 0;
    const docsComplete = hasArtifacts && openDocSections === 0;
    const blocked = blockers > 0 || overdue > 0;
    const allPriorDone =
      scopeDone && classifyDone && routeDone && hasReqs && evidenceDone && gapsClosed && docsComplete;
    const readyForReview =
      allPriorDone &&
      !blocked &&
      openIncidents === 0 &&
      !!grade &&
      grade.blockerCount === 0 &&
      (grade.overallGrade === "A" || grade.overallGrade === "B");

    const stageDefs = [
      { label: "Scope", done: scopeDone },
      { label: "Classify", done: classifyDone },
      { label: "Route", done: routeDone },
      { label: "Requirements", done: hasReqs },
      { label: "Evidence", done: evidenceDone },
      { label: "Close gaps", done: gapsClosed },
      { label: "Documentation", done: docsComplete },
      { label: "Ready for review", done: readyForReview },
    ];
    const total = stageDefs.length;
    const doneCount = stageDefs.filter((d) => d.done).length;
    let currentIndex = stageDefs.findIndex((d) => !d.done);
    if (currentIndex === -1) currentIndex = total - 1;
    const journeyStage = stageDefs[currentIndex]!.label;
    const journeyPct = Math.round((doneCount / total) * 100);

    // --- readiness bucket (mutually exclusive; sums to total assessments) ---
    let readiness: Readiness;
    if (blocked) readiness = "blocked";
    else if (readyForReview) readiness = "ready";
    else if (doneCount === 0) readiness = "not_started";
    else readiness = "in_progress";

    if (readiness === "blocked") blockedCount++;
    else if (readiness === "ready") readyCount++;
    else if (readiness === "not_started") notStarted++;
    else inProgress++;

    // --- grade distribution ---
    const letter = grade?.overallGrade ?? null;
    if (letter && letter in gradeCounts) gradeCounts[letter] = (gradeCounts[letter] ?? 0) + 1;
    else gradeCounts.ungraded = (gradeCounts.ungraded ?? 0) + 1;

    // --- urgency score: fires float to the top; a "ready" row sinks below all
    // active work so the board reads as a triage queue, not a status list. ---
    const urgencyScore =
      overdue * 1000 +
      blockers * 200 +
      dueSoon * 120 +
      openIncidents * 80 +
      highRiskGaps * 20 +
      openRequirements * 2 +
      (readiness === "ready" ? -1000 : 0);

    // --- one-line, data-derived next action ---
    let headline: string;
    if (overdue > 0)
      headline =
        `${overdue} statutory deadline${plural(overdue)} overdue` +
        (silencedDeadlines > 0 ? ` — alerting stopped on ${silencedDeadlines}` : "");
    else if (blockers > 0) headline = `${blockers} blocker${plural(blockers)} to resolve`;
    else if (dueSoon > 0) headline = `${dueSoon} deadline${plural(dueSoon)} due within 14 days`;
    else if (openIncidents > 0) headline = `${openIncidents} open incident${plural(openIncidents)}`;
    else if (highRiskGaps > 0) headline = `${highRiskGaps} high-risk gap${plural(highRiskGaps)}`;
    else if (readiness === "ready") headline = "Ready for internal review";
    else if (readiness === "not_started") headline = "Not started";
    else if (openRequirements > 0)
      headline = `${openRequirements} requirement${plural(openRequirements)} open`;
    else if (hasArtifacts && !docsComplete)
      headline = `${openDocSections} document section${plural(openDocSections)} to finish`;
    else headline = `Continue: ${journeyStage}`;

    rows.push({
      assessmentId: a.id,
      productId: a.productId,
      productName,
      manufacturerName: product?.manufacturerName ?? "",
      regulationKey: a.regulationKey,
      readiness,
      journeyStage,
      journeyPct,
      journeyDone: doneCount,
      journeyTotal: total,
      grade: letter,
      score: grade?.overallScore ?? null,
      blockers,
      highRiskGaps,
      openRequirements,
      openIncidents,
      overdueDeadlines: overdue,
      dueSoonDeadlines: dueSoon,
      silencedDeadlines,
      nextDeadlineAt: nextDeadlineMs === null ? null : new Date(nextDeadlineMs).toISOString(),
      evidenceCoverage: pct(evidencedApplicable, applicableEvals.length),
      urgencyScore,
      headline,
    });

    sumBlockers += blockers;
    sumHighRisk += highRiskGaps;
    sumOpenIncidents += openIncidents;
    sumOverdue += overdue;
    sumDueSoon += dueSoon;
    sumSilenced += silencedDeadlines;
    totalReq += evals.length;
    resolvedReq += evals.filter((e) => isTerminal(e.status)).length;
    applicableReq += applicableEvals.length;
    evidencedReq += evidencedApplicable;
    totalSections += secTotal;
    completeSections += secComplete;
  }

  // Triage order: most urgent first, then soonest live deadline, then name.
  rows.sort((x, y) => {
    if (y.urgencyScore !== x.urgencyScore) return y.urgencyScore - x.urgencyScore;
    const xd = x.nextDeadlineAt ? new Date(x.nextDeadlineAt).getTime() : Infinity;
    const yd = y.nextDeadlineAt ? new Date(y.nextDeadlineAt).getTime() : Infinity;
    if (xd !== yd) return xd - yd;
    return x.productName.localeCompare(y.productName);
  });

  // Deadline horizon: soonest first (overdue timestamps sort earliest). Every
  // open statutory clock is returned — never truncated — so an overdue deadline
  // can never be silently dropped and the "live clocks" count stays honest.
  deadlines.sort((x, y) => new Date(x.dueAt).getTime() - new Date(y.dueAt).getTime());

  const grades = (["A", "B", "C", "D", "F", "ungraded"] as const)
    .map((g) => ({ grade: g as string, count: gradeCounts[g] ?? 0 }))
    .filter((g) => g.count > 0);

  return {
    generatedAt: new Date(now).toISOString(),
    totals: {
      products: input.products.length,
      assessments: input.assessments.length,
      notStarted,
      inProgress,
      blocked: blockedCount,
      readyForReview: readyCount,
    },
    risk: {
      openBlockers: sumBlockers,
      highRiskGaps: sumHighRisk,
      openIncidents: sumOpenIncidents,
      overdueDeadlines: sumOverdue,
      dueSoonDeadlines: sumDueSoon,
      silencedDeadlines: sumSilenced,
    },
    evidence: {
      requirementCoverage: pct(resolvedReq, totalReq),
      evidenceCoverage: pct(evidencedReq, applicableReq),
      documentationCoverage: pct(completeSections, totalSections),
      totalRequirements: totalReq,
      resolvedRequirements: resolvedReq,
      applicableRequirements: applicableReq,
      evidencedRequirements: evidencedReq,
      totalSections,
      completeSections,
    },
    grades,
    deadlines,
    products: rows,
  };
}
