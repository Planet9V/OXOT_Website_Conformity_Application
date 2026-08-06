import { Router, type IRouter } from "express";
import { eq, asc, and } from "drizzle-orm";
import { db, siteSettingsTable, navItemsTable, pagesTable } from "@workspace/db";
import { GetSiteSettingsResponse, GetNavigationResponse } from "@workspace/api-zod";
import { parseLocale, SUPPORTED_LOCALES } from "../lib/locale";
import { allowedVisibilities } from "../lib/visibility";

const router: IRouter = Router();

router.get("/site/:locale/settings", async (req, res): Promise<void> => {
  const locale = parseLocale(req.params.locale);
  if (!locale) {
    res.status(400).json({ error: "Unsupported locale" });
    return;
  }

  const [row] = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.locale, locale));

  if (!row) {
    res.status(404).json({ error: "Site settings not found" });
    return;
  }

  res.json(
    GetSiteSettingsResponse.parse({
      siteName: row.siteName,
      tagline: row.tagline,
      description: row.description,
      contactEmail: row.contactEmail,
      footerText: row.footerText,
      socialLinks: row.socialLinks,
      availableLocales: SUPPORTED_LOCALES,
    }),
  );
});

router.get("/site/:locale/navigation", async (req, res): Promise<void> => {
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

  // Hide internal nav links whose target CMS page exists in this locale but is
  // above the caller's visibility tier (or unpublished). Links that don't
  // resolve to a CMS page (custom SPA routes, anchors, external URLs) pass
  // through untouched — the page routes are the enforcement point for those.
  const visible = await allowedVisibilities(req);
  const pageRows = await db
    .select({ slug: pagesTable.slug, status: pagesTable.status, visibility: pagesTable.visibility })
    .from(pagesTable)
    .where(and(eq(pagesTable.locale, locale)));
  const bySlug = new Map(pageRows.map((p) => [p.slug, p]));
  const navSlug = (href: string): string | null => {
    if (!href.startsWith("/")) return null;
    const path = href.split(/[?#]/)[0];
    let segments = path.split("/").filter(Boolean);
    // Locale-prefixed internal links ("/nl/<slug>") resolve to the same page
    // rows, which are already scoped to this locale.
    if (segments.length > 1 && SUPPORTED_LOCALES.includes(segments[0] as never)) {
      segments = segments.slice(1);
    }
    if (segments.length !== 1) return null;
    return segments[0];
  };
  // Note: `external` does NOT bypass the check — a root-relative href that
  // resolves to a gated CMS page is filtered regardless of how it's flagged.
  const filtered = rows.filter((row) => {
    const slug = navSlug(row.href);
    if (!slug) return true;
    const page = bySlug.get(slug);
    if (!page) return true;
    return page.status === "published" && visible.includes(page.visibility as (typeof visible)[number]);
  });

  res.json(
    GetNavigationResponse.parse(
      filtered.map((row) => ({
        id: row.id,
        label: row.label,
        href: row.href,
        placement: row.placement,
        order: row.sortOrder,
        external: row.external,
      })),
    ),
  );
});

export default router;
