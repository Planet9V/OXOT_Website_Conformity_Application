/**
 * The regulation-agnostic execution engine that turns captured assessment state
 * into decisions and documents:
 *   - resolveRoutes:    which conformity routes are allowed for a class (Art 32).
 *   - computeGrade:     a weighted readiness score with per-theme breakdown.
 *   - buildArtifacts:   compiles DoC / technical docs / risk assessment / CVD
 *                       policy / SBOM reference / support statement / Annex II
 *                       user information from state, flagging which fields are
 *                       still missing.
 *   - incidentClock:    the CRA Art 14 track-aware reporting deadlines
 *                       (24h / 72h, plus the per-track final-report anchor).
 *
 * All functions are pure — the route handler reads the DB and passes rows in —
 * so the compliance logic is deterministic and unit-testable. Nothing here is
 * legal advice.
 */
import type {
  ConformityRouteRow,
  ProductClassRow,
  ConformityThemeRow,
  ConformityProductRow,
  ConformityAssessmentRow,
  ConformityEvidenceRow,
  AppliedStandard,
  ArtifactSection,
  ThemeScore,
  ArtifactScore,
} from "@workspace/db";
import type { AnswerMap } from "./craFlow";
import { assessSupportPeriod } from "./supportPeriod";

// ---------------------------------------------------------------------------
// Route resolution (Article 32)
// ---------------------------------------------------------------------------

/**
 * Art 32(2) advisory — NOT a gate. A Class I important product may only use
 * Module A (self-assessment) when harmonised standards / common specifications
 * / an EU cybersecurity certification scheme (assurance level at least
 * "substantial") FULLY cover the applicable essential requirements. When the
 * route claims Module A but the standards ledger doesn't back it with at least
 * one fully-applied entry, surface the mismatch so the assessor records the
 * standards or changes route before the DoC is signed.
 */
export function standardsRouteAdvisory(input: {
  classKey: string | null;
  routeKey: string | null;
  appliedStandards: AppliedStandard[] | null | undefined;
}): string | null {
  if (input.classKey !== "important_class_i" || input.routeKey !== "module_a") return null;
  const standards = input.appliedStandards ?? [];
  if (standards.some((s) => s.coverage === "full")) return null;
  const remedy =
    "Art 32(2) requires harmonised standards, common specifications or a European cybersecurity certification scheme (assurance level at least 'substantial') to fully cover the applicable essential requirements — record at least one standard as applied in full, or switch to a third-party route (Module B+C or Module H).";
  return standards.length
    ? `Module A (self-assessment) is selected for a Class I important product, but every standard on record is only partially applied. ${remedy}`
    : `Module A (self-assessment) is selected for a Class I important product, but no applied standards are recorded yet. ${remedy}`;
}

export type AllowedRoute = {
  key: string;
  name: string;
  description: string;
  thirdPartyRequired: boolean;
};

export type ResolvedRoutes = {
  allowed: AllowedRoute[];
  recommendedRouteKey: string | null;
};

export function resolveRoutes(
  classKey: string,
  appliesHarmonised: boolean | undefined,
  routes: ConformityRouteRow[],
  productClass: ProductClassRow | undefined,
): ResolvedRoutes {
  let allowed = routes.filter((r) =>
    ((r.appliesToClasses as string[]) ?? []).includes(classKey),
  );

  // A Class I important product may only self-assess (Module A) when harmonised
  // standards / common specs / a certification scheme are fully applied.
  if (classKey === "important_class_i" && appliesHarmonised !== true) {
    allowed = allowed.filter((r) => r.key !== "module_a");
  }
  // Class II important products (Art 32(3)) and Critical products (Art 32(4)) may NEVER use Module A.
  if (classKey === "important_class_ii" || classKey === "critical") {
    allowed = allowed.filter((r) => r.key !== "module_a");
  }

  let recommendedRouteKey: string | null = productClass?.defaultRouteKey ?? null;
  if (classKey === "important_class_i") {
    recommendedRouteKey = appliesHarmonised === true ? "module_a" : "module_b_c";
  }
  if (recommendedRouteKey && !allowed.some((r) => r.key === recommendedRouteKey)) {
    recommendedRouteKey = allowed[0]?.key ?? null;
  }

  return {
    allowed: allowed
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((r) => ({
        key: r.key,
        name: r.name,
        description: r.description,
        thirdPartyRequired: r.thirdPartyRequired,
      })),
    recommendedRouteKey,
  };
}

// ---------------------------------------------------------------------------
// Grade computation
// ---------------------------------------------------------------------------

export type EvalLite = {
  requirementRefCode: string;
  status: string;
  themeKey: string | null;
  obligationType: string;
};

const STATUS_SCORE: Record<string, number | null> = {
  met: 1,
  partial: 0.6,
  in_progress: 0.3,
  not_started: 0,
  not_met: 0,
  not_applicable: null, // excluded from scoring
};

export type GradeResult = {
  overallScore: number;
  overallGrade: string;
  blockerCount: number;
  requirementScore: number;
  artifactScore: number;
  perTheme: ThemeScore[];
  perArtifact: ArtifactScore[];
};

function letterFor(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

function capGrade(letter: string, floorLetter: string): string {
  const order = ["A", "B", "C", "D", "F"];
  return order.indexOf(letter) >= order.indexOf(floorLetter) ? letter : floorLetter;
}

export function computeGrade(
  evaluations: EvalLite[],
  themes: ConformityThemeRow[],
  artifacts: { artifactType: string; sections: ArtifactSection[] }[],
): GradeResult {
  const themeName = new Map(themes.map((t) => [t.key, t.name]));

  // Per-theme rollup.
  const byTheme = new Map<string, { sum: number; count: number; met: number }>();
  let reqSum = 0;
  let reqCount = 0;
  let blockerCount = 0;

  for (const e of evaluations) {
    const s = STATUS_SCORE[e.status];
    if (e.status === "not_met") blockerCount += 1;
    if (s === null || s === undefined) continue; // N/A excluded
    reqSum += s;
    reqCount += 1;
    const key = e.themeKey ?? "other";
    const agg = byTheme.get(key) ?? { sum: 0, count: 0, met: 0 };
    agg.sum += s;
    agg.count += 1;
    if (e.status === "met") agg.met += 1;
    byTheme.set(key, agg);
  }

  const perTheme: ThemeScore[] = [...byTheme.entries()]
    .map(([themeKey, agg]) => ({
      themeKey,
      themeName: themeName.get(themeKey) ?? themeKey,
      score: Math.round((agg.sum / agg.count) * 100),
      met: agg.met,
      total: agg.count,
    }))
    .sort((a, b) => a.themeName.localeCompare(b.themeName));

  const perArtifact: ArtifactScore[] = artifacts.map((a) => {
    const total = a.sections.length || 1;
    const complete = a.sections.filter((s) => s.complete).length;
    return { artifactType: a.artifactType, completeness: Math.round((complete / total) * 100) };
  });

  const requirementScore = reqCount ? Math.round((reqSum / reqCount) * 100) : 0;
  const artifactScore = perArtifact.length
    ? Math.round(perArtifact.reduce((s, a) => s + a.completeness, 0) / perArtifact.length)
    : 0;

  // Weight requirements more heavily than paperwork.
  const overallScore = Math.round(0.7 * requirementScore + 0.3 * artifactScore);
  let overallGrade = letterFor(overallScore);
  // Any unmet essential requirement means the product is not conforming: cap at D.
  if (blockerCount > 0) overallGrade = capGrade(overallGrade, "D");

  return {
    overallScore,
    overallGrade,
    blockerCount,
    requirementScore,
    artifactScore,
    perTheme,
    perArtifact,
  };
}

// ---------------------------------------------------------------------------
// Article 64 Financial Penalty Risk Engine
// ---------------------------------------------------------------------------

/**
 * Calculates statutory fine risk exposure under CRA Article 64.
 * Article 61(1): Non-compliance with Annex I essential requirements triggers
 * administrative fines up to €15,000,000 or 2.5% of worldwide annual turnover,
 * whichever is higher.
 */
export function computeArticle61PenaltyRisk(input: {
  blockerCount: number;
  globalTurnoverEur?: number | null;
}): {
  maxStatutoryFineEur: number;
  fineRiskCategory: "low" | "medium" | "high" | "critical";
  penaltyBasis: string;
} {
  const baseCap = 15_000_000;
  const turnoverCap = input.globalTurnoverEur ? input.globalTurnoverEur * 0.025 : 0;
  const maxStatutoryFineEur = Math.max(baseCap, turnoverCap);

  let fineRiskCategory: "low" | "medium" | "high" | "critical" = "low";
  if (input.blockerCount > 5) fineRiskCategory = "critical";
  else if (input.blockerCount > 2) fineRiskCategory = "high";
  else if (input.blockerCount > 0) fineRiskCategory = "medium";

  const penaltyBasis =
    input.globalTurnoverEur && turnoverCap > baseCap
      ? `2.5% of global turnover (€${(turnoverCap / 1e6).toFixed(1)}M)`
      : `Statutory cap (€15M under CRA Art 61(1))`;

  return {
    maxStatutoryFineEur,
    fineRiskCategory,
    penaltyBasis,
  };
}

// ---------------------------------------------------------------------------
// Incident clock (Article 14)
// ---------------------------------------------------------------------------

/** The two statutory CRA Article 14 reporting tracks. */
export type IncidentKind = "exploited_vulnerability" | "severe_incident";

export const INCIDENT_KINDS: readonly IncidentKind[] = [
  "exploited_vulnerability",
  "severe_incident",
] as const;

export const INCIDENT_KIND_LABELS: Record<IncidentKind, string> = {
  exploited_vulnerability: "Actively exploited vulnerability",
  severe_incident: "Severe incident",
};

export function isIncidentKind(value: string): value is IncidentKind {
  return (INCIDENT_KINDS as readonly string[]).includes(value);
}

/**
 * Terminal incident statuses. Everything else (open, investigating,
 * mitigated, …) is an ACTIVE Article 14 track that must keep counting toward
 * incident exposure. Canonical semantics — alerting, portfolio rollups and
 * executive reports must all agree with the workbench worklist.
 */
export const CLOSED_INCIDENT_STATUSES = ["resolved", "closed"] as const;

export function isIncidentClosed(status: string): boolean {
  return (CLOSED_INCIDENT_STATUSES as readonly string[]).includes(status);
}

const H = 60 * 60 * 1000;
const D = 24 * H;

/**
 * Exact calendar-month arithmetic for Art 14(5)'s "one month" — NOT a 30-day
 * approximation. Jan 31 + 1 month clamps to the last day of February (the EU
 * Regulation 1182/71 rule: when the corresponding day does not exist, the
 * period ends on the last day of the target month). Time-of-day is preserved.
 */
export function addCalendarMonth(from: Date): Date {
  const d = new Date(from.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1); // avoid overflow while switching months
  d.setUTCMonth(d.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

export interface IncidentClockAnchors {
  /** Vulnerability track: when a corrective/mitigating measure became available. */
  correctiveAvailableAt?: Date | null;
  /** Severe-incident track: when the 72h notification was submitted. */
  notificationDoneAt?: Date | null;
}

/**
 * Track-aware Article 14 reporting deadlines. Both tracks: early warning
 * detection + 24h, notification detection + 72h.
 *
 * Final report:
 *  - exploited_vulnerability: 14 days after the corrective measure became
 *    AVAILABLE; conservative fallback detection + 14 days until that anchor is
 *    recorded.
 *  - severe_incident: one CALENDAR month after the 72h notification was
 *    SUBMITTED (exact month arithmetic with end-of-month clamping);
 *    conservative fallback detection + 72h + one month.
 */
export function incidentClock(
  detectedAt: Date,
  kind: IncidentKind = "exploited_vulnerability",
  anchors: IncidentClockAnchors = {},
): {
  earlyWarningDueAt: Date;
  notificationDueAt: Date;
  finalReportDueAt: Date;
} {
  const t = detectedAt.getTime();
  let finalReportDueAt: Date;
  if (kind === "severe_incident") {
    const anchor = anchors.notificationDoneAt;
    finalReportDueAt =
      anchor != null ? addCalendarMonth(anchor) : addCalendarMonth(new Date(t + 72 * H));
  } else {
    const anchor = anchors.correctiveAvailableAt?.getTime();
    finalReportDueAt = anchor != null ? new Date(anchor + 14 * D) : new Date(t + 14 * D);
  }
  return {
    earlyWarningDueAt: new Date(t + 24 * H),
    notificationDueAt: new Date(t + 72 * H),
    finalReportDueAt,
  };
}

// ---------------------------------------------------------------------------
// Incident report package (Article 14 — SRP-ready)
// ---------------------------------------------------------------------------

export interface IncidentReportField {
  label: string;
  value: string;
  /** True when the Art 14-required content has not been captured yet. */
  missing: boolean;
  /** Statutory basis, e.g. "Art 14(2)(b) CRA"; "" for context-only fields. */
  citation: string;
}

export type IncidentReportStage = "early_warning" | "notification" | "final_report";

export interface IncidentReportSection {
  stage: IncidentReportStage;
  label: string;
  /** The CRA provision this stage submission fulfils. */
  articleRef: string;
  dueAt: string;
  doneAt: string | null;
  fields: IncidentReportField[];
}

/** The structural slice of the incident row the report builder needs. */
export interface IncidentForReport {
  id: number;
  assessmentId: number;
  title: string;
  description: string;
  kind: string;
  severity: string;
  detectedAt: Date;
  earlyWarningDueAt: Date;
  earlyWarningDoneAt: Date | null;
  notificationDueAt: Date;
  notificationDoneAt: Date | null;
  finalReportDueAt: Date;
  finalReportDoneAt: Date | null;
  correctiveAvailableAt: Date | null;
  memberStates: string;
  suspectedMalicious: boolean;
  exploitNature: string;
  correctiveMeasures: string;
  userMitigations: string;
  threatActorInfo: string;
  sensitive: boolean;
}

function reportField(
  label: string,
  value: string,
  required = true,
  citation = "",
): IncidentReportField {
  const trimmed = value.trim();
  return { label, value: trimmed, missing: required && trimmed === "", citation };
}

function utc(d: Date | null): string {
  return d ? `${d.toISOString().slice(0, 16).replace("T", " ")} UTC` : "";
}

/**
 * Assemble the three-stage Article 14 report package (early warning / 72h
 * notification / final report) from captured incident state. Nothing is
 * invented: any required field not yet captured is flagged `missing` so the
 * export renders an explicit "To complete:" marker instead of fabricated text.
 */
export function buildIncidentReportPackage(
  incident: IncidentForReport,
  productName: string,
): {
  kindLabel: string;
  deadlineNote: string;
  sections: IncidentReportSection[];
} {
  const kind: IncidentKind = isIncidentKind(incident.kind)
    ? incident.kind
    : "exploited_vulnerability";
  const kindLabel = INCIDENT_KIND_LABELS[kind];
  const severe = kind === "severe_incident";
  const yesNo = (b: boolean): string => (b ? "Yes" : "No");
  // Statutory bases: actively exploited vulnerabilities follow Art 14(2)(a)-(c);
  // severe incidents follow Art 14(3)(a)-(c). Reports go via the ENISA single
  // reporting platform established under Art 16 CRA.
  const par = severe ? "14(3)" : "14(2)";

  const identity: IncidentReportField[] = [
    reportField("Product concerned", productName, true, "Art 14(1) CRA"),
    reportField("Report track", kindLabel, true, `Art ${par} CRA`),
    reportField("Manufacturer aware since", utc(incident.detectedAt), true, `Art ${par} CRA`),
    reportField(
      "Information considered highly sensitive",
      yesNo(incident.sensitive),
      false,
      "Art 14(2), (3) CRA",
    ),
  ];

  const earlyWarning: IncidentReportSection = {
    stage: "early_warning",
    label: "Early warning (24h)",
    articleRef: `Art ${par}(a) CRA`,
    dueAt: incident.earlyWarningDueAt.toISOString(),
    doneAt: incident.earlyWarningDoneAt?.toISOString() ?? null,
    fields: [
      ...identity,
      reportField(
        severe
          ? "Incident summary"
          : "Actively exploited vulnerability — summary",
        `${incident.title}${incident.description ? ` — ${incident.description}` : ""}`,
        true,
        `Art ${par}(a) CRA`,
      ),
      ...(severe
        ? [
            reportField(
              "Suspected to be caused by unlawful or malicious acts",
              yesNo(incident.suspectedMalicious),
              false,
              "Art 14(3)(a) CRA",
            ),
          ]
        : []),
      reportField("EU member states affected", incident.memberStates, true, `Art ${par}(a) CRA`),
    ],
  };

  const notification: IncidentReportSection = {
    stage: "notification",
    label: "Notification (72h)",
    articleRef: `Art ${par}(b) CRA`,
    dueAt: incident.notificationDueAt.toISOString(),
    doneAt: incident.notificationDoneAt?.toISOString() ?? null,
    fields: [
      ...identity,
      reportField(
        "General information about the incident",
        incident.description,
        true,
        `Art ${par}(b) CRA`,
      ),
      reportField(
        severe
          ? "Nature of the incident (incl. severity and impact)"
          : "Nature of the exploit and the vulnerability concerned",
        incident.exploitNature,
        true,
        `Art ${par}(b) CRA`,
      ),
      reportField("Assessed severity", incident.severity, false, `Art ${par}(b) CRA`),
      reportField(
        "Corrective or mitigating measures taken",
        incident.correctiveMeasures,
        true,
        `Art ${par}(b) CRA`,
      ),
      reportField("EU member states affected", incident.memberStates, true, `Art ${par}(b) CRA`),
      reportField(
        "Known threat-actor information",
        incident.threatActorInfo,
        true,
        `Art ${par}(b) CRA`,
      ),
    ],
  };

  const finalReport: IncidentReportSection = {
    stage: "final_report",
    label: severe
      ? "Final report (1 month after notification)"
      : "Final report (14 days after corrective measure available)",
    articleRef: `Art ${par}(c) CRA`,
    dueAt: incident.finalReportDueAt.toISOString(),
    doneAt: incident.finalReportDoneAt?.toISOString() ?? null,
    fields: [
      ...identity,
      reportField(
        severe
          ? "Detailed description of the incident, its severity and impact"
          : "Detailed description of the vulnerability, its severity and impact",
        [incident.description, incident.exploitNature].filter((s) => s.trim()).join("\n"),
        true,
        `Art ${par}(c) CRA`,
      ),
      ...(kind === "exploited_vulnerability"
        ? [
            reportField(
              "Corrective or mitigating measure available since",
              utc(incident.correctiveAvailableAt),
              true,
              "Art 14(2)(c) CRA",
            ),
          ]
        : []),
      reportField(
        "Information on the malicious actor (where available)",
        incident.threatActorInfo,
        true,
        `Art ${par}(c) CRA`,
      ),
      reportField(
        "Corrective or mitigating measures taken by the manufacturer",
        incident.correctiveMeasures,
        true,
        `Art ${par}(c) CRA`,
      ),
      reportField(
        "Corrective or mitigating measures users can apply",
        incident.userMitigations,
        true,
        `Art ${par}(c) CRA`,
      ),
    ],
  };

  const deadlineNote = severe
    ? "Final report due one calendar month after the 72-hour notification was submitted; until then a conservative detection + 72h + one calendar month applies."
    : "Final report due 14 days after a corrective or mitigating measure became available; until that date is recorded a conservative detection + 14 days applies.";

  return { kindLabel, deadlineNote, sections: [earlyWarning, notification, finalReport] };
}

// ---------------------------------------------------------------------------
// Artifact generation
// ---------------------------------------------------------------------------

export const ARTIFACT_TYPES = [
  "eu_doc",
  "technical_documentation",
  "risk_assessment",
  "cvd_policy",
  "sbom_reference",
  "support_statement",
  "user_information",
] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  eu_doc: "EU Declaration of Conformity",
  technical_documentation: "Technical Documentation",
  risk_assessment: "Cybersecurity Risk Assessment",
  cvd_policy: "Coordinated Vulnerability Disclosure Policy",
  sbom_reference: "Software Bill of Materials (SBOM) Reference",
  support_statement: "Support Period & Update Statement",
  user_information: "User Information & Instructions (Annex II)",
};

export type EvalDetail = {
  requirementRefCode: string;
  title: string;
  status: string;
  themeKey: string | null;
  obligationType: string;
  implementationNote: string;
  riskRating: string | null;
};

export type BuildArtifactsInput = {
  product: ConformityProductRow;
  assessment: ConformityAssessmentRow;
  className: string;
  routeName: string | null;
  thirdPartyRequired: boolean;
  answers: AnswerMap;
  evaluations: EvalDetail[];
  evidence: ConformityEvidenceRow[];
  /**
   * The product's PSIRT/CVD profile (null when unset). The CVD-policy and
   * technical-documentation builders prefer this published contact over the
   * free-text requirement note, so the documents and the public security page
   * can never drift apart.
   */
  psirt: {
    contactEmail: string;
    contactUrl: string;
    policyUrl: string;
    disclosureDays: number;
  } | null;
};

const NEEDED = "To complete: ";

function fmtDate(d: string | null): string {
  return d && d.trim() ? d : "";
}

function evidenceOfType(evidence: ConformityEvidenceRow[], type: string) {
  return evidence.filter((e) => e.evidenceType === type);
}

// Short, human-readable fingerprint for an evidence file, so the technical
// documentation records which exact bytes were assessed (integrity/traceability).
function fingerprintSuffix(e: ConformityEvidenceRow): string {
  return e.fileHash ? ` — sha256:${e.fileHash.slice(0, 12)}…` : "";
}

function evalByRef(evals: EvalDetail[], ref: string) {
  return evals.find((e) => e.requirementRefCode === ref);
}

function buildEuDoc(i: BuildArtifactsInput): ArtifactSection[] {
  const p = i.product;
  const hasManufacturer = !!(p.manufacturerName && p.manufacturerAddress);
  return [
    {
      key: "identification",
      label: "1. Product identification (name, type, version)",
      body: `Product: ${p.name || "—"}\nType: ${p.productType}\nVersion / batch: ${p.version || "—"}`,
      complete: !!(p.name && p.version),
    },
    {
      key: "manufacturer",
      label: "2. Name and address of the manufacturer",
      body: hasManufacturer
        ? `${p.manufacturerName}\n${p.manufacturerAddress}${p.authorizedRep ? `\nAuthorised representative: ${p.authorizedRep}` : ""}`
        : `${NEEDED}manufacturer legal name and address.`,
      complete: hasManufacturer,
    },
    {
      key: "sole_responsibility",
      label: "3. Statement of sole responsibility",
      body: "This declaration of conformity is issued under the sole responsibility of the manufacturer.",
      complete: true,
    },
    {
      key: "object",
      label: "4. Object of the declaration",
      body: p.description || `${NEEDED}a description identifying the product for traceability.`,
      complete: !!p.description,
    },
    {
      key: "conformity",
      label: "5. Conformity statement (CRA Annex I) and assessment route",
      body: i.assessment.routeKey
        ? `The object described above is in conformity with the relevant Union harmonisation legislation, in particular Regulation (EU) 2024/2847 (Cyber Resilience Act). Conformity assessment route: ${i.routeName}.`
        : `${NEEDED}select a conformity assessment route.`,
      complete: !!i.assessment.routeKey,
    },
    {
      key: "standards",
      label: "6. References to harmonised standards / common specifications applied",
      // Render the recorded standards ledger verbatim — the DoC must cite exact
      // references, not a yes/no claim. Explicitly recording "none applied"
      // (fork answered No) is also a complete, honest declaration.
      body: (i.assessment.appliedStandards ?? []).length
        ? (i.assessment.appliedStandards ?? [])
            .map(
              (s) =>
                `  - ${s.reference}${s.title ? ` — ${s.title}` : ""} (${
                  s.coverage === "full" ? "applied in full" : "partially applied"
                })${s.notes ? `: ${s.notes}` : ""}`,
            )
            .join("\n")
        : i.answers["applies_harmonised_standards"]?.bool === false
          ? "No harmonised standards, common specifications or European cybersecurity certification schemes are applied; conformity is declared against the Annex I essential requirements directly."
          : `${NEEDED}record the applied standards on the route stage (or answer the harmonised-standards question "No").`,
      complete:
        (i.assessment.appliedStandards ?? []).length > 0 ||
        i.answers["applies_harmonised_standards"]?.bool === false,
    },
    {
      key: "notified_body",
      label: "7. Notified body (where a third party is involved)",
      body: i.thirdPartyRequired
        ? `${NEEDED}notified body name, four-digit identification number, and certificate/attestation reference.`
        : "Not applicable — self-assessment (Module A).",
      complete: !i.thirdPartyRequired,
    },
    {
      key: "signature",
      label: "8. Place, date and signature",
      body: `Signed for and on behalf of: ${p.manufacturerName || "—"}\nPlace / date: ____________________\nName / function: ____________________`,
      complete: false,
    },
  ];
}

function buildTechnicalDoc(i: BuildArtifactsInput): ArtifactSection[] {
  const p = i.product;
  const allAddressed =
    i.evaluations.length > 0 && i.evaluations.every((e) => e.status !== "not_started");
  const sbom = evidenceOfType(i.evidence, "sbom");
  const tests = evidenceOfType(i.evidence, "test_report");
  const reqTable = i.evaluations
    .map((e) => `  - [${e.status}] ${e.requirementRefCode} — ${e.title}`)
    .join("\n");
  return [
    {
      key: "general_description",
      label: "General description (Annex VII.1)",
      body: `${
        p.description
          ? `${p.description}\nIntended use: ${p.intendedUse || "—"}\nClass: ${i.className}`
          : `${NEEDED}general description and intended use of the product.`
      }\nUser-facing information and instructions are compiled separately — see the "User Information & Instructions (Annex II)" document.`,
      complete: !!(p.description && p.intendedUse),
    },
    {
      key: "design_development",
      label: "Design, development and production (Annex VII.2)",
      body: "Describe the architecture, the secure development process, and the production/monitoring processes used. Attach evidence in the Evidence tab.",
      complete: i.evidence.length > 0,
    },
    {
      key: "essential_requirements",
      label: "Assessment of the Annex I essential requirements",
      body: reqTable || `${NEEDED}instantiate and evaluate the essential requirements.`,
      complete: allAddressed,
    },
    {
      key: "risk_assessment_ref",
      label: "Cybersecurity risk assessment (Art 13)",
      body:
        evalByRef(i.evaluations, "Art 13")?.status === "met"
          ? "See the accompanying Cybersecurity Risk Assessment artifact."
          : `${NEEDED}complete the risk assessment (requirement Art 13).`,
      complete: evalByRef(i.evaluations, "Art 13")?.status === "met",
    },
    {
      key: "sbom",
      label: "Software bill of materials (Annex I Part II(1))",
      body: sbom.length
        ? sbom.map((s) => `  - ${s.title}${s.url ? ` (${s.url})` : ""}${fingerprintSuffix(s)}`).join("\n")
        : `${NEEDED}attach an SBOM in the Evidence tab (type "sbom").`,
      complete: sbom.length > 0,
    },
    {
      key: "test_reports",
      label: "Reports of tests performed (Annex I Part II(3))",
      body: tests.length
        ? tests.map((t) => `  - ${t.title}${fingerprintSuffix(t)}`).join("\n")
        : `${NEEDED}attach security test reports in the Evidence tab.`,
      complete: tests.length > 0,
    },
    {
      key: "vulnerability_handling",
      label: "Vulnerability handling process (Annex I Part II)",
      body: i.psirt && (i.psirt.contactEmail || i.psirt.contactUrl)
        ? `Coordinated vulnerability disclosure is in place. Published security contact: ${
            i.psirt.contactEmail || i.psirt.contactUrl
          }. Target disclosure window: ${i.psirt.disclosureDays} days. See the accompanying Coordinated Vulnerability Disclosure Policy artifact.`
        : `${NEEDED}publish the security contact on the product's PSIRT/CVD profile (PSIRT → CVD profiles).`,
      complete: !!(i.psirt && (i.psirt.contactEmail || i.psirt.contactUrl)),
    },
    {
      key: "support_period",
      label: "Support period",
      body: fmtDate(p.supportPeriodEnd)
        ? `Support period: ${fmtDate(p.supportPeriodStart) || "start"} to ${fmtDate(p.supportPeriodEnd)}.`
        : `${NEEDED}define the support period end date on the product.`,
      complete: !!fmtDate(p.supportPeriodEnd),
    },
  ];
}

function buildRiskAssessment(i: BuildArtifactsInput): ArtifactSection[] {
  const productReqs = i.evaluations.filter(
    (e) => e.obligationType === "product_requirement",
  );
  const rated = productReqs.filter((e) => !!e.riskRating);
  const table = productReqs
    .map(
      (e) =>
        `  - ${e.requirementRefCode} — ${e.title}\n      risk: ${e.riskRating ?? "unrated"} | status: ${e.status}${e.implementationNote ? `\n      mitigation: ${e.implementationNote}` : ""}`,
    )
    .join("\n");
  const unmitigatedHigh = productReqs.filter(
    (e) => (e.riskRating === "high" || e.riskRating === "critical") && e.status !== "met",
  );
  return [
    {
      key: "methodology",
      label: "Methodology",
      body: "Risks were identified per Annex I Part I essential requirement, rated by likelihood and impact, and mitigated by the corresponding security measure. Residual risk is reviewed before release.",
      complete: true,
    },
    {
      key: "risk_register",
      label: "Risk register (per essential requirement)",
      body: table || `${NEEDED}instantiate the essential requirements and rate their risk.`,
      complete: productReqs.length > 0 && rated.length === productReqs.length,
    },
    {
      key: "residual_risk",
      label: "Residual risk determination",
      body: unmitigatedHigh.length
        ? `${unmitigatedHigh.length} high/critical risk(s) are not yet met — resolve before placing on the market.`
        : "No unmitigated high or critical risks recorded.",
      complete: unmitigatedHigh.length === 0 && rated.length > 0,
    },
  ];
}

function buildCvdPolicy(i: BuildArtifactsInput): ArtifactSection[] {
  const cvd = evalByRef(i.evaluations, "Annex I Part II(5)");
  const profileContact = [
    i.psirt?.contactEmail ? `Security contact: ${i.psirt.contactEmail}` : "",
    i.psirt?.contactUrl ? `Reporting form: ${i.psirt.contactUrl}` : "",
    i.psirt?.policyUrl ? `CVD policy: ${i.psirt.policyUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const contact = profileContact || cvd?.implementationNote?.trim();
  return [
    {
      key: "security_contact",
      label: "Security contact / reporting point",
      body: contact
        ? contact
        : `${NEEDED}publish the security contact on the product's PSIRT/CVD profile (PSIRT → CVD profiles).`,
      complete: !!contact,
    },
    {
      key: "reporting_channel",
      label: "How to report a vulnerability",
      body: "Researchers can report suspected vulnerabilities to the security contact above. Reports are acknowledged and triaged; good-faith research is not pursued.",
      complete: true,
    },
    {
      key: "disclosure_timeline",
      label: "Handling and disclosure timeline",
      body: `Vulnerabilities are validated, remediated without undue delay, and coordinated for disclosure with the reporter${
        i.psirt ? ` within a target window of ${i.psirt.disclosureDays} days` : ""
      }. Actively exploited vulnerabilities are reported to the CSIRT and ENISA per Art 14.`,
      complete: true,
    },
  ];
}

function buildSbomReference(i: BuildArtifactsInput): ArtifactSection[] {
  const sbom = evidenceOfType(i.evidence, "sbom");
  const part1 = evalByRef(i.evaluations, "Annex I Part II(1)");
  return [
    {
      key: "inventory",
      label: "SBOM inventory (top-level dependencies)",
      body: sbom.length
        ? sbom.map((s) => `  - ${s.title}${s.url ? ` (${s.url})` : ""}${s.fileName ? ` [${s.fileName}]` : ""}${fingerprintSuffix(s)}`).join("\n")
        : `${NEEDED}attach at least one SBOM (type "sbom") in the Evidence tab.`,
      complete: sbom.length > 0,
    },
    {
      key: "format",
      label: "Format",
      body: "SBOMs are maintained in a commonly used machine-readable format (e.g. CycloneDX or SPDX) covering at least the top-level dependencies.",
      complete: true,
    },
    {
      key: "maintenance",
      label: "Maintenance policy",
      body: part1?.implementationNote?.trim()
        ? part1.implementationNote
        : `${NEEDED}describe how the SBOM is kept up to date (note on "Annex I Part II(1)").`,
      complete: !!part1?.implementationNote?.trim(),
    },
  ];
}

function buildSupportStatement(i: BuildArtifactsInput): ArtifactSection[] {
  const p = i.product;
  const end = fmtDate(p.supportPeriodEnd);
  const updateReq = evalByRef(i.evaluations, "Annex I(2)(c)");

  // Art. 13(8) has two limbs: a five-year default, and a shorter period where
  // the product is expected to be in use for less than five years. Assessed in
  // lib/supportPeriod.ts so the rule is unit-tested in both directions.
  const support = assessSupportPeriod({
    supportPeriodStart: p.supportPeriodStart,
    supportPeriodEnd: p.supportPeriodEnd,
    expectedUseTimeMonths: p.expectedUseTimeMonths,
    supportPeriodRationale: p.supportPeriodRationale,
  });

  const supportBody = (() => {
    if (support.status === "not_set") return `${NEEDED}${support.message}`;
    if (!support.satisfiesArticle13_8) return `${NEEDED}${support.message}`;
    const dates = `Security updates are provided from ${fmtDate(p.supportPeriodStart) || "placing on the market"} until ${end}. `;
    const basis =
      support.status === "short_justified" && support.hasRationale
        ? ` Basis recorded for the Annex VII file: ${p.supportPeriodRationale}`
        : "";
    return `${dates}${support.message}${basis}`;
  })();

  return [
    {
      key: "support_period",
      label: "Support period (Art 13(8))",
      body: supportBody,
      complete: support.satisfiesArticle13_8,
    },
    {
      key: "update_policy",
      label: "Update delivery",
      body:
        updateReq?.status === "met"
          ? "Security updates are delivered securely and, where applicable, automatically, with user notification."
          : `${NEEDED}confirm the secure update mechanism (requirement Annex I(2)(c)).`,
      complete: updateReq?.status === "met",
    },
    {
      key: "eol",
      label: "End-of-support communication",
      body: end
        ? `Users will be informed ahead of the end-of-support date (${end}).`
        : `${NEEDED}define the end-of-support date to communicate to users.`,
      complete: !!end,
    },
  ];
}

/**
 * CRA Annex II — the information and instructions that must accompany the
 * product to the user. Each section maps to an Annex II item and doubles as a
 * completeness checklist: it auto-fills from what the workbench already knows
 * (product fields, requirement notes, evidence) and carries a "To complete:"
 * marker otherwise. The Annex II(6) item (internet address of the EU DoC) is
 * intentionally not modelled — the workbench does not capture publication URLs.
 */
function buildUserInformation(i: BuildArtifactsInput): ArtifactSection[] {
  const p = i.product;
  const hasManufacturer = !!(p.manufacturerName && p.manufacturerAddress);
  const cvdContact = evalByRef(i.evaluations, "Annex I Part II(5)")?.implementationNote?.trim();
  const updateReq = evalByRef(i.evaluations, "Annex I(2)(c)");
  const updateNote = updateReq?.implementationNote?.trim();
  const annexIiNote = evalByRef(i.evaluations, "Annex II")?.implementationNote?.trim();
  const sbom = evidenceOfType(i.evidence, "sbom");
  const end = fmtDate(p.supportPeriodEnd);
  const productReqs = i.evaluations.filter((e) => e.obligationType === "product_requirement");
  const rated = productReqs.filter((e) => !!e.riskRating);
  const riskRegisterReady = productReqs.length > 0 && rated.length === productReqs.length;
  const openHighRisks = productReqs.filter(
    (e) => (e.riskRating === "high" || e.riskRating === "critical") && e.status !== "met",
  );
  return [
    {
      key: "scope",
      label: "About this document (CRA Annex II)",
      body: `This document compiles the information and instructions that must accompany ${p.name || "the product"} to the user under CRA Annex II — tracked as requirement "Annex II" in the gap assessment. Incomplete sections below are user-facing information still missing: treat this document as an honest checklist until every section is complete.`,
      complete: true,
    },
    {
      key: "manufacturer_contact",
      label: "Manufacturer identity and contact (Annex II(1))",
      body: hasManufacturer
        ? `${p.manufacturerName}\n${p.manufacturerAddress}${p.authorizedRep ? `\nAuthorised representative: ${p.authorizedRep}` : ""}\nInclude an email or other digital contact and, where available, the manufacturer website in the shipped copy.`
        : `${NEEDED}manufacturer legal name and address (set on the product).`,
      complete: hasManufacturer,
    },
    {
      key: "vulnerability_contact",
      label: "Vulnerability reporting contact and CVD policy (Annex II(2))",
      body: cvdContact
        ? `Single point of contact for reporting vulnerabilities: ${cvdContact}\nThe full policy is published as the "Coordinated Vulnerability Disclosure Policy" document of this assessment.`
        : `${NEEDED}record the single point of contact for vulnerability reports in the note of requirement "Annex I Part II(5)" (shared with the CVD Policy document).`,
      complete: !!cvdContact,
    },
    {
      key: "product_identification",
      label: "Product identification (Annex II(3))",
      body: `Product: ${p.name || "—"}\nType: ${p.productType}\nVersion / batch: ${p.version || "—"}${
        p.name && p.version ? "" : `\n${NEEDED}product name and version enabling unique identification.`
      }`,
      complete: !!(p.name && p.version),
    },
    {
      key: "intended_purpose",
      label: "Intended purpose and essential functionality (Annex II(4))",
      body:
        p.description && p.intendedUse
          ? `${p.description}\nIntended purpose: ${p.intendedUse}\nDescribe alongside this the security environment provided by the manufacturer and the security properties users rely on.`
          : `${NEEDED}fill in the product description and intended use on the product, including its essential (security) functionality.`,
      complete: !!(p.description && p.intendedUse),
    },
    {
      key: "risk_circumstances",
      label: "Known circumstances that may lead to significant cybersecurity risks (Annex II(5))",
      body: riskRegisterReady
        ? openHighRisks.length
          ? `Derived from the risk register — disclose the circumstances behind these open high/critical risks:\n${openHighRisks
              .map((e) => `  - ${e.requirementRefCode} — ${e.title}`)
              .join("\n")}`
          : "No high or critical risks are currently open in the risk register. Review reasonably foreseeable misuse before release and record any circumstance that could lead to significant cybersecurity risk."
        : `${NEEDED}rate the risk of every essential requirement in the gap assessment so known risk circumstances can be derived (see the Cybersecurity Risk Assessment document).`,
      complete: riskRegisterReady,
    },
    {
      key: "support_period",
      label: "Technical security support and end of the support period (Annex II(7))",
      body: end
        ? `Vulnerability handling and security updates are provided until ${end}${fmtDate(p.supportPeriodStart) ? ` (support started ${fmtDate(p.supportPeriodStart)})` : ""}. The end date of the support period must be indicated at the time of purchase.`
        : `${NEEDED}set the support period end date on the product — it must be indicated to users at the time of purchase.`,
      complete: !!end,
    },
    {
      key: "update_installation",
      label: "How security updates are installed (Annex II(8)(c),(e))",
      body:
        updateReq?.status === "met" && updateNote
          ? `${updateNote}\nSecurity updates are installed automatically by default (Annex I(2)(c)); the instructions above must include how users can turn that default off.`
          : `${NEEDED}describe in the note of requirement "Annex I(2)(c)" how security-relevant updates are installed and how the default automatic installation can be turned off — then mark the requirement met.`,
      complete: updateReq?.status === "met" && !!updateNote,
    },
    {
      key: "secure_use_decommissioning",
      label: "Secure commissioning, use and decommissioning (Annex II(8)(a),(b),(d))",
      body: annexIiNote
        ? annexIiNote
        : `${NEEDED}record in the note of requirement "Annex II" where the detailed user instructions live (or the internet address referring to them): secure initial commissioning, how changes to the product can affect the security of data, and secure decommissioning including how user data is removed.`,
      complete: !!annexIiNote,
    },
    {
      key: "sbom_access",
      label: "Access to the software bill of materials (Annex II(9))",
      body: sbom.length
        ? `Where the SBOM is made available to users, it can be accessed via:\n${sbom
            .map((s) => `  - ${s.title}${s.url ? ` (${s.url})` : ""}`)
            .join("\n")}`
        : `${NEEDED}attach the SBOM in the Evidence tab (type "sbom"), or record where users can access it.`,
      complete: sbom.length > 0,
    },
  ];
}

const BUILDERS: Record<ArtifactType, (i: BuildArtifactsInput) => ArtifactSection[]> = {
  eu_doc: buildEuDoc,
  technical_documentation: buildTechnicalDoc,
  risk_assessment: buildRiskAssessment,
  cvd_policy: buildCvdPolicy,
  sbom_reference: buildSbomReference,
  support_statement: buildSupportStatement,
  user_information: buildUserInformation,
};

export function buildArtifact(type: ArtifactType, input: BuildArtifactsInput): ArtifactSection[] {
  return BUILDERS[type](input);
}

export function buildAllArtifacts(
  input: BuildArtifactsInput,
): { artifactType: ArtifactType; sections: ArtifactSection[] }[] {
  return ARTIFACT_TYPES.map((t) => ({ artifactType: t, sections: buildArtifact(t, input) }));
}
