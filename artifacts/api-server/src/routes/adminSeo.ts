import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, pagesTable, type PageRow } from "@workspace/db";
import { ListSeoPagesResponse, UpdateSeoPageBody, UpdateSeoPageResponse } from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import { scheduleReindex } from "../lib/rag";

const router: IRouter = Router();

function toSeoDto(page: PageRow) {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    locale: page.locale,
    status: page.status,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImage: page.ogImage,
    canonicalUrl: page.canonicalUrl,
    metaKeywords: page.metaKeywords,
    noindex: page.noindex,
    visibility: page.visibility,
    regulationKeys: page.regulationKeys,
  };
}

router.get("/admin/seo/pages", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(pagesTable)
    .orderBy(asc(pagesTable.locale), asc(pagesTable.slug));
  res.json(ListSeoPagesResponse.parse(rows.map(toSeoDto)));
});

router.put("/admin/seo/pages/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid page id" });
    return;
  }
  const parsed = UpdateSeoPageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid SEO metadata" });
    return;
  }
  const b = parsed.data;
  const clean = (v: string | null | undefined): string | null => {
    if (v === undefined || v === null) return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  };
  // seoTitle/seoDescription are deliberately not written here — they are
  // versioned page content owned by the CMS editor and are rewritten on publish.
  // Touching them here would create a second source of truth that publish clobbers.
  const [updated] = await db
    .update(pagesTable)
    .set({
      ogTitle: clean(b.ogTitle),
      ogDescription: clean(b.ogDescription),
      ogImage: clean(b.ogImage),
      canonicalUrl: clean(b.canonicalUrl),
      metaKeywords: clean(b.metaKeywords),
      noindex: b.noindex ?? false,
      // Operational access metadata, same ownership model as noindex.
      ...(b.visibility !== undefined ? { visibility: b.visibility } : {}),
      ...(b.regulationKeys !== undefined
        ? {
            regulationKeys: b.regulationKeys
              .map((k) => k.trim())
              .filter((k) => k.length > 0),
          }
        : {}),
    })
    .where(eq(pagesTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  // A visibility change must propagate to the RAG index (chunks carry a copy
  // of page visibility); retrieval also re-checks the live page, but keeping
  // the index in sync avoids silently thinner anonymous retrieval.
  if (b.visibility !== undefined) {
    scheduleReindex();
  }
  res.json(UpdateSeoPageResponse.parse(toSeoDto(updated)));
});

export default router;
