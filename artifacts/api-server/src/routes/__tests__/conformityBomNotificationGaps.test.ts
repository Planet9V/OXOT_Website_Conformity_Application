/**
 * Art 13(6) notification-gap endpoint — server-side integration test.
 *
 * Boots the real Express app against the real dev DB and proves the gap
 * endpoint's matching rule (componentKey + vulnerability id, purl preferred
 * over name@version) against real rows — the exact rule the inline finding
 * chips use — including the edge cases the UI e2e mocks can't cover:
 *  - tracked (notified/acknowledged/not_required) pairs are EXCLUDED,
 *    tracked-but-pending pairs still count as gaps;
 *  - components with no purl match by name@version (and by bare name when
 *    the version is blank too);
 *  - findings with a blank identifier are skipped entirely;
 *  - findings from MULTIPLE BOMs on the same assessment are all aggregated;
 *  - non-vulnerability findings and BOM-level (componentless) findings never
 *    appear;
 *  - anonymous → 401, never data; unknown assessment → 404.
 *
 * BOMs/components/findings are seeded directly via the db layer (the analyze
 * pipeline depends on OSV network lookups); notifications go through the real
 * POST endpoint so the tracked componentKey is computed by production code.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import {
  db,
  conformityBomsTable,
  conformityBomComponentsTable,
  conformityBomFindingsTable,
} from "@workspace/db";

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
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("gap-admin")}`;
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

/** Seed a BOM row directly (analyze pipeline needs network OSV; gaps don't). */
async function seedBom(assessmentId: number, name: string): Promise<number> {
  const [bom] = await db
    .insert(conformityBomsTable)
    .values({ assessmentId, name, status: "analyzed" })
    .returning({ id: conformityBomsTable.id });
  return bom!.id;
}

async function seedComponent(
  bomId: number,
  c: { name: string; version?: string; purl?: string },
): Promise<number> {
  const [row] = await db
    .insert(conformityBomComponentsTable)
    .values({ bomId, name: c.name, version: c.version ?? "", purl: c.purl ?? "" })
    .returning({ id: conformityBomComponentsTable.id });
  return row!.id;
}

async function seedFinding(
  bomId: number,
  f: {
    componentId?: number | null;
    identifier?: string;
    findingType?: string;
    severity?: string;
  },
): Promise<number> {
  const [row] = await db
    .insert(conformityBomFindingsTable)
    .values({
      bomId,
      componentId: f.componentId ?? null,
      findingType: f.findingType ?? "vulnerability",
      identifier: f.identifier ?? "",
      severity: f.severity ?? "high",
      title: `Finding ${f.identifier ?? "(untitled)"}`,
      source: "manual",
    })
    .returning({ id: conformityBomFindingsTable.id });
  return row!.id;
}

type Gap = {
  findingId: number;
  trackedStatus: string;
  bomId: number;
  bomName: string;
  componentKey: string;
  componentName: string;
  componentVersion: string;
  purl: string;
  vulnerabilityId: string;
  severity: string;
};

describe("bom-notification-gaps — matching rule against the real DB", () => {
  it("matches by componentKey (purl preferred) + vulnerability id across BOMs, skipping blanks", async () => {
    const product = await api("POST", "/conformity/products", {
      name: `Gap Test Product ${Date.now()}`,
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
      // ---- empty state: no BOMs → no gaps ---------------------------------
      const empty = await api("GET", `/conformity/assessments/${assessmentId}/bom-notification-gaps`);
      expect(empty.status).toBe(200);
      expect(empty.json).toEqual([]);

      // ---- seed two BOMs with components + vulnerability findings ---------
      const bomA = await seedBom(assessmentId, "SBOM Alpha");
      const bomB = await seedBom(assessmentId, "SBOM Beta");

      // Component WITH purl (purl wins over name@version as the key).
      const lodash = await seedComponent(bomA, {
        name: "lodash",
        version: "4.17.11",
        purl: "pkg:npm/lodash@4.17.11",
      });
      // Component WITHOUT purl → key is name@version.
      const openssl = await seedComponent(bomA, { name: "openssl", version: "1.0.2" });
      // Component with neither purl nor version → key is the bare name.
      const legacyLib = await seedComponent(bomB, { name: "legacylib" });

      // Findings:
      const fLodashTracked = await seedFinding(bomA, { componentId: lodash, identifier: "CVE-2019-10744" });
      const fLodashPending = await seedFinding(bomA, { componentId: lodash, identifier: "CVE-2020-8203" });
      const fLodashUntracked = await seedFinding(bomA, { componentId: lodash, identifier: "CVE-2021-23337" });
      const fOpensslTracked = await seedFinding(bomA, { componentId: openssl, identifier: "CVE-2016-2107" });
      const fOpensslUntracked = await seedFinding(bomA, { componentId: openssl, identifier: "CVE-2016-6304" });
      const fLegacyNotRequired = await seedFinding(bomB, { componentId: legacyLib, identifier: "CVE-2015-0001" });
      const fLegacyUntracked = await seedFinding(bomB, { componentId: legacyLib, identifier: "CVE-2015-0002" });
      // Edge cases that must never appear:
      await seedFinding(bomA, { componentId: lodash, identifier: "   " }); // blank identifier → skipped
      await seedFinding(bomA, { componentId: lodash, identifier: "MD5", findingType: "crypto_weakness" }); // not a vulnerability
      await seedFinding(bomA, { componentId: null, identifier: "CVE-9999-0001" }); // BOM-level, no component

      // ---- tracked notifications via the REAL endpoint ---------------------
      // Resolved by purl key (component has a purl — purl must be preferred).
      const t1 = await api("POST", `/conformity/assessments/${assessmentId}/bom-notifications`, {
        componentName: "lodash",
        componentVersion: "4.17.11",
        purl: "pkg:npm/lodash@4.17.11",
        vulnerabilityId: "CVE-2019-10744",
        status: "notified",
      });
      expect(t1.status, JSON.stringify(t1.json)).toBe(200);
      expect((t1.json as { componentKey: string }).componentKey).toBe("pkg:npm/lodash@4.17.11");
      // Tracked but still PENDING → must still be a gap.
      await api("POST", `/conformity/assessments/${assessmentId}/bom-notifications`, {
        componentName: "lodash",
        componentVersion: "4.17.11",
        purl: "pkg:npm/lodash@4.17.11",
        vulnerabilityId: "CVE-2020-8203",
        status: "pending",
      });
      // Resolved by name@version key (no purl on the component).
      const t3 = await api("POST", `/conformity/assessments/${assessmentId}/bom-notifications`, {
        componentName: "openssl",
        componentVersion: "1.0.2",
        vulnerabilityId: "CVE-2016-2107",
        status: "acknowledged",
      });
      expect((t3.json as { componentKey: string }).componentKey).toBe("openssl@1.0.2");
      // Resolved by bare-name key + explicit not_required decision.
      await api("POST", `/conformity/assessments/${assessmentId}/bom-notifications`, {
        componentName: "legacylib",
        vulnerabilityId: "CVE-2015-0001",
        status: "not_required",
      });
      // Same vulnerability id tracked on a DIFFERENT componentKey must NOT
      // resolve openssl's finding — the match is the (key, vuln) pair.
      await api("POST", `/conformity/assessments/${assessmentId}/bom-notifications`, {
        componentName: "someOtherLib",
        componentVersion: "9.9.9",
        vulnerabilityId: "CVE-2016-6304",
        status: "notified",
      });
      // A name@version record must NOT resolve a purl-keyed component's
      // finding (purl is preferred, so the keys differ).
      await api("POST", `/conformity/assessments/${assessmentId}/bom-notifications`, {
        componentName: "lodash",
        componentVersion: "4.17.11",
        vulnerabilityId: "CVE-2021-23337",
        status: "notified",
      });

      // ---- assert the gap list matches the chip rule exactly ---------------
      const res = await api("GET", `/conformity/assessments/${assessmentId}/bom-notification-gaps`);
      expect(res.status, JSON.stringify(res.json)).toBe(200);
      const gaps = res.json as unknown as Gap[];

      const byFinding = new Map(gaps.map((g) => [g.findingId, g]));
      // Excluded: resolved trackings.
      expect(byFinding.has(fLodashTracked)).toBe(false);
      expect(byFinding.has(fOpensslTracked)).toBe(false);
      expect(byFinding.has(fLegacyNotRequired)).toBe(false);
      // Present: pending tracking is still a gap, with its status surfaced.
      expect(byFinding.get(fLodashPending)).toMatchObject({
        trackedStatus: "pending",
        componentKey: "pkg:npm/lodash@4.17.11",
        vulnerabilityId: "CVE-2020-8203",
        bomName: "SBOM Alpha",
      });
      // Present: untracked findings from both BOMs.
      expect(byFinding.get(fLodashUntracked)).toMatchObject({
        trackedStatus: "",
        componentKey: "pkg:npm/lodash@4.17.11",
        vulnerabilityId: "CVE-2021-23337",
      });
      expect(byFinding.get(fOpensslUntracked)).toMatchObject({
        trackedStatus: "",
        componentKey: "openssl@1.0.2",
        purl: "",
        vulnerabilityId: "CVE-2016-6304",
      });
      expect(byFinding.get(fLegacyUntracked)).toMatchObject({
        trackedStatus: "",
        componentKey: "legacylib",
        componentVersion: "",
        bomName: "SBOM Beta",
        vulnerabilityId: "CVE-2015-0002",
      });
      // Nothing else: blank identifier, crypto finding, and BOM-level finding
      // are all absent — so the total is exactly the four gaps above.
      expect(gaps).toHaveLength(4);
      expect(gaps.every((g) => g.vulnerabilityId.trim() !== "")).toBe(true);
    } finally {
      await api("DELETE", `/conformity/products/${productId}`);
    }
  }, 30_000);

  it("stays fast and correct on a large multi-BOM assessment", async () => {
    const product = await api("POST", "/conformity/products", {
      name: `Gap Scale Product ${Date.now()}`,
      productType: "software",
    });
    const productId = (product.json as { id: number }).id;
    const assessment = await api("POST", "/conformity/assessments", {
      productId,
      regulationKey: "cra",
    });
    const assessmentId = (assessment.json as { assessment: { id: number } }).assessment.id;

    try {
      // 3 BOMs × 200 components, one vulnerability finding each = 600 findings.
      const PER_BOM = 200;
      let tracked = 0;
      for (let b = 0; b < 3; b++) {
        const bomId = await seedBom(assessmentId, `Scale BOM ${b}`);
        const componentRows = Array.from({ length: PER_BOM }, (_, i) => ({
          bomId,
          name: `pkg-${b}-${i}`,
          version: "1.0.0",
          purl: `pkg:npm/pkg-${b}-${i}@1.0.0`,
        }));
        const inserted = await db
          .insert(conformityBomComponentsTable)
          .values(componentRows)
          .returning({ id: conformityBomComponentsTable.id });
        await db.insert(conformityBomFindingsTable).values(
          inserted.map((row, i) => ({
            bomId,
            componentId: row.id,
            findingType: "vulnerability",
            identifier: `CVE-2026-${b}${String(i).padStart(4, "0")}`,
            severity: "high",
            title: `Vuln ${b}-${i}`,
            source: "manual",
          })),
        );
        // Track every 10th finding as notified → excluded from gaps.
        for (let i = 0; i < PER_BOM; i += 10) {
          const t = await api("POST", `/conformity/assessments/${assessmentId}/bom-notifications`, {
            componentName: `pkg-${b}-${i}`,
            componentVersion: "1.0.0",
            purl: `pkg:npm/pkg-${b}-${i}@1.0.0`,
            vulnerabilityId: `CVE-2026-${b}${String(i).padStart(4, "0")}`,
            status: "notified",
          });
          expect(t.status).toBe(200);
          tracked++;
        }
      }

      const started = Date.now();
      const res = await api("GET", `/conformity/assessments/${assessmentId}/bom-notification-gaps`);
      const elapsed = Date.now() - started;
      expect(res.status).toBe(200);
      const gaps = res.json as unknown as Gap[];
      expect(gaps).toHaveLength(3 * PER_BOM - tracked);
      // Generous bound — this is a regression tripwire, not a benchmark.
      expect(elapsed).toBeLessThan(5_000);
    } finally {
      await api("DELETE", `/conformity/products/${productId}`);
    }
  }, 60_000);
});

describe("bom-notification-gaps — auth contract", () => {
  it("anonymous → 401 (never data); unknown assessment → 404", async () => {
    const anon = await api("GET", "/conformity/assessments/1/bom-notification-gaps", undefined, null);
    expect(anon.status).toBe(401);
    expect(Array.isArray(anon.json)).toBe(false);

    const missing = await api("GET", "/conformity/assessments/999999/bom-notification-gaps");
    expect(missing.status).toBe(404);
  });
});
