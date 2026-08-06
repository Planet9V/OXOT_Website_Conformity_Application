import { Router, type IRouter } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, pagesTable, pageVersionsTable, navItemsTable, type PageRow } from "@workspace/db";
import {
  ListAdminPagesResponse,
  CreateAdminPageBody,
  CreateAdminPageResponse,
  GetAdminPageResponse,
  DeleteAdminPageResponse,
  SaveAdminPageDraftBody,
  SaveAdminPageDraftResponse,
  PublishAdminPageResponse,
  PublishAdminPageBody,
  ListAdminPageVersionsResponse,
  RestoreAdminPageVersionResponse,
  TranslateAdminPageResponse,
  ListAdminNavResponse,
  SaveAdminNavBody,
  SaveAdminNavResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import { parseLocale, type Locale } from "../lib/locale";
import {
  buildAdminPage,
  buildAdminPageSummary,
  ensureDraftVersion,
  getDraftVersion,
  NotFoundError,
  publishDraft,
  restoreVersion,
  saveDraft,
  snapshotToDto,
  validateDraftForPublish,
} from "../lib/cms";
import { translatePageContent } from "../lib/aiContent";
import { scheduleReindex } from "../lib/rag";
import { scheduleSocialShare } from "../lib/social";
import { publicPageUrl } from "../lib/urls";

const router: IRouter = Router();

function parseId(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function loadPage(id: number): Promise<PageRow | undefined> {
  const [page] = await db.select().from(pagesTable).where(eq(pagesTable.id, id));
  return page;
}

// --- Pages ---------------------------------------------------------------

router.get("/admin/:locale/pages", requireAdmin, async (req, res) => {
  const locale = parseLocale(req.params.locale);
  if (!locale) {
    res.status(400).json({ error: "Unsupported locale" });
    return;
  }
  const pages = await db
    .select()
    .from(pagesTable)
    .where(eq(pagesTable.locale, locale))
    .orderBy(asc(pagesTable.title));
  const summaries = await Promise.all(pages.map((p) => buildAdminPageSummary(p)));
  res.json(ListAdminPagesResponse.parse(summaries));
});

router.post("/admin/pages", requireAdmin, async (req, res) => {
  const parsed = CreateAdminPageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { slug, locale, title } = parsed.data;
  const [existing] = await db
    .select()
    .from(pagesTable)
    .where(and(eq(pagesTable.slug, slug), eq(pagesTable.locale, locale)));
  if (existing) {
    res.status(400).json({ error: "A page with this slug already exists for this locale." });
    return;
  }
  const [page] = await db
    .insert(pagesTable)
    // serviceKey is the page's stable identity for cross-page wiring; a new page
    // adopts its slug as that identity (it survives later slug renames).
    .values({ slug, serviceKey: slug, locale, title, status: "draft" })
    .returning();
  await db.insert(pageVersionsTable).values({
    pageId: page.id,
    versionNumber: 1,
    state: "draft",
    title,
    sections: [],
    note: "Initial draft",
  });
  const draft = await ensureDraftVersion(page);
  res.json(CreateAdminPageResponse.parse(await buildAdminPage(page, draft)));
});

router.get("/admin/pages/:id", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const page = await loadPage(id);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  const draft = await ensureDraftVersion(page);
  res.json(GetAdminPageResponse.parse(await buildAdminPage(page, draft)));
});

router.delete("/admin/pages/:id", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const page = await loadPage(id);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  const wasPublished = page.status === "published";
  await db.delete(pagesTable).where(eq(pagesTable.id, id));
  // Only a published page contributes to the assistant's index; refresh it so
  // the deleted content stops showing up in answers.
  if (wasPublished) {
    scheduleReindex();
  }
  res.json(DeleteAdminPageResponse.parse({ success: true }));
});

router.put("/admin/pages/:id/draft", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = SaveAdminPageDraftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const page = await loadPage(id);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  const draft = await saveDraft(page, parsed.data);
  res.json(SaveAdminPageDraftResponse.parse(await buildAdminPage(page, draft)));
});

router.post("/admin/pages/:id/publish", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const page = await loadPage(id);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  // Validate the working draft BEFORE committing the publish transaction so a
  // broken/blank page (empty title or all-empty sections) can never go live.
  // This also protects the restore→publish path: restore only creates a draft,
  // so validating at publish time is the single guard that covers it.
  const draftToPublish = await ensureDraftVersion(page);
  const validation = validateDraftForPublish(draftToPublish);
  if (!validation.ok) {
    res.status(400).json({ error: "Draft is not publishable", issues: validation.issues });
    return;
  }
  const updated = await publishDraft(page);
  // Publishing changes live content, so refresh the assistant's knowledge index
  // in the background — the publish response returns without waiting for it.
  scheduleReindex();

  // Optionally share to social platforms. Parse options from the (optional)
  // request body; invalid/missing body is silently ignored.
  // Social posts are public broadcasts — never share gated (members/admin)
  // pages, regardless of what the request asked for. The linked page would be
  // a 404 for anonymous visitors and the post text could leak gated content.
  const socialOpts = PublishAdminPageBody.safeParse(req.body);
  if (socialOpts.success && socialOpts.data && updated.visibility === "public") {
    const { shareLinkedIn, shareX, shareText } = socialOpts.data;
    const platforms: ("linkedin" | "x")[] = [];
    if (shareLinkedIn) platforms.push("linkedin");
    if (shareX) platforms.push("x");
    if (platforms.length > 0) {
      const text = (shareText?.trim() || updated.title || page.title).slice(0, 3000);
      // Attach the live page URL so LinkedIn/X fetch its OG metadata and render
      // a rich article card instead of a plain-text post.
      const pageUrl = publicPageUrl(updated.slug) || undefined;
      scheduleSocialShare(text, platforms, pageUrl);
    }
  }

  const draft = await ensureDraftVersion(updated);
  res.json(PublishAdminPageResponse.parse(await buildAdminPage(updated, draft)));
});

router.get("/admin/pages/:id/versions", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const page = await loadPage(id);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  const rows = await db
    .select()
    .from(pageVersionsTable)
    .where(eq(pageVersionsTable.pageId, id))
    .orderBy(desc(pageVersionsTable.versionNumber));
  res.json(
    ListAdminPageVersionsResponse.parse(
      rows.map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
        state: v.state,
        title: v.title,
        note: v.note,
        createdAt: v.createdAt.toISOString(),
      })),
    ),
  );
});

router.post("/admin/pages/:id/versions/:versionId/restore", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  const versionId = parseId(req.params.versionId);
  if (!id || !versionId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const page = await loadPage(id);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  try {
    const draft = await restoreVersion(page, versionId);
    res.json(RestoreAdminPageVersionResponse.parse(await buildAdminPage(page, draft)));
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: "Version not found" });
      return;
    }
    throw error;
  }
});

// --- Translation ---------------------------------------------------------

router.post("/admin/pages/:id/translate", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const page = await loadPage(id);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  const sourceLocale = page.locale as Locale;
  const targetLocale: Locale = sourceLocale === "en" ? "nl" : "en";
  const draft = await ensureDraftVersion(page);

  const translated = await translatePageContent({
    title: draft.title,
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    sections: snapshotToDto(draft.sections),
    sourceLocale,
    targetLocale,
  });

  let [counterpart] = await db
    .select()
    .from(pagesTable)
    .where(and(eq(pagesTable.slug, page.slug), eq(pagesTable.locale, targetLocale)));
  if (!counterpart) {
    [counterpart] = await db
      .insert(pagesTable)
      // The translated page shares the source page's stable identity so both
      // locales stay wired to the same relationships.
      .values({
        slug: page.slug,
        serviceKey: page.serviceKey ?? page.slug,
        locale: targetLocale,
        title: translated.title,
        status: "draft",
      })
      .returning();
    await db.insert(pageVersionsTable).values({
      pageId: counterpart.id,
      versionNumber: 1,
      state: "draft",
      title: translated.title,
      sections: [],
      note: "Created by translation",
    });
  }

  const updatedDraft = await saveDraft(counterpart, {
    title: translated.title,
    seoTitle: translated.seoTitle,
    seoDescription: translated.seoDescription,
    sections: translated.sections,
  });
  res.json(TranslateAdminPageResponse.parse(await buildAdminPage(counterpart, updatedDraft)));
});

// --- Navigation ----------------------------------------------------------

router.get("/admin/nav/:locale", requireAdmin, async (req, res) => {
  const locale = parseLocale(req.params.locale);
  if (!locale) {
    res.status(400).json({ error: "Unsupported locale" });
    return;
  }
  const rows = await db
    .select()
    .from(navItemsTable)
    .where(eq(navItemsTable.locale, locale))
    .orderBy(asc(navItemsTable.sortOrder));
  res.json(
    ListAdminNavResponse.parse(
      rows.map((n) => ({
        id: n.id,
        label: n.label,
        href: n.href,
        placement: n.placement,
        order: n.sortOrder,
        external: n.external,
      })),
    ),
  );
});

router.put("/admin/nav/:locale", requireAdmin, async (req, res) => {
  const locale = parseLocale(req.params.locale);
  if (!locale) {
    res.status(400).json({ error: "Unsupported locale" });
    return;
  }
  const parsed = SaveAdminNavBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { items } = parsed.data;
  await db.transaction(async (tx) => {
    await tx.delete(navItemsTable).where(eq(navItemsTable.locale, locale));
    if (items.length > 0) {
      await tx.insert(navItemsTable).values(
        items.map((i) => ({
          locale,
          label: i.label,
          href: i.href,
          placement: i.placement,
          sortOrder: i.order,
          external: i.external,
        })),
      );
    }
  });
  const rows = await db
    .select()
    .from(navItemsTable)
    .where(eq(navItemsTable.locale, locale))
    .orderBy(asc(navItemsTable.sortOrder));
  res.json(
    SaveAdminNavResponse.parse(
      rows.map((n) => ({
        id: n.id,
        label: n.label,
        href: n.href,
        placement: n.placement,
        order: n.sortOrder,
        external: n.external,
      })),
    ),
  );
});

export default router;
