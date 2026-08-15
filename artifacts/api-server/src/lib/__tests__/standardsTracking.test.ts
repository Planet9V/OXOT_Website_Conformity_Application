/**
 * Standards tracking (Art 32) — unit tests for:
 *
 * 1. standardsRouteAdvisory: the Class I / Module A route-validity check.
 *    Module A self-assessment is only available to a Class I important
 *    product when at least one recorded standard is applied in FULL. The
 *    advisory must fire for exactly that gap — and stay silent for every
 *    other class/route/coverage combination (it is an advisory, not a gate).
 *
 * 2. buildEuDoc's standards section: recorded standards render verbatim
 *    (reference, title, coverage, notes) and complete the section; an
 *    explicit "no standards applied" answer is also a complete declaration;
 *    neither → an honest "To complete" marker.
 */
import { describe, it, expect } from "vitest";
import type {
  AppliedStandard,
  ConformityProductRow,
  ConformityAssessmentRow,
} from "@workspace/db";
import {
  buildArtifact,
  standardsRouteAdvisory,
  type BuildArtifactsInput,
} from "../conformityEngine";

const NOW = new Date("2026-07-20T12:00:00Z");

const FULL: AppliedStandard = {
  reference: "EN 18031-1:2024",
  title: "Common security requirements for radio equipment",
  coverage: "full",
};
const PARTIAL: AppliedStandard = {
  reference: "ETSI EN 303 645",
  coverage: "partial",
  notes: "Consumer IoT baseline only",
};

describe("standardsRouteAdvisory (Art 32(2))", () => {
  const advisory = (
    classKey: string | null,
    routeKey: string | null,
    appliedStandards: AppliedStandard[],
  ) => standardsRouteAdvisory({ classKey, routeKey, appliedStandards });

  it("fires for Class I + Module A with no standards on record", () => {
    const msg = advisory("important_class_i", "module_a", []);
    expect(msg).toBeTruthy();
    expect(msg).toContain("no applied standards");
    expect(msg).toContain("Art 32(2)");
  });

  it("fires for Class I + Module A when every entry is only partial", () => {
    const msg = advisory("important_class_i", "module_a", [PARTIAL]);
    expect(msg).toBeTruthy();
    expect(msg).toContain("partially applied");
  });

  it("clears once any standard is applied in full", () => {
    expect(advisory("important_class_i", "module_a", [PARTIAL, FULL])).toBeNull();
  });

  it("silent on third-party routes — coverage is the notified body's problem there", () => {
    expect(advisory("important_class_i", "module_b_c", [])).toBeNull();
    expect(advisory("important_class_i", "module_h", [PARTIAL])).toBeNull();
  });

  it("silent for non-Class-I classes regardless of coverage", () => {
    expect(advisory("default", "module_a", [])).toBeNull();
    expect(advisory("important_class_ii", "module_a", [])).toBeNull();
    expect(advisory("critical", "module_a", [PARTIAL])).toBeNull();
  });

  it("silent while class or route is still undecided", () => {
    expect(advisory(null, "module_a", [])).toBeNull();
    expect(advisory("important_class_i", null, [])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// buildEuDoc — section 6 (standards references)
// ---------------------------------------------------------------------------

function product(): ConformityProductRow {
  return {
    id: 1,
    name: "NovaGuard Smart Home Hub",
    description: "Connected home hub",
    manufacturerName: "NovaGuard Labs BV",
    manufacturerAddress: "Keizersgracht 1, Amsterdam, NL",
    authorizedRep: "",
    productType: "hardware",
    version: "2.0",
    intendedUse: "Smart home control",
    supportPeriodStart: null,
    supportPeriodEnd: null,
  expectedUseTimeMonths: null,
  supportPeriodRationale: "",
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function assessment(appliedStandards: AppliedStandard[]): ConformityAssessmentRow {
  return {
    id: 1,
    productId: 1,
    regulationKey: "cra",
    status: "active",
    currentStage: "gap_assessment",
    scopeResult: "in_scope",
    classKey: "important_class_i",
    routeKey: "module_a",
    appliedStandards,
    startedAt: NOW,
    completedAt: null,
    updatedAt: NOW,
  };
}

function input(
  appliedStandards: AppliedStandard[],
  answers: BuildArtifactsInput["answers"] = {},
): BuildArtifactsInput {
  return {
    product: product(),
    assessment: assessment(appliedStandards),
    className: "Important — Class I",
    routeName: "Module A — Internal control",
    thirdPartyRequired: false,
    answers,
    evaluations: [],
    evidence: [],
    psirt: null,
  };
}

function standardsSection(i: BuildArtifactsInput) {
  const s = buildArtifact("eu_doc", i).find((x) => x.key === "standards");
  expect(s).toBeDefined();
  return s!;
}

describe("buildEuDoc standards section", () => {
  it("renders recorded standards verbatim and completes the section", () => {
    const s = standardsSection(input([FULL, PARTIAL]));
    expect(s.complete).toBe(true);
    expect(s.body).toContain("EN 18031-1:2024");
    expect(s.body).toContain("Common security requirements for radio equipment");
    expect(s.body).toContain("applied in full");
    expect(s.body).toContain("ETSI EN 303 645");
    expect(s.body).toContain("partially applied");
    expect(s.body).toContain("Consumer IoT baseline only");
    expect(s.body).not.toContain("To complete: ");
  });

  it("an explicit 'no standards applied' answer is a complete, honest declaration", () => {
    const s = standardsSection(input([], { applies_harmonised_standards: { bool: false } }));
    expect(s.complete).toBe(true);
    expect(s.body).toContain("No harmonised standards");
  });

  it("a bare yes-claim without recorded references stays incomplete — the DoC must cite them", () => {
    const s = standardsSection(input([], { applies_harmonised_standards: { bool: true } }));
    expect(s.complete).toBe(false);
    expect(s.body).toContain("To complete: ");
  });
});
