/**
 * The conformity "journey" — deliberately a separate concept from the readiness
 * grade. Journey = how far through the workflow this assessment has travelled
 * (scope → classify → route → requirements → evidence → close gaps →
 * documentation → ready). Readiness grade = how good the answers are.
 *
 * Keeping the two distinct is a credibility requirement: a fully-travelled
 * journey with unmet blockers must NOT read as "done". The journey never
 * silently inflates the grade, and the grade never advances the journey.
 */
import type {
  ConformityAssessment,
  ConformityAssessmentDetail,
  ConformityGrade,
} from "@workspace/api-client-react";
import type { WorkSummary } from "@/lib/next-actions";

export type JourneyState = "done" | "current" | "upcoming" | "blocked";

export interface JourneyStage {
  key: string;
  label: string;
  state: JourneyState;
  hint: string;
}

export interface Journey {
  stages: JourneyStage[];
  progressPct: number;
  currentIndex: number;
  doneCount: number;
  total: number;
  /** Something is capping progress: not-met requirements or open incidents. */
  blocked: boolean;
  /** All stages complete AND nothing blocking — safe to route for review. */
  readyForReview: boolean;
}

interface StageDef {
  key: string;
  label: string;
  hint: string;
  done: boolean;
}

export function computeJourney(
  detail: ConformityAssessmentDetail,
  grade: ConformityGrade | null | undefined,
  work: WorkSummary,
): Journey {
  const a = detail.assessment;
  const c = detail.counts;

  // Completion is derived from the SAME live worklist that powers the Next
  // Actions panel (via summarizeWork), never from the grade snapshot — so the
  // stepper, the nudge, and the panel can never disagree about open work.
  const scopeDone = detail.scope.answered;
  const classifyDone = a.classKey != null;
  const routeDone = a.routeKey != null;
  const hasReqs = c.evaluationsTotal > 0;
  const evidenceDone = c.evidenceCount > 0;
  // "met" and "not_applicable" are terminal — summarizeWork already excludes
  // them, so a checklist of only-resolved requirements counts as closed.
  const gapsClosed = hasReqs && work.openRequirements === 0;
  const docsComplete = work.hasArtifacts && work.openDocSections === 0;
  // Blocked = something is past-due or failing (this paints the current stage
  // red). An on-track open incident is "open work" — surfaced and nudged via the
  // shared worklist — but not a red blocker; it still gates readiness below.
  const blocked = work.blockers > 0 || work.overdueDeadlines > 0;

  // "Ready for review" is an internal milestone, not a legal declaration. It can
  // only be true once every prior stage is genuinely complete AND nothing is
  // blocking or open in live data — a stale healthy grade can never surface it
  // while open work (including an unresolved incident) remains.
  const allPriorDone =
    scopeDone && classifyDone && routeDone && hasReqs && evidenceDone && gapsClosed && docsComplete;
  const readyForReview =
    allPriorDone &&
    !blocked &&
    work.openIncidents === 0 &&
    !!grade &&
    grade.blockerCount === 0 &&
    (grade.overallGrade === "A" || grade.overallGrade === "B");

  const defs: StageDef[] = [
    {
      key: "scope",
      label: "Scope",
      hint: "Confirm whether the product falls under the regulation.",
      done: scopeDone,
    },
    {
      key: "classify",
      label: "Classify",
      hint: "Determine the product class / risk category.",
      done: classifyDone,
    },
    {
      key: "route",
      label: "Route",
      hint: "Select the conformity assessment route.",
      done: routeDone,
    },
    {
      key: "requirements",
      label: "Requirements",
      hint: "Build the requirement checklist for the selected route.",
      done: hasReqs,
    },
    {
      key: "evidence",
      label: "Evidence",
      hint: "Attach evidence supporting the requirements.",
      done: evidenceDone,
    },
    {
      key: "gaps",
      label: "Close gaps",
      hint: "Resolve every requirement — no blockers left open.",
      done: gapsClosed,
    },
    {
      key: "documentation",
      label: "Documentation",
      hint: "Complete the generated technical documentation package.",
      done: docsComplete,
    },
    {
      key: "ready",
      label: "Ready for review",
      hint: "Grade meets the bar with no blockers or open incidents.",
      done: readyForReview,
    },
  ];

  const total = defs.length;
  const doneCount = defs.filter((d) => d.done).length;
  // Current = first stage not yet done (all done → the final stage).
  let currentIndex = defs.findIndex((d) => !d.done);
  if (currentIndex === -1) currentIndex = total - 1;

  const stages: JourneyStage[] = defs.map((d, i) => {
    let state: JourneyState;
    if (d.done) state = "done";
    else if (i === currentIndex) state = blocked ? "blocked" : "current";
    else state = "upcoming";
    return { key: d.key, label: d.label, state, hint: d.hint };
  });

  return {
    stages,
    progressPct: Math.round((doneCount / total) * 100),
    currentIndex,
    doneCount,
    total,
    blocked,
    readyForReview,
  };
}

/** Ordered canonical workflow stages (the persisted `currentStage` machine). */
const STAGE_ORDER = ["scoping", "classification", "route", "gap_assessment", "artifacts", "complete"];

/**
 * Lightweight progress for a bare assessment row (product cards) where we only
 * have the persisted `currentStage`, not the full detail + grade. Reflects
 * workflow position, not readiness — deliberately coarse.
 */
export function stageProgress(a: Pick<ConformityAssessment, "currentStage">): {
  pct: number;
  index: number;
  total: number;
} {
  const total = STAGE_ORDER.length;
  const idx = STAGE_ORDER.indexOf(a.currentStage);
  const index = idx === -1 ? 0 : idx;
  // scoping → a sliver, complete → full. Never show 0% for a live assessment.
  const pct =
    a.currentStage === "complete"
      ? 100
      : Math.max(8, Math.round(((index + 0.5) / total) * 100));
  return { pct, index, total };
}
