import { Router, type IRouter } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db, pagesTable, siteSettingsTable, type PageRow } from "@workspace/db";
import { SUPPORTED_LOCALES, parseLocale, firstParam, type Locale } from "../lib/locale";
import { absoluteWebUrl } from "../lib/publicUrl";

const router: IRouter = Router();

// Static React SPA funnel routes (not CMS-backed pages). They must appear in the
// sitemap so crawlers can discover them — the CMS-page query below never sees them.
const STATIC_FUNNEL_ROUTES = [
  "/",
  "/product",
  "/pricing",
  "/deployment",
  "/resources",
  "/cra-check",
  "/demo",
];

// --- Helpers ---------------------------------------------------------------

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Escape a string for safe interpolation into an HTML attribute value. */
function htmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Public web path for a published page. The homepage lives at "/" (English) or
 * "/nl" (Dutch); other pages carry a "/nl" prefix in Dutch so each language
 * variant has its own shareable, crawlable URL.
 */
function pagePath(slug: string, locale: Locale): string {
  const prefix = locale === "nl" ? "/nl" : "";
  const path = slug === "home" ? "" : `/${slug}`;
  return `${prefix}${path}` || "/";
}

/**
 * Canonical absolute URL for a page. Prefer the operational canonicalUrl set in
 * the SEO admin; otherwise derive it from the public web origin + locale-aware
 * slug path so a Dutch page is self-canonical rather than pointing at English.
 */
function canonicalForPage(page: PageRow): string {
  const explicit = page.canonicalUrl?.trim();
  if (explicit) return explicit;
  return absoluteWebUrl(pagePath(page.slug, page.locale as Locale));
}

async function publishedIndexablePages(): Promise<PageRow[]> {
  const rows = await db
    .select()
    .from(pagesTable)
    .where(and(eq(pagesTable.status, "published"), eq(pagesTable.visibility, "public")))
    .orderBy(asc(pagesTable.id));
  // Exclude noindex pages: they must not appear in the sitemap.
  return rows.filter((row) => !row.noindex && SUPPORTED_LOCALES.includes(row.locale as Locale));
}

// --- Routes ----------------------------------------------------------------

// GET /api/seo/sitemap.xml
//
// Lists every PUBLISHED, indexable page across all supported locales with its
// canonical absolute URL and <lastmod> from updatedAt. Served at the site root
// as /sitemap.xml via the web artifact's proxy middleware.
router.get("/seo/sitemap.xml", async (_req, res): Promise<void> => {
  try {
    const pages = await publishedIndexablePages();

    // Static funnel routes first (always present), then CMS pages, deduped by loc.
    const staticLocs = STATIC_FUNNEL_ROUTES.map((p) => absoluteWebUrl(p));
    const staticSet = new Set(staticLocs);
    const staticUrls = staticLocs
      .map((loc) => `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n  </url>`)
      .join("\n");

    const cmsUrls = pages
      .filter((page) => !staticSet.has(canonicalForPage(page)))
      .map((page) => {
        const loc = xmlEscape(canonicalForPage(page));
        const lastmod = page.updatedAt.toISOString();
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
      })
      .join("\n");

    const body = [staticUrls, cmsUrls].filter(Boolean).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

    res.type("application/xml").send(xml);
  } catch (err) {
    _req.log.error({ err }, "Failed to build sitemap");
    res.status(500).type("text/plain").send("Failed to build sitemap");
  }
});

// GET /api/seo/robots.txt
//
// Allows crawling and points at the absolute sitemap URL. Served at the site
// root as /robots.txt via the web artifact's proxy middleware.
router.get("/seo/robots.txt", (_req, res): void => {
  const sitemapUrl = absoluteWebUrl("/sitemap.xml");
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${sitemapUrl}\n`;
  res.type("text/plain").send(body);
});

// GET /api/seo/page-meta?locale=<en|nl>&slug=<slug>
//
// Returns a minimal, crawler-facing HTML document whose <head> carries this
// page's OWN Open Graph + Twitter card meta (reflecting its SEO fields). The
// web artifact's middleware detects social/search crawler User-Agents on the
// public page routes and serves this instead of the JS-only SPA shell, so
// LinkedIn/X/Google see page-specific tags in the initial HTML.
//
// Human browsers never hit this path; they get the SPA, whose useSeo hook sets
// the same tags client-side at runtime.
router.get("/seo/page-meta", async (req, res): Promise<void> => {
  const locale = parseLocale(firstParam(req.query["locale"] as string | string[] | undefined));
  if (!locale) {
    res.status(400).type("text/plain").send("Unsupported locale");
    return;
  }
  const slug = firstParam(req.query["slug"] as string | string[] | undefined) || "home";

  try {
    const [page] = await db
      .select()
      .from(pagesTable)
      .where(
        and(
          eq(pagesTable.slug, slug),
          eq(pagesTable.locale, locale),
          eq(pagesTable.status, "published"),
          // Crawler-facing meta must never leak members/admin page metadata.
          eq(pagesTable.visibility, "public"),
        ),
      );

    if (!page) {
      res.status(404).type("text/html").send(renderMetaHtml(locale, null, null));
      return;
    }

    const [settings] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.locale, locale));

    res.type("text/html").send(renderMetaHtml(locale, page, settings?.siteName ?? null));
  } catch (err) {
    req.log.error({ err }, "Failed to render page meta");
    res.status(500).type("text/plain").send("Failed to render page meta");
  }
});

/**
 * Build the crawler-facing HTML document with per-page OG + Twitter tags.
 * Falls back to sensible site-level values when a specific field is unset.
 */
function renderMetaHtml(
  locale: Locale,
  page: PageRow | null,
  siteName: string | null,
): string {
  const tags: string[] = [];
  const meta = (attr: "name" | "property", key: string, value: string | null | undefined) => {
    if (!value) return;
    tags.push(`    <meta ${attr}="${key}" content="${htmlAttr(value)}" />`);
  };

  const title = page ? page.seoTitle || page.title : siteName || "OXOT";
  const description = page ? page.seoDescription : null;
  const canonical = page ? canonicalForPage(page) : absoluteWebUrl("/");
  const ogTitle = (page?.ogTitle || title) ?? null;
  const ogDescription = (page?.ogDescription || description) ?? null;
  const ogImage = page?.ogImage ?? null;

  meta("name", "description", description);
  meta("name", "keywords", page?.metaKeywords ?? null);
  if (page?.noindex) meta("name", "robots", "noindex,nofollow");

  // Open Graph
  meta("property", "og:type", "website");
  meta("property", "og:site_name", siteName ?? "OXOT");
  meta("property", "og:title", ogTitle);
  meta("property", "og:description", ogDescription);
  meta("property", "og:image", ogImage);
  meta("property", "og:url", canonical);
  meta("property", "og:locale", locale === "nl" ? "nl_NL" : "en_US");

  // Twitter card
  meta("name", "twitter:card", ogImage ? "summary_large_image" : "summary");
  meta("name", "twitter:title", ogTitle);
  meta("name", "twitter:description", ogDescription);
  meta("name", "twitter:image", ogImage);

  const canonicalTag = canonical
    ? `    <link rel="canonical" href="${htmlAttr(canonical)}" />\n`
    : "";

  return `<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <title>${htmlAttr(title)}</title>
${canonicalTag}${tags.join("\n")}
  </head>
  <body></body>
</html>
`;
}

export default router;
