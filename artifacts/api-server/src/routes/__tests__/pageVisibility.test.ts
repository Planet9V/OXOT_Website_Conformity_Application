/**
 * Contract tests for the CMS visibility tiers ("gated CMS" of the unified
 * conformance frontend):
 *
 *  - A `members` page must be a hard 404 for anonymous callers — on the list
 *    endpoint, the detail endpoint, crawler page-meta, and the sitemap. A
 *    gated page must be indistinguishable from a missing one.
 *  - An authenticated session (admin cookie — same tier model as members for
 *    CMS reads) sees public AND members pages.
 *  - Navigation filtering: internal nav links to a non-visible CMS page are
 *    dropped for anonymous callers.
 *
 * Strategy: boot the real Express app on an ephemeral port against the dev
 * database, seed one public + one members page inside the test, and drive it
 * over HTTP with/without a signed session cookie. Rows are cleaned up after.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { and, eq, inArray } from "drizzle-orm";
import { db, pagesTable, pageSectionsTable, navItemsTable } from "@workspace/db";
import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";

const PUBLIC_SLUG = "vis-test-public";
const MEMBERS_SLUG = "vis-test-members";
const NAV_LABEL = "VisTest Members Nav";

let server: Server;
let baseUrl: string;
let adminCookie: string;

async function get(path: string, cookie?: string) {
  return fetch(`${baseUrl}${path}`, {
    headers: cookie ? { cookie } : undefined,
    redirect: "manual",
  });
}

async function cleanup() {
  await db
    .delete(navItemsTable)
    .where(and(eq(navItemsTable.locale, "en"), eq(navItemsTable.label, NAV_LABEL)));
  await db
    .delete(pagesTable)
    .where(inArray(pagesTable.slug, [PUBLIC_SLUG, MEMBERS_SLUG]));
}

beforeAll(async () => {
  await cleanup();
  for (const [slug, visibility] of [
    [PUBLIC_SLUG, "public"],
    [MEMBERS_SLUG, "members"],
  ] as const) {
    const [row] = await db
      .insert(pagesTable)
      .values({
        slug,
        serviceKey: slug,
        locale: "en",
        title: `Visibility test ${visibility}`,
        status: "published",
        visibility,
        regulationKeys: ["cra"],
        noindex: false,
      })
      .returning({ id: pagesTable.id });
    await db.insert(pageSectionsTable).values({
      pageId: row.id,
      type: "article",
      sortOrder: 0,
      data: { title: slug, excerpt: "x", markdown: "## Test" },
    });
  }
  // Internal nav item pointing at the members page.
  await db.insert(navItemsTable).values({
    locale: "en",
    label: NAV_LABEL,
    href: `/${MEMBERS_SLUG}`,
    placement: "header",
    sortOrder: 999,
    external: false,
  });

  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("vis-test-admin")}`;
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await cleanup();
  await new Promise((resolve) => server.close(resolve));
});

describe("page visibility tiers", () => {
  it("anonymous list contains the public page but never the members page", async () => {
    const res = await get("/api/site/en/pages");
    expect(res.status).toBe(200);
    const slugs = ((await res.json()) as { slug: string }[]).map((p) => p.slug);
    expect(slugs).toContain(PUBLIC_SLUG);
    expect(slugs).not.toContain(MEMBERS_SLUG);
  });

  it("anonymous detail: members page is a hard 404, public page is 200", async () => {
    expect((await get(`/api/site/en/pages/${MEMBERS_SLUG}`)).status).toBe(404);
    expect((await get(`/api/site/en/pages/${PUBLIC_SLUG}`)).status).toBe(200);
  });

  it("authenticated session sees the members page in list and detail", async () => {
    const list = await get("/api/site/en/pages", adminCookie);
    const slugs = ((await list.json()) as { slug: string }[]).map((p) => p.slug);
    expect(slugs).toContain(MEMBERS_SLUG);

    const detail = await get(`/api/site/en/pages/${MEMBERS_SLUG}`, adminCookie);
    expect(detail.status).toBe(200);
    const page = (await detail.json()) as { visibility: string; regulationKeys: string[] };
    expect(page.visibility).toBe("members");
    expect(page.regulationKeys).toEqual(["cra"]);
  });

  it("navigation drops the members link for anonymous, keeps it for authed", async () => {
    const anon = await get("/api/site/en/navigation");
    const anonLabels = ((await anon.json()) as { label: string }[]).map((n) => n.label);
    expect(anonLabels).not.toContain(NAV_LABEL);

    const authed = await get("/api/site/en/navigation", adminCookie);
    const authedLabels = ((await authed.json()) as { label: string }[]).map((n) => n.label);
    expect(authedLabels).toContain(NAV_LABEL);
  });

  it("sitemap and crawler page-meta never expose the members page", async () => {
    const sitemap = await (await get("/api/seo/sitemap.xml")).text();
    expect(sitemap).toContain(PUBLIC_SLUG);
    expect(sitemap).not.toContain(MEMBERS_SLUG);

    const meta = await get(`/api/seo/page-meta?slug=${MEMBERS_SLUG}&locale=en`);
    expect(meta.status).toBe(404);
  });
});
