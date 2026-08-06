/**
 * Imports the OXOT informational content library (regulation field-guides, the
 * Cyber Digital Twin product story, services, the OT-security offerings, About,
 * Frameworks, and the "death wobble" essay) from the vendored markdown under
 * `src/content/{en,nl}` into the oxot-web CMS as published pages.
 *
 * Each source markdown file becomes one page (slug = filename) with a single
 * `article` section holding the full markdown body — every word preserved.
 * Front-matter maps to title + SEO fields. Internal `/en/...` and `/nl/...`
 * cross-links are rewritten to oxot-web's locale-agnostic `/...` routing.
 *
 * Idempotent — pages are matched on (slug, locale) and fully replaced, so
 * re-running reproduces the same pages. Nav for the content sections and the
 * conformity gateway is rebuilt for each locale.
 *
 * Run with: pnpm --filter @workspace/api-server run seed:content
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { eq, and } from "drizzle-orm";
import {
  db,
  pool,
  pagesTable,
  pageSectionsTable,
  navItemsTable,
} from "@workspace/db";

const log = (msg: string) => process.stdout.write(`${msg}\n`);

type Locale = "en" | "nl";
const LOCALES: Locale[] = ["en", "nl"];

interface ParsedDoc {
  slug: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  excerpt: string | null;
  published: boolean;
  body: string;
}

// Minimal front-matter parser: reads the leading `---`-fenced block as simple
// `key: value` pairs (values optionally wrapped in single or double quotes).
function parseFrontMatter(raw: string): { fm: Record<string, string>; body: string } {
  const fm: Record<string, string> = {};
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(raw);
  if (!match) return { fm, body: raw };
  for (const line of match[1].split("\n")) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fm[kv[1]] = value;
  }
  return { fm, body: raw.slice(match[0].length) };
}

// Rewrite internal locale-prefixed links (`/en/cra`, `/nl/iec-62443`) to the
// locale-agnostic slug routes oxot-web uses (`/cra`). Leaves external and
// anchor links untouched. Applies inside key-facts blocks too.
function rewriteLinks(body: string): string {
  return body.replace(/\]\(\/(en|nl)\/([^)]*)\)/g, "](/$2)");
}

function parseDoc(dir: string, file: string): ParsedDoc {
  const raw = readFileSync(path.join(dir, file), "utf8");
  const { fm, body } = parseFrontMatter(raw);
  const slug = file.replace(/\.md$/, "");
  return {
    slug,
    title: fm.title || slug,
    seoTitle: fm.meta_title || fm.title || null,
    seoDescription: fm.meta_description || fm.excerpt || null,
    excerpt: fm.excerpt || null,
    published: (fm.published ?? "true").toLowerCase() !== "false",
    body: rewriteLinks(body).trim(),
  };
}

// Header + footer navigation — imported from navSeed.ts so the same data can
// be assertion-tested without pulling in any DB dependencies.
import { NAV } from "./navSeed";

async function importLocale(locale: Locale): Promise<number> {
  const dir = path.resolve(process.cwd(), "src/content", locale);
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  let count = 0;

  for (const file of files) {
    const doc = parseDoc(dir, file);

    await db.transaction(async (tx) => {
      // Remove any existing page for this slug+locale (cascade clears sections).
      await tx
        .delete(pagesTable)
        .where(and(eq(pagesTable.slug, doc.slug), eq(pagesTable.locale, locale)));

      const [page] = await tx
        .insert(pagesTable)
        .values({
          slug: doc.slug,
          // Canonical identity for cross-page wiring; equals the source
          // filename slug and never changes when the CMS slug is edited.
          serviceKey: doc.slug,
          locale,
          title: doc.title,
          seoTitle: doc.seoTitle,
          seoDescription: doc.seoDescription,
          status: doc.published ? "published" : "draft",
        })
        .returning({ id: pagesTable.id });

      await tx.insert(pageSectionsTable).values({
        pageId: page.id,
        type: "article",
        sortOrder: 0,
        data: {
          title: doc.title,
          excerpt: doc.excerpt ?? "",
          markdown: doc.body,
        },
      });
    });

    count += 1;
  }

  return count;
}

async function seed() {
  let total = 0;
  for (const locale of LOCALES) {
    const n = await importLocale(locale);
    log(`Imported ${n} ${locale} content pages.`);
    total += n;

    // Rebuild nav for the content sections + conformity gateway for this locale.
    await db.transaction(async (tx) => {
      await tx.delete(navItemsTable).where(eq(navItemsTable.locale, locale));
      await tx.insert(navItemsTable).values(NAV[locale]);
    });
  }
  log(`Content import complete: ${total} pages across ${LOCALES.length} locales.`);
}

seed()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    process.stderr.write(`Content import failed: ${String(err)}\n`);
    await pool.end();
    process.exit(1);
  });
