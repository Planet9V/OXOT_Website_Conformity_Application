/**
 * Social share failure observability contract (auto-share on publish).
 *
 * Auto-share is fire-and-forget, so a silent failure is exactly the risk the
 * outcome log exists to prevent. These tests lock in, against the real app +
 * dev DB:
 *  1. When postToSocial returns a failure outcome inside scheduleSocialShare,
 *     recordSocialOutcomes persists a matching row (source = "publish") to
 *     social_posts.
 *  2. GET /admin/social/posts returns those rows newest-first.
 *
 * Strategy: keep lib/social and the DB real; mock only integrationSettings so
 * both platforms look configured + auto-publishable, and intercept fetch so
 * calls to linkedin.com / twitter.com fail deterministically while the test's
 * own HTTP calls to the booted app pass through untouched.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

vi.mock("../../lib/integrationSettings", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../lib/integrationSettings")>();
  return {
    ...actual,
    getLinkedinConfig: vi.fn().mockResolvedValue({
      enabled: true,
      autoPublish: true,
      accessToken: "TEST_LI_TOKEN",
      authorUrn: "urn:li:member:test",
    }),
    getXConfig: vi.fn().mockResolvedValue({
      enabled: true,
      autoPublish: true,
      apiKey: "TEST_X_KEY",
      apiSecret: "TEST_X_SECRET",
      accessToken: "TEST_X_TOKEN",
      accessSecret: "TEST_X_ACCESS_SECRET",
    }),
    // No alert recipient → alertSocialFailures logs and returns (no email).
    getAlertRecipient: vi.fn().mockResolvedValue(null),
    recordIntegrationHealth: vi.fn().mockResolvedValue(undefined),
    recordIntegrationEvent: vi.fn().mockResolvedValue(undefined),
  };
});

import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";
import { scheduleSocialShare } from "../../lib/social";
import { db, socialPostsTable } from "@workspace/db";
import { like } from "drizzle-orm";

const realFetch = globalThis.fetch;

/**
 * Fail every request to the social providers with a 500; pass everything else
 * (our own calls to the booted app) through to the real fetch.
 */
function interceptSocialFetch(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.includes("linkedin.com") || url.includes("twitter.com")) {
        return new Response("simulated provider outage", { status: 500 });
      }
      return realFetch(input, init);
    }),
  );
}

const RUN_TAG = `social-outcome-log-test-${Date.now()}`;

let server: Server;
let baseUrl: string;
let adminCookie: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("social-log-test-admin")}`;
  interceptSocialFetch();
});

afterAll(async () => {
  vi.unstubAllGlobals();
  // Clean up every row this test run created.
  await db.delete(socialPostsTable).where(like(socialPostsTable.text, `%${RUN_TAG}%`));
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

/** Poll social_posts until `predicate` matches (real DB I/O takes wall time). */
async function waitForRows(
  predicate: (rows: (typeof socialPostsTable.$inferSelect)[]) => boolean,
  timeoutMs = 8000,
): Promise<(typeof socialPostsTable.$inferSelect)[]> {
  const deadline = Date.now() + timeoutMs;
  let rows: (typeof socialPostsTable.$inferSelect)[] = [];
  while (Date.now() < deadline) {
    rows = await db
      .select()
      .from(socialPostsTable)
      .where(like(socialPostsTable.text, `%${RUN_TAG}%`));
    if (predicate(rows)) return rows;
    await new Promise((r) => setTimeout(r, 100));
  }
  return rows;
}

describe("auto-share failure persistence (source = publish)", () => {
  it("persists a matching social_posts row when postToSocial fails during scheduleSocialShare", async () => {
    const text = `LinkedIn failure must be logged ${RUN_TAG}`;

    scheduleSocialShare(text, ["linkedin"]);

    const rows = await waitForRows((rs) =>
      rs.some((r) => r.text === text && r.platform === "linkedin"),
    );
    const row = rows.find((r) => r.text === text && r.platform === "linkedin");

    expect(row).toBeDefined();
    expect(row?.success).toBe(false);
    expect(row?.source).toBe("publish");
    expect(row?.error).toMatch(/LinkedIn API 500/);
  });

  it("persists one failure row per platform when both platforms fail", async () => {
    const text = `Both platforms fail ${RUN_TAG}`;

    scheduleSocialShare(text, ["linkedin", "x"]);

    const rows = (
      await waitForRows((rs) => rs.filter((r) => r.text === text).length >= 2)
    ).filter((r) => r.text === text);

    expect(rows.map((r) => r.platform).sort()).toEqual(["linkedin", "x"]);
    for (const r of rows) {
      expect(r.success).toBe(false);
      expect(r.source).toBe("publish");
      expect(r.error).toBeTruthy();
    }
  });
});

describe("GET /admin/social/posts", () => {
  it("returns logged outcomes newest-first, including publish failures", async () => {
    // Insert rows with explicit, strictly increasing createdAt so ordering is
    // deterministic (defaultNow() could tie within one millisecond).
    const base = Date.now() - 60_000;
    const inserted = await db
      .insert(socialPostsTable)
      .values(
        [0, 1, 2].map((i) => ({
          platform: "linkedin",
          success: false,
          error: "simulated failure",
          text: `ordering row ${i} ${RUN_TAG}`,
          source: "publish",
          createdAt: new Date(base + i * 1000),
        })),
      )
      .returning();

    const res = await fetch(`${baseUrl}/admin/social/posts`, {
      headers: { cookie: adminCookie },
    });
    expect(res.status).toBe(200);
    const posts = (await res.json()) as {
      id: number;
      success: boolean;
      source: string;
      createdAt: string;
    }[];

    // Globally newest-first.
    for (let i = 1; i < posts.length; i++) {
      expect(Date.parse(posts[i - 1]!.createdAt)).toBeGreaterThanOrEqual(
        Date.parse(posts[i]!.createdAt),
      );
    }

    // Our three rows appear in reverse insertion order (2, 1, 0) if within
    // the returned window; at minimum the relative order must be descending.
    const ids = new Set(inserted.map((r) => r.id));
    const ours = posts.filter((p) => ids.has(p.id));
    expect(ours.length).toBeGreaterThan(0);
    const byIdOrder = inserted
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((r) => r.id)
      .filter((id) => ours.some((p) => p.id === id));
    expect(ours.map((p) => p.id)).toEqual(byIdOrder);

    // The publish-failure rows are visible to the admin as failures.
    for (const p of ours) {
      expect(p.success).toBe(false);
      expect(p.source).toBe("publish");
    }
  });

  it("rejects anonymous access", async () => {
    const res = await fetch(`${baseUrl}/admin/social/posts`);
    expect(res.status).toBe(401);
  });
});
