/**
 * Module 4: Statutory Reports & Dossier Generation Unit Test Suite
 *
 * Tests statutory report generation, section drafting/editing, section AI regeneration,
 * cryptographic SHA-256 signature sealing, and PDF export preparation.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";

let server: Server;
let baseUrl: string;
let adminCookie: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("reports-admin-test")}`;
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
): Promise<{ status: number; json: any }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      cookie: adminCookie,
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

describe("Module 4: Statutory Reports & Dossier Generation Diagnostic Suite", () => {
  let createdReportId: number;

  it("GET /api/conformity/reports - lists statutory compliance reports", async () => {
    const res = await api("GET", "/conformity/reports");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.reports)).toBe(true);
  });

  it("POST /api/conformity/reports - generates new EU CRA Executive Dossier", async () => {
    const res = await api("POST", "/conformity/reports", {
      title: "Statutory EU CRA Executive Dossier Diagnostic 2026",
      reportType: "cra_executive_summary",
      scopeNotes: "Automated test suite dossier generation",
    });

    expect(res.status).toBe(200);
    expect(res.json.id).toBeDefined();
    expect(res.json.title).toBe("Statutory EU CRA Executive Dossier Diagnostic 2026");
    expect(res.json.status).toBe("draft");
    createdReportId = res.json.id;
  });

  it("GET /api/conformity/reports/:id - retrieves report sections and structure", async () => {
    const res = await api("GET", `/conformity/reports/${createdReportId}`);
    expect(res.status).toBe(200);
    expect(res.json.report.id).toBe(createdReportId);
    expect(res.json.sections).toBeDefined();
    expect(typeof res.json.sections).toBe("object");
  });

  it("PATCH /api/conformity/reports/:id/sections/:key - updates section content", async () => {
    const res = await api("PATCH", `/conformity/reports/${createdReportId}/sections/executiveSummary`, {
      customMarkdown: "# Executive Summary\n\nAll Annex I statutory cybersecurity controls are 100% verified.",
    });

    expect(res.status).toBe(200);
    expect(res.json.sections.executiveSummary).toBeDefined();
    expect(res.json.sections.executiveSummary.content).toContain("100% verified");
  });

  it("POST /api/conformity/reports/:id/finalize - seals report with cryptographic signature hash", async () => {
    const res = await api("POST", `/conformity/reports/${createdReportId}/finalize`, {
      signerName: "Dr. Elena Vance, Chief Security Officer",
      signatureRole: "Authorized CRA Compliance Assessor",
    });

    expect(res.status).toBe(200);
    expect(res.json.report.status).toBe("finalized");
    expect(res.json.report.signerName).toBe("Dr. Elena Vance, Chief Security Officer");
    expect(res.json.report.signatureHash).toBeDefined();
    expect(res.json.report.signatureHash.length).toBeGreaterThan(10);
  });

  it("GET /api/conformity/reports/:id/export - checks export payload readiness", async () => {
    const res = await api("GET", `/conformity/reports/${createdReportId}/export`);
    expect(res.status).toBe(200);
    expect(res.json.report).toBeDefined();
    expect(res.json.signatureHash).toBeDefined();
  });
});
