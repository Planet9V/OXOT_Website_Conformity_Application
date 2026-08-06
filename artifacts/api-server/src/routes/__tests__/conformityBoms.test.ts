/**
 * xBOM Vault integration walk + demo read-only contract.
 *
 * Boots the real Express app against the real dev DB on an ephemeral port and
 * drives the BOM endpoints over HTTP:
 *  - admin happy path: create product + assessment → ingest a small CycloneDX
 *    SBOM (with a weak-crypto crypto-asset) → GET detail → analyze (with the OSV
 *    network call STUBBED so no real network is touched) → assert crypto findings
 *    → PATCH checklist → DELETE.
 *  - demo contract: demo can READ catalog/list/detail (not 401/403); demo
 *    POST/PATCH/DELETE are refused with 403; an admin mutation is not 403.
 *
 * The real network is never hit: `globalThis.fetch` is stubbed for api.osv.dev
 * during analyze, and embeddings failures are best-effort (they only warn).
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

// Stub the embeddings client so BOM ingest's best-effort auto-embed never hits
// the real OpenRouter network (an OPENROUTER_API_KEY may be present in the env).
vi.mock("../../lib/embeddings", () => ({
  embedText: vi.fn(async () => Array.from({ length: 1536 }, () => 0)),
  embedTexts: vi.fn(async (texts: string[]) => texts.map(() => Array.from({ length: 1536 }, () => 0))),
}));

import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";
import { ObjectStorageService } from "../../lib/objectStorage";

const objectStorage = new ObjectStorageService();

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
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("bom-admin")}`;
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
  cookie: string = adminCookie,
): Promise<{ status: number; json: Json }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      cookie,
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

// A tiny CycloneDX doc: one ordinary library + one weak-crypto crypto-asset
// (MD5) so runCryptoHeuristics raises at least one crypto_weakness finding.
const CYCLONEDX_SBOM = JSON.stringify({
  bomFormat: "CycloneDX",
  specVersion: "1.6",
  components: [
    { type: "library", name: "left-pad", version: "1.3.0", purl: "pkg:npm/left-pad@1.3.0" },
    { type: "cryptographic-asset", name: "MD5", version: "" },
  ],
});

describe("xBOM Vault — admin happy path", () => {
  it("ingests → detail → analyzes (OSV stubbed) → patches checklist → deletes", async () => {
    // ---- create product + assessment via the real endpoints ---------------
    const product = await api("POST", "/conformity/products", {
      name: `BOM Test Product ${Date.now()}`,
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
      // ---- catalog --------------------------------------------------------
      const catalog = await api("GET", "/conformity/bom-catalog");
      expect(catalog.status).toBe(200);
      expect(catalog.json).toHaveProperty("sbom");
      expect(catalog.json).toHaveProperty("cbom");

      // ---- ingest via object storage (large-file path) --------------------
      // Upload the document to object storage, then ingest it by reference so
      // the server downloads + parses it instead of receiving it inline. This
      // exercises the same path the UI uses for multi-megabyte BOM files.
      const storedPath = await objectStorage.uploadBytes(
        Buffer.from(CYCLONEDX_SBOM, "utf8"),
        "application/json",
        ".json",
      );
      const ingestedByRef = await api("POST", `/conformity/assessments/${assessmentId}/boms`, {
        bomType: "sbom",
        format: "cyclonedx",
        name: "Uploaded SBOM",
        objectPath: storedPath,
        fileName: "uploaded.json",
      });
      expect(ingestedByRef.status, JSON.stringify(ingestedByRef.json)).toBe(200);
      const byRefDetail = ingestedByRef.json as {
        bom: { id: number; componentCount: number; fileName: string };
      };
      expect(byRefDetail.bom.componentCount).toBe(2);
      expect(byRefDetail.bom.fileName).toBe("uploaded.json");
      // Clean it up so the main walk below asserts on the inline-ingested BOM.
      await api("DELETE", `/conformity/boms/${byRefDetail.bom.id}`);

      // ---- reject a missing document --------------------------------------
      const empty = await api("POST", `/conformity/assessments/${assessmentId}/boms`, {
        bomType: "sbom",
        format: "cyclonedx",
        name: "Empty",
      });
      expect(empty.status).toBe(400);

      // ---- ingest (inline paste/small-upload path) ------------------------
      const ingested = await api("POST", `/conformity/assessments/${assessmentId}/boms`, {
        bomType: "cbom",
        format: "cyclonedx",
        name: "Test CBOM",
        content: CYCLONEDX_SBOM,
        fileName: "sbom.json",
      });
      expect(ingested.status, JSON.stringify(ingested.json)).toBe(200);
      const detail = ingested.json as {
        bom: { id: number; componentCount: number; status: string; checklist: unknown[] };
        components: { id: number; name: string }[];
        findings: unknown[];
      };
      const bomId = detail.bom.id;
      expect(detail.bom.componentCount).toBe(2);
      expect(detail.bom.status).toBe("stored");
      expect(detail.components).toHaveLength(2);
      expect(detail.findings).toHaveLength(0);
      expect(detail.bom.checklist.length).toBeGreaterThan(0);

      // list shows the new bom
      const list = await api("GET", `/conformity/assessments/${assessmentId}/boms`);
      expect(list.status).toBe(200);
      expect(
        (list.json as unknown as { id: number }[]).some((b) => b.id === bomId),
      ).toBe(true);

      // ---- GET detail -----------------------------------------------------
      const got = await api("GET", `/conformity/boms/${bomId}`);
      expect(got.status).toBe(200);
      expect((got.json as { components: unknown[] }).components).toHaveLength(2);

      // ---- analyze with OSV fetch STUBBED (no real network) ---------------
      const originalFetch = globalThis.fetch;
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockImplementation(async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
          const url = typeof input === "string" ? input : input.toString();
          if (url.includes("api.osv.dev")) {
            // Return one vuln for the first query (left-pad) so we exercise the
            // index → componentId mapping too.
            return new Response(
              JSON.stringify({ results: [{ vulns: [{ id: "OSV-TEST-0001", modified: "2024-01-01" }] }, {}] }),
              { status: 200, headers: { "content-type": "application/json" } },
            );
          }
          return originalFetch(input as never, init);
        });
      let analyzed;
      try {
        analyzed = await api("POST", `/conformity/boms/${bomId}/analyze`);
      } finally {
        fetchSpy.mockRestore();
      }
      expect(analyzed.status, JSON.stringify(analyzed.json)).toBe(200);
      const analyzedJson = analyzed.json as {
        bom: { status: string; findingCount: number };
        findings: { findingType: string; source: string }[];
      };
      expect(analyzedJson.bom.status).toBe("analyzed");
      // MD5 crypto-asset must produce a crypto_weakness finding.
      expect(analyzedJson.findings.some((f) => f.findingType === "crypto_weakness")).toBe(true);
      // The stubbed OSV vuln must be persisted too.
      expect(analyzedJson.findings.some((f) => f.source === "osv")).toBe(true);
      expect(analyzedJson.bom.findingCount).toBe(analyzedJson.findings.length);

      // ---- PATCH checklist ------------------------------------------------
      const patched = await api("PATCH", `/conformity/boms/${bomId}/checklist`, {
        checklist: [{ key: "algorithms_inventoried", label: "All algorithms inventoried", done: true, note: "done" }],
      });
      expect(patched.status, JSON.stringify(patched.json)).toBe(200);
      const patchedChecklist = (patched.json as { bom: { checklist: { done: boolean }[] } }).bom.checklist;
      expect(patchedChecklist).toHaveLength(1);
      expect(patchedChecklist[0]!.done).toBe(true);

      // ---- DELETE ---------------------------------------------------------
      const deleted = await api("DELETE", `/conformity/boms/${bomId}`);
      expect(deleted.status).toBe(200);
      expect((deleted.json as { success: boolean }).success).toBe(true);
      const gone = await api("GET", `/conformity/boms/${bomId}`);
      expect(gone.status).toBe(404);
    } finally {
      // Clean up the product (cascades the assessment + any residual boms).
      await api("DELETE", `/conformity/products/${productId}`);
    }
  }, 30_000);
});

describe("xBOM Vault — demo role is read-only", () => {
  it("demo can read catalog, but mutations are 403 and an admin mutation is not", async () => {
    // reads reachable
    const catalog = await api("GET", "/conformity/bom-catalog", undefined, demoCookie);
    expect(catalog.status).not.toBe(401);
    expect(catalog.status).not.toBe(403);

    const list = await api("GET", "/conformity/assessments/1/boms", undefined, demoCookie);
    expect(list.status).not.toBe(401);
    expect(list.status).not.toBe(403);

    const detail = await api("GET", "/conformity/boms/1", undefined, demoCookie);
    expect(detail.status).not.toBe(401);
    expect(detail.status).not.toBe(403);

    // mutations refused
    const demoIngest = await api("POST", "/conformity/assessments/1/boms", {}, demoCookie);
    expect(demoIngest.status).toBe(403);
    const demoPatch = await api("PATCH", "/conformity/boms/1/checklist", {}, demoCookie);
    expect(demoPatch.status).toBe(403);
    const demoDelete = await api("DELETE", "/conformity/boms/1", undefined, demoCookie);
    expect(demoDelete.status).toBe(403);

    // an admin mutation gets past the demo guard (may 400/404, never 403)
    const adminIngest = await api("POST", "/conformity/assessments/1/boms", {}, adminCookie);
    expect(adminIngest.status).not.toBe(403);
    expect(adminIngest.status).not.toBe(401);
  });
});
