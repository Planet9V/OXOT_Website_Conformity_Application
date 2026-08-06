import { Router, type IRouter } from "express";
import { eq, and, asc, inArray } from "drizzle-orm";
import { db, pagesTable, pageSectionsTable } from "@workspace/db";
import { ListPagesResponse, GetPageResponse } from "@workspace/api-zod";
import { parseLocale, firstParam } from "../lib/locale";
import { allowedVisibilities } from "../lib/visibility";

const router: IRouter = Router();

router.get("/site/:locale/pages", async (req, res): Promise<void> => {
  const locale = parseLocale(req.params.locale);
  if (!locale) {
    res.status(400).json({ error: "Unsupported locale" });
    return;
  }

  const visible = await allowedVisibilities(req);
  const rows = await db
    .select()
    .from(pagesTable)
    .where(
      and(
        eq(pagesTable.locale, locale),
        eq(pagesTable.status, "published"),
        inArray(pagesTable.visibility, visible),
      ),
    )
    .orderBy(asc(pagesTable.id));

  // Source each summary's excerpt from the page's article section so that
  // summary/related-service cards stay in sync with edited CMS content.
  const articleSections = await db
    .select({
      pageId: pageSectionsTable.pageId,
      data: pageSectionsTable.data,
    })
    .from(pageSectionsTable)
    .where(eq(pageSectionsTable.type, "article"))
    .orderBy(asc(pageSectionsTable.pageId), asc(pageSectionsTable.sortOrder));

  const excerptByPageId = new Map<number, string>();
  for (const section of articleSections) {
    if (excerptByPageId.has(section.pageId)) continue;
    const excerpt = section.data?.excerpt;
    if (typeof excerpt === "string" && excerpt.trim().length > 0) {
      excerptByPageId.set(section.pageId, excerpt);
    }
  }

  res.json(
    ListPagesResponse.parse(
      rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        serviceKey: row.serviceKey,
        title: row.title,
        excerpt: excerptByPageId.get(row.id) ?? null,
        locale: row.locale,
        visibility: row.visibility,
        regulationKeys: row.regulationKeys,
      })),
    ),
  );
});

router.get("/site/:locale/pages/:slug", async (req, res): Promise<void> => {
  const locale = parseLocale(req.params.locale);
  if (!locale) {
    res.status(400).json({ error: "Unsupported locale" });
    return;
  }
  const slug = firstParam(req.params.slug);

  const visible = await allowedVisibilities(req);
  const [page] = await db
    .select()
    .from(pagesTable)
    .where(
      and(
        eq(pagesTable.slug, slug),
        eq(pagesTable.locale, locale),
        eq(pagesTable.status, "published"),
        // A page above the caller's tier is indistinguishable from a missing
        // page (404) — never a blank render or an auth hint.
        inArray(pagesTable.visibility, visible),
      ),
    );

  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }

  const sections = await db
    .select()
    .from(pageSectionsTable)
    .where(eq(pageSectionsTable.pageId, page.id))
    .orderBy(asc(pageSectionsTable.sortOrder));

  res.json(
    GetPageResponse.parse({
      id: page.id,
      slug: page.slug,
      title: page.title,
      locale: page.locale,
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
      sections: sections.map((section) => ({
        id: section.id,
        type: section.type,
        order: section.sortOrder,
        data: section.data,
      })),
    }),
  );
});

export default router;
