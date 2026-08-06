import { eq } from "drizzle-orm";
import { db, conformityReportsTable, type ReportSection } from "@workspace/db";
import { aiSectionSpecs } from "./reportEngine";
import { draftSection, type ReportPromptContext } from "./reportNarrative";
import { renderMarkdown } from "./reportExport";
import type { ReportAudience, ReportFormat, ReportScope } from "./reportTypes";

/**
 * Background AI drafting pipeline for reports.
 *
 * Concurrency model: while a report is `generating` this loop is the ONLY
 * writer (edits/regenerate/finalize are rejected by the routes until the
 * report reaches `draft`). Every section write re-reads the row under
 * SELECT ... FOR UPDATE and re-checks status, so a report deleted or finalized
 * mid-flight simply aborts the loop instead of resurrecting state.
 */

function promptContext(report: typeof conformityReportsTable.$inferSelect): ReportPromptContext {
  return {
    scope: report.scope as ReportScope,
    format: report.reportType as ReportFormat,
    audience: report.audience as ReportAudience,
    snapshot: report.dataSnapshot,
    citations: report.citations,
  };
}

/** Swaps one section under row lock iff the report is still in an allowed status. */
async function updateSection(
  reportId: number,
  key: string,
  mutate: (section: ReportSection) => ReportSection,
  allowedStatuses: string[],
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(conformityReportsTable)
      .where(eq(conformityReportsTable.id, reportId))
      .for("update");
    if (!row || !allowedStatuses.includes(row.status)) return false;
    if (!row.sections.some((s) => s.key === key)) return false;
    const sections = row.sections.map((s) => (s.key === key ? mutate(s) : s));
    await tx.update(conformityReportsTable).set({ sections }).where(eq(conformityReportsTable.id, reportId));
    return true;
  });
}

/**
 * Drafts every pending AI section of a freshly created report, then promotes
 * it to `draft` (or `failed` when not a single section could be drafted).
 * Fire-and-forget from the create route; never throws.
 */
export async function generateReportAiSections(reportId: number): Promise<void> {
  try {
    const [report] = await db.select().from(conformityReportsTable).where(eq(conformityReportsTable.id, reportId));
    if (!report || report.status !== "generating") return;
    const ctx = promptContext(report);
    const specs = aiSectionSpecs(ctx.scope, ctx.format, ctx.audience);
    let anyReady = false;
    for (const spec of specs) {
      const target = report.sections.find((s) => s.key === spec.key && s.kind === "ai");
      if (!target || target.status !== "pending") continue;
      try {
        const { contentMd, note } = await draftSection(ctx, spec);
        const applied = await updateSection(
          reportId,
          spec.key,
          (s) => ({ ...s, status: "ready", contentMd, note, html: renderMarkdown(contentMd) }),
          ["generating"],
        );
        if (!applied) return; // deleted mid-flight — stop drafting
        anyReady = true;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[reports] drafting section "${spec.key}" of report ${reportId} failed: ${message}`);
        const applied = await updateSection(
          reportId,
          spec.key,
          (s) => ({ ...s, status: "failed", note: `Drafting failed: ${message.slice(0, 300)}` }),
          ["generating"],
        );
        if (!applied) return;
      }
    }
    await db
      .update(conformityReportsTable)
      .set({ status: anyReady ? "draft" : "failed" })
      .where(eq(conformityReportsTable.id, reportId));
  } catch (err) {
    console.warn(`[reports] generation pipeline for report ${reportId} aborted:`, err);
    await db
      .update(conformityReportsTable)
      .set({ status: "failed" })
      .where(eq(conformityReportsTable.id, reportId))
      .catch(() => undefined);
  }
}

/**
 * Redrafts ONE section of a `draft` report. The route has already flipped the
 * section to `pending` inside a transaction; this finishes (or fails) it.
 * Fire-and-forget; never throws.
 */
export async function regenerateReportSection(reportId: number, sectionKey: string): Promise<void> {
  try {
    const [report] = await db.select().from(conformityReportsTable).where(eq(conformityReportsTable.id, reportId));
    if (!report || report.status !== "draft") return;
    const ctx = promptContext(report);
    const spec = aiSectionSpecs(ctx.scope, ctx.format, ctx.audience).find((s) => s.key === sectionKey);
    if (!spec) return;
    try {
      const { contentMd, note } = await draftSection(ctx, spec);
      await updateSection(
        reportId,
        sectionKey,
        (s) => ({
          ...s,
          status: "ready",
          contentMd,
          note,
          html: renderMarkdown(contentMd),
          editedBy: undefined,
          editedAt: undefined,
        }),
        ["draft"],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[reports] regenerating section "${sectionKey}" of report ${reportId} failed: ${message}`);
      await updateSection(
        reportId,
        sectionKey,
        (s) => ({ ...s, status: "failed", note: `Drafting failed: ${message.slice(0, 300)}` }),
        ["draft"],
      );
    }
  } catch (err) {
    console.warn(`[reports] regenerate pipeline for report ${reportId}/${sectionKey} aborted:`, err);
  }
}
