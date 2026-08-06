/**
 * retrieveWorkspaceContext — per-assessment workspace RAG (conformity_embeddings).
 *
 * Verifies that the helper vector-searches conformity_embeddings FILTERED by
 * assessmentId: it returns a seeded row for its own assessment and does NOT
 * leak it into a different assessment's retrieval.
 *
 * No real network: `../embeddings` is mocked so embedText returns a canned
 * vector (the cosine ordering is irrelevant here — the assessmentId filter is
 * what's under test, and only one candidate exists per assessment).
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const ZERO_VECTOR = Array.from({ length: 1536 }, () => 0.1);

vi.mock("../embeddings", () => ({
  embedText: vi.fn(async () => ZERO_VECTOR),
  embedTexts: vi.fn(async (texts: string[]) => texts.map(() => ZERO_VECTOR)),
}));

import { eq } from "drizzle-orm";
import {
  db,
  conformityProductsTable,
  conformityAssessmentsTable,
  conformityEmbeddingsTable,
} from "@workspace/db";
import { retrieveWorkspaceContext } from "../rag";

let productId: number;
let assessmentA: number;
let assessmentB: number;

beforeAll(async () => {
  const [product] = await db
    .insert(conformityProductsTable)
    .values({ name: `RAG Workspace Test ${Date.now()}`, productType: "software" })
    .returning();
  productId = product!.id;

  const [a] = await db
    .insert(conformityAssessmentsTable)
    .values({ productId, regulationKey: "cra" })
    .returning();
  const [b] = await db
    .insert(conformityAssessmentsTable)
    .values({ productId, regulationKey: "cra" })
    .returning();
  assessmentA = a!.id;
  assessmentB = b!.id;

  await db.insert(conformityEmbeddingsTable).values({
    assessmentId: assessmentA,
    sourceType: "bom",
    sourceId: 1,
    title: "Assessment A SBOM",
    content: "left-pad\nreact\nlodash",
    embedding: ZERO_VECTOR,
  });
});

afterAll(async () => {
  // Cascades assessments + their embeddings.
  await db.delete(conformityProductsTable).where(eq(conformityProductsTable.id, productId));
});

describe("retrieveWorkspaceContext", () => {
  it("returns the seeded item for its own assessment", async () => {
    const hits = await retrieveWorkspaceContext(assessmentA, "what libraries are in the SBOM?", 4);
    expect(hits.length).toBe(1);
    expect(hits[0]!.title).toBe("Assessment A SBOM");
    expect(hits[0]!.sourceType).toBe("bom");
    expect(hits[0]!.content).toContain("left-pad");
  });

  it("does NOT leak another assessment's embeddings", async () => {
    const hits = await retrieveWorkspaceContext(assessmentB, "what libraries are in the SBOM?", 4);
    expect(hits).toEqual([]);
  });
});
