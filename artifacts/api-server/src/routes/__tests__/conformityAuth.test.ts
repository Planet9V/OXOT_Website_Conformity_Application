/**
 * Regression guard: the conformity *execution* ("working") layer must never be
 * reachable by anonymous callers.
 *
 * The execution layer (products, assessments, wizard answers, route selection,
 * requirement instantiation, gap evaluations, evidence, artifacts, readiness
 * grade, incidents) mutates and exposes a customer's assessment state. Every
 * one of those endpoints is gated behind `requireAdmin`. If that guard is
 * accidentally dropped from any route in a future refactor, assessment data
 * could be read or mutated by logged-out users with no visible symptom — this
 * test locks the contract down so the regression fails CI instead.
 *
 * Conversely, the read-only knowledge/mapping browser (dashboard summary,
 * regulations, themes, requirements, mappings, sources) is intentionally
 * public and must STAY reachable without a session.
 *
 * Strategy
 * --------
 * Boot the real Express app against the real dev database on an ephemeral port,
 * then drive it over HTTP:
 *  1. Anonymous request to every execution endpoint  -> 401 (never 2xx data).
 *  2. Authenticated request (valid signed admin cookie) to representative
 *     execution endpoints -> NOT 401/403 (proves the 401 above comes from the
 *     auth guard, not some unrelated failure — i.e. the guard is the gate).
 *  3. Anonymous request to every public knowledge-base endpoint -> reachable
 *     (200, never 401/403).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { eq, inArray } from "drizzle-orm";
import { db, conformityMembersTable } from "@workspace/db";
import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";
import { hashPassword } from "../../lib/teamMembers";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Every execution-layer endpoint. Placeholder ids (1) are irrelevant: the
 * `requireAdmin` guard runs before any handler logic or body parsing, so an
 * anonymous call is rejected regardless of whether the id exists.
 */
const EXECUTION_ENDPOINTS: { method: Method; path: string }[] = [
  // Flow
  { method: "GET", path: "/conformity/flow/cra" },
  // Products
  { method: "GET", path: "/conformity/products" },
  { method: "POST", path: "/conformity/products" },
  { method: "GET", path: "/conformity/products/1" },
  { method: "PUT", path: "/conformity/products/1" },
  { method: "DELETE", path: "/conformity/products/1" },
  // Assessments + wizard
  { method: "POST", path: "/conformity/assessments" },
  { method: "GET", path: "/conformity/assessments/1" },
  { method: "GET", path: "/conformity/assessments/1/activity" },
  { method: "DELETE", path: "/conformity/assessments/1" },
  { method: "PUT", path: "/conformity/assessments/1/answers" },
  { method: "PUT", path: "/conformity/assessments/1/route" },
  { method: "PUT", path: "/conformity/assessments/1/standards" },
  { method: "POST", path: "/conformity/assessments/1/instantiate" },
  // Evaluations (gap worklist)
  { method: "GET", path: "/conformity/assessments/1/evaluations" },
  { method: "PUT", path: "/conformity/evaluations/1" },
  // Evidence
  { method: "GET", path: "/conformity/assessments/1/evidence" },
  { method: "POST", path: "/conformity/assessments/1/evidence" },
  { method: "DELETE", path: "/conformity/evidence/1" },
  // Artifacts
  { method: "GET", path: "/conformity/assessments/1/artifacts" },
  { method: "POST", path: "/conformity/assessments/1/artifacts/generate" },
  { method: "GET", path: "/conformity/artifacts/1" },
  // Readiness grade
  { method: "POST", path: "/conformity/assessments/1/grade" },
  { method: "GET", path: "/conformity/assessments/1/grades" },
  // Incidents
  { method: "GET", path: "/conformity/assessments/1/incidents" },
  { method: "POST", path: "/conformity/assessments/1/incidents" },
  { method: "PUT", path: "/conformity/incidents/1" },
  { method: "DELETE", path: "/conformity/incidents/1" },
  { method: "GET", path: "/conformity/incidents/1/report-package" },
  // xBOM Vault
  { method: "GET", path: "/conformity/bom-catalog" },
  { method: "GET", path: "/conformity/assessments/1/boms" },
  { method: "POST", path: "/conformity/assessments/1/boms" },
  { method: "GET", path: "/conformity/boms/1" },
  { method: "DELETE", path: "/conformity/boms/1" },
  { method: "POST", path: "/conformity/boms/1/analyze" },
  { method: "PATCH", path: "/conformity/boms/1/checklist" },
  // Conformity Flow Engine — flow definitions + per-assessment runs
  { method: "GET", path: "/conformity/flows" },
  { method: "POST", path: "/conformity/flows" },
  { method: "GET", path: "/conformity/flows/1" },
  { method: "PUT", path: "/conformity/flows/1" },
  { method: "DELETE", path: "/conformity/flows/1" },
  { method: "GET", path: "/conformity/assessments/1/flow-runs" },
  { method: "POST", path: "/conformity/assessments/1/flow-runs" },
  { method: "GET", path: "/conformity/flow-runs/1" },
  { method: "PATCH", path: "/conformity/flow-runs/1/steps/step-a" },
  // Portfolio rollup (command centre) — admin-only operational aggregate
  { method: "GET", path: "/conformity/portfolio" },
  // Team directory (assignment picker — any signed-in role)
  { method: "GET", path: "/conformity/team" },
];

/** Read-only knowledge-base endpoints that must remain public. */
const PUBLIC_ENDPOINTS: string[] = [
  "/conformity/summary",
  "/conformity/regulations",
  "/conformity/themes",
  "/conformity/requirements",
  "/conformity/mappings",
  "/conformity/sources",
];

let server: Server;
let baseUrl: string;
let adminCookie: string;
let demoCookie: string;

// Named-member fixtures: REAL rows, because member sessions re-check `active`
// in the DB on every request — a forged/stale cookie alone is not enough.
const MEMBER_USERNAME = "ci.contract.member";
const MEMBER_PASSWORD = "ci-member-pass-12345";
const DEACT_USERNAME = "ci.contract.deact";
let memberCookie: string;
let deactId: number;
let deactCookie: string;

async function upsertMember(username: string, displayName: string): Promise<number> {
  const [row] = await db
    .insert(conformityMembersTable)
    .values({ username, displayName, passwordHash: hashPassword(MEMBER_PASSWORD), active: true })
    .onConflictDoUpdate({
      target: conformityMembersTable.username,
      set: { displayName, passwordHash: hashPassword(MEMBER_PASSWORD), active: true },
    })
    .returning();
  return row!.id;
}

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  const username = process.env["ADMIN_USERNAME"] ?? "admin";
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken(username)}`;
  demoCookie = `${ADMIN_COOKIE}=${createSessionToken("oxotdemo", "demo")}`;

  const memberId = await upsertMember(MEMBER_USERNAME, "CI Member");
  memberCookie = `${ADMIN_COOKIE}=${createSessionToken(MEMBER_USERNAME, "member", {
    memberId,
    displayName: "CI Member",
  })}`;
  deactId = await upsertMember(DEACT_USERNAME, "CI Deactivated");
  deactCookie = `${ADMIN_COOKIE}=${createSessionToken(DEACT_USERNAME, "member", {
    memberId: deactId,
    displayName: "CI Deactivated",
  })}`;
});

afterAll(async () => {
  await db
    .delete(conformityMembersTable)
    .where(inArray(conformityMembersTable.username, [MEMBER_USERNAME, DEACT_USERNAME]));
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe("conformity execution layer — anonymous access is rejected", () => {
  it.each(EXECUTION_ENDPOINTS)(
    "$method $path returns 401 (not data) without a session",
    async ({ method, path }) => {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        // A body is irrelevant — the guard rejects before parsing — but send a
        // valid empty JSON object so express.json() never chokes first.
        headers:
          method === "GET" || method === "DELETE"
            ? {}
            : { "Content-Type": "application/json" },
        body: method === "GET" || method === "DELETE" ? undefined : "{}",
      });

      expect(res.status).toBe(401);

      // The response must be the auth error envelope, never leaked data.
      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty("error");
      expect(body).not.toHaveProperty("product");
      expect(body).not.toHaveProperty("assessment");
      expect(body).not.toHaveProperty("products");
    },
  );
});

describe("conformity execution layer — the auth guard is what gates it", () => {
  // Representative read endpoints: with a valid admin cookie the request must
  // get PAST requireAdmin. It may 404 (id 1 may not exist) or 200, but it must
  // never be 401/403 — proving the anonymous 401s above come from the guard.
  const authedReads: string[] = [
    "/conformity/products",
    "/conformity/products/1",
    "/conformity/assessments/1",
    "/conformity/assessments/1/evaluations",
    "/conformity/portfolio",
  ];

  it.each(authedReads)(
    "GET %s is not rejected as unauthorized when a valid admin cookie is present",
    async (path) => {
      const res = await fetch(`${baseUrl}${path}`, {
        headers: { Cookie: adminCookie },
      });
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    },
  );
});

describe("conformity execution layer — the demo role is read-only", () => {
  // Demo may READ every execution endpoint (it drives the public sandbox)...
  const demoReads = EXECUTION_ENDPOINTS.filter((e) => e.method === "GET");
  it.each(demoReads)(
    "$method $path is reachable with a demo cookie (not 401/403)",
    async ({ path }) => {
      const res = await fetch(`${baseUrl}${path}`, { headers: { Cookie: demoCookie } });
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    },
  );

  // ...but every mutation is refused with 403 before the handler runs.
  const demoMutations = EXECUTION_ENDPOINTS.filter((e) => e.method !== "GET");
  it.each(demoMutations)(
    "$method $path is forbidden (403) with a demo cookie",
    async ({ method, path }) => {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers:
          method === "DELETE" ? { Cookie: demoCookie } : { Cookie: demoCookie, "Content-Type": "application/json" },
        body: method === "DELETE" ? undefined : "{}",
      });
      expect(res.status).toBe(403);
      // Never leaked data — just the read-only refusal envelope.
      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty("error");
      expect(body).not.toHaveProperty("product");
      expect(body).not.toHaveProperty("assessment");
    },
  );

  // The 403 is role-based, not a blanket block: an admin mutation gets PAST the
  // guard (it may 400/404 on the empty body / missing id, but never 403).
  it("an admin mutation is not blocked by the demo read-only guard", async () => {
    const res = await fetch(`${baseUrl}/conformity/assessments`, {
      method: "POST",
      headers: { Cookie: adminCookie, "Content-Type": "application/json" },
      body: "{}",
    });
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(401);
  });
});

describe("conformity execution layer — named members are full participants", () => {
  const memberReads = [
    "/conformity/products",
    "/conformity/assessments/1/evaluations",
    "/conformity/team",
    "/conformity/assessments/1/activity",
  ];
  it.each(memberReads)(
    "GET %s is reachable with a member cookie (not 401/403)",
    async (path) => {
      const res = await fetch(`${baseUrl}${path}`, { headers: { Cookie: memberCookie } });
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    },
  );

  it("a member mutation gets past the auth + read-only guards (unlike demo)", async () => {
    // Empty body → may 400 on validation, but never 401/403: members can write.
    const res = await fetch(`${baseUrl}/conformity/assessments`, {
      method: "POST",
      headers: { Cookie: memberCookie, "Content-Type": "application/json" },
      body: "{}",
    });
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it("deactivating a member kills their still-signed cookie on the next request", async () => {
    try {
      await db
        .update(conformityMembersTable)
        .set({ active: false })
        .where(eq(conformityMembersTable.id, deactId));
      const res = await fetch(`${baseUrl}/conformity/products`, {
        headers: { Cookie: deactCookie },
      });
      expect(res.status).toBe(401);
    } finally {
      await db
        .update(conformityMembersTable)
        .set({ active: true })
        .where(eq(conformityMembersTable.id, deactId));
    }
  });

  it("a member signs in with their own credentials and gets a named session", async () => {
    const login = await fetch(`${baseUrl}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: MEMBER_USERNAME, password: MEMBER_PASSWORD }),
    });
    expect(login.status).toBe(200);
    const body = (await login.json()) as Record<string, unknown>;
    expect(body["authenticated"]).toBe(true);
    expect(body["role"]).toBe("member");
    expect(body["displayName"]).toBe("CI Member");

    const setCookie = login.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(ADMIN_COOKIE);
    const cookie = setCookie.split(";")[0]!;
    const session = await fetch(`${baseUrl}/admin/session`, { headers: { Cookie: cookie } });
    const s = (await session.json()) as Record<string, unknown>;
    expect(s["authenticated"]).toBe(true);
    expect(s["username"]).toBe(MEMBER_USERNAME);
    expect(s["displayName"]).toBe("CI Member");
  });

  it("a wrong member password is rejected", async () => {
    const res = await fetch(`${baseUrl}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: MEMBER_USERNAME, password: "definitely-wrong-pass" }),
    });
    expect(res.status).toBe(401);
  });
});

describe("member management (/admin/team) is admin-only", () => {
  it("anonymous GET /admin/team is rejected with 401", async () => {
    const res = await fetch(`${baseUrl}/admin/team`);
    expect(res.status).toBe(401);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty("error");
  });

  it.each(["demo", "member"] as const)("GET /admin/team as %s is rejected", async (who) => {
    const cookie = who === "demo" ? demoCookie : memberCookie;
    const res = await fetch(`${baseUrl}/admin/team`, { headers: { Cookie: cookie } });
    expect([401, 403]).toContain(res.status);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty("error");
    expect(Array.isArray(body)).toBe(false);
  });

  it("a member cannot create accounts (POST /admin/team rejected)", async () => {
    const res = await fetch(`${baseUrl}/admin/team`, {
      method: "POST",
      headers: { Cookie: memberCookie, "Content-Type": "application/json" },
      body: JSON.stringify({ username: "sneaky.member", displayName: "X", password: "12345678" }),
    });
    expect([401, 403]).toContain(res.status);
  });

  it("the admin can list members (the guard is role-based, not a blanket block)", async () => {
    const res = await fetch(`${baseUrl}/admin/team`, { headers: { Cookie: adminCookie } });
    expect(res.status).toBe(200);
    const list = (await res.json()) as { username: string }[];
    expect(list.some((m) => m.username === MEMBER_USERNAME)).toBe(true);
  });
});

describe("conformity knowledge base — public endpoints stay reachable", () => {
  it.each(PUBLIC_ENDPOINTS)(
    "GET %s is reachable without a session",
    async (path) => {
      const res = await fetch(`${baseUrl}${path}`);
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect(res.status).toBe(200);
    },
  );
});

/**
 * Every response — success or error — must carry an X-Request-Id header so a
 * user-reported failure can be correlated with its exact server log line. The
 * header is set by a top-level middleware before any route (or auth guard) runs,
 * so it must be present even on the anonymous 401s asserted above.
 */
describe("responses carry a correlation id", () => {
  it("a public 200 response includes X-Request-Id", async () => {
    const res = await fetch(`${baseUrl}/conformity/summary`);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("an anonymous 401 response still includes X-Request-Id", async () => {
    const res = await fetch(`${baseUrl}/conformity/products`);
    expect(res.status).toBe(401);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });
});
