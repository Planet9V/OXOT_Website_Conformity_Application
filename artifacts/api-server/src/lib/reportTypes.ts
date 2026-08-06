import type { AppliedStandard } from "@workspace/db";

/**
 * Frozen snapshot shapes for the executive reporting suite. A report stores
 * one of these in `data_snapshot` at generation time and every section —
 * deterministic or AI-drafted — is rendered exclusively from it, so a report
 * never drifts when live assessment data changes afterwards.
 *
 * All timestamps are ISO strings: snapshots are plain JSON.
 */

export type ReportScope = "assessment" | "portfolio";
export type ReportFormat = "briefing" | "full" | "readout";
export type ReportAudience = "board" | "regulator";

export type SnapshotRequirement = {
  refCode: string;
  title: string;
  themeKey: string;
  themeName: string;
  status: string; // not_started | in_progress | met | partial | not_met | not_applicable
  riskRating: string | null;
  owner: string;
  dueDate: string | null;
  note: string;
};

export type SnapshotTheme = {
  key: string;
  name: string;
  met: number;
  partial: number;
  open: number; // not_started + in_progress + not_met
  notApplicable: number;
  total: number;
  score: number; // 0-100 from the grading model
};

export type SnapshotEvidence = {
  id: number;
  title: string;
  evidenceType: string;
  requirementRefCode: string | null;
  fileName: string;
  hashPrefix: string; // first 12 hex chars of SHA-256 ("" when none)
  createdAt: string;
};

export type SnapshotArtifactDoc = {
  artifactType: string;
  status: string; // draft | final
  completeness: number; // 0-100
};

export type SnapshotIncidentClock = {
  label: string; // "Early warning (24h)" | "Notification (72h)" | "Final report"
  dueAt: string;
  doneAt: string | null;
  overdue: boolean; // due in the past and not done, as of snapshot time
};

export type SnapshotIncident = {
  id: number;
  title: string;
  kind: string; // exploited_vulnerability | severe_incident
  severity: string;
  status: string; // open | closed
  detectedAt: string;
  clocks: SnapshotIncidentClock[];
  memberStates: string;
  correctiveMeasures: string;
  userMitigations: string;
};

export type SnapshotBom = {
  bomType: string;
  name: string;
  componentCount: number;
  findingCount: number;
  findingsBySeverity: { critical: number; high: number; medium: number; low: number; other: number };
};

export type SnapshotDeadline = {
  label: string;
  dueAt: string;
  done: boolean;
  kind: "statutory" | "support" | "internal";
};

export type SnapshotActivity = { createdAt: string; summary: string; actor: string };

export type SnapshotRegulation = {
  key: string;
  shortName: string;
  fullTitle: string;
  sourceUrl: string;
};

export type SnapshotGrade = {
  overallScore: number;
  overallGrade: string;
  blockerCount: number;
  requirementScore: number;
  artifactScore: number;
};

export type AssessmentSnapshot = {
  scope: "assessment";
  generatedAt: string;
  product: {
    name: string;
    version: string;
    productType: string;
    manufacturerName: string;
    manufacturerAddress: string;
    intendedUse: string;
    supportPeriodStart: string | null;
    supportPeriodEnd: string | null;
  };
  assessment: {
    id: number;
    regulationKey: string;
    status: string;
    currentStage: string;
    scopeResult: string | null;
    classKey: string | null;
    className: string | null;
    routeKey: string | null;
    routeName: string | null;
    startedAt: string;
    updatedAt: string;
  };
  grade: SnapshotGrade;
  readiness: { met: number; notApplicable: number; partial: number; open: number; total: number; percent: number };
  themes: SnapshotTheme[];
  requirements: SnapshotRequirement[];
  gaps: SnapshotRequirement[]; // open/partial requirements, risk-ranked
  evidence: SnapshotEvidence[];
  artifactsDocs: SnapshotArtifactDoc[];
  incidents: SnapshotIncident[];
  boms: SnapshotBom[];
  /** Upstream maintainer notifications still pending (CRA Art 13(6)). */
  upstreamNotificationGaps: number;
  deadlines: SnapshotDeadline[];
  activityTail: SnapshotActivity[];
  appliedStandards: AppliedStandard[];
  standardsAdvisory: string | null;
  regulations: SnapshotRegulation[];
};

export type PortfolioRow = {
  assessmentId: number;
  productName: string;
  version: string;
  status: string;
  currentStage: string;
  classKey: string | null;
  routeKey: string | null;
  grade: string;
  score: number;
  blockers: number;
  openGaps: number;
  openIncidents: number;
  evidenceCount: number;
  nearestDeadline: { label: string; dueAt: string } | null;
};

export type SystemicGap = {
  refCode: string;
  title: string;
  themeName: string;
  failCount: number;
  products: string[];
};

export type PortfolioSnapshot = {
  scope: "portfolio";
  generatedAt: string;
  productCount: number;
  assessmentCount: number;
  averageScore: number;
  gradeDistribution: { grade: string; count: number }[];
  totals: { blockers: number; openGaps: number; openIncidents: number; overdueDeadlines: number };
  rows: PortfolioRow[];
  systemicGaps: SystemicGap[];
  deadlineHorizon: { productName: string; label: string; dueAt: string; done: boolean }[]; // next 90 days
  appliedStandards: AppliedStandard[]; // union across assessments (deduped by reference)
  regulations: SnapshotRegulation[];
};

export type ReportSnapshot = AssessmentSnapshot | PortfolioSnapshot;

export const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  met: "Met",
  partial: "Partially met",
  not_met: "Not met",
  not_applicable: "Not applicable",
};

export const RISK_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function formatLabel(format: ReportFormat): string {
  return format === "briefing" ? "Executive Briefing" : format === "full" ? "Conformity Assessment Report" : "Executive Readout";
}

export function audienceLabel(audience: ReportAudience): string {
  return audience === "board" ? "Board edition" : "Regulatory edition";
}
