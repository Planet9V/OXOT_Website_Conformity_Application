/**
 * PSIRT/CVD module (Annex I Part II CRA) — API walk.
 *
 * Boots the real Express app on an ephemeral port and drives:
 *  - public CVD intake (no auth) incl. honeypot swallow;
 *  - PSIRT profile upsert per product;
 *  - the validated remediation lifecycle (received → triaged → confirmed →
 *    fix_in_progress → fix_available → disclosed) with ledger rows, and
 *    rejection of illegal jumps;
 *  - advisory draft → completeness-gated publish → immutability, and the
 *    public advisory listing only exposing published rows;
 *  - the auth contract: anonymous → 401 on workbench routes, demo mutations →
 *    403, demo reads OK, public routes open.
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
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("psirt-admin")}`;
  demoCookie = `${ADMIN_COOKIE}=${createSessionToken("oxotdemo", "demo")}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

type Json = Record<string, unknown>;

async function api(
  method: string,
  path: string,
  body?: unknown,
  cookie: string | null = adminCookie,
): Promise<{ status: number; json: Json }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let json: Json = {};
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text) as Json;
    } catch {
      json = { __raw: text };
    }
  }
  return { status: res.status, json };
}

describe("public CVD intake", () => {
  it("accepts an anonymous report and swallows honeypot submissions", async () => {
    const ok = await api(
      "POST",
      "/conformity/public/vulnerability-reports",
      {
        productName: "PSIRT Test Product",
        title: `Intake ${Date.now()}`,
        description: "Buffer overflow in the parser.",
        claimedSeverity: "high",
      },
      null,
    );
    expect(ok.status).toBe(201);
    expect(ok.json.id as number).toBeGreaterThan(0);

    const bot = await api(
      "POST",
      "/conformity/public/vulnerability-reports",
      {
        productName: "Bot Product",
        title: "spam",
        description: "spam",
        website: "http://spam.example",
      },
      null,
    );
    expect(bot.status).toBe(201);
    expect(bot.json.id).toBe(0); // indistinguishable success, nothing stored
  });
});

describe("PSIRT lifecycle + profile + advisories", () => {
  it("walks the full remediation lifecycle with a validated state machine", async () => {
    const product = await api("POST", "/conformity/products", {
      name: `PSIRT Product ${Date.now()}`,
      productType: "software",
    });
    expect(product.status).toBe(200);
    const productId = product.json.id as number;

    // Profile upsert (create then update).
    const put1 = await api("PUT", `/conformity/products/${productId}/psirt-profile`, {
      contactEmail: "security@example.com",
      contactUrl: "",
      policyText: "Report responsibly.",
      policyUrl: "",
      disclosureDays: 45,
    });
    expect(put1.status).toBe(200);
    expect(put1.json.disclosureDays).toBe(45);
    const put2 = await api("PUT", `/conformity/products/${productId}/psirt-profile`, {
      contactEmail: "psirt@example.com",
      contactUrl: "https://example.com/security",
      policyText: "Report responsibly.",
      policyUrl: "",
      disclosureDays: 60,
    });
    expect(put2.status).toBe(200);
    expect(put2.json.contactEmail).toBe("psirt@example.com");

    // Intake a report, then triage it against the product.
    const intake = await api(
      "POST",
      "/conformity/public/vulnerability-reports",
      {
        productName: "PSIRT Product (as typed by reporter)",
        title: `CVE walk ${Date.now()}`,
        description: "Auth bypass.",
      },
      null,
    );
    const reportId = intake.json.id as number;

    // Illegal jump straight to disclosed is rejected.
    const jump = await api("PATCH", `/conformity/vuln-reports/${reportId}`, {
      status: "disclosed",
    });
    expect(jump.status).toBe(400);

    const triage = await api("PATCH", `/conformity/vuln-reports/${reportId}`, {
      status: "triaged",
      productId,
      assessedSeverity: "high",
      owner: "psirt-admin",
      note: "Reproduced.",
    });
    expect(triage.status).toBe(200);
    // Disclosure target derived from the 60-day profile.
    expect(triage.json.disclosureDueAt).toBeTruthy();

    for (const status of ["confirmed", "fix_in_progress", "fix_available", "disclosed"]) {
      const step = await api("PATCH", `/conformity/vuln-reports/${reportId}`, { status });
      expect(step.status).toBe(200);
      expect(step.json.status).toBe(status);
    }
    // Terminal: no further transitions.
    const after = await api("PATCH", `/conformity/vuln-reports/${reportId}`, {
      status: "triaged",
    });
    expect(after.status).toBe(400);

    // Ledger recorded every transition (received + 5).
    const events = await api("GET", `/conformity/vuln-reports/${reportId}/events`);
    expect(events.status).toBe(200);
    expect((events.json as unknown as Json[]).length).toBe(6);

    // Advisory: draft → publish gated on completeness → immutable.
    const draft = await api("POST", "/conformity/advisories", {
      productId,
      vulnReportId: reportId,
      title: "Auth bypass in PSIRT Product",
      severity: "high",
    });
    expect(draft.status).toBe(201);
    const advisoryId = draft.json.id as number;
    expect(String(draft.json.advisoryCode)).toMatch(/^OXOT-SA-\d{4}-\d{3,}$/);

    const early = await api("POST", `/conformity/advisories/${advisoryId}/publish`);
    expect(early.status).toBe(400); // summary/affected/fixed missing

    const fill = await api("PATCH", `/conformity/advisories/${advisoryId}`, {
      summary: "An unauthenticated attacker can bypass login.",
      affectedVersions: "< 2.1.0",
      fixedVersions: "2.1.0",
      credits: "Jane Reporter",
    });
    expect(fill.status).toBe(200);

    const publish = await api("POST", `/conformity/advisories/${advisoryId}/publish`);
    expect(publish.status).toBe(200);
    expect(publish.json.status).toBe("published");

    // Published advisories are immutable and undeletable.
    expect((await api("PATCH", `/conformity/advisories/${advisoryId}`, { title: "x" })).status).toBe(409);
    expect((await api("DELETE", `/conformity/advisories/${advisoryId}`)).status).toBe(409);

    // Public listing exposes it; public policy lists the configured product.
    const pub = await api("GET", "/conformity/public/advisories", undefined, null);
    expect(pub.status).toBe(200);
    expect(
      (pub.json as unknown as Json[]).some((a) => a.id === advisoryId),
    ).toBe(true);
    const policy = await api("GET", "/conformity/public/security-policy", undefined, null);
    expect(policy.status).toBe(200);
    expect(
      (policy.json as unknown as Json[]).some((p) => p.contactEmail === "psirt@example.com"),
    ).toBe(true);

    await api("DELETE", `/conformity/products/${productId}`);
  });
});

describe("public surface security contracts", () => {
  it("rejects javascript: and http: URLs on psirt profile PUT, accepts https and blank", async () => {
    const product = await api("POST", "/conformity/products", {
      name: `SecCheck ${Date.now()}`,
      productType: "software",
    });
    expect(product.status).toBe(200);
    const productId = product.json.id as number;

    const base = {
      contactEmail: "sec@example.com",
      contactUrl: "",
      policyText: "",
      policyUrl: "",
      disclosureDays: 90,
    };

    // javascript: in contactUrl must be 400
    const js = await api("PUT", `/conformity/products/${productId}/psirt-profile`, {
      ...base,
      contactUrl: "javascript:alert(1)",
    });
    expect(js.status).toBe(400);

    // data: in policyUrl must be 400
    const data = await api("PUT", `/conformity/products/${productId}/psirt-profile`, {
      ...base,
      policyUrl: "data:text/html,<script>alert(1)</script>",
    });
    expect(data.status).toBe(400);

    // Plain http (no TLS) is also rejected
    const http = await api("PUT", `/conformity/products/${productId}/psirt-profile`, {
      ...base,
      contactUrl: "http://insecure.example.com/security",
    });
    expect(http.status).toBe(400);

    // https and blank are both accepted
    const ok = await api("PUT", `/conformity/products/${productId}/psirt-profile`, {
      ...base,
      contactUrl: "https://example.com/security",
      policyUrl: "https://example.com/cvd-policy",
    });
    expect(ok.status).toBe(200);

    await api("DELETE", `/conformity/products/${productId}`);
  });

  it("public advisory listing does not expose internal audit identity or linkage IDs", async () => {
    // The public endpoint must only return disclosure fields; workbench
    // internals (createdBy, vulnReportId, incidentId, productId) must be absent.
    const pub = await api("GET", "/conformity/public/advisories", undefined, null);
    expect(pub.status).toBe(200);
    const advisories = pub.json as unknown as Record<string, unknown>[];
    for (const a of advisories) {
      expect(a).not.toHaveProperty("createdBy");
      expect(a).not.toHaveProperty("vulnReportId");
      expect(a).not.toHaveProperty("incidentId");
      expect(a).not.toHaveProperty("productId");
    }
  });
});

describe("auth contract", () => {
  it("anon → 401 on workbench routes; demo reads OK, demo mutations → 403", async () => {
    expect((await api("GET", "/conformity/vuln-reports", undefined, null)).status).toBe(401);
    expect((await api("GET", "/conformity/advisories", undefined, null)).status).toBe(401);

    expect((await api("GET", "/conformity/vuln-reports", undefined, demoCookie)).status).toBe(200);
    expect((await api("GET", "/conformity/advisories", undefined, demoCookie)).status).toBe(200);

    expect(
      (
        await api(
          "POST",
          "/conformity/advisories",
          { title: "nope", severity: "low" },
          demoCookie,
        )
      ).status,
    ).toBe(403);
    expect(
      (await api("PATCH", "/conformity/vuln-reports/1", { owner: "x" }, demoCookie)).status,
    ).toBe(403);
  });
});
