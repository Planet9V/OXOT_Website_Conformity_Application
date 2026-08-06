/**
 * Restores site content — pages (with sections), navigation and site
 * settings — from the versioned snapshot at
 * `src/content/snapshot/site-content.json` (written by content:export).
 *
 * Safety model:
 *   - If the database already has pages, this is a NO-OP so a routine
 *     `docker compose up` can never destroy live admin edits. Set
 *     FORCE_SITE_SEED=true to overwrite anyway (full replace).
 *   - On an empty database (fresh deployment), the snapshot is applied in
 *     full, so the site comes up with exactly the content that was live when
 *     the snapshot was exported.
 *   - If no snapshot file exists yet, it exits cleanly; run the legacy chain
 *     (seed, seed:content, seed:customer-site) to bootstrap, then export.
 *
 * Run with: pnpm --filter @workspace/api-server run seed:site
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  db,
  pool,
  pagesTable,
  pageSectionsTable,
  navItemsTable,
  siteSettingsTable,
} from "@workspace/db";

const log = (msg: string) => process.stdout.write(`${msg}\n`);

interface SnapshotSection {
  type: string;
  sortOrder: number;
  data: Record<string, unknown>;
}
interface SnapshotPage {
  slug: string;
  serviceKey: string | null;
  locale: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  metaKeywords: string | null;
  noindex: boolean;
  visibility: string;
  regulationKeys: string[];
  status: string;
  sections: SnapshotSection[];
}
interface Snapshot {
  siteSettings: {
    locale: string;
    siteName: string;
    tagline: string;
    description: string;
    contactEmail: string | null;
    footerText: string;
    socialLinks: { platform: string; url: string }[];
  }[];
  navItems: {
    locale: string;
    label: string;
    href: string;
    placement: string;
    sortOrder: number;
    external: boolean;
  }[];
  pages: SnapshotPage[];
}

async function seedFromSnapshot(): Promise<void> {
  const file = path.resolve(process.cwd(), "src/content/snapshot/site-content.json");
  if (!existsSync(file)) {
    log(`No content snapshot at ${file} — nothing to apply.`);
    log("Bootstrap with: seed, seed:content, seed:customer-site — then content:export.");
    return;
  }

  const snapshot = JSON.parse(readFileSync(file, "utf8")) as Snapshot;

  const existing = await db.select({ id: pagesTable.id }).from(pagesTable).limit(1);
  if (existing.length > 0 && process.env["FORCE_SITE_SEED"] !== "true") {
    log("Site content already present — skipping snapshot restore to protect live edits.");
    log("Set FORCE_SITE_SEED=true to overwrite the database with the snapshot.");
    return;
  }

  let sectionCount = 0;
  await db.transaction(async (tx) => {
    // Full replace: snapshot is the single source of truth for site content.
    await tx.delete(pagesTable); // cascade clears page_sections
    await tx.delete(navItemsTable);
    await tx.delete(siteSettingsTable);

    for (const s of snapshot.siteSettings) {
      await tx.insert(siteSettingsTable).values(s);
    }
    if (snapshot.navItems.length > 0) {
      await tx.insert(navItemsTable).values(snapshot.navItems);
    }
    for (const page of snapshot.pages) {
      const { sections, ...pageRow } = page;
      const [inserted] = await tx
        .insert(pagesTable)
        .values(pageRow)
        .returning({ id: pagesTable.id });
      for (const section of sections) {
        await tx.insert(pageSectionsTable).values({ pageId: inserted.id, ...section });
        sectionCount += 1;
      }
    }
  });

  log(
    `Snapshot restored: ${snapshot.pages.length} pages (${sectionCount} sections), ` +
      `${snapshot.navItems.length} nav items, ${snapshot.siteSettings.length} settings rows.`,
  );
}

seedFromSnapshot()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    process.stderr.write(`Site snapshot restore failed: ${String(err)}\n`);
    await pool.end();
    process.exit(1);
  });
