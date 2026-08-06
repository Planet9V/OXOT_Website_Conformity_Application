/**
 * Conformity Provenance Ledger — activity endpoint integration walk.
 *
 * Boots the real Express app against the real dev DB on an ephemeral port and
 * verifies the chain-of-custody ledger: after a BOM ingest and an evidence add
 * on an assessment, GET /conformity/assessments/{id}/activity returns those
 * rows newest-first; demo can read; anon → 401; unknown assessment → 404.
 *
 * The real network is never hit: `../../lib/embeddings` is mocked so the BOM
 * ingest's best-effort auto-embed uses a canned zero vector.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

vi.mock("../../lib/embeddings", () => ({
  embedText: vi.fn(async () => Array.from({ length: 1536 }, () => 0)),
  embedTexts: vi.fn(async (texts: string[]) =>
    texts.map(() => Array.from({ length: 1536 }, () => 0)),
  ),
}));

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
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("activity-admin")}`;
  demoCookie = `${ADMIN_COOKIE}=${createSessionToken("oxotdemo", "demo")}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

type Json = Record<string, unknown>;

const ANON = Symbol("anon");

async function api(
  method: string,
  path: string,
  body?: unknown,
  cookie: string | undefined | typeof ANON = adminCookie,
): Promise<{ status: number; json: Json | Json[] }> {
  const cookieHeader = cookie === ANON ? undefined : cookie;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let json: Json | Json[] = {};
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { __raw: text };
    }
  }
  return { status: res.status, json };
}

const CYCLONEDX_SBOM = JSON.stringify({
  bomFormat: "CycloneDX",
  specVersion: "1.6",
  components: [{ type: "library", name: "left-pad", version: "1.3.0" }],
});

describe("conformity activity ledger", () => {
  it("records BOM ingest + evidence add, returns newest-first; demo reads; anon 401; unknown 404", async () => {
    const product = await api("POST", "/conformity/products", {
      name: `Activity Test Product ${Date.now()}`,
      productType: "software",
    });
    expect(product.status, JSON.stringify(product.json)).toBe(200);
    const productId = (product.json as { id: number }).id;

    const assessment = await api("POST", "/conformity/assessments", {
      productId,
      regulationKey: "cra",
    });
    expect(assessment.status, JSON.stringify(assessment.json)).toBe(200);
    const assessmentId = (assessment.json as { assessment: { id: number } }).assessment.id;

    try {
      // ---- ingest a BOM (writes activity + auto-embed) --------------------
      const ingested = await api("POST", `/conformity/assessments/${assessmentId}/boms`, {
        bomType: "sbom",
        format: "cyclonedx",
        name: "Test SBOM",
        content: CYCLONEDX_SBOM,
        fileName: "sbom.json",
      });
      expect(ingested.status, JSON.stringify(ingested.json)).toBe(200);

      // ---- add evidence (writes activity) ---------------------------------
      const evidence = await api("POST", `/conformity/assessments/${assessmentId}/evidence`, {
        title: "Test Report",
        evidenceType: "document",
      });
      expect(evidence.status, JSON.stringify(evidence.json)).toBe(200);

      // ---- GET activity (admin) -------------------------------------------
      const activity = await api("GET", `/conformity/assessments/${assessmentId}/activity`);
      expect(activity.status, JSON.stringify(activity.json)).toBe(200);
      const rows = activity.json as {
        entityType: string;
        action: string;
        summary: string;
        createdAt: string;
      }[];
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBeGreaterThanOrEqual(2);

      // both events are present
      expect(rows.some((r) => r.entityType === "bom" && r.action === "created")).toBe(true);
      expect(rows.some((r) => r.entityType === "evidence" && r.action === "created")).toBe(true);

      // newest-first: createdAt is non-increasing
      const times = rows.map((r) => new Date(r.createdAt).getTime());
      for (let i = 1; i < times.length; i++) {
        expect(times[i - 1]!).toBeGreaterThanOrEqual(times[i]!);
      }

      // ---- demo can read --------------------------------------------------
      const demoRead = await api(
        "GET",
        `/conformity/assessments/${assessmentId}/activity`,
        undefined,
        demoCookie,
      );
      expect(demoRead.status).not.toBe(401);
      expect(demoRead.status).not.toBe(403);
      expect(demoRead.status).toBe(200);

      // ---- anon → 401 -----------------------------------------------------
      const anon = await api(
        "GET",
        `/conformity/assessments/${assessmentId}/activity`,
        undefined,
        ANON,
      );
      expect(anon.status).toBe(401);

      // ---- unknown assessment → 404 --------------------------------------
      const unknown = await api("GET", "/conformity/assessments/999999999/activity");
      expect(unknown.status).toBe(404);
    } finally {
      await api("DELETE", `/conformity/products/${productId}`);
    }
  }, 30_000);

  it("ledgers wizard answer saves; semantic no-op updates neither touch the row nor the ledger", async () => {
    const product = await api("POST", "/conformity/products", {
      name: `Ledger Coupling Product ${Date.now()}`,
      productType: "software",
    });
    expect(product.status, JSON.stringify(product.json)).toBe(200);
    const productId = (product.json as { id: number }).id;

    const assessment = await api("POST", "/conformity/assessments", {
      productId,
      regulationKey: "cra",
    });
    expect(assessment.status, JSON.stringify(assessment.json)).toBe(200);
    const assessmentId = (assessment.json as { assessment: { id: number } }).assessment.id;

    try {
      // ---- wizard answers save appends an assessment "updated" row --------
      const answers = await api("PUT", `/conformity/assessments/${assessmentId}/answers`, {
        answers: [{ questionKey: "placing_eu_market", value: { bool: true } }],
      });
      expect(answers.status, JSON.stringify(answers.json)).toBe(200);
      const afterAnswers = await api("GET", `/conformity/assessments/${assessmentId}/activity`);
      const answerRows = afterAnswers.json as {
        entityType: string;
        action: string;
        summary: string;
      }[];
      expect(
        answerRows.some(
          (r) =>
            r.entityType === "assessment" &&
            r.action === "updated" &&
            /answers saved/i.test(r.summary),
        ),
      ).toBe(true);

      // ---- incident create: baseline for the no-op checks ----------------
      const created = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
        title: "Ledger coupling incident",
        kind: "exploited_vulnerability",
        severity: "high",
        detectedAt: new Date().toISOString(),
      });
      expect(created.status, JSON.stringify(created.json)).toBe(200);
      const incident = created.json as { id: number; updatedAt: string };
      const baseline = await api("GET", `/conformity/assessments/${assessmentId}/activity`);
      const baselineCount = (baseline.json as unknown[]).length;

      // ---- semantic no-op: identical value → no UPDATE, no ledger row ----
      const noop = await api("PUT", `/conformity/incidents/${incident.id}`, { severity: "high" });
      expect(noop.status, JSON.stringify(noop.json)).toBe(200);
      expect((noop.json as { updatedAt: string }).updatedAt).toBe(incident.updatedAt);
      const afterNoop = await api("GET", `/conformity/assessments/${assessmentId}/activity`);
      expect((afterNoop.json as unknown[]).length).toBe(baselineCount);

      // ---- real change: updatedAt and the ledger move together -----------
      const changed = await api("PUT", `/conformity/incidents/${incident.id}`, {
        severity: "critical",
      });
      expect(changed.status, JSON.stringify(changed.json)).toBe(200);
      expect((changed.json as { updatedAt: string }).updatedAt).not.toBe(incident.updatedAt);
      const afterChange = await api("GET", `/conformity/assessments/${assessmentId}/activity`);
      const changeRows = afterChange.json as { entityType: string; summary: string }[];
      expect(changeRows.length).toBe(baselineCount + 1);
      expect(
        changeRows.some(
          (r) => r.entityType === "incident" && r.summary.includes("severity: critical"),
        ),
      ).toBe(true);
    } finally {
      await api("DELETE", `/conformity/products/${productId}`);
    }
  }, 30_000);

  it("workspace feed: anon → 401 without data; demo/admin → 200 array with actorDisplay; product create/rename/delete rows appear", async () => {
    // ---- anon → 401, never data ------------------------------------------
    const anon = await api("GET", "/conformity/activity", undefined, ANON);
    expect(anon.status).toBe(401);
    expect(Array.isArray(anon.json)).toBe(false);

    // ---- product lifecycle writes workspace-level rows --------------------
    const name = `Workspace Feed Product ${Date.now()}`;
    const renamedName = `${name} v2`;
    const product = await api("POST", "/conformity/products", {
      name,
      productType: "software",
    });
    expect(product.status, JSON.stringify(product.json)).toBe(200);
    const productId = (product.json as { id: number }).id;

    const renamed = await api("PUT", `/conformity/products/${productId}`, {
      name: renamedName,
    });
    expect(renamed.status, JSON.stringify(renamed.json)).toBe(200);

    const deleted = await api("DELETE", `/conformity/products/${productId}`);
    expect(deleted.status, JSON.stringify(deleted.json)).toBe(200);

    // ---- admin reads the feed ---------------------------------------------
    const adminRead = await api("GET", "/conformity/activity");
    expect(adminRead.status, JSON.stringify(adminRead.json)).toBe(200);
    // Paged response: { entries, total }
    const page = adminRead.json as {
      entries: {
        entityType: string;
        action: string;
        summary: string;
        actorDisplay: string;
        createdAt: string;
      }[];
      total: number;
    };
    const rows = page.entries;
    expect(Array.isArray(rows)).toBe(true);
    expect(typeof page.total).toBe("number");
    expect(page.total).toBeGreaterThanOrEqual(rows.length);

    const mine = rows.filter((r) => r.summary.includes(name));
    expect(
      mine.some((r) => r.entityType === "product" && r.action === "created"),
    ).toBe(true);
    expect(
      mine.some(
        (r) =>
          r.entityType === "product" &&
          r.action === "updated" &&
          r.summary.includes(`renamed from "${name}"`),
      ),
    ).toBe(true);
    expect(
      mine.some((r) => r.entityType === "product" && r.action === "deleted"),
    ).toBe(true);

    // every row carries a non-empty human-readable actorDisplay
    for (const r of rows) {
      expect(typeof r.actorDisplay).toBe("string");
      expect(r.actorDisplay.length).toBeGreaterThan(0);
    }

    // newest-first ordering
    const times = rows.map((r) => new Date(r.createdAt).getTime());
    for (let i = 1; i < times.length; i++) {
      expect(times[i - 1]!).toBeGreaterThanOrEqual(times[i]!);
    }

    // ---- demo can read (200, not 401/403) ---------------------------------
    const demoRead = await api("GET", "/conformity/activity", undefined, demoCookie);
    expect(demoRead.status).toBe(200);
    expect(Array.isArray((demoRead.json as { entries: unknown[] }).entries)).toBe(true);
  }, 30_000);
});
