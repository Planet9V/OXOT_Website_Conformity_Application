/**
 * Regression guard: the public demo flow must keep its artifact step wired to a
 * canonical, generatable artifact type so the run-side "Create / link artifact"
 * action auto-links the generated document instead of forcing a manual pick.
 *
 * Why this test exists
 * --------------------
 * The demo flow authors its artifact step with `config.artifactType: "eu_doc"`.
 * The run panel's auto-link path (flow-runner-panel.tsx) links the freshly
 * generated artifact whose `artifactType === step.config.artifactType`. Nothing
 * else guards that contract: if someone changes the seed's `artifactType` back
 * to a non-generatable value, or renames a canonical ARTIFACT_TYPE, the demo
 * would quietly revert to forcing the user to guess — with no failing check.
 *
 * This test locks both halves of the contract:
 *   1. every artifact step in the demo flow declares an artifactType that is one
 *      of the canonical generatable ARTIFACT_TYPES;
 *   2. actually generating artifacts (via the SAME pure `buildAllArtifacts` the
 *      generate route uses) produces an artifact whose type matches the step, so
 *      the `a.artifactType === artifactType` auto-link lookup finds a match.
 */
import { describe, it, expect } from "vitest";
import type {
  ConformityProductRow,
  ConformityAssessmentRow,
} from "@workspace/db";
import { CRA_FLOW_STEPS } from "../craFlowTemplate";
import {
  ARTIFACT_TYPES,
  buildAllArtifacts,
  type BuildArtifactsInput,
} from "../../lib/conformityEngine";

/** The demo flow's artifact steps and their authored artifact type. */
const artifactSteps = CRA_FLOW_STEPS.filter((s) => s.type === "artifact");

/**
 * A representative demo-shaped input for the pure artifact generator. Because
 * `buildAllArtifacts` emits exactly one artifact per canonical ARTIFACT_TYPE
 * regardless of the captured state, the field values here only need to be
 * type-valid — they do not affect which artifact TYPES are produced, which is
 * the property under test.
 */
function demoArtifactsInput(): BuildArtifactsInput {
  return {
    product: {
      name: "NovaGuard Smart Home Hub",
      description: "A connected smart-home hub.",
      manufacturerName: "NovaGuard Technologies B.V.",
      manufacturerAddress: "Keizersgracht 123, 1015 CJ Amsterdam, Netherlands",
      authorizedRep: "NovaGuard Technologies B.V. (established in the EU)",
      productType: "hardware_with_software",
      version: "2.4.0",
      intendedUse: "Residential security automation for consumers.",
      supportPeriodStart: "2026-07-15",
      supportPeriodEnd: "2031-07-15",
    } as unknown as ConformityProductRow,
    assessment: {
      regulationKey: "cra",
      classKey: "important_class_i",
      routeKey: "module_a",
    } as unknown as ConformityAssessmentRow,
    className: "Important product, Class I",
    routeName: "Module A (self-assessment)",
    thirdPartyRequired: false,
    answers: { applies_harmonised_standards: { bool: true } },
    evaluations: [],
    evidence: [],
    psirt: null,
  };
}

describe("demo CRA flow — artifact step auto-link contract", () => {
  it("the demo flow authors at least one artifact step", () => {
    // A guard for the guard: if the flow ever drops its artifact step entirely,
    // the assertions below would vacuously pass — fail loudly instead.
    expect(
      artifactSteps.length,
      "The demo CRA flow must include at least one artifact step.",
    ).toBeGreaterThan(0);
  });

  it("every artifact step declares a canonical generatable artifactType", () => {
    for (const step of artifactSteps) {
      const artifactType = step.config?.artifactType;
      expect(
        typeof artifactType,
        `Artifact step "${step.id}" must declare config.artifactType.`,
      ).toBe("string");
      expect(
        ARTIFACT_TYPES as readonly string[],
        `Artifact step "${step.id}" type "${String(artifactType)}" must be one of the ` +
          `canonical generatable ARTIFACT_TYPES [${ARTIFACT_TYPES.join(", ")}], ` +
          `otherwise the run panel cannot auto-link a generated document.`,
      ).toContain(artifactType as string);
    }
  });

  it("generating artifacts produces one whose type matches each artifact step (auto-link fires)", () => {
    // The generate route builds artifacts via buildAllArtifacts; the run panel
    // then auto-links `created.find((a) => a.artifactType === step.artifactType)`.
    const generated = buildAllArtifacts(demoArtifactsInput());
    for (const step of artifactSteps) {
      const artifactType = step.config?.artifactType;
      const match = generated.find((a) => a.artifactType === artifactType);
      expect(
        match,
        `Generating artifacts produced no artifact of type "${String(artifactType)}" ` +
          `for step "${step.id}", so the auto-link path would force a manual pick.`,
      ).toBeDefined();
    }
  });
});
