/**
 * W1.3 — the status-deriver registry.
 *
 * Most obligations carry the status a person recorded against them. A few can be
 * DERIVED from what the system actually holds, and those are the valuable ones,
 * because a derived status cannot be wrong about itself: Article 14 is either
 * evidenced by filings on the submission ledger or it is not, whatever anyone
 * typed.
 *
 * Phase 1.5 implemented exactly one of these, inline:
 *
 *     const isArt14 = r.regulationKey === "cra" && r.refCode === "Art 14";
 *
 * That was right for one act. It does not survive three: the 24h/72h/one-month
 * reporting of NIS2 Art. 23 is its own duty, and serious incidents are reported
 * under AI Act Art. 73. Each of those would add a branch to a
 * function that has nothing to do with either of them.
 * `DESIGN_five_shapes.md` D9 says adding an act must mean REGISTERING content,
 * never editing the engine.
 *
 * ── What this deliberately does NOT do ──
 *
 * There is no NIS2 or AI Act deriver here. Neither act has obligations seeded
 * yet, and a deriver for data that does not exist would be a guess about a
 * schema nobody has written. The registry earns its place by removing the
 * branch that exists; it does not pre-populate branches that do not.
 *
 * Nor are there registries for determinations, clocks or artifacts. Those are
 * not currently if/else chains — they are separate modules called directly, and
 * inventing three more registries to hold one entry each would be architecture
 * for its own sake. Add them when a second act needs them.
 */

import type { ReportingObligationAssessment } from "./reportingObligation";

/** Everything a deriver may read. Extend as real derivers need more. */
export interface DeriverContext {
  /** Art. 14 reporting, computed from incidents and the submission ledger. */
  reporting: ReportingObligationAssessment;
}

export interface DerivedStatus {
  /** The obligation status, in the same vocabulary as evaluation rows. */
  status: string;
  /** Where it came from, so a reader can check rather than trust. */
  derivedFrom: Record<string, unknown>;
}

export type StatusDeriver = (ctx: DeriverContext) => DerivedStatus;

/**
 * Keyed `${regulationKey}::${refCode}` — the same key the obligations endpoint
 * already builds to group evaluations, so registering is a one-line change and
 * a typo produces a miss rather than a wrong answer.
 */
const DERIVERS: Record<string, StatusDeriver> = {
  /**
   * CRA Article 14 — reporting obligations.
   *
   * A stage counts as discharged only where the append-only submission ledger
   * holds a row for it, so this can read "not met" while an evaluation row says
   * "met". That disagreement is the point.
   *
   * `no_reportable_events` maps to `not_started` for the obligation list,
   * because the list's vocabulary has no word for "the duty has not been
   * engaged". The full assessment travels in `derivedFrom`, where the
   * distinction survives — an empty record is not a clean bill of health.
   */
  "cra::Art 14": ({ reporting }) => ({
    status: reporting.status === "no_reportable_events" ? "not_started" : reporting.status,
    derivedFrom: {
      source: "conformity_incident_submissions",
      citation: reporting.citation,
      status: reporting.status,
      incidentCount: reporting.incidentCount,
      overdueCount: reporting.overdueCount,
      unevidencedCount: reporting.unevidencedCount,
      message: reporting.message,
    },
  }),
};

/** Is this obligation's status derived rather than recorded? */
export function hasDeriver(regulationKey: string, refCode: string): boolean {
  return `${regulationKey}::${refCode}` in DERIVERS;
}

/**
 * Derive the status, or return null when nobody registered one — in which case
 * the caller falls back to aggregating the recorded evaluations.
 */
export function deriveStatus(
  regulationKey: string,
  refCode: string,
  ctx: DeriverContext,
): DerivedStatus | null {
  const deriver = DERIVERS[`${regulationKey}::${refCode}`];
  return deriver ? deriver(ctx) : null;
}

/** Which obligations are derived, for diagnostics and tests. */
export function registeredDerivers(): string[] {
  return Object.keys(DERIVERS).sort();
}
