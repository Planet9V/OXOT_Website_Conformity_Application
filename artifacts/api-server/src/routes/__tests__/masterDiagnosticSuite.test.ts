/**
 * Master Comprehensive Diagnostic Unit Test Suite
 *
 * Validates database wiring, API contracts, entity relationships, and service logic for:
 *  1. Users & Team Management (/api/conformity/me, /api/admin/team)
 *  2. Portfolio & Executive Dashboard (/api/conformity/portfolio/rollup)
 *  3. PSIRT & Vulnerability Handling (/api/conformity/psirt/*, advisories, vuln-reports)
 *  4. Reports & Statutory Dossiers (/api/conformity/reports/*, generation, finalization)
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
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("diag-admin")}`;
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

// ---------------------------------------------------------------------------
// 1. Users & Team Management Diagnostic Tests
// ---------------------------------------------------------------------------
describe("1. Users & Team Management Diagnostics", () => {
  it("GET /api/conformity/me - returns current session user details", async () => {
    const res = await api("GET", "/conformity/me");
    expect(res.status).toBe(200);
    expect(res.json.username).toBe("diag-admin");
    expect(res.json.role).toBe("admin");
  });

  it("POST /api/conformity/me/tours - records user tour completion state", async () => {
    const res = await api("POST", "/conformity/me/tours", {
      tourKey: "products_overview_v1",
    });
    expect(res.status).toBe(200);
    expect(res.json.completedTours).toContain("products_overview_v1");
  });

  it("GET /api/admin/team - lists registered assessors and team members", async () => {
    const res = await api("GET", "/admin/team");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.members)).toBe(true);
    expect(res.json.members.length).toBeGreaterThan(0);

    const firstMember = res.json.members[0];
    expect(firstMember).toHaveProperty("id");
    expect(firstMember).toHaveProperty("name");
    expect(firstMember).toHaveProperty("role");
    expect(firstMember).toHaveProperty("active");
  });
});

// ---------------------------------------------------------------------------
// 2. Portfolio & Executive Dashboard Diagnostic Tests
// ---------------------------------------------------------------------------
describe("2. Portfolio & Executive Dashboard Diagnostics", () => {
  let createdProdId: number;

  it("POST /api/conformity/products - creates product for portfolio rollup", async () => {
    const res = await api("POST", "/conformity/products", {
      name: "Portfolio Test Controller 5000",
      productType: "industrial_device",
      version: "5.0.0",
      manufacturerName: "OXOT Portfolio Diagnostics Inc.",
      intendedUse: "Critical Infrastructure Cyber Resilience",
      description: "Automated test product for portfolio aggregation checks",
    });

    expect(res.status).toBe(200);
    expect(res.json.id).toBeDefined();
    createdProdId = res.json.id;
  });

  it("POST /api/conformity/assessments - attaches assessment to product", async () => {
    const res = await api("POST", "/conformity/assessments", {
      productId: createdProdId,
      regulationKey: "cra",
    });

    expect(res.status).toBe(200);
    expect(res.json.id).toBeDefined();
    expect(res.json.productId).toBe(createdProdId);
  });

  it("GET /api/conformity/portfolio/rollup - aggregates portfolio compliance metrics", async () => {
    const res = await api("GET", "/conformity/portfolio/rollup");
    expect(res.status).toBe(200);
    expect(res.json).toHaveProperty("totalProducts");
    expect(res.json).toHaveProperty("totalAssessments");
    expect(res.json).toHaveProperty("overallGrade");
    expect(res.json.totalProducts).toBeGreaterThan(0);
    expect(res.json.totalAssessments).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 3. PSIRT & Vulnerability Handling Engine Diagnostic Tests
// ---------------------------------------------------------------------------
describe("3. PSIRT & Vulnerability Handling Diagnostics", () => {
  let advisoryId: number;

  it("GET /api/conformity/advisories - lists statutory PSIRT advisories", async () => {
    const res = await api("GET", "/conformity/advisories");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.advisories)).toBe(true);
  });

  it("POST /api/conformity/advisories - publishes new CRA Article 14 security advisory", async () => {
    const res = await api("POST", "/conformity/advisories", {
      title: "OXOT-2026-0099 Remote Code Execution Mitigated",
      cveId: "CVE-2026-9999",
      severity: "high",
      cvssScore: 8.8,
      affectedProducts: "Portfolio Test Controller 5000",
      summary: "Critical buffer validation issue patched in firmware update v5.0.1",
      remediation: "Upgrade immediately to firmware v5.0.1 or restrict network access.",
    });

    expect(res.status).toBe(200);
    expect(res.json.id).toBeDefined();
    expect(res.json.cveId).toBe("CVE-2026-9999");
    expect(res.json.severity).toBe("high");
    advisoryId = res.json.id;
  });

  it("GET /api/conformity/vuln-reports - lists intake vulnerability reports", async () => {
    const res = await api("GET", "/conformity/vuln-reports");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.reports)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Reports & Statutory Dossiers Diagnostic Tests
// ---------------------------------------------------------------------------
describe("4. Reports & Statutory Dossiers Diagnostics", () => {
  let reportId: number;

  it("GET /api/conformity/reports - lists generated statutory reports", async () => {
    const res = await api("GET", "/conformity/reports");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.reports)).toBe(true);
  });

  it("POST /api/conformity/reports - generates executive CRA compliance report", async () => {
    const res = await api("POST", "/conformity/reports", {
      title: "Statutory EU CRA Executive Dossier Q3 2026",
      reportType: "cra_executive_summary",
      scopeNotes: "Diagnostic test suite automated report generation",
    });

    expect(res.status).toBe(200);
    expect(res.json.id).toBeDefined();
    expect(res.json.title).toBe("Statutory EU CRA Executive Dossier Q3 2026");
    reportId = res.json.id;
  });

  it("GET /api/conformity/reports/:id - fetches full report structure and sections", async () => {
    const res = await api("GET", `/conformity/reports/${reportId}`);
    expect(res.status).toBe(200);
    expect(res.json.report.id).toBe(reportId);
    expect(res.json.sections).toBeDefined();
  });

  it("POST /api/conformity/reports/:id/finalize - seals report with cryptographic hash", async () => {
    const res = await api("POST", `/conformity/reports/${reportId}/finalize`, {
      signerName: "Dr. Elena Vance, Chief Security Officer",
      signatureRole: "Authorized CRA Compliance Officer",
    });

    expect(res.status).toBe(200);
    expect(res.json.report.status).toBe("finalized");
    expect(res.json.report.signatureHash).toBeDefined();
  });
});
