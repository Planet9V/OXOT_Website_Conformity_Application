/**
 * Executive reporting suite — board/regulator-grade reports generated from a
 * FROZEN data snapshot (pattern: flow-run snapshot; reports never drift).
 *
 * Deterministic sections (cover, KPIs, charts, tables, methodology,
 * references) are pre-rendered HTML computed synchronously at creation; AI
 * sections are drafted in the background by lib/reportGeneration and are
 * individually editable/regenerable while the report is `draft`. Finalising
 * locks the report; export composes a self-contained print HTML document.
 *
 * Auth: everything requires a session; the public demo role is read-only
 * (GET only), mirroring the execution-layer convention.
 */
import { Router, type IRouter } from "express";
import { and, desc, eq, inArray, type SQL } from "drizzle-orm";
import {
  db,
  conformityReportsTable,
  conformityAssessmentsTable,
  conformityProductsTable,
  conformityActivityTable,
  type ConformityReportRow,
  type ReportOptions,
  type ReportSection,
} from "@workspace/db";
import {
  CreateConformityReportBody,
  CreateConformityReportResponse,
  ListConformityReportsResponse,
  GetConformityReportParams,
  GetConformityReportResponse,
  UpdateConformityReportSectionParams,
  UpdateConformityReportSectionBody,
  UpdateConformityReportSectionResponse,
  RegenerateConformityReportSectionParams,
  RegenerateConformityReportSectionResponse,
  FinalizeConformityReportParams,
  FinalizeConformityReportResponse,
  DeleteConformityReportParams,
  DeleteConformityReportResponse,
  ExportConformityReportParams,
} from "@workspace/api-zod";
import { requireAuth, getSession } from "../lib/adminAuth";
import {
  buildAssessmentSnapshot,
  buildPortfolioSnapshot,
  buildCitationRegistry,
  defaultReportTitle,
  planSections,
} from "../lib/reportEngine";
import { generateReportAiSections, regenerateReportSection } from "../lib/reportGeneration";
import { composeReportHtml, renderMarkdown } from "../lib/reportExport";
import { validateMarkers } from "../lib/reportCitations";
import { formatLabel, type ReportFormat, type ReportSnapshot } from "../lib/reportTypes";

const router: IRouter = Router();

/**
 * The public demo role is READ-ONLY here, exactly as in the execution layer:
 * report generation costs LLM tokens and mutates shared workspace state.
 * Scoped to /conformity/reports so unrelated routers further down the chain
 * are never affected.
 */
router.use("/conformity/reports", (req, res, next): void => {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    next();
    return;
  }
  if (getSession(req)?.role === "demo" && process.env["DEMO_READONLY"] === "true") {
    res.status(403).json({ error: "The demo workspace is read-only." });
    return;
  }
  next();
});

/** Resolve the acting session's actor string for activity logging. */
function actorOf(req: Parameters<typeof getSession>[0]): string {
  const session = getSession(req);
  if (!session) return "";
  return `${session.role}:${session.username}`;
}

/** Explicit tx result union — keeps `"code" in result` narrowing sound. */
type ReportTxError = { code: 400 | 404 | 409; error: string };

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

function toSectionDto(s: ReportSection) {
  return {
    key: s.key,
    heading: s.heading,
    kind: s.kind,
    status: s.status,
    html: s.html,
    contentMd: s.contentMd,
    note: s.note ?? "",
    editedBy: s.editedBy ?? "",
    editedAt: s.editedAt ?? null,
  };
}

function toSummaryDto(r: ConformityReportRow, productName: string | null) {
  return {
    id: r.id,
    scope: r.scope,
    assessmentId: r.assessmentId ?? null,
    productName,
    title: r.title,
    reportType: r.reportType,
    audience: r.audience,
    status: r.status,
    sectionsTotal: r.sections.length,
    sectionsReady: r.sections.filter((s) => s.status === "ready").length,
    sectionsPending: r.sections.filter((s) => s.status === "pending").length,
    sectionsFailed: r.sections.filter((s) => s.status === "failed").length,
    createdBy: r.createdBy,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function toReportDto(r: ConformityReportRow, productName: string | null) {
  return {
    ...toSummaryDto(r, productName),
    options: r.options,
    citations: r.citations,
    sections: r.sections.map(toSectionDto),
  };
}

/** Product name for assessment-scope reports (null for portfolio scope). */
async function productNameFor(report: ConformityReportRow): Promise<string | null> {
  if (!report.assessmentId) return null;
  const [row] = await db
    .select({ name: conformityProductsTable.name })
    .from(conformityAssessmentsTable)
    .innerJoin(conformityProductsTable, eq(conformityAssessmentsTable.productId, conformityProductsTable.id))
    .where(eq(conformityAssessmentsTable.id, report.assessmentId));
  return row?.name ?? null;
}

async function loadReport(id: number): Promise<ConformityReportRow | null> {
  const [row] = await db.select().from(conformityReportsTable).where(eq(conformityReportsTable.id, id));
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.get("/conformity/reports", requireAuth, async (req, res): Promise<void> => {
  const scope = typeof req.query.scope === "string" ? req.query.scope : undefined;
  const assessmentIdRaw = typeof req.query.assessmentId === "string" ? Number(req.query.assessmentId) : undefined;
  const filters: SQL[] = [];
  if (scope === "assessment" || scope === "portfolio") filters.push(eq(conformityReportsTable.scope, scope));
  if (assessmentIdRaw !== undefined && Number.isInteger(assessmentIdRaw)) {
    filters.push(eq(conformityReportsTable.assessmentId, assessmentIdRaw));
  }
  const rows = await db
    .select()
    .from(conformityReportsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(conformityReportsTable.updatedAt));

  const assessmentIds = [...new Set(rows.map((r) => r.assessmentId).filter((x): x is number => x !== null))];
  const nameByAssessment = new Map<number, string>();
  if (assessmentIds.length) {
    const names = await db
      .select({ id: conformityAssessmentsTable.id, name: conformityProductsTable.name })
      .from(conformityAssessmentsTable)
      .innerJoin(conformityProductsTable, eq(conformityAssessmentsTable.productId, conformityProductsTable.id))
      .where(inArray(conformityAssessmentsTable.id, assessmentIds));
    for (const n of names) nameByAssessment.set(n.id, n.name);
  }
  res.json(
    ListConformityReportsResponse.parse({
      reports: rows.map((r) => toSummaryDto(r, r.assessmentId ? (nameByAssessment.get(r.assessmentId) ?? null) : null)),
    }),
  );
});

router.post("/conformity/reports", requireAuth, async (req, res): Promise<void> => {
  const body = CreateConformityReportBody.parse(req.body);
  const reportType = body.reportType as ReportFormat;

  let snapshot: ReportSnapshot;
  let assessmentId: number | null = null;
  if (body.scope === "assessment") {
    if (body.assessmentId === undefined) {
      res.status(400).json({ error: "assessmentId is required for assessment-scope reports" });
      return;
    }
    const built = await buildAssessmentSnapshot(body.assessmentId);
    if (!built) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }
    snapshot = built;
    assessmentId = body.assessmentId;
  } else {
    snapshot = await buildPortfolioSnapshot();
  }

  const options: ReportOptions = {
    includeAnnexes: body.options?.includeAnnexes ?? true,
    includeEvidenceRegister: body.options?.includeEvidenceRegister ?? true,
    includeIncidentDetail: body.options?.includeIncidentDetail ?? body.audience === "regulator",
  };
  const registry = buildCitationRegistry(snapshot, options);
  const title = body.title && body.title.trim() ? body.title.trim() : defaultReportTitle(snapshot, reportType);
  const { sections } = planSections(snapshot, reportType, body.audience, options, registry, title);

  const report = await db.transaction(async (tx) => {
    const rows = await tx
      .insert(conformityReportsTable)
      .values({
        scope: body.scope,
        assessmentId,
        reportType,
        audience: body.audience,
        status: "generating",
        title,
        options,
        dataSnapshot: snapshot as unknown as Record<string, unknown>,
        citations: registry.citations,
        sections,
        createdBy: actorOf(req),
      })
      .returning();
    await tx.insert(conformityActivityTable).values({
      ...(assessmentId !== null ? { assessmentId } : {}),
      entityType: "report",
      entityId: rows[0]!.id,
      action: "created",
      actor: actorOf(req),
      source: "ui",
      summary: `Report "${title}" (${formatLabel(reportType)}, ${body.audience}) generation started`,
    });
    return rows[0]!;
  });

  void generateReportAiSections(report.id);
  res.json(CreateConformityReportResponse.parse({ report: toReportDto(report, await productNameFor(report)) }));
});

router.get("/conformity/reports/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = GetConformityReportParams.parse(req.params);
  const report = await loadReport(id);
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(GetConformityReportResponse.parse({ report: toReportDto(report, await productNameFor(report)) }));
});

router.patch("/conformity/reports/:id/sections/:key", requireAuth, async (req, res): Promise<void> => {
  const { id, key } = UpdateConformityReportSectionParams.parse(req.params);
  const body = UpdateConformityReportSectionBody.parse(req.body);
  const result = await db.transaction(async (tx): Promise<ReportTxError | { row: ConformityReportRow }> => {
    const [row] = await tx
      .select()
      .from(conformityReportsTable)
      .where(eq(conformityReportsTable.id, id))
      .for("update");
    if (!row) return { code: 404 as const, error: "Report not found" };
    if (row.status === "generating") return { code: 409 as const, error: "The report is still generating — try again shortly." };
    if (row.status === "final") return { code: 409 as const, error: "Finalised reports are read-only." };
    const section = row.sections.find((s) => s.key === key);
    if (!section) return { code: 404 as const, error: "Section not found" };
    if (section.kind !== "ai") {
      return { code: 400 as const, error: "Deterministic sections are computed from the data snapshot and cannot be edited." };
    }
    if (section.status === "pending") {
      return { code: 409 as const, error: "This section is being regenerated — wait for it to finish." };
    }
    // Manual prose obeys the same citation-traceability contract as AI
    // drafts: [n] markers must exist in this report's frozen reference list.
    // Invalid markers are stripped and surfaced back via the section note.
    const { text: cleanedMd, stripped } = validateMarkers(body.contentMd, row.citations);
    const sections = row.sections.map((s) =>
      s.key === key
        ? {
            ...s,
            contentMd: cleanedMd,
            html: renderMarkdown(cleanedMd),
            status: "ready" as const,
            editedBy: actorOf(req),
            editedAt: new Date().toISOString(),
            note: stripped.length
              ? `Removed citation marker${stripped.length === 1 ? "" : "s"} not in this report's reference list: ${stripped.map((n) => `[${n}]`).join(" ")}`
              : undefined,
          }
        : s,
    );
    // A successful mutation on a `failed` report heals it back to `draft`.
    const updated = await tx
      .update(conformityReportsTable)
      .set({ sections, ...(row.status === "failed" ? { status: "draft" as const } : {}) })
      .where(eq(conformityReportsTable.id, id))
      .returning();
    return { row: updated[0]! };
  });
  if ("code" in result) {
    res.status(result.code).json({ error: result.error });
    return;
  }
  res.json(UpdateConformityReportSectionResponse.parse({ report: toReportDto(result.row, await productNameFor(result.row)) }));
});

router.post("/conformity/reports/:id/sections/:key/regenerate", requireAuth, async (req, res): Promise<void> => {
  const { id, key } = RegenerateConformityReportSectionParams.parse(req.params);
  const result = await db.transaction(async (tx): Promise<ReportTxError | { row: ConformityReportRow }> => {
    const [row] = await tx
      .select()
      .from(conformityReportsTable)
      .where(eq(conformityReportsTable.id, id))
      .for("update");
    if (!row) return { code: 404 as const, error: "Report not found" };
    if (row.status === "generating") return { code: 409 as const, error: "The report is still generating — try again shortly." };
    if (row.status === "final") return { code: 409 as const, error: "Finalised reports are read-only." };
    const section = row.sections.find((s) => s.key === key);
    if (!section) return { code: 404 as const, error: "Section not found" };
    if (section.kind !== "ai") return { code: 400 as const, error: "Only AI-drafted sections can be regenerated." };
    if (section.status === "pending") return { code: 409 as const, error: "This section is already being regenerated." };
    const sections = row.sections.map((s) => (s.key === key ? { ...s, status: "pending" as const } : s));
    // Heal a `failed` report back to `draft` when claiming the section, so the
    // background worker (which only writes to draft reports) can proceed.
    const updated = await tx
      .update(conformityReportsTable)
      .set({ sections, ...(row.status === "failed" ? { status: "draft" as const } : {}) })
      .where(eq(conformityReportsTable.id, id))
      .returning();
    return { row: updated[0]! };
  });
  if ("code" in result) {
    res.status(result.code).json({ error: result.error });
    return;
  }
  void regenerateReportSection(id, key);
  res.json(RegenerateConformityReportSectionResponse.parse({ report: toReportDto(result.row, await productNameFor(result.row)) }));
});

router.post("/conformity/reports/:id/finalize", requireAuth, async (req, res): Promise<void> => {
  const { id } = FinalizeConformityReportParams.parse(req.params);
  const result = await db.transaction(async (tx): Promise<ReportTxError | { row: ConformityReportRow }> => {
    const [row] = await tx
      .select()
      .from(conformityReportsTable)
      .where(eq(conformityReportsTable.id, id))
      .for("update");
    if (!row) return { code: 404 as const, error: "Report not found" };
    if (row.status === "final") return { code: 409 as const, error: "The report is already finalised." };
    if (row.status === "generating") return { code: 409 as const, error: "The report is still generating — try again shortly." };
    const notReady = row.sections.filter((s) => s.kind === "ai" && s.status !== "ready");
    if (notReady.length > 0) {
      return {
        code: 409 as const,
        error: `${notReady.length} section(s) are not ready — regenerate or edit them before finalising.`,
      };
    }
    const updated = await tx
      .update(conformityReportsTable)
      .set({ status: "final" })
      .where(eq(conformityReportsTable.id, id))
      .returning();
    await tx.insert(conformityActivityTable).values({
      ...(row.assessmentId !== null ? { assessmentId: row.assessmentId } : {}),
      entityType: "report",
      entityId: row.id,
      action: "completed",
      actor: actorOf(req),
      source: "ui",
      summary: `Report "${row.title}" finalised`,
    });
    return { row: updated[0]! };
  });
  if ("code" in result) {
    res.status(result.code).json({ error: result.error });
    return;
  }
  res.json(FinalizeConformityReportResponse.parse({ report: toReportDto(result.row, await productNameFor(result.row)) }));
});

router.delete("/conformity/reports/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = DeleteConformityReportParams.parse(req.params);
  const result = await db.transaction(async (tx): Promise<ReportTxError | { ok: true }> => {
    const [row] = await tx
      .select()
      .from(conformityReportsTable)
      .where(eq(conformityReportsTable.id, id))
      .for("update");
    if (!row) return { code: 404 as const, error: "Report not found" };
    await tx.delete(conformityReportsTable).where(eq(conformityReportsTable.id, id));
    await tx.insert(conformityActivityTable).values({
      ...(row.assessmentId !== null ? { assessmentId: row.assessmentId } : {}),
      entityType: "report",
      entityId: row.id,
      action: "deleted",
      actor: actorOf(req),
      source: "ui",
      summary: `Report "${row.title}" deleted`,
    });
    return { ok: true as const };
  });
  if ("code" in result) {
    res.status(result.code).json({ error: result.error });
    return;
  }
  res.json(DeleteConformityReportResponse.parse({ ok: true }));
});

router.get("/conformity/reports/:id/export", requireAuth, async (req, res): Promise<void> => {
  const { id } = ExportConformityReportParams.parse(req.params);
  const report = await loadReport(id);
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  const { title, html } = composeReportHtml(report);
  // Not zod-parsed: the composed document can exceed practical zod string
  // validation value; the shape is trivially {title, html}.
  res.json({ title, html });
});

export default router;
