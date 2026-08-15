/**
 * The Article 13(8) rule as the manufacturer actually meets it — through the
 * generated support statement, not just the pure function.
 *
 * lib/__tests__/supportPeriod.test.ts pins the rule. This pins the wiring: that
 * a lawful short support period reaches the Annex VII artifact as complete, and
 * an unjustified one carries the "To complete:" marker. Both directions, because
 * the plan's original criterion would have failed the lawful case.
 */
import { describe, it, expect } from "vitest";
import type {
  ConformityProductRow,
  ConformityAssessmentRow,
} from "@workspace/db";
import { buildArtifact, type BuildArtifactsInput } from "../conformityEngine";

const NOW = new Date("2026-07-20T12:00:00Z");

function product(over: Partial<ConformityProductRow> = {}): ConformityProductRow {
  return {
    id: 1,
    name: "Industrial Edge Controller",
    description: "",
    manufacturerName: "ACME",
    manufacturerAddress: "",
    authorizedRep: "",
    productType: "hardware_with_software",
    version: "1.0",
    intendedUse: "",
    supportPeriodStart: null,
    supportPeriodEnd: null,
    expectedUseTimeMonths: null,
    supportPeriodRationale: "",
    createdAt: NOW,
    updatedAt: NOW,
    ...over,
  } as ConformityProductRow;
}

function assessment(): ConformityAssessmentRow {
  return {
    id: 1,
    productId: 1,
    regulationKey: "cra",
    status: "active",
    currentStage: "gap_assessment",
    scopeResult: "in_scope",
    classKey: "important_class_ii",
    routeKey: "module_h",
    appliedStandards: [],
    startedAt: NOW,
    completedAt: null,
    updatedAt: NOW,
  } as ConformityAssessmentRow;
}

function supportSection(p: ConformityProductRow) {
  const input = {
    product: p,
    assessment: assessment(),
    evaluations: [],
    evidence: [],
    now: NOW,
  } as unknown as BuildArtifactsInput;
  const sections = buildArtifact("support_statement", input);
  const section = sections.find((s) => s.key === "support_period");
  if (!section) throw new Error("support_period section missing");
  return section;
}

describe("support statement — Article 13(8) wiring", () => {
  it("marks a five-year period complete", () => {
    const s = supportSection(
      product({ supportPeriodStart: "2027-12-11", supportPeriodEnd: "2032-12-11" }),
    );
    expect(s.complete).toBe(true);
    expect(s.body).not.toMatch(/To complete/i);
  });

  it("flags a 12-month period on a Class II product with no expected use time", () => {
    const s = supportSection(
      product({ supportPeriodStart: "2027-12-11", supportPeriodEnd: "2028-12-11" }),
    );
    expect(s.complete).toBe(false);
    expect(s.body).toMatch(/To complete/i);
    expect(s.body).toMatch(/Article 13\(8\)/);
  });

  // The case the original acceptance criterion would have wrongly rejected.
  it("accepts the same 12-month period when expected use time matches", () => {
    const s = supportSection(
      product({
        supportPeriodStart: "2027-12-11",
        supportPeriodEnd: "2028-12-11",
        expectedUseTimeMonths: 12,
        supportPeriodRationale: "Single-season sensor; enclosure rated for one harvest cycle.",
      }),
    );
    expect(s.complete).toBe(true);
    expect(s.body).not.toMatch(/To complete/i);
    expect(s.body).toMatch(/Annex VII/);
    expect(s.body).toMatch(/Single-season sensor/);
  });

  it("flags a period shorter than the declared expected use time", () => {
    const s = supportSection(
      product({
        supportPeriodStart: "2027-12-11",
        supportPeriodEnd: "2029-12-11",
        expectedUseTimeMonths: 48,
      }),
    );
    expect(s.complete).toBe(false);
    expect(s.body).toMatch(/correspond to the expected use time/i);
  });

  it("asks for a support period when none is set", () => {
    const s = supportSection(product());
    expect(s.complete).toBe(false);
    expect(s.body).toMatch(/To complete/i);
  });
});
