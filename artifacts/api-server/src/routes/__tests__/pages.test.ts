/**
 * Regression guard: `GET /site/:locale/pages` must source each summary's
 * `excerpt` from the page's *article section* content — never from a static
 * map or the page row itself.
 *
 * Why this matters
 * ----------------
 * The related-services strip (and any other summary card) renders the excerpt
 * returned here. It was deliberately switched from hardcoded copy to live CMS
 * content so a renamed page or an edited excerpt stays in sync. Without a test,
 * a future refactor could reintroduce hardcoded copy or drop the article-section
 * lookup and nobody would notice until the cards went stale.
 *
 * Strategy
 * --------
 * Mock `@workspace/db` with an in-memory store keyed by table, mount the real
 * router in an Express app, and hit it over HTTP. Each test seeds page rows and
 * article-section rows, then asserts the response excerpt matches the section's
 * `data.excerpt` for both `en` and `nl` — proving the excerpt is derived from
 * CMS article content, not invented.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import express from "express";

// ---------------------------------------------------------------------------
// Mock drizzle-orm helpers to inert markers — the db mock ignores the WHERE /
// ORDER BY arguments and returns rows straight from the in-memory store.
// ---------------------------------------------------------------------------

import { vi } from "vitest";

vi.mock("drizzle-orm", () => ({
  eq: (...a: unknown[]) => ({ op: "eq", a }),
  and: (...a: unknown[]) => ({ op: "and", a }),
  asc: (...a: unknown[]) => ({ op: "asc", a }),
  inArray: (...a: unknown[]) => ({ op: "inArray", a }),
}));

// Visibility tiers are covered by their own tests; here every request sees
// public pages only, keeping this suite focused on excerpt sourcing.
vi.mock("../../lib/visibility", () => ({
  allowedVisibilities: async () => ["public"],
}));

// ---------------------------------------------------------------------------
// Mock @workspace/db with a table-keyed store. `db.select().from(table)` returns
// a chain whose awaited `orderBy()` resolves to the rows seeded for that table.
// ---------------------------------------------------------------------------

vi.mock("@workspace/db", () => {
  const state: { pages: unknown[]; sections: unknown[] } = {
    pages: [],
    sections: [],
  };
  const pagesTable = {
    __t: "pages",
    id: "id",
    slug: "slug",
    title: "title",
    locale: "locale",
    status: "status",
  };
  const pageSectionsTable = {
    __t: "sections",
    pageId: "pageId",
    type: "type",
    sortOrder: "sortOrder",
    data: "data",
  };
  const chainFor = (table: { __t: string }) => {
    const rows = table.__t === "pages" ? state.pages : state.sections;
    const chain: Record<string, unknown> = {
      where: () => chain,
      orderBy: () => Promise.resolve(rows),
    };
    return chain;
  };
  return {
    db: { select: () => ({ from: (table: { __t: string }) => chainFor(table) }) },
    pagesTable,
    pageSectionsTable,
    __setState: (pages: unknown[], sections: unknown[]) => {
      state.pages = pages;
      state.sections = sections;
    },
  };
});

// Import AFTER the mocks so the router binds to the mocked db.
import router from "../pages";
import * as dbModule from "@workspace/db";

const setState = (
  dbModule as unknown as {
    __setState: (pages: unknown[], sections: unknown[]) => void;
  }
).__setState;

// ---------------------------------------------------------------------------
// Test HTTP server
// ---------------------------------------------------------------------------

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = express();
  app.use(router);
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

beforeEach(() => {
  setState([], []);
});

/** Build a page row as returned by pagesTable.select(). */
function pageRow(id: number, slug: string, title: string, locale: "en" | "nl") {
  return {
    id,
    slug,
    serviceKey: slug,
    title,
    locale,
    status: "published",
    visibility: "public",
    regulationKeys: [],
    // extra columns the route ignores — present to mirror a real row
    seoTitle: null,
    seoDescription: null,
  };
}

/** Build an article-section projection row ({ pageId, data }). */
function articleSection(pageId: number, excerpt: string | null, sortOrder = 0) {
  return { pageId, sortOrder, data: excerpt === null ? { markdown: "x" } : { excerpt, markdown: "x" } };
}

async function listPages(locale: string) {
  const res = await fetch(`${baseUrl}/site/${locale}/pages`);
  return { status: res.status, body: (await res.json()) as Array<Record<string, unknown>> };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /site/:locale/pages — excerpt sourced from article section", () => {
  it("en: excerpt comes from each page's article section, matched by page id", async () => {
    setState(
      [
        pageRow(1, "ot-security-assessments", "OT Security Assessments", "en"),
        pageRow(2, "ot-security-programmes", "OT Security Programmes", "en"),
      ],
      [
        articleSection(1, "Independent assessment of your OT estate."),
        articleSection(2, "A rolling programme that keeps OT secure."),
      ],
    );

    const { status, body } = await listPages("en");
    expect(status).toBe(200);

    const bySlug = new Map(body.map((p) => [p.slug, p]));
    expect(bySlug.get("ot-security-assessments")?.excerpt).toBe(
      "Independent assessment of your OT estate.",
    );
    expect(bySlug.get("ot-security-programmes")?.excerpt).toBe(
      "A rolling programme that keeps OT secure.",
    );
  });

  it("nl: excerpt comes from each page's article section (localized copy)", async () => {
    setState(
      [
        pageRow(11, "ot-security-assessments", "OT-beveiligingsbeoordelingen", "nl"),
        pageRow(12, "ot-security-programmes", "OT-beveiligingsprogramma's", "nl"),
      ],
      [
        articleSection(11, "Onafhankelijke beoordeling van uw OT-omgeving."),
        articleSection(12, "Een doorlopend programma dat OT veilig houdt."),
      ],
    );

    const { status, body } = await listPages("nl");
    expect(status).toBe(200);

    const bySlug = new Map(body.map((p) => [p.slug, p]));
    expect(bySlug.get("ot-security-assessments")?.excerpt).toBe(
      "Onafhankelijke beoordeling van uw OT-omgeving.",
    );
    expect(bySlug.get("ot-security-programmes")?.excerpt).toBe(
      "Een doorlopend programma dat OT veilig houdt.",
    );
  });

  it("returns excerpt: null when the page has no article section", async () => {
    setState([pageRow(3, "no-article", "No Article", "en")], []);

    const { body } = await listPages("en");
    expect(body).toHaveLength(1);
    expect(body[0].excerpt).toBeNull();
  });

  it("ignores a blank/whitespace-only article excerpt (falls back to null)", async () => {
    setState([pageRow(4, "blank-excerpt", "Blank", "en")], [articleSection(4, "   ")]);

    const { body } = await listPages("en");
    expect(body[0].excerpt).toBeNull();
  });

  it("uses the first article section's excerpt when a page has several", async () => {
    // Sections are pre-ordered by sortOrder in the route's query; the first
    // one with a non-empty excerpt wins.
    setState(
      [pageRow(5, "multi-section", "Multi", "en")],
      [
        articleSection(5, "First section excerpt.", 0),
        articleSection(5, "Second section excerpt.", 1),
      ],
    );

    const { body } = await listPages("en");
    expect(body[0].excerpt).toBe("First section excerpt.");
  });

  it("does not attach one page's excerpt to a different page (id keying)", async () => {
    setState(
      [
        pageRow(7, "with-article", "With Article", "en"),
        pageRow(8, "without-article", "Without Article", "en"),
      ],
      [articleSection(7, "Belongs to page 7 only.")],
    );

    const { body } = await listPages("en");
    const bySlug = new Map(body.map((p) => [p.slug, p]));
    expect(bySlug.get("with-article")?.excerpt).toBe("Belongs to page 7 only.");
    expect(bySlug.get("without-article")?.excerpt).toBeNull();
  });

  it("rejects an unsupported locale", async () => {
    const res = await fetch(`${baseUrl}/site/fr/pages`);
    expect(res.status).toBe(400);
  });
});
