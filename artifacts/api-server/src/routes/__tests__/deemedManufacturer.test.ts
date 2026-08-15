/**
 * Articles 21 / 22 — the deemed-manufacturer transition, end to end.
 *
 * lib/__tests__/deemedManufacturer.test.ts pins the legal rule. This pins what
 * the phase is actually for:
 *
 *   - the assessment is PERSISTED (the endpoint it replaces computed and stored
 *     nothing, so the determination existed only in the browser),
 *   - identical facts assessed twice produce DIFFERENT records, because the
 *     engine it replaces hashed a hardcoded "2026-08-14T12:00:00Z" and so
 *     produced an identical "certificate hash" for assessments months apart —
 *     the one thing a hash exists to prevent,
 *   - a positive determination OPENS a manufacturer obligation set, which is
 *     the transition made real rather than merely announced.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { eq } from "drizzle-orm";
import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";
import { db, conformityProductsTable, conformityAssessmentsTable } from "@workspace/db";

let server: Server;
let baseUrl: string;
let cookie: string;
let productId: number;

beforeAll(async () => {
  cookie = `${ADMIN_COOKIE}=${createSessionToken("dm-admin")}`;
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  const [product] = await db
    .insert(conformityProductsTable)
    .values({ name: `DM E2E ${Date.now()}`, productType: "hardware_with_software" })
    .returning();
  productId = product!.id;
});

afterAll(async () => {
  await db.delete(conformityAssessmentsTable).where(eq(conformityAssessmentsTable.productId, productId));
  await db.delete(conformityProductsTable).where(eq(conformityProductsTable.id, productId));
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

type Json = Record<string, any>;

async function assess(body: unknown): Promise<{ status: number; json: Json }> {
  const res = await fetch(`${baseUrl}/conformity/deemed-manufacturer/assess`, {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : {} };
}

/** An "other person" who substantially modifies and makes available — Art. 22. */
function transitionFacts() {
  return {
    productId,
    subjectName: "Axians Industrial Solutions",
    actorRole: "other_person",
    modificationMade: true,
    changeFollowsPlacingOnMarket: true,
    affectsAnnexIPartICompliance: true,
    modifiesAssessedIntendedPurpose: false,
    makesAvailableOnMarket: true,
    cybersecurityImpactIsProductWide: false,
  };
}

describe("the assessment is persisted", () => {
  it("stores the facts, the determination and who made it", async () => {
    const res = await assess(transitionFacts());
    expect(res.status, JSON.stringify(res.json)).toBe(201);
    expect(res.json.assessment.id).toBeTypeOf("number");
    expect(res.json.assessment.assessedBy).toContain("dm-admin");
    expect(res.json.assessment.governingArticle).toBe("Article 22");
    expect(res.json.assessment.obligationScope).toBe("affected_part");

    const list = await fetch(
      `${baseUrl}/conformity/deemed-manufacturer/assessments?productId=${productId}`,
      { headers: { cookie } },
    );
    const body = (await list.json()) as Json;
    expect(body.total).toBeGreaterThanOrEqual(1);
  });
});

describe("the frozen-timestamp regression", () => {
  /**
   * The engine this replaces built its hash over a hardcoded timestamp, so the
   * same facts always produced the same "certificate hash" no matter when they
   * were assessed. Two assessments of identical facts must be distinguishable.
   */
  it("gives identical facts different timestamps and different hashes", async () => {
    const facts = transitionFacts();
    const first = await assess(facts);
    await new Promise((r) => setTimeout(r, 1100));
    const second = await assess(facts);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.json.assessment.assessedAt).not.toBe(first.json.assessment.assessedAt);
    expect(second.json.assessment.recordHash).not.toBe(first.json.assessment.recordHash);
    expect(second.json.assessment.id).not.toBe(first.json.assessment.id);
  });
});

describe("the transition opens manufacturer obligations", () => {
  it("opens an assessment on a positive determination", async () => {
    const res = await assess(transitionFacts());
    expect(res.json.openedAssessmentId).toBeTypeOf("number");

    const rows = await db
      .select()
      .from(conformityAssessmentsTable)
      .where(eq(conformityAssessmentsTable.productId, productId));
    expect(rows.length).toBe(1);
    expect(rows[0]!.regulationKey).toBe("cra");
  });

  it("does not open a second one when re-assessed", async () => {
    await assess(transitionFacts());
    const rows = await db
      .select()
      .from(conformityAssessmentsTable)
      .where(eq(conformityAssessmentsTable.productId, productId));
    expect(rows.length).toBe(1);
  });

  it("opens nothing on a negative determination", async () => {
    const [other] = await db
      .insert(conformityProductsTable)
      .values({ name: `DM negative ${Date.now()}`, productType: "software" })
      .returning();
    const res = await assess({
      ...transitionFacts(),
      productId: other!.id,
      // Substantial modification, but not made available — Art. 22(1) needs both.
      makesAvailableOnMarket: false,
    });
    expect(res.json.determination.deemedManufacturer).toBe(false);
    expect(res.json.openedAssessmentId).toBeNull();

    const rows = await db
      .select()
      .from(conformityAssessmentsTable)
      .where(eq(conformityAssessmentsTable.productId, other!.id));
    expect(rows.length).toBe(0);
    await db.delete(conformityProductsTable).where(eq(conformityProductsTable.id, other!.id));
  });
});

describe("input validation", () => {
  it("rejects an unknown actor role", async () => {
    const res = await assess({ ...transitionFacts(), actorRole: "wizard" });
    expect(res.status).toBe(400);
  });

  it("404s on a product that does not exist", async () => {
    const res = await assess({ ...transitionFacts(), productId: 99_999_999 });
    expect(res.status).toBe(404);
  });
});
