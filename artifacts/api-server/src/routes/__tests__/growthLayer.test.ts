/**
 * Regression guard for the growth layer: affiliate links, click tracking,
 * visitor analytics, and the SEO field-ownership split.
 *
 * Why this exists
 * ---------------
 * The growth layer spans several fragile contracts that are easy to break
 * silently in a refactor:
 *  - Affiliate targets are used verbatim in an HTTP redirect, so the create/
 *    update endpoints must reject anything that is not absolute http(s)
 *    (e.g. `javascript:`), or a stored link becomes an open-redirect/XSS vector.
 *  - AI link suggestion + apply must insert `[kw](/api/go/:id)` markdown into
 *    the page's *draft* version (never the live/published content) so the
 *    admin can review before publishing.
 *  - `GET /api/go/:id` must record a click (attributing the source page from
 *    the Referer header) and 302 to the stored target; bots must be redirected
 *    but never counted; unknown/inactive links must fall back to `/`.
 *  - The analytics beacon must increment the admin overview; bot beacons must
 *    be acked but not counted.
 *  - SEO ownership is split: seoTitle/seoDescription are versioned CMS content
 *    rewritten on publish, while OG/canonical/keywords/noindex are operational
 *    fields owned by the SEO admin. A publish must NOT revert SEO-admin edits.
 *  - Route ordering is load-bearing: `/admin/seo/pages` must be reachable and
 *    not swallowed by adminCms's greedy `/admin/:locale/pages`.
 *
 * Strategy
 * --------
 * Boot the real Express app against the real dev/test database (DATABASE_URL
 * from the vitest env) on an ephemeral port and drive it over HTTP with a
 * signed admin cookie (no login round-trip). All fixture rows use unique
 * slugs/paths and are deleted in afterAll. The only mock is the LLM call
 * (`generateJson` is forced to throw) so `suggestAffiliateLinks` always takes
 * its deterministic candidate fallback — keeping the test hermetic, fast, and
 * free of AI-proxy spend.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { and, eq, inArray } from "drizzle-orm";
import {
  db,
  pagesTable,
  pageSectionsTable,
  pageVersionsTable,
  pageViewsTable,
  affiliateLinksTable,
  linkClicksTable,
} from "@workspace/db";

// Force the deterministic fallback in suggestAffiliateLinks: keep every other
// aiContent export real, but make the LLM call fail fast.
vi.mock("../../lib/aiContent", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/aiContent")>();
  return {
    ...actual,
    generateJson: async () => {
      throw new Error("LLM disabled in growthLayer.test");
    },
  };
});

import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";

const HUMAN_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";
const BOT_UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

const RUN = `gl${Date.now().toString(36)}`; // unique suffix for this run's fixtures

let server: Server;
let baseUrl: string;
let adminCookie: string;

const createdPageIds: number[] = [];
const createdLinkIds: number[] = [];
const beaconPaths: string[] = [];

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken(process.env["ADMIN_USERNAME"] ?? "admin")}`;
});

afterAll(async () => {
  // Cascades clean up versions/sections (pages) and keywords/clicks (links).
  if (createdPageIds.length > 0) {
    await db.delete(pagesTable).where(inArray(pagesTable.id, createdPageIds));
  }
  if (createdLinkIds.length > 0) {
    await db.delete(affiliateLinksTable).where(inArray(affiliateLinksTable.id, createdLinkIds));
  }
  if (beaconPaths.length > 0) {
    await db.delete(pageViewsTable).where(inArray(pageViewsTable.path, beaconPaths));
  }
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

// --- helpers ---------------------------------------------------------------

async function api(
  method: string,
  path: string,
  opts: { body?: unknown; headers?: Record<string, string>; auth?: boolean; redirect?: "follow" | "manual" | "error" } = {},
): Promise<Response> {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (opts.auth !== false) headers["Cookie"] = adminCookie;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  return fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    redirect: opts.redirect ?? "follow",
  });
}

/** Insert a published page with one live two_column section. */
async function createPage(input: {
  slug: string;
  body: string;
  seoTitle?: string | null;
}): Promise<{ id: number; slug: string }> {
  const [page] = await db
    .insert(pagesTable)
    .values({
      slug: input.slug,
      serviceKey: input.slug,
      locale: "en",
      title: `Growth test page ${input.slug}`,
      seoTitle: input.seoTitle ?? null,
      status: "published",
    })
    .returning();
  createdPageIds.push(page!.id);
  await db.insert(pageSectionsTable).values({
    pageId: page!.id,
    type: "two_column",
    sortOrder: 0,
    data: { title: "Section title", body: input.body },
  });
  return { id: page!.id, slug: page!.slug };
}

async function createLink(input: {
  name: string;
  targetUrl: string;
  active?: boolean;
  keywords?: { keyword: string; locale?: "en" | "nl" }[];
}): Promise<{ id: number }> {
  const res = await api("POST", "/admin/affiliate/links", {
    body: {
      name: input.name,
      targetUrl: input.targetUrl,
      active: input.active ?? true,
      keywords: input.keywords ?? [],
    },
  });
  expect(res.status).toBe(200);
  const created = (await res.json()) as { id: number };
  createdLinkIds.push(created.id);
  return created;
}

// --- 1. Affiliate link creation rejects unsafe targets ----------------------

describe("POST /admin/affiliate/links — target URL validation", () => {
  const badTargets = [
    "javascript:alert(1)",
    "/relative/path",
    "ftp://example.com/file",
    "not a url at all",
    "//protocol-relative.example.com",
    "data:text/html,<script>1</script>",
  ];

  it.each(badTargets)("rejects non-http(s) target %j with 400 (nothing stored)", async (targetUrl) => {
    const res = await api("POST", "/admin/affiliate/links", {
      body: { name: `${RUN} bad`, targetUrl, keywords: [] },
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty("error");
    expect(body).not.toHaveProperty("id");
  });

  it("accepts an absolute https URL and returns the stored link", async () => {
    const created = await createLink({
      name: `${RUN} good`,
      targetUrl: "https://partner.example.com/offer?src=oxot",
    });
    expect(created.id).toBeGreaterThan(0);
  });

  it("PUT also rejects a downgrade to a non-http target", async () => {
    const created = await createLink({
      name: `${RUN} update-guard`,
      targetUrl: "https://partner.example.com/ok",
    });
    const res = await api("PUT", `/admin/affiliate/links/${created.id}`, {
      body: { name: `${RUN} update-guard`, targetUrl: "javascript:alert(1)", keywords: [] },
    });
    expect(res.status).toBe(400);
    // Stored target must be untouched.
    const [row] = await db
      .select()
      .from(affiliateLinksTable)
      .where(eq(affiliateLinksTable.id, created.id));
    expect(row!.targetUrl).toBe("https://partner.example.com/ok");
  });
});

// --- 2. AI suggest + apply inserts a tracked link into the DRAFT ------------

describe("affiliate suggest + apply — inserts [kw](/api/go/:id) into the page draft", () => {
  it("suggests the deterministic keyword match and apply writes it into the draft only", async () => {
    // "zephyrium" is an invented token so the \b keyword regex can only match
    // our fixture body, and no other keyword in the shared dev DB collides.
    const keyword = `zephyrium${RUN}`;
    const body = `Our ${keyword} sensors integrate with legacy PLCs without downtime.`;
    const page = await createPage({ slug: `${RUN}-suggest`, body });
    const link = await createLink({
      name: `${RUN} partner`,
      targetUrl: "https://partner.example.com/zephyrium",
      keywords: [{ keyword, locale: "en" }],
    });

    // Suggest: LLM is mocked to fail, so the deterministic candidates come back.
    const suggestRes = await api("POST", "/admin/affiliate/suggest", {
      body: { pageId: page.id },
    });
    expect(suggestRes.status).toBe(200);
    const { suggestions } = (await suggestRes.json()) as {
      suggestions: { sectionIndex: number; sectionType: string; linkId: number; keyword: string }[];
    };
    const ours = suggestions.find((s) => s.linkId === link.id);
    expect(ours).toBeDefined();
    expect(ours!.keyword).toBe(keyword);
    expect(ours!.sectionType).toBe("two_column");

    // Apply: the markdown link lands in the draft's section body.
    const applyRes = await api("POST", "/admin/affiliate/apply", {
      body: {
        pageId: page.id,
        insertions: [{ sectionIndex: ours!.sectionIndex, linkId: link.id, keyword }],
      },
    });
    expect(applyRes.status).toBe(200);
    const applied = (await applyRes.json()) as {
      sections: { type: string; data: Record<string, unknown> }[];
    };
    const expectedMarkdown = `[${keyword}](/api/go/${link.id})`;
    expect(String(applied.sections[0]!.data["body"])).toContain(expectedMarkdown);

    // The DRAFT version carries the link…
    const [draft] = await db
      .select()
      .from(pageVersionsTable)
      .where(and(eq(pageVersionsTable.pageId, page.id), eq(pageVersionsTable.state, "draft")));
    expect(draft).toBeDefined();
    expect(JSON.stringify(draft!.sections)).toContain(expectedMarkdown);

    // …but the LIVE (published) section is untouched until an explicit publish.
    const [live] = await db
      .select()
      .from(pageSectionsTable)
      .where(eq(pageSectionsTable.pageId, page.id));
    expect(String((live!.data as Record<string, unknown>)["body"])).not.toContain("/api/go/");
  });
});

// --- 3. /api/go/:id records the click and 302s to the target ----------------

describe("GET /api/go/:id — click tracking redirect", () => {
  it("302s to the stored target and records a click attributed via Referer", async () => {
    const target = `https://partner.example.com/${RUN}-click`;
    const link = await createLink({ name: `${RUN} click`, targetUrl: target });
    const referer = "https://oxot.example.com/en/services?utm=x";

    const res = await api("GET", `/go/${link.id}`, {
      auth: false,
      redirect: "manual",
      headers: { "User-Agent": HUMAN_UA, Referer: referer },
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(target);

    const clicks = await db
      .select()
      .from(linkClicksTable)
      .where(eq(linkClicksTable.affiliateLinkId, link.id));
    expect(clicks).toHaveLength(1);
    expect(clicks[0]!.path).toBe("/en/services"); // pathname extracted from Referer
    expect(clicks[0]!.referrer).toBe(referer);

    // The click shows up in the admin overview's link performance.
    const overviewRes = await api("GET", "/admin/analytics/overview?days=1");
    expect(overviewRes.status).toBe(200);
    const overview = (await overviewRes.json()) as {
      linkPerformance: { linkId: number; clicks: number }[];
    };
    const perf = overview.linkPerformance.find((p) => p.linkId === link.id);
    expect(perf?.clicks).toBe(1);
  });

  it("redirects bots to the target WITHOUT recording a click", async () => {
    const target = `https://partner.example.com/${RUN}-bot`;
    const link = await createLink({ name: `${RUN} bot`, targetUrl: target });

    const res = await api("GET", `/go/${link.id}`, {
      auth: false,
      redirect: "manual",
      headers: { "User-Agent": BOT_UA },
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(target);

    const clicks = await db
      .select()
      .from(linkClicksTable)
      .where(eq(linkClicksTable.affiliateLinkId, link.id));
    expect(clicks).toHaveLength(0);
  });

  it("falls back to / for unknown, inactive, and malformed link ids", async () => {
    const inactive = await createLink({
      name: `${RUN} inactive`,
      targetUrl: "https://partner.example.com/inactive",
      active: false,
    });
    for (const path of ["/go/999999999", `/go/${inactive.id}`, "/go/not-a-number"]) {
      const res = await api("GET", path, {
        auth: false,
        redirect: "manual",
        headers: { "User-Agent": HUMAN_UA },
      });
      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("/");
    }
  });
});

// --- 4. Analytics beacon increments the admin overview -----------------------

describe("POST /api/analytics/collect — beacon feeds the overview", () => {
  it("a human beacon is acked and increments the overview", async () => {
    const path = `/${RUN}-beacon-human`;
    beaconPaths.push(path);

    const res = await api("POST", "/analytics/collect", {
      auth: false,
      headers: { "User-Agent": HUMAN_UA },
      body: { path, locale: "en", sessionId: `${RUN}-sess`, referrer: "https://google.com/", device: "desktop" },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });

    const overviewRes = await api("GET", "/admin/analytics/overview?days=1");
    expect(overviewRes.status).toBe(200);
    const overview = (await overviewRes.json()) as {
      totalViews: number;
      topPages: { path: string; views: number }[];
    };
    // The unique path makes the assertion robust against concurrent data.
    const rows = await db.select().from(pageViewsTable).where(eq(pageViewsTable.path, path));
    expect(rows).toHaveLength(1);
    expect(overview.totalViews).toBeGreaterThanOrEqual(1);
    // topPages is limited to 10, so assert via the DB row + totals rather than
    // requiring our path to beat existing traffic into the top-10 list.
  });

  it("a bot beacon is acked but NOT recorded", async () => {
    const path = `/${RUN}-beacon-bot`;
    beaconPaths.push(path);

    const res = await api("POST", "/analytics/collect", {
      auth: false,
      headers: { "User-Agent": BOT_UA },
      body: { path, locale: "en" },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });

    const rows = await db.select().from(pageViewsTable).where(eq(pageViewsTable.path, path));
    expect(rows).toHaveLength(0);
  });
});

// --- 5. SEO ownership: publish must not revert SEO-admin edits ---------------

describe("SEO field ownership — publish preserves OG/canonical, rewrites seoTitle", () => {
  it("GET /admin/seo/pages is reachable (not swallowed by /admin/:locale/pages)", async () => {
    // Route-ordering guard: if adminCms's greedy `/admin/:locale/pages` were
    // registered first, "seo" would be parsed as a locale and this would 400.
    const res = await api("GET", "/admin/seo/pages");
    expect(res.status).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  it("publishing a draft keeps SEO-admin OG/canonical edits and applies the draft's seoTitle", async () => {
    const page = await createPage({
      slug: `${RUN}-seo`,
      body: "Original body copy.",
      seoTitle: "Original SEO title",
    });

    // SEO admin edits the operational fields.
    const seoRes = await api("PUT", `/admin/seo/pages/${page.id}`, {
      body: {
        ogTitle: "OG title set by SEO admin",
        ogDescription: "OG description set by SEO admin",
        ogImage: "https://oxot.example.com/og.png",
        canonicalUrl: `https://oxot.example.com/${RUN}-seo`,
        metaKeywords: "ot security, cra",
        noindex: true,
      },
    });
    expect(seoRes.status).toBe(200);

    // CMS editor saves a draft with new versioned content (incl. seoTitle)…
    const draftRes = await api("PUT", `/admin/pages/${page.id}/draft`, {
      body: {
        title: "New page title",
        seoTitle: "Draft seoTitle from CMS",
        seoDescription: "Draft seoDescription from CMS",
        sections: [{ type: "two_column", order: 0, data: { title: "T", body: "Edited body." } }],
      },
    });
    expect(draftRes.status).toBe(200);

    // …and publishes.
    const publishRes = await api("POST", `/admin/pages/${page.id}/publish`, { body: {} });
    expect(publishRes.status).toBe(200);

    const [row] = await db.select().from(pagesTable).where(eq(pagesTable.id, page.id));
    // Versioned content: rewritten by publish (CMS is the owner).
    expect(row!.title).toBe("New page title");
    expect(row!.seoTitle).toBe("Draft seoTitle from CMS");
    expect(row!.seoDescription).toBe("Draft seoDescription from CMS");
    // Operational SEO fields: publish must NOT touch them (SEO admin is the owner).
    expect(row!.ogTitle).toBe("OG title set by SEO admin");
    expect(row!.ogDescription).toBe("OG description set by SEO admin");
    expect(row!.ogImage).toBe("https://oxot.example.com/og.png");
    expect(row!.canonicalUrl).toBe(`https://oxot.example.com/${RUN}-seo`);
    expect(row!.metaKeywords).toBe("ot security, cra");
    expect(row!.noindex).toBe(true);
  });
});
