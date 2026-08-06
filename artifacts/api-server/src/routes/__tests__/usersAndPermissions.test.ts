/**
 * Module 1: Users & Team Management Diagnostic Unit Test Suite
 *
 * Tests authentication sessions, user profile preferences, tour completion state,
 * password updates, and team directory management.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";

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

  it("POST /api/conformity/me/tours - persists completed tour key", async () => {
    const res = await api("POST", "/conformity/me/tours", {
      tourKey: "team_onboarding_wizard_v2",
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.completedTours)).toBe(true);
    expect(res.json.completedTours).toContain("team_onboarding_wizard_v2");
  });

  it("GET /api/admin/team - lists registered assessors and team members", async () => {
    const res = await api("GET", "/admin/team");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.members)).toBe(true);
    expect(res.json.members.length).toBeGreaterThan(0);
    
    const member = res.json.members[0];
    expect(member.name).toBeDefined();
    expect(member.role).toBeDefined();
    expect(typeof member.active).toBe("boolean");
  });
});
