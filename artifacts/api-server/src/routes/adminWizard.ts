import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, pageTemplatesTable, type PageTemplateRow } from "@workspace/db";
import {
  GeneratePageDraftBody,
  GeneratePageDraftResponse,
  ListTemplatesResponse,
  CreateTemplateBody,
  CreateTemplateResponse,
  DeleteTemplateResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import { generatePageDraft } from "../lib/aiContent";

const router: IRouter = Router();

function toTemplateDto(row: PageTemplateRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    config: row.config ?? {},
    createdAt: row.createdAt.toISOString(),
  };
}

router.post("/admin/wizard/generate", requireAdmin, async (req, res) => {
  const parsed = GeneratePageDraftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { topic, persona, cta, tone, locale, sections, templateId } = parsed.data;

  let blueprintConfig: Record<string, unknown> | null = null;
  if (templateId) {
    const [tpl] = await db
      .select()
      .from(pageTemplatesTable)
      .where(eq(pageTemplatesTable.id, templateId));
    blueprintConfig = tpl?.config ?? null;
  }

  try {
    const result = await generatePageDraft({
      topic,
      persona,
      cta,
      tone,
      locale,
      sections: sections ?? undefined,
      blueprintConfig,
    });
    res.json(GeneratePageDraftResponse.parse(result));
  } catch (error) {
    req.log.error({ err: error }, "Wizard generation failed");
    res.status(502).json({ error: "The AI could not generate a draft right now. Please try again." });
  }
});

router.get("/admin/templates", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(pageTemplatesTable)
    .orderBy(desc(pageTemplatesTable.createdAt));
  res.json(ListTemplatesResponse.parse(rows.map(toTemplateDto)));
});

router.post("/admin/templates", requireAdmin, async (req, res) => {
  const parsed = CreateTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { name, description, config } = parsed.data;
  const [row] = await db
    .insert(pageTemplatesTable)
    .values({ name, description: description ?? null, config: config ?? {} })
    .returning();
  res.json(CreateTemplateResponse.parse(toTemplateDto(row)));
});

router.delete("/admin/templates/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [existing] = await db
    .select()
    .from(pageTemplatesTable)
    .where(eq(pageTemplatesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Template not found" });
    return;
  }
  await db.delete(pageTemplatesTable).where(eq(pageTemplatesTable.id, id));
  res.json(DeleteTemplateResponse.parse({ success: true }));
});

export default router;
