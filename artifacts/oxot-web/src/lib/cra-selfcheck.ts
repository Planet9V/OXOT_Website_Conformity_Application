// Client-safe (NO pg / server imports) so both the quiz client component and its
// unit tests can use it. Pure scoring for the CRA Classification Self-Check —
// indicative only, never a legal determination (see docs/CRA-CLASSIFICATION-SELF-CHECK.md).
import { type Segment } from "@/lib/segments";

export type Position = "manufacturer" | "oem" | "integrator" | "reseller" | "operator";
export type HasDigital = "yes" | "no" | "unsure";
export type Category = "default" | "classI" | "classII" | "critical" | "unsure";
export type EvidenceItem = "sbom" | "risk" | "sdl" | "cvd" | "cert" | "cert_progress" | "none";

export type Role = "psirt" | "compliance" | "ciso" | "engineering" | "other";
export type PortfolioSize = "p1" | "p2_10" | "p11_50" | "p50plus";
export type DeployContext = "nis2_essential" | "general" | "unsure";
export type EvidenceLiving = "model" | "manual" | "stale";

export type CraClass =
  | "DEFAULT"
  | "CLASS_I"
  | "CLASS_II"
  | "CRITICAL"
  | "NEEDS_REVIEW"
  | "OUT_OF_SCOPE_LIKELY";

// self_default: Module A self-assessment available in principle.
// self_closed:  Class I — self-assessment closed until harmonised standards (~Q2 2027).
// third_party:  Class II — mandatory third-party (Module B+C or H).
// third_party_plus: Critical — third-party + possible EU cybersecurity certification.
export type Route = "self_default" | "self_closed" | "third_party" | "third_party_plus" | "unknown";

// Three-question homepage teaser ahead of the full wizard: a coarse class-awareness
// read (not the full Category set — no "critical", it's a teaser, not the classifier).
export type TeaserClassAware = "default" | "classI" | "classII" | "unsure";
export type TeaserSbom = "yes" | "no";

export interface TeaserCopy {
  title: string;
  q1: { label: string; options: { value: Position; label: string }[] };
  q2: { label: string; options: { value: TeaserClassAware; label: string }[] };
  q3: { label: string; yes: string; no: string; noHint: string };
  verdictScope: string;
  verdictRoute: Record<TeaserClassAware, string>;
  verdictSbomGap: string;
  verdictSbomOk: string;
  cta: string;
}

// Wizard v2 copy — new questions, delta labels, callouts, runway and gap-closure copy.
export interface SelfCheckCopyV2 {
  roleQuestion: { label: string; options: { value: string; label: string }[] };
  portfolioQuestion: { label: string; options: { value: string; label: string; insight?: string }[] };
  deployQuestion: { label: string; options: { value: string; label: string }[] };
  evidenceLivingQuestion: { label: string; options: { value: string; label: string }[] };
  deltaLabels: Record<string, string>;
  s7Callout: { text: string; source: string };
  reportingClock: string;
  programmeStrip: string;
  roleHeaders: Record<string, string>;
  runway: { title: string; startLabel: string; annotations: string[]; overshootLabel: string; fitsLabel: string };
  gapClosure: Record<string, { title: string; body: string; href: string }>;
  evidenceLivingClose: Record<string, string>;
  teaser: TeaserCopy;
}

/**
 * Pure composition of the mini-check's three-line verdict: scope, class-specific
 * route, and an SBOM gap/ok line depending on the visitor's third answer.
 */
export function miniVerdict(classAware: TeaserClassAware, sbom: TeaserSbom, t: TeaserCopy): string {
  return [t.verdictScope, t.verdictRoute[classAware], sbom === "no" ? t.verdictSbomGap : t.verdictSbomOk].join(" ");
}

const VALID_POSITIONS = new Set<string>(["manufacturer", "oem", "integrator", "reseller", "operator"]);

// classAware values that map straight to a Category; "unsure"/"no" (an admitted
// gap in class-awareness) instead leave category unset and flag openOnCategory.
const CLASS_AWARE_TO_CATEGORY: Partial<Record<string, Category>> = {
  default: "default",
  classI: "classI",
  classII: "classII",
};

export interface SelfCheckAnswers {
  position?: Position;
  hasDigital?: HasDigital;
  category?: Category;
  becomesManufacturer?: boolean;
  euMarket?: boolean;
  evidence?: EvidenceItem[];
  role?: Role;
  portfolioSize?: PortfolioSize;
  deployContext?: DeployContext;
  evidenceLiving?: EvidenceLiving;
}

/**
 * Applies a "category" answer change, clearing `deployContext` when the new
 * category no longer shows that question (i.e. anything other than
 * classII/unsure) so a stale answer from a prior pass through the wizard
 * can't silently ride into classify()/the lead payload after Back navigation.
 */
export function applyCategoryChange(answers: SelfCheckAnswers, category: Category): SelfCheckAnswers {
  const next: SelfCheckAnswers = { ...answers, category };
  if (category !== "classII" && category !== "unsure") delete next.deployContext;
  return next;
}

/**
 * Pure parse of the homepage teaser's hand-off query params (?position=&classAware=&sbom=)
 * into a partial wizard seed. Invalid/missing values are ignored silently — never guessed.
 * `position` never implies `hasDigital` (a different question the teaser doesn't ask).
 * `classAware=unsure` or `=no` is the visitor admitting they don't know their class: leave
 * `category` unset and flag `openOnCategory` so the wizard opens straight on that question.
 * `sbom=no` is absence of one artifact, not evidence about others — evidence stays unset.
 */
export function parsePrefill(params: { position?: string; classAware?: string; sbom?: string }): {
  answers: Partial<SelfCheckAnswers>;
  openOnCategory: boolean;
} {
  const answers: Partial<SelfCheckAnswers> = {};
  let openOnCategory = false;

  if (params.position && VALID_POSITIONS.has(params.position)) {
    answers.position = params.position as Position;
  }

  const category = params.classAware ? CLASS_AWARE_TO_CATEGORY[params.classAware] : undefined;
  if (category) {
    answers.category = category;
  } else if (params.classAware === "unsure" || params.classAware === "no") {
    openOnCategory = true;
  }

  if (params.sbom === "yes") {
    answers.evidence = ["sbom"];
  }

  return { answers, openOnCategory };
}

export interface SelfCheckResult {
  craClass: CraClass;
  route: Route;
  /** Key into the copy's `results` / `nowActions` maps. */
  resultKey: CraClass;
  nowActionKey: "now_sbom" | "now_risk" | "now_reserve_slot" | "now_annex_vii" | "confirm_scope";
  /** True when a reseller/integrator rebrands or substantially modifies (Art. 21/22). */
  becomesManufacturerFlag: boolean;
  /** The intake segment to preselect on hand-off. */
  segment: Segment;
  /** True when a NIS2-essential deployment context upgraded an unresolved category to NEEDS_REVIEW. */
  classIIFlag: boolean;
}

const POSITION_TO_SEGMENT: Record<Position, Segment> = {
  manufacturer: "manufacturer",
  oem: "oem",
  integrator: "integrator",
  reseller: "reseller",
  operator: "operator",
};

const CATEGORY_TO_CLASS: Record<Category, CraClass> = {
  default: "DEFAULT",
  classI: "CLASS_I",
  classII: "CLASS_II",
  critical: "CRITICAL",
  unsure: "NEEDS_REVIEW",
};

const CLASS_TO_ROUTE: Record<CraClass, Route> = {
  DEFAULT: "self_default",
  CLASS_I: "self_closed",
  CLASS_II: "third_party",
  CRITICAL: "third_party_plus",
  NEEDS_REVIEW: "unknown",
  OUT_OF_SCOPE_LIKELY: "unknown",
};

/**
 * Indicative CRA classification from the six answers. Deterministic and pure.
 * Never presents as a legal determination — the UI must show the disclaimer.
 */
export function classify(a: SelfCheckAnswers): SelfCheckResult {
  const segment = a.position ? POSITION_TO_SEGMENT[a.position] : "manufacturer";
  const becomesManufacturerFlag =
    !!a.becomesManufacturer && (a.position === "integrator" || a.position === "reseller");

  // No digital elements -> likely out of scope (the CRA covers products WITH them).
  if (a.hasDigital === "no") {
    return {
      craClass: "OUT_OF_SCOPE_LIKELY",
      route: "unknown",
      resultKey: "OUT_OF_SCOPE_LIKELY",
      nowActionKey: "confirm_scope",
      becomesManufacturerFlag,
      segment,
      classIIFlag: false,
    };
  }

  let craClass = CATEGORY_TO_CLASS[a.category ?? "unsure"];

  // A deployment context of "essential entity under NIS2" raises the stakes for anything
  // not already resolved to an explicit class — surfaced as NEEDS_REVIEW, not silently upgraded.
  let classIIFlag = false;
  if (a.deployContext === "nis2_essential" && (craClass === "DEFAULT" || craClass === "NEEDS_REVIEW")) {
    craClass = "NEEDS_REVIEW";
    classIIFlag = true;
  }

  const route = CLASS_TO_ROUTE[craClass];

  const ev = new Set(a.evidence ?? []);
  const nowActionKey: SelfCheckResult["nowActionKey"] =
    !ev.has("sbom")
      ? "now_sbom"
      : !ev.has("risk")
        ? "now_risk"
        : craClass === "CLASS_II" || craClass === "CRITICAL"
          ? "now_reserve_slot"
          : "now_annex_vii";

  return { craClass, route, resultKey: craClass, nowActionKey, becomesManufacturerFlag, segment, classIIFlag };
}

// The core artifacts every CRA technical file needs. Missing ones are the buyer's
// concrete gaps — surfaced on the result screen with a grounded one-liner each.
export const REQUIRED_EVIDENCE: EvidenceItem[] = ["sbom", "risk", "cvd"];

/** Which required artifacts the visitor does NOT yet have (their gaps). */
export function gaps(a: SelfCheckAnswers): EvidenceItem[] {
  const have = new Set(a.evidence ?? []);
  if (have.has("none")) return [...REQUIRED_EVIDENCE];
  return REQUIRED_EVIDENCE.filter((e) => !have.has(e));
}

export type ReadinessBand = "on_track" | "behind" | "at_risk";

/** A route that cannot self-assess today (Class I closed, or mandatory third-party). */
function hardRoute(r: Route): boolean {
  return r === "self_closed" || r === "third_party" || r === "third_party_plus";
}

export interface ScoreDelta {
  key: string;
  points: number;
}

const MISSING_KEY: Record<EvidenceItem, string | undefined> = {
  sbom: "missing_sbom",
  risk: "missing_risk",
  cvd: "missing_cvd",
  sdl: undefined,
  cert: undefined,
  cert_progress: undefined,
  none: undefined,
};

/** Queue penalty: a mandatory third-party route with a portfolio large enough to queue for a CAB slot. */
function queuePenaltyApplies(route: Route, portfolioSize: PortfolioSize | undefined): boolean {
  return (
    (route === "third_party" || route === "third_party_plus") &&
    (portfolioSize === "p11_50" || portfolioSize === "p50plus")
  );
}

/**
 * The itemised deltas behind the readiness score, in a fixed, explainable order:
 * missing artifacts -> hard route -> EU market -> cert/cert-progress -> SDL -> queue.
 * `total` is `100 + sum(deltas)` clamped to 5–98, matching the v1 gauge's clamp.
 */
export function scoreBreakdown(a: SelfCheckAnswers): { total: number; deltas: ScoreDelta[] } {
  const deltas: ScoreDelta[] = [];
  const missing = gaps(a);
  for (const item of missing) {
    const key = MISSING_KEY[item];
    if (key) deltas.push({ key, points: -22 });
  }

  const route = classify(a).route;
  if (hardRoute(route)) deltas.push({ key: "hard_route", points: -14 });
  if (a.euMarket === true) deltas.push({ key: "eu_market", points: -4 }); // in-market = clock is already running

  const ev = new Set(a.evidence ?? []);
  if (ev.has("cert")) {
    deltas.push({ key: "cert", points: 12 });
  } else if (ev.has("cert_progress")) {
    deltas.push({ key: "cert_progress", points: 6 });
  }
  if (ev.has("sdl")) deltas.push({ key: "sdl", points: 6 });

  if (queuePenaltyApplies(route, a.portfolioSize)) deltas.push({ key: "queue", points: -8 });

  const sum = deltas.reduce((s, d) => s + d.points, 0);
  const total = Math.max(5, Math.min(98, 100 + sum));
  return { total, deltas };
}

/**
 * A transparent 5–98 readiness score for the gauge: start at 100, subtract for
 * each missing core artifact and for a route that needs a (currently non-existent)
 * Conformity Assessment Body. Deterministic; the band is derived from the gaps too.
 */
export function readinessScore(a: SelfCheckAnswers): number {
  return scoreBreakdown(a).total;
}

export function readinessBand(a: SelfCheckAnswers): ReadinessBand {
  const missing = gaps(a).length;
  const hard = hardRoute(classify(a).route);
  if (missing >= 2 || (missing >= 1 && hard)) return "at_risk";
  if (missing === 1) return "behind";
  return "on_track";
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

/** Upper bound of each portfolio-size bucket, i.e. the worst-case product count. */
const PRODUCTS: Record<PortfolioSize, number> = { p1: 1, p2_10: 10, p11_50: 50, p50plus: 100 };

/** The Class II self-assessment closure date the runway graphic counts down to. */
const WALL = Date.UTC(2027, 11, 11); // 2027-12-11

/**
 * Serial worst-case runway math for the "can you make the wall" graphic: how many
 * weeks a portfolio needs (16–24 weeks/product, serially — the honest default; the
 * annotation copy explains Module H parallelisation as the fix) vs. how many weeks
 * remain before the Class I self-assessment closure date, from a start point shiftable
 * by whole quarters (13 weeks each).
 */
export function runwayMath(
  portfolioSize: PortfolioSize,
  startQuarterOffset: number,
  now: Date,
): { weeksNeededMin: number; weeksNeededMax: number; weeksAvailable: number; overshootWeeks: number } {
  const count = PRODUCTS[portfolioSize];
  const weeksNeededMin = count * 16;
  const weeksNeededMax = count * 24;

  const start = now.getTime() + startQuarterOffset * 13 * WEEK_MS;
  const weeksAvailable = Math.floor((WALL - start) / WEEK_MS);
  const overshootWeeks = Math.max(0, weeksNeededMin - weeksAvailable);

  return { weeksNeededMin, weeksNeededMax, weeksAvailable, overshootWeeks };
}
