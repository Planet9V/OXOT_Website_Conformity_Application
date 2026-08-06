/**
 * Upstream component-vulnerability notifications (CRA Art 13(6)) — API walk.
 *
 * Boots the real Express app against the real dev DB on an ephemeral port and
 * drives the bom-notification endpoints over HTTP:
 *  - create → list → update happy path, with the natural-key upsert semantics
 *    (POSTing the same component+vulnerability again UPDATES the existing row,
 *    never duplicates — that is what keeps records attached across re-analysis);
 *  - semantic no-op detection (identical PATCH adds no ledger row);
 *  - validation → 400 (not a 500);
 *  - the auth contract: anonymous → 401, demo mutations → 403, demo reads OK.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { eq, and } from "drizzle-orm";
import { db, conformityActivityTable } from "@workspace/db";

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
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("notif-admin")}`;
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

async function ledgerCountFor(assessmentId: number, entityId: number): Promise<number> {
  const rows = await db
    .select({ id: conformityActivityTable.id })
    .from(conformityActivityTable)
    .where(
      and(
        eq(conformityActivityTable.assessmentId, assessmentId),
        eq(conformityActivityTable.entityType, "bom_notification"),
        eq(conformityActivityTable.entityId, entityId),
      ),
    );
  return rows.length;
}

describe("upstream notifications — admin walk with natural-key upsert", () => {
  it("creates, upserts by (componentKey, vulnerabilityId), updates, and skips no-ops", async () => {
    const product = await api("POST", "/conformity/products", {
      name: `Notif Test Product ${Date.now()}`,
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
      // ---- empty list ------------------------------------------------------
      const empty = await api("GET", `/conformity/assessments/${assessmentId}/bom-notifications`);
      expect(empty.status).toBe(200);
      expect(empty.json).toEqual([]);

      // ---- create ----------------------------------------------------------
      const created = await api("POST", `/conformity/assessments/${assessmentId}/bom-notifications`, {
        componentName: "lodash",
        componentVersion: "4.17.11",
        purl: "pkg:npm/lodash@4.17.11",
        vulnerabilityId: "CVE-2019-10744",
        status: "pending",
        maintainerContact: "security@openjsf.org",
        method: "email",
      });
      expect(created.status, JSON.stringify(created.json)).toBe(200);
      const rec = created.json as { id: number; componentKey: string; status: string; recordedBy: string };
      expect(rec.componentKey).toBe("pkg:npm/lodash@4.17.11");
      expect(rec.status).toBe("pending");
      expect(rec.recordedBy).toContain("notif-admin");
      expect(await ledgerCountFor(assessmentId, rec.id)).toBe(1);

      // ---- upsert: same natural key → SAME row, updated, not duplicated ----
      const upserted = await api("POST", `/conformity/assessments/${assessmentId}/bom-notifications`, {
        componentName: "lodash",
        componentVersion: "4.17.11",
        purl: "pkg:npm/lodash@4.17.11",
        vulnerabilityId: "CVE-2019-10744",
        status: "notified",
        maintainerContact: "security@openjsf.org",
        method: "email",
        notifiedAt: "2026-07-18T00:00:00.000Z",
      });
      expect(upserted.status, JSON.stringify(upserted.json)).toBe(200);
      const upsertedRec = upserted.json as { id: number; status: string; notifiedAt: string | null };
      expect(upsertedRec.id).toBe(rec.id);
      expect(upsertedRec.status).toBe("notified");
      expect(upsertedRec.notifiedAt).toBe("2026-07-18T00:00:00.000Z");

      const list = await api("GET", `/conformity/assessments/${assessmentId}/bom-notifications`);
      expect(list.status).toBe(200);
      expect(list.json as unknown as unknown[]).toHaveLength(1);

      // ---- identical POST again is a semantic no-op (no extra ledger row) --
      const before = await ledgerCountFor(assessmentId, rec.id);
      const noop = await api("POST", `/conformity/assessments/${assessmentId}/bom-notifications`, {
        componentName: "lodash",
        componentVersion: "4.17.11",
        purl: "pkg:npm/lodash@4.17.11",
        vulnerabilityId: "CVE-2019-10744",
        status: "notified",
        maintainerContact: "security@openjsf.org",
        method: "email",
        notifiedAt: "2026-07-18T00:00:00.000Z",
      });
      expect(noop.status).toBe(200);
      expect((noop.json as { id: number }).id).toBe(rec.id);
      expect(await ledgerCountFor(assessmentId, rec.id)).toBe(before);

      // ---- a DIFFERENT vulnerability on the same component is a new row ----
      const other = await api("POST", `/conformity/assessments/${assessmentId}/bom-notifications`, {
        componentName: "lodash",
        componentVersion: "4.17.11",
        purl: "pkg:npm/lodash@4.17.11",
        vulnerabilityId: "CVE-2020-8203",
      });
      expect(other.status).toBe(200);
      expect((other.json as { id: number }).id).not.toBe(rec.id);
      const list2 = await api("GET", `/conformity/assessments/${assessmentId}/bom-notifications`);
      expect(list2.json as unknown as unknown[]).toHaveLength(2);

      // ---- PATCH status transition + no-op skip -----------------------------
      const patched = await api("PATCH", `/conformity/bom-notifications/${rec.id}`, {
        status: "acknowledged",
        notes: "Maintainer confirmed; fixed in 4.17.21.",
      });
      expect(patched.status, JSON.stringify(patched.json)).toBe(200);
      expect((patched.json as { status: string }).status).toBe("acknowledged");

      const beforePatchNoop = await ledgerCountFor(assessmentId, rec.id);
      const patchNoop = await api("PATCH", `/conformity/bom-notifications/${rec.id}`, {
        status: "acknowledged",
        notes: "Maintainer confirmed; fixed in 4.17.21.",
      });
      expect(patchNoop.status).toBe(200);
      expect(await ledgerCountFor(assessmentId, rec.id)).toBe(beforePatchNoop);

      // ---- validation → 400 -------------------------------------------------
      const missingVuln = await api(
        "POST",
        `/conformity/assessments/${assessmentId}/bom-notifications`,
        { componentName: "lodash" },
      );
      expect(missingVuln.status).toBe(400);
      const missingComponent = await api(
        "POST",
        `/conformity/assessments/${assessmentId}/bom-notifications`,
        { vulnerabilityId: "CVE-2019-10744" },
      );
      expect(missingComponent.status).toBe(400);
      const badDate = await api(
        "POST",
        `/conformity/assessments/${assessmentId}/bom-notifications`,
        { componentName: "x", vulnerabilityId: "CVE-1", notifiedAt: "not-a-date" },
      );
      expect(badDate.status).toBe(400);
      const badStatus = await api("PATCH", `/conformity/bom-notifications/${rec.id}`, {
        status: "shipped",
      });
      expect(badStatus.status).toBe(400);

      // ---- 404s -------------------------------------------------------------
      const noAssessment = await api("GET", "/conformity/assessments/999999/bom-notifications");
      expect(noAssessment.status).toBe(404);
      const noNotif = await api("PATCH", "/conformity/bom-notifications/999999", { status: "pending" });
      expect(noNotif.status).toBe(404);
    } finally {
      await api("DELETE", `/conformity/products/${productId}`);
    }
  }, 30_000);
});

describe("upstream notifications — auth contract", () => {
  it("anonymous → 401 (never data), demo reads OK, demo mutations → 403", async () => {
    const anonList = await api("GET", "/conformity/assessments/1/bom-notifications", undefined, null);
    expect(anonList.status).toBe(401);
    const anonCreate = await api(
      "POST",
      "/conformity/assessments/1/bom-notifications",
      { vulnerabilityId: "CVE-1", componentName: "x" },
      null,
    );
    expect(anonCreate.status).toBe(401);
    const anonPatch = await api("PATCH", "/conformity/bom-notifications/1", {}, null);
    expect(anonPatch.status).toBe(401);

    // demo can read
    const demoList = await api(
      "GET",
      "/conformity/assessments/1/bom-notifications",
      undefined,
      demoCookie,
    );
    expect(demoList.status).not.toBe(401);
    expect(demoList.status).not.toBe(403);

    // demo mutations refused before the handler runs
    const demoCreate = await api("POST", "/conformity/assessments/1/bom-notifications", {}, demoCookie);
    expect(demoCreate.status).toBe(403);
    const demoPatch = await api("PATCH", "/conformity/bom-notifications/1", {}, demoCookie);
    expect(demoPatch.status).toBe(403);
  });
});
