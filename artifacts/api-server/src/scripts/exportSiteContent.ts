/**
 * Exports the LIVE site content — pages (with all sections), navigation and
 * site settings, every locale — from the database into a versioned JSON
 * snapshot at `src/content/snapshot/site-content.json`.
 *
 * This is the write-back half of the content lifecycle: admins edit pages in
 * the CMS, then this export captures the result so the snapshot in git is
 * always the current seed. `seed:site` (seedSiteSnapshot.ts) replays the
 * snapshot into an empty database, so fresh deployments come up with exactly
 * the content that was live when the snapshot was taken.
 *
 * Output is deterministically ordered (locale, then slug / placement / sort
 * order) and pretty-printed so re-exports produce clean git diffs.
 *
 * Run with: pnpm --filter @workspace/api-server run content:export
 * In Docker: docker compose run --rm content-export
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { asc } from "drizzle-orm";
import {
  db,
  pool,
  pagesTable,
  pageSectionsTable,
  navItemsTable,
  siteSettingsTable,
} from "@workspace/db";

const log = (msg: string) => process.stdout.write(`${msg}\n`);

async function exportSnapshot(): Promise<void> {
  const pages = await db
    .select()
    .from(pagesTable)
    .orderBy(asc(pagesTable.locale), asc(pagesTable.slug));
  const sections = await db
    .select()
    .from(pageSectionsTable)
    .orderBy(asc(pageSectionsTable.pageId), asc(pageSectionsTable.sortOrder), asc(pageSectionsTable.id));
  const navItems = await db
    .select()
    .from(navItemsTable)
    .orderBy(asc(navItemsTable.locale), asc(navItemsTable.placement), asc(navItemsTable.sortOrder), asc(navItemsTable.id));
  const settings = await db
    .select()
    .from(siteSettingsTable)
    .orderBy(asc(siteSettingsTable.locale));

  const sectionsByPage = new Map<number, typeof sections>();
  for (const s of sections) {
    const list = sectionsByPage.get(s.pageId) ?? [];
    list.push(s);
    sectionsByPage.set(s.pageId, list);
  }

  const snapshot = {
    // Documentation only — ignored on import.
    exportedAt: new Date().toISOString(),
    siteSettings: settings.map((s) => ({
      locale: s.locale,
      siteName: s.siteName,
      tagline: s.tagline,
      description: s.description,
      contactEmail: s.contactEmail,
      footerText: s.footerText,
      socialLinks: s.socialLinks,
    })),
    navItems: navItems.map((n) => ({
      locale: n.locale,
      label: n.label,
      href: n.href,
      placement: n.placement,
      sortOrder: n.sortOrder,
      external: n.external,
    })),
    pages: pages.map((p) => ({
      slug: p.slug,
      serviceKey: p.serviceKey,
      locale: p.locale,
      title: p.title,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      ogTitle: p.ogTitle,
      ogDescription: p.ogDescription,
      ogImage: p.ogImage,
      canonicalUrl: p.canonicalUrl,
      metaKeywords: p.metaKeywords,
      noindex: p.noindex,
      visibility: p.visibility,
      regulationKeys: p.regulationKeys,
      status: p.status,
      sections: (sectionsByPage.get(p.id) ?? []).map((s) => ({
        type: s.type,
        sortOrder: s.sortOrder,
        data: s.data,
      })),
    })),
  };

  const outDir = path.resolve(process.cwd(), "src/content/snapshot");
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "site-content.json");
  writeFileSync(outFile, `${JSON.stringify(snapshot, null, 2)}\n`);

  log(
    `Exported ${snapshot.pages.length} pages (${sections.length} sections), ` +
      `${snapshot.navItems.length} nav items, ${snapshot.siteSettings.length} settings rows`,
  );
  log(`Snapshot written to ${outFile}`);
}

exportSnapshot()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    process.stderr.write(`Content export failed: ${String(err)}\n`);
    await pool.end();
    process.exit(1);
  });
