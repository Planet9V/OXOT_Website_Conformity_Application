/**
 * Unit tests for the CRA Annex II "User Information & Instructions" builder.
 *
 * The document doubles as a completeness checklist: every section auto-fills
 * from state the workbench already captures (product fields, requirement
 * notes, evidence) and must carry a "To complete:" marker otherwise. These
 * tests pin the completeness predicate of each section for the two extremes —
 * an empty product and a fully-populated assessment — plus the risk-register
 * derivation rules for Annex II(5).
 */
import { describe, it, expect } from "vitest";
import type {
  ConformityProductRow,
  ConformityAssessmentRow,
  ConformityEvidenceRow,
} from "@workspace/db";
import {
  buildArtifact,
  buildAllArtifacts,
  type BuildArtifactsInput,
  type EvalDetail,
} from "../conformityEngine";

const NOW = new Date("2026-07-20T12:00:00Z");

function product(over: Partial<ConformityProductRow> = {}): ConformityProductRow {
  return {
    id: 1,
    name: "",
    orgRole: null,
    description: "",
    manufacturerName: "",
    manufacturerAddress: "",
    authorizedRep: "",
    productType: "software",
    version: "",
    intendedUse: "",
    placedOnMarketDate: null,
    supportPeriodStart: null,
    supportPeriodEnd: null,
  expectedUseTimeMonths: null,
  supportPeriodRationale: "",
    createdAt: NOW,
    updatedAt: NOW,
    ...over,
  };
}

function assessment(): ConformityAssessmentRow {
  return {
    id: 1,
    productId: 1,
    regulationKey: "cra",
    status: "active",
    currentStage: "gap_assessment",
    scopeResult: "in_scope",
    classKey: "default",
    routeKey: "module_a",
    appliedStandards: [],
    startedAt: NOW,
    completedAt: null,
    updatedAt: NOW,
  };
}

function evalOf(over: Partial<EvalDetail>): EvalDetail {
  return {
    requirementRefCode: "Annex I(1)",
    title: "A requirement",
    status: "not_started",
    themeKey: null,
    obligationType: "product_requirement",
    implementationNote: "",
    riskRating: null,
    ...over,
  };
}

function sbomEvidence(): ConformityEvidenceRow {
  return {
    id: 10,
    assessmentId: 1,
    requirementRefCode: "Annex I Part II(1)",
    title: "CycloneDX SBOM",
    evidenceType: "sbom",
    url: "https://nova.example/sbom.json",
    objectPath: "",
    fileName: "",
    fileHash: "",
    note: "",
    createdAt: NOW,
  };
}

function input(over: Partial<BuildArtifactsInput> = {}): BuildArtifactsInput {
  return {
    product: product(),
    assessment: assessment(),
    className: "Default product",
    routeName: "Module A",
    thirdPartyRequired: false,
    answers: {},
    evaluations: [],
    evidence: [],
    psirt: null,
    ...over,
  };
}

function section(sections: ReturnType<typeof buildArtifact>, key: string) {
  const s = sections.find((x) => x.key === key);
  expect(s, `section "${key}" must exist`).toBeDefined();
  return s!;
}

const ITEM_KEYS = [
  "manufacturer_contact",
  "vulnerability_contact",
  "product_identification",
  "intended_purpose",
  "risk_circumstances",
  "support_period",
  "update_installation",
  "secure_use_decommissioning",
  "sbom_access",
];

describe("buildUserInformation (CRA Annex II)", () => {
  it("is part of the generatable set", () => {
    const types = buildAllArtifacts(input()).map((a) => a.artifactType);
    expect(types).toContain("user_information");
  });

  it("empty product: every Annex II item is incomplete and carries a To complete marker", () => {
    const sections = buildArtifact("user_information", input());
    expect(sections.map((s) => s.key)).toEqual(["scope", ...ITEM_KEYS]);
    expect(section(sections, "scope").complete).toBe(true);
    for (const key of ITEM_KEYS) {
      const s = section(sections, key);
      expect(s.complete, `"${key}" must be incomplete on an empty product`).toBe(false);
      expect(s.body, `"${key}" must say what is missing`).toContain("To complete: ");
    }
  });

  it("fully populated assessment: every section is complete and auto-filled from state", () => {
    const i = input({
      product: product({
        name: "NovaGuard Smart Home Hub",
        description: "A connected home hub controlling locks and cameras.",
        manufacturerName: "NovaGuard Labs BV",
        manufacturerAddress: "Keizersgracht 1, Amsterdam, NL",
        authorizedRep: "NovaGuard EU Rep GmbH",
        version: "2.0",
        intendedUse: "Residential smart-home control within a private LAN.",
        supportPeriodStart: "2026-01-01",
        supportPeriodEnd: "2031-01-01",
      }),
      evaluations: [
        evalOf({
          requirementRefCode: "Annex I Part II(5)",
          obligationType: "process",
          implementationNote: "security@novaguard.example (see /.well-known/security.txt)",
        }),
        evalOf({
          requirementRefCode: "Annex I(2)(c)",
          status: "met",
          riskRating: "low",
          implementationNote:
            "Signed OTA updates install automatically; disable under Settings → Updates → Automatic.",
        }),
        evalOf({
          requirementRefCode: "Annex II",
          obligationType: "documentation",
          implementationNote: "Full user manual: https://novaguard.example/manual (covers set-up, use, decommissioning and data wipe).",
        }),
        evalOf({ requirementRefCode: "Annex I(1)", status: "met", riskRating: "high" }),
      ],
      evidence: [sbomEvidence()],
      psirt: null,
    });
    const sections = buildArtifact("user_information", i);
    for (const key of ITEM_KEYS) {
      expect(section(sections, key).complete, `"${key}" must be complete`).toBe(true);
    }
    expect(section(sections, "vulnerability_contact").body).toContain(
      "security@novaguard.example",
    );
    expect(section(sections, "support_period").body).toContain("2031-01-01");
    expect(section(sections, "update_installation").body).toContain("Settings → Updates");
    expect(section(sections, "secure_use_decommissioning").body).toContain(
      "https://novaguard.example/manual",
    );
    expect(section(sections, "sbom_access").body).toContain("https://nova.example/sbom.json");
  });

  it("Annex II(5): a fully-rated register with open high risks lists them (honest disclosure input)", () => {
    const i = input({
      evaluations: [
        evalOf({
          requirementRefCode: "Annex I(3)",
          title: "Protection from unauthorised access",
          status: "not_met",
          riskRating: "high",
        }),
        evalOf({ requirementRefCode: "Annex I(4)", status: "met", riskRating: "low" }),
      ],
    });
    const s = section(buildArtifact("user_information", i), "risk_circumstances");
    expect(s.complete).toBe(true);
    expect(s.body).toContain("Annex I(3)");
    expect(s.body).toContain("Protection from unauthorised access");
  });

  it("Annex II(5): an unrated register stays incomplete — never fabricates a risk picture", () => {
    const i = input({
      evaluations: [
        evalOf({ requirementRefCode: "Annex I(3)", status: "met", riskRating: null }),
      ],
    });
    const s = section(buildArtifact("user_information", i), "risk_circumstances");
    expect(s.complete).toBe(false);
    expect(s.body).toContain("To complete: ");
  });

  it("update installation requires the requirement to be met AND the mechanism recorded", () => {
    const met = input({
      evaluations: [evalOf({ requirementRefCode: "Annex I(2)(c)", status: "met", riskRating: "low" })],
    });
    // met but no note → still incomplete: there is nothing to hand the user.
    const s = section(buildArtifact("user_information", met), "update_installation");
    expect(s.complete).toBe(false);
    expect(s.body).toContain("To complete: ");
  });
});
