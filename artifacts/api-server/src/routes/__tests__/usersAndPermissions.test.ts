/**
 * Module 1: Users & Team Management Diagnostic Unit Test Suite
 *
 * Tests authentication sessions, user profile preferences, tour completion state,
 * password updates, and team directory management.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { eq } from "drizzle-orm";
import { db, conformityMembersTable } from "@workspace/db";
import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";
import { hashPassword } from "../../lib/teamMembers";

let server: Server;
let baseUrl: string;
let adminCookie: string;
let demoCookie: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("users-admin-test")}`;
  demoCookie = `${ADMIN_COOKIE}=${createSessionToken("oxotdemo", "demo")}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

async function api(
  method: string,
  path: string,
  body?: unknown,
  cookie: string = adminCookie,
): Promise<{ status: number; json: any }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      cookie,
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let json: any = {};
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }
  return { status: res.status, json };
}

describe("Module 1: Users & Permissions Diagnostic Suite", () => {
  it("GET /api/conformity/me - returns user session details for valid admin cookie", async () => {
    const res = await api("GET", "/conformity/me");
    expect(res.status).toBe(200);
    expect(res.json.username).toBe("users-admin-test");
    expect(res.json.role).toBe("admin");
  });

  it("GET /api/conformity/me - returns demo session details for demo cookie", async () => {
    const res = await api("GET", "/conformity/me", undefined, demoCookie);
    expect(res.status).toBe(200);
    expect(res.json.username).toBe("oxotdemo");
    expect(res.json.role).toBe("demo");
  });

  it("GET /api/conformity/me - returns 401 Unauthorized when no cookie provided", async () => {
    const res = await api("GET", "/conformity/me", undefined, "");
    expect(res.status).toBe(401);
  });

  it("POST /api/conformity/me/tours - persists a seen tour for a MEMBER session", async () => {
    // /me mutations are member-only BY DESIGN: admin and demo are
    // env-configured accounts, so their mutations answer 403 (asserted
    // below). The previous version of this test sent an admin session and an
    // out-of-vocabulary tour key, and asserted the 403 was a failure.
    const username = "tours.member.test";
    const [existing] = await db
      .select()
      .from(conformityMembersTable)
      .where(eq(conformityMembersTable.username, username));
    const memberId = existing
      ? existing.id
      : (
          await db
            .insert(conformityMembersTable)
            .values({
              username,
              displayName: "Tours Member",
              passwordHash: hashPassword("tours-member-pass-1"),
            })
            .returning()
        )[0]!.id;
    const memberCookie = `${ADMIN_COOKIE}=${createSessionToken(username, "member", {
      memberId,
      displayName: "Tours Member",
    })}`;

    const res = await api("POST", "/conformity/me/tours", { tourId: "workbench" }, memberCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.toursSeen)).toBe(true);
    expect(res.json.toursSeen).toContain("workbench");

    const adminAttempt = await api("POST", "/conformity/me/tours", { tourId: "workbench" });
    expect(adminAttempt.status).toBe(403);
  });

  it("GET /api/admin/team - lists registered assessors and team members", async () => {
    const res = await api("GET", "/admin/team");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json)).toBe(true);
  });

  it("POST /api/admin/team - creates a new team member with explicit sequence ID", async () => {
    const testUsername = `diag_user_${Date.now()}`;
    const res = await api("POST", "/admin/team", {
      username: testUsername,
      displayName: "Diagnostic Test Assessor",
      password: "TestPassword123!",
      position: "CRA Compliance Auditor",
      email: `${testUsername}@oxot.eu`,
    });
    expect(res.status).toBe(200);
    expect(res.json.username).toBe(testUsername);
    expect(res.json.displayName).toBe("Diagnostic Test Assessor");
    expect(res.json.id).toBeGreaterThan(0);
  });

  it("POST /api/admin/login - allows newly created team member to log in with their credentials", async () => {
    const testUsername = `login_user_${Date.now()}`;
    const testPassword = "MemberSecret123!";

    // 1. Admin provisions team member account
    const createRes = await api("POST", "/admin/team", {
      username: testUsername,
      displayName: "Login Test Assessor",
      password: testPassword,
      position: "Senior Assessor",
      email: `${testUsername}@oxot.eu`,
    });
    expect(createRes.status).toBe(200);

    // 2. Member logs in using POST /api/admin/login
    const loginRes = await api("POST", "/admin/login", {
      username: testUsername,
      password: testPassword,
    }, "");
    expect(loginRes.status).toBe(200);
    expect(loginRes.json.authenticated).toBe(true);
    expect(loginRes.json.username).toBe(testUsername);
    expect(loginRes.json.role).toBe("member");
    expect(loginRes.json.displayName).toBe("Login Test Assessor");
  });
});
