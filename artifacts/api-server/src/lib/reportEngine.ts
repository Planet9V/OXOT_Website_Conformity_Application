import { asc, desc, eq, inArray } from "drizzle-orm";
import {
  db,
  conformityAssessmentsTable,
  conformityProductsTable,
  conformityEvaluationsTable,
  requirementsTable,
  conformityThemesTable,
  conformityEvidenceTable,
  conformityArtifactsTable,
  conformityIncidentsTable,
  conformityBomsTable,
  conformityBomFindingsTable,
  conformityBomNotificationsTable,
  conformityActivityTable,
  regulationsTable,
  productClassesTable,
  conformityRoutesTable,
  type AppliedStandard,
  type ReportOptions,
  type ReportSection,
} from "@workspace/db";
import { computeGrade, isIncidentClosed, standardsRouteAdvisory, type EvalLite } from "./conformityEngine";
import { CitationRegistry, STATIC_BIBLIOGRAPHY } from "./reportCitations";
import type { AiSectionSpec } from "./reportNarrative";
import {
  Figures,
  renderActivityExtract,
  renderAssessmentCover,
  renderClassificationRoute,
  renderDeadlineHorizon,
  renderDocumentControl,
  renderEvidenceRegister,
  renderFindingsOverview,
  renderIncidents,
  renderKpiBand,
  renderMethodology,
  renderPortfolioCover,
  renderPortfolioKpis,
  renderPortfolioMethodology,
  renderPortfolioTable,
  renderPostureCharts,
  renderReadoutDeadlines,
  renderReadoutPosture,
  renderReferences,
  renderRemediation,
  renderRequirementMatrix,
  renderRiskAnalysis,
  renderStandardsSection,
  renderSupplyChain,
  renderSystemicGaps,
} from "./reportRenderers";
import {
  formatLabel,
  RISK_ORDER,
  type AssessmentSnapshot,
  type PortfolioSnapshot,
  type ReportAudience,
  type ReportFormat,
  type ReportSnapshot,
  type SnapshotIncident,
  type SnapshotRequirement,
  type SnapshotTheme,
} from "./reportTypes";

/**
 * Report engine: builds frozen data snapshots, the per-report citation
 * registry, and the ordered section plan (deterministic sections pre-rendered,
 * AI sections stubbed as `pending` for the background narrative pipeline).
 */

const OPEN_STATUSES = new Set(["not_met", "partial", "in_progress", "not_started"]);

// ---------------------------------------------------------------------------
// Snapshot builders
// ---------------------------------------------------------------------------

function incidentToSnapshot(i: typeof conformityIncidentsTable.$inferSelect, now: Date): SnapshotIncident {
  const clock = (label: string, dueAt: Date, doneAt: Date | null) => ({
    label,
    dueAt: dueAt.toISOString(),
    doneAt: doneAt ? doneAt.toISOString() : null,
    overdue: !doneAt && dueAt.getTime() < now.getTime(),
  });
  return {
    id: i.id,
    title: i.title,
    kind: i.kind,
    severity: i.severity,
    status: i.status,
    detectedAt: i.detectedAt.toISOString(),
    clocks: [
      clock("Early warning (24h)", i.earlyWarningDueAt, i.earlyWarningDoneAt),
      clock("Notification (72h)", i.notificationDueAt, i.notificationDoneAt),
      clock("Final report", i.finalReportDueAt, i.finalReportDoneAt),
    ],
    memberStates: i.memberStates,
    correctiveMeasures: i.correctiveMeasures,
    userMitigations: i.userMitigations,
  };
}

export async function buildAssessmentSnapshot(assessmentId: number): Promise<AssessmentSnapshot | null> {
  const now = new Date();
  const [assessment] = await db
    .select()
    .from(conformityAssessmentsTable)
    .where(eq(conformityAssessmentsTable.id, assessmentId));
  if (!assessment) return null;
  const [product] = await db
    .select()
    .from(conformityProductsTable)
    .where(eq(conformityProductsTable.id, assessment.productId));
  if (!product) return null;

  const [evaluations, requirements, themes, evidence, artifacts, incidents, boms, regulations] = await Promise.all([
    db
      .select()
      .from(conformityEvaluationsTable)
      .where(eq(conformityEvaluationsTable.assessmentId, assessmentId))
      .orderBy(asc(conformityEvaluationsTable.id)),
    db
      .select()
      .from(requirementsTable)
      .where(eq(requirementsTable.regulationKey, assessment.regulationKey))
      .orderBy(asc(requirementsTable.sortOrder), asc(requirementsTable.id)),
    db.select().from(conformityThemesTable).orderBy(asc(conformityThemesTable.sortOrder)),
    db
      .select()
      .from(conformityEvidenceTable)
      .where(eq(conformityEvidenceTable.assessmentId, assessmentId))
      .orderBy(asc(conformityEvidenceTable.id)),
    db
      .select()
      .from(conformityArtifactsTable)
      .where(eq(conformityArtifactsTable.assessmentId, assessmentId)),
    db
      .select()
      .from(conformityIncidentsTable)
      .where(eq(conformityIncidentsTable.assessmentId, assessmentId))
      .orderBy(asc(conformityIncidentsTable.detectedAt)),
    db.select().from(conformityBomsTable).where(eq(conformityBomsTable.assessmentId, assessmentId)),
    db.select().from(regulationsTable),
  ]);

  const requirementByRef = new Map(requirements.map((r) => [r.refCode, r]));
  const themeByKey = new Map(themes.map((t) => [t.key, t]));
  const evaluationByRef = new Map(evaluations.map((e) => [e.requirementRefCode, e]));

  const snapshotRequirements: SnapshotRequirement[] = requirements.map((r) => {
    const ev = evaluationByRef.get(r.refCode);
    const theme = r.themeKey ? themeByKey.get(r.themeKey) : undefined;
    return {
      refCode: r.refCode,
      title: r.title,
      themeKey: r.themeKey ?? "general",
      themeName: theme?.name ?? "General obligations",
      status: ev?.status ?? "not_started",
      riskRating: ev?.riskRating ?? null,
      owner: ev?.owner ?? "",
      dueDate: ev?.dueDate ?? null,
      note: ev?.implementationNote ?? "",
    };
  });

  const evalLite: EvalLite[] = evaluations
    .filter((e) => requirementByRef.has(e.requirementRefCode))
    .map((e) => {
      const r = requirementByRef.get(e.requirementRefCode)!;
      return {
        requirementRefCode: e.requirementRefCode,
        status: e.status,
        themeKey: r.themeKey,
        obligationType: r.obligationType,
      };
    });
  const grade = computeGrade(
    evalLite,
    themes,
    artifacts.map((a) => ({ artifactType: a.artifactType, sections: a.content.sections })),
  );

  const counts = { met: 0, partial: 0, notApplicable: 0, open: 0 };
  for (const r of snapshotRequirements) {
    if (r.status === "met") counts.met += 1;
    else if (r.status === "partial") counts.partial += 1;
    else if (r.status === "not_applicable") counts.notApplicable += 1;
    else counts.open += 1;
  }
  const total = snapshotRequirements.length;
  const applicable = total - counts.notApplicable;
  const readiness = {
    ...counts,
    total,
    percent: applicable > 0 ? Math.round((counts.met / applicable) * 100) : 0,
  };

  const perThemeScore = new Map(grade.perTheme.map((t) => [t.themeKey, t.score]));
  const snapshotThemes: SnapshotTheme[] = themes
    .map((t) => {
      const reqs = snapshotRequirements.filter((r) => r.themeKey === t.key);
      return {
        key: t.key,
        name: t.name,
        met: reqs.filter((r) => r.status === "met").length,
        partial: reqs.filter((r) => r.status === "partial").length,
        open: reqs.filter((r) => OPEN_STATUSES.has(r.status) && r.status !== "partial").length,
        notApplicable: reqs.filter((r) => r.status === "not_applicable").length,
        total: reqs.length,
        score: Math.round(perThemeScore.get(t.key) ?? 0),
      };
    })
    .filter((t) => t.total > 0);

  const gaps = snapshotRequirements
    .filter((r) => OPEN_STATUSES.has(r.status))
    .sort((a, b) => {
      const riskDiff = (RISK_ORDER[a.riskRating ?? ""] ?? 9) - (RISK_ORDER[b.riskRating ?? ""] ?? 9);
      if (riskDiff !== 0) return riskDiff;
      const aDue = a.dueDate ?? "9999-12-31";
      const bDue = b.dueDate ?? "9999-12-31";
      if (aDue !== bDue) return aDue < bDue ? -1 : 1;
      return a.refCode.localeCompare(b.refCode);
    })
    .slice(0, 40);

  const bomIds = boms.map((b) => b.id);
  const findings = bomIds.length
    ? await db.select().from(conformityBomFindingsTable).where(inArray(conformityBomFindingsTable.bomId, bomIds))
    : [];
  const severityFor = (bomId: number) => {
    const acc = { critical: 0, high: 0, medium: 0, low: 0, other: 0 };
    for (const f of findings) {
      if (f.bomId !== bomId) continue;
      if (f.severity === "critical") acc.critical += 1;
      else if (f.severity === "high") acc.high += 1;
      else if (f.severity === "medium") acc.medium += 1;
      else if (f.severity === "low") acc.low += 1;
      else acc.other += 1;
    }
    return acc;
  };
  const notifications = await db
    .select()
    .from(conformityBomNotificationsTable)
    .where(eq(conformityBomNotificationsTable.assessmentId, assessmentId));
  const upstreamNotificationGaps = notifications.filter((n) => n.status === "pending").length;

  const snapshotIncidents = incidents.map((i) => incidentToSnapshot(i, now));
  const deadlines: AssessmentSnapshot["deadlines"] = [];
  for (const i of snapshotIncidents) {
    for (const c of i.clocks) {
      if (c.doneAt) {
        const doneTime = new Date(c.doneAt).getTime();
        if (now.getTime() - doneTime < 30 * 86_400_000) {
          deadlines.push({ label: `${i.title} — ${c.label}`, dueAt: c.dueAt, done: true, kind: "statutory" });
        }
      } else {
        deadlines.push({ label: `${i.title} — ${c.label}`, dueAt: c.dueAt, done: false, kind: "statutory" });
      }
    }
  }
  if (product.supportPeriodEnd) {
    deadlines.push({
      label: "Support period ends",
      dueAt: new Date(`${product.supportPeriodEnd}T00:00:00.000Z`).toISOString(),
      done: false,
      kind: "support",
    });
  }
  deadlines.sort((a, b) => a.dueAt.localeCompare(b.dueAt));

  const activity = await db
    .select()
    .from(conformityActivityTable)
    .where(eq(conformityActivityTable.assessmentId, assessmentId))
    .orderBy(desc(conformityActivityTable.createdAt))
    .limit(12);

  const [classRow] = assessment.classKey
    ? await db
        .select()
        .from(productClassesTable)
        .where(eq(productClassesTable.key, assessment.classKey))
        .limit(1)
    : [undefined];
  const [routeRow] = assessment.routeKey
    ? await db
        .select()
        .from(conformityRoutesTable)
        .where(eq(conformityRoutesTable.key, assessment.routeKey))
        .limit(1)
    : [undefined];

  const relevantRegulations = regulations.filter((r) => r.key === assessment.regulationKey);

  return {
    scope: "assessment",
    generatedAt: now.toISOString(),
    product: {
      name: product.name,
      version: product.version,
      productType: product.productType,
      manufacturerName: product.manufacturerName,
      manufacturerAddress: product.manufacturerAddress,
      intendedUse: product.intendedUse,
      supportPeriodStart: product.supportPeriodStart ?? null,
      supportPeriodEnd: product.supportPeriodEnd ?? null,
    },
    assessment: {
      id: assessment.id,
      regulationKey: assessment.regulationKey,
      status: assessment.status,
      currentStage: assessment.currentStage,
      scopeResult: assessment.scopeResult ?? null,
      classKey: assessment.classKey ?? null,
      className: classRow?.name ?? null,
      routeKey: assessment.routeKey ?? null,
      routeName: routeRow?.name ?? null,
      startedAt: assessment.startedAt.toISOString(),
      updatedAt: assessment.updatedAt.toISOString(),
    },
    grade: {
      overallScore: grade.overallScore,
      overallGrade: grade.overallGrade,
      blockerCount: grade.blockerCount,
      requirementScore: grade.requirementScore,
      artifactScore: grade.artifactScore,
    },
    readiness,
    themes: snapshotThemes,
    requirements: snapshotRequirements,
    gaps,
    evidence: evidence.map((e) => ({
      id: e.id,
      title: e.title,
      evidenceType: e.evidenceType,
      requirementRefCode: e.requirementRefCode ?? null,
      fileName: e.fileName,
      hashPrefix: e.fileHash ? e.fileHash.slice(0, 12) : "",
      createdAt: e.createdAt.toISOString(),
    })),
    artifactsDocs: artifacts.map((a) => {
      const sections = a.content.sections;
      const complete = sections.filter((sec) => sec.complete).length;
      return {
        artifactType: a.artifactType,
        status: a.status,
        completeness: sections.length > 0 ? Math.round((complete / sections.length) * 100) : 0,
      };
    }),
    incidents: snapshotIncidents,
    boms: boms.map((b) => ({
      bomType: b.bomType,
      name: b.name,
      componentCount: b.componentCount,
      findingCount: b.findingCount,
      findingsBySeverity: severityFor(b.id),
    })),
    upstreamNotificationGaps,
    deadlines: deadlines.slice(0, 14),
    activityTail: activity.map((a) => ({
      createdAt: a.createdAt.toISOString(),
      summary: a.summary,
      actor: a.actor,
    })),
    appliedStandards: assessment.appliedStandards ?? [],
    standardsAdvisory: standardsRouteAdvisory({
      classKey: assessment.classKey ?? null,
      routeKey: assessment.routeKey ?? null,
      appliedStandards: assessment.appliedStandards,
    }),
    regulations: relevantRegulations.map((r) => ({
      key: r.key,
      shortName: r.shortName,
      fullTitle: r.fullTitle,
      sourceUrl: r.sourceUrl,
    })),
  };
}

const GRADE_ORDER = ["A", "B", "C", "D", "E", "F"];

export async function buildPortfolioSnapshot(): Promise<PortfolioSnapshot> {
  const now = new Date();
  const [assessments, products, evaluations, requirements, themes, artifacts, incidents, evidence, regulations] =
    await Promise.all([
      db.select().from(conformityAssessmentsTable).orderBy(asc(conformityAssessmentsTable.id)),
      db.select().from(conformityProductsTable),
      db.select().from(conformityEvaluationsTable),
      db.select().from(requirementsTable),
      db.select().from(conformityThemesTable).orderBy(asc(conformityThemesTable.sortOrder)),
      db.select().from(conformityArtifactsTable),
      db.select().from(conformityIncidentsTable),
      db.select().from(conformityEvidenceTable),
      db.select().from(regulationsTable),
    ]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const requirementByKey = new Map(requirements.map((r) => [`${r.regulationKey}:${r.refCode}`, r]));

  const rows: PortfolioSnapshot["rows"] = [];
  let overdueDeadlines = 0;
  const gradeCounts = new Map<string, number>();
  const systemic = new Map<string, { refCode: string; title: string; themeName: string; products: Set<string> }>();
  const horizon: PortfolioSnapshot["deadlineHorizon"] = [];
  const standardsUnion = new Map<string, AppliedStandard>();

  for (const assessment of assessments) {
    const product = productById.get(assessment.productId);
    if (!product) continue;
    const evals = evaluations.filter((e) => e.assessmentId === assessment.id);
    const arts = artifacts.filter((a) => a.assessmentId === assessment.id);
    const incs = incidents.filter((i) => i.assessmentId === assessment.id);
    const evalLite: EvalLite[] = evals
      .map((e) => {
        const r = requirementByKey.get(`${assessment.regulationKey}:${e.requirementRefCode}`);
        return r
          ? { requirementRefCode: e.requirementRefCode, status: e.status, themeKey: r.themeKey, obligationType: r.obligationType }
          : null;
      })
      .filter((e): e is EvalLite => e !== null);
    const grade = computeGrade(
      evalLite,
      themes,
      arts.map((a) => ({ artifactType: a.artifactType, sections: a.content.sections })),
    );
    const openGaps = evals.filter((e) => OPEN_STATUSES.has(e.status)).length;
    const openIncidents = incs.filter((i) => !isIncidentClosed(i.status)).length;

    let nearest: { label: string; dueAt: string } | null = null;
    for (const i of incs) {
      const snap = incidentToSnapshot(i, now);
      for (const c of snap.clocks) {
        if (c.doneAt) continue;
        if (c.overdue) overdueDeadlines += 1;
        if (!nearest || c.dueAt < nearest.dueAt) nearest = { label: `${i.title} — ${c.label}`, dueAt: c.dueAt };
        if (new Date(c.dueAt).getTime() <= now.getTime() + 90 * 86_400_000) {
          horizon.push({ productName: product.name, label: `${i.title} — ${c.label}`, dueAt: c.dueAt, done: false });
        }
      }
    }
    if (product.supportPeriodEnd) {
      const dueAt = new Date(`${product.supportPeriodEnd}T00:00:00.000Z`).toISOString();
      if (new Date(dueAt).getTime() <= now.getTime() + 90 * 86_400_000) {
        horizon.push({ productName: product.name, label: "Support period ends", dueAt, done: false });
      }
    }

    for (const e of evals) {
      if (e.status !== "not_met" && e.status !== "partial") continue;
      const r = requirementByKey.get(`${assessment.regulationKey}:${e.requirementRefCode}`);
      if (!r) continue;
      const key = `${assessment.regulationKey}:${e.requirementRefCode}`;
      const entry = systemic.get(key) ?? {
        refCode: r.refCode,
        title: r.title,
        themeName: themes.find((t) => t.key === r.themeKey)?.name ?? "General obligations",
        products: new Set<string>(),
      };
      entry.products.add(product.name);
      systemic.set(key, entry);
    }

    for (const std of assessment.appliedStandards ?? []) {
      if (!standardsUnion.has(std.reference)) standardsUnion.set(std.reference, std);
    }

    gradeCounts.set(grade.overallGrade, (gradeCounts.get(grade.overallGrade) ?? 0) + 1);
    rows.push({
      assessmentId: assessment.id,
      productName: product.name,
      version: product.version,
      status: assessment.status,
      currentStage: assessment.currentStage,
      classKey: assessment.classKey ?? null,
      routeKey: assessment.routeKey ?? null,
      grade: grade.overallGrade,
      score: grade.overallScore,
      blockers: grade.blockerCount,
      openGaps,
      openIncidents,
      evidenceCount: evidence.filter((e) => e.assessmentId === assessment.id).length,
      nearestDeadline: nearest,
    });
  }

  horizon.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const systemicGaps = [...systemic.values()]
    .filter((g) => g.products.size >= 2)
    .map((g) => ({
      refCode: g.refCode,
      title: g.title,
      themeName: g.themeName,
      failCount: g.products.size,
      products: [...g.products].sort(),
    }))
    .sort((a, b) => b.failCount - a.failCount || a.refCode.localeCompare(b.refCode))
    .slice(0, 10);

  const usedRegulationKeys = new Set(assessments.map((a) => a.regulationKey));
  const grades = GRADE_ORDER.filter((g) => gradeCounts.has(g) || GRADE_ORDER.indexOf(g) < 6).map((g) => ({
    grade: g,
    count: gradeCounts.get(g) ?? 0,
  }));
  for (const [g, count] of gradeCounts) {
    if (!GRADE_ORDER.includes(g)) grades.push({ grade: g, count });
  }

  return {
    scope: "portfolio",
    generatedAt: now.toISOString(),
    productCount: products.length,
    assessmentCount: assessments.length,
    averageScore: rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0,
    gradeDistribution: grades,
    totals: {
      blockers: rows.reduce((s, r) => s + r.blockers, 0),
      openGaps: rows.reduce((s, r) => s + r.openGaps, 0),
      openIncidents: rows.reduce((s, r) => s + r.openIncidents, 0),
      overdueDeadlines,
    },
    rows,
    systemicGaps,
    deadlineHorizon: horizon.slice(0, 15),
    appliedStandards: [...standardsUnion.values()],
    regulations: regulations
      .filter((r) => usedRegulationKeys.has(r.key))
      .map((r) => ({ key: r.key, shortName: r.shortName, fullTitle: r.fullTitle, sourceUrl: r.sourceUrl })),
  };
}

// ---------------------------------------------------------------------------
// Citations
// ---------------------------------------------------------------------------

export function buildCitationRegistry(snapshot: ReportSnapshot, options: ReportOptions): CitationRegistry {
  const registry = new CitationRegistry();
  for (const r of snapshot.regulations) {
    registry.add("regulation", `reg:${r.key}`, r.fullTitle + (r.sourceUrl ? ` Available at: ${r.sourceUrl}.` : ""));
  }
  for (const std of snapshot.appliedStandards) {
    registry.add(
      "standard",
      `std:${std.reference}`,
      `${std.reference}${std.title ? `, '${std.title}'` : ""} — ${std.coverage === "full" ? "applied in full" : "applied in part"} per the assessment standards ledger.`,
    );
  }
  for (const bib of STATIC_BIBLIOGRAPHY) {
    if (bib.key === "bib:cra" && snapshot.regulations.some((r) => r.key === "cra")) {
      registry.alias("bib:cra", "reg:cra");
      continue;
    }
    registry.add("bibliography", bib.key, bib.label);
  }
  if (snapshot.scope === "assessment" && options.includeEvidenceRegister) {
    for (const e of snapshot.evidence) {
      registry.add(
        "evidence",
        `ev:${e.id}`,
        `Evidence E-${e.id}: '${e.title}' (${e.evidenceType}${e.hashPrefix ? `, SHA-256 ${e.hashPrefix}…` : ""}), registered ${e.createdAt.slice(0, 10)}, OXOT Conformity Workbench evidence vault.`,
      );
    }
  }
  return registry;
}

// ---------------------------------------------------------------------------
// AI section specs (pure function of scope/format/audience)
// ---------------------------------------------------------------------------

export function aiSectionSpecs(scope: "assessment" | "portfolio", format: ReportFormat, audience: ReportAudience): AiSectionSpec[] {
  const board = audience === "board";
  if (scope === "assessment") {
    if (format === "briefing") {
      return [
        { key: "executive_summary", heading: "Executive summary", maxTokens: 1200, brief: "Summarise the product's CRA conformity posture in one tight narrative: overall grade and its main drivers, the most consequential open obligations, statutory deadline exposure, and the trajectory to attestation readiness. Lead with the conclusion." },
        { key: "key_findings", heading: "Key findings", maxTokens: 1200, brief: "The 4–6 findings the reader must know. Each finding: one bold lead sentence plus one supporting fact drawn from DATA (a count, a grade, a deadline or a requirement reference)." },
        { key: "risk_outlook", heading: "Risk outlook", maxTokens: 1000, brief: "Assess exposure over the next quarter: statutory deadlines, blockers left unremediated, incident posture, and the consequence of inaction under market-surveillance powers. Be specific about dates and counts from DATA." },
        board
          ? { key: "decisions_requested", heading: "Decisions requested", maxTokens: 900, brief: "State the specific decisions and resourcing you request of the board, each tied to a gap, deadline or risk in DATA, each with the cost of delay. Number them." }
          : { key: "compliance_position", heading: "Statement of compliance position", maxTokens: 1000, brief: "A precise, non-promotional statement of the current compliance position: what is demonstrated, what remains open, and the planned corrective trajectory with dates from DATA." },
      ];
    }
    if (format === "full") {
      return [
        { key: "executive_summary", heading: "Executive summary", maxTokens: 2000, brief: "A self-contained summary of the whole report: conformity posture and grade drivers, material gaps and their risk, standards position, incident/deadline exposure, and readiness trajectory. A reader who stops here must still leave correctly informed." },
        { key: "introduction", heading: "Introduction and scope", maxTokens: 1600, brief: "Set out the purpose and scope of this report: the product under assessment and its intended use, the regulation and the obligations timeline that applies, what the assessment covers and excludes, and how the report is organised." },
        { key: "regulatory_context", heading: "Regulatory context", maxTokens: 2000, brief: "Explain the obligations that bear on this product given its classification and conformity route: essential requirements (Annex I Parts I and II), vulnerability handling, reporting duties (Article 14), technical documentation and the declaration of conformity. Anchor every obligation claim with a citation." },
        { key: "findings_discussion", heading: "Discussion of findings", maxTokens: 2400, brief: "Analyse the evaluation results theme by theme: where the product is strong, where material gaps concentrate, which failures constitute blockers and why. Reference specific requirement reference codes and risk ratings from DATA. Academic register, no lists of raw data — interpret it." },
        { key: "risk_commentary", heading: "Risk commentary", maxTokens: 1800, brief: "Interpret the open risk register: concentration of critical/high items, plausible consequences under market surveillance, dependencies between gaps, and the order in which risk should be retired." },
        { key: "recommendations", heading: "Recommendations", maxTokens: 2000, brief: "A prioritised remediation programme in three horizons: immediate (0–30 days), near term (30–90 days), structural (90+ days). Tie every recommendation to specific gaps, deadlines or advisory findings in DATA and state the exit criterion for each." },
        { key: "conclusion", heading: "Conclusion", maxTokens: 1400, brief: "A measured closing assessment: how close the product is to attestation readiness, the conditions that must hold before the EU declaration of conformity can be issued, and the single most important next step." },
      ];
    }
    return [
      { key: "headline", heading: "The headline", maxTokens: 700, brief: "One bold headline sentence stating the overall posture, then 3 bullets: biggest strength, biggest exposure, most urgent date. Nothing else." },
      { key: "findings_talking_points", heading: "Findings — talking points", maxTokens: 800, brief: "One bold lead line, then 3–5 bullets of findings talking points a presenter can read aloud, each anchored to a number or reference code in DATA." },
      { key: "risk_talking_points", heading: "Risks — talking points", maxTokens: 800, brief: "One bold lead line, then 3–5 bullets on risk and deadline exposure, each with a date or count from DATA." },
      { key: "asks", heading: "What we need from you", maxTokens: 700, brief: board ? "One bold lead line, then 3–4 bullets: the decisions, budget or ownership needed, each with its cost of delay." : "One bold lead line, then 3–4 bullets: the corrective commitments and evidence the manufacturer will provide, each with a date." },
    ];
  }
  // portfolio
  if (format === "briefing" || format === "full") {
    const base: AiSectionSpec[] = [
      { key: "executive_summary", heading: "Executive summary", maxTokens: 1800, brief: "Summarise the portfolio's CRA posture: distribution of grades, where risk concentrates, systemic gaps that repeat across products, statutory deadline exposure, and the overall trajectory. Lead with the conclusion." },
      { key: "systemic_commentary", heading: "Systemic gap analysis", maxTokens: 1600, brief: "Interpret the systemic gaps table: why these requirements likely fail across products (shared platform, process, or organisational causes), and the leverage of fixing them centrally once." },
      { key: "recommendations", heading: "Recommendations", maxTokens: 1800, brief: board ? "Prioritised portfolio-level recommendations: central fixes before per-product fixes, resourcing and ownership asks, each tied to figures in DATA with cost of delay." : "Prioritised portfolio-level corrective programme with horizons and exit criteria, tied to figures in DATA." },
    ];
    if (format === "full") {
      base.splice(1, 0, {
        key: "regulatory_context",
        heading: "Regulatory context",
        maxTokens: 1600,
        brief: "Explain the CRA obligations timeline as it applies across the portfolio (application dates, reporting duties, documentation and declaration obligations) and what market surveillance can demand of a manufacturer with this posture.",
      });
      base.push({ key: "conclusion", heading: "Conclusion", maxTokens: 1200, brief: "A measured closing assessment of portfolio readiness and the two or three moves that most change the risk position." });
    }
    return base;
  }
  return [
    { key: "headline", heading: "The headline", maxTokens: 700, brief: "One bold headline sentence on portfolio posture, then 3 bullets: strongest product, weakest product, most urgent portfolio-wide date. Use names and figures from DATA." },
    { key: "systemic_talking_points", heading: "Systemic gaps — talking points", maxTokens: 800, brief: "One bold lead line, then 3–5 bullets on gaps that repeat across products and what fixing them centrally buys." },
    { key: "asks", heading: "What we need from you", maxTokens: 700, brief: "One bold lead line, then 3–4 bullets: the decisions, budget or ownership needed at portfolio level, each with cost of delay." },
  ];
}

// ---------------------------------------------------------------------------
// Section planning
// ---------------------------------------------------------------------------

function aiStub(spec: AiSectionSpec): ReportSection {
  return { key: spec.key, heading: spec.heading, kind: "ai", status: "pending", html: "", contentMd: "" };
}

function det(key: string, heading: string, html: string): ReportSection {
  return { key, heading, kind: "deterministic", status: "ready", html, contentMd: "" };
}

export function defaultReportTitle(snapshot: ReportSnapshot, format: ReportFormat): string {
  if (snapshot.scope === "assessment") {
    return `${snapshot.product.name} — ${formatLabel(format)}`;
  }
  return `Product Portfolio — ${formatLabel(format)}`;
}

export function planSections(
  snapshot: ReportSnapshot,
  format: ReportFormat,
  audience: ReportAudience,
  options: ReportOptions,
  registry: CitationRegistry,
  title: string,
): { sections: ReportSection[]; aiSpecs: AiSectionSpec[] } {
  const figures = new Figures();
  const specs = aiSectionSpecs(snapshot.scope, format, audience);
  const specByKey = new Map(specs.map((s) => [s.key, s]));
  const ai = (key: string): ReportSection => aiStub(specByKey.get(key)!);
  const sections: ReportSection[] = [];

  if (snapshot.scope === "assessment") {
    const s = snapshot;
    if (format === "briefing") {
      sections.push(
        det("cover", "Cover", renderAssessmentCover(s, format, audience, title)),
        det("kpi_band", "Conformity posture at a glance", renderKpiBand(s)),
        det("posture_charts", "Posture overview", renderPostureCharts(s, figures)),
        ai("executive_summary"),
        ai("key_findings"),
        ai("risk_outlook"),
        audience === "board" ? ai("decisions_requested") : ai("compliance_position"),
        det("references", "References", renderReferences(registry)),
      );
    } else if (format === "full") {
      sections.push(
        det("title_page", "Title page", renderAssessmentCover(s, format, audience, title)),
        det("document_control", "Document control", renderDocumentControl(s, audience)),
        ai("executive_summary"),
        ai("introduction"),
        det("methodology", "Methodology", renderMethodology(s, registry)),
        ai("regulatory_context"),
        det("classification_route", "Classification and conformity route", renderClassificationRoute(s, registry)),
        det("findings_overview", "Findings overview", renderFindingsOverview(s, figures)),
        ai("findings_discussion"),
        det("risk_analysis", "Risk analysis", renderRiskAnalysis(s, figures)),
        ai("risk_commentary"),
        det("standards_conformity", "Harmonised standards and presumption of conformity", renderStandardsSection(s, registry)),
        det("incident_readiness", "Incident reporting readiness (Article 14)", renderIncidents(s, options, figures)),
        det("supply_chain", "Supply-chain transparency", renderSupplyChain(s, registry, figures)),
        det("remediation_programme", "Remediation programme", renderRemediation(s)),
        ai("recommendations"),
        ai("conclusion"),
        det("references", "References", renderReferences(registry)),
      );
      if (options.includeAnnexes) {
        sections.push(det("annex_requirements", "Annex A — Requirement evaluation matrix", renderRequirementMatrix(s, audience === "regulator")));
      }
      if (options.includeEvidenceRegister) {
        sections.push(det("annex_evidence", "Annex B — Evidence register", renderEvidenceRegister(s)));
      }
      if (options.includeAnnexes) {
        sections.push(det("annex_activity", "Annex C — Activity ledger extract", renderActivityExtract(s)));
      }
    } else {
      sections.push(
        det("cover", "Cover", renderAssessmentCover(s, format, audience, title)),
        ai("headline"),
        det("posture_page", "Posture", renderReadoutPosture(s, figures)),
        ai("findings_talking_points"),
        det("findings_page", "Findings by theme", renderFindingsOverview(s, figures)),
        ai("risk_talking_points"),
        det("risk_page", "Risk exposure", renderRiskAnalysis(s, figures)),
        det("deadlines_page", "Deadlines", renderReadoutDeadlines(s, figures)),
        ai("asks"),
        det("references", "References", renderReferences(registry)),
      );
    }
    return { sections, aiSpecs: specs };
  }

  const p = snapshot;
  if (format === "briefing" || format === "full") {
    sections.push(
      det("cover", "Cover", renderPortfolioCover(p, format, audience, title)),
      det("kpi_band", "Portfolio posture at a glance", renderPortfolioKpis(p, figures)),
      ai("executive_summary"),
    );
    if (format === "full") {
      sections.push(det("methodology", "Methodology", renderPortfolioMethodology(registry)), ai("regulatory_context"));
    }
    sections.push(
      det("portfolio_posture", "Per-product posture", renderPortfolioTable(p)),
      det("systemic_gaps", "Systemic gaps", renderSystemicGaps(p)),
      ai("systemic_commentary"),
      det("deadline_horizon", "Deadline horizon (90 days)", renderDeadlineHorizon(p, figures)),
      ai("recommendations"),
    );
    if (format === "full") sections.push(ai("conclusion"));
    sections.push(det("references", "References", renderReferences(registry)));
  } else {
    sections.push(
      det("cover", "Cover", renderPortfolioCover(p, format, audience, title)),
      ai("headline"),
      det("posture_page", "Portfolio posture", renderPortfolioKpis(p, figures)),
      det("portfolio_table_page", "Products", renderPortfolioTable(p)),
      ai("systemic_talking_points"),
      det("systemic_page", "Systemic gaps", renderSystemicGaps(p)),
      det("deadlines_page", "Deadline horizon", renderDeadlineHorizon(p, figures)),
      ai("asks"),
      det("references", "References", renderReferences(registry)),
    );
  }
  return { sections, aiSpecs: specs };
}
