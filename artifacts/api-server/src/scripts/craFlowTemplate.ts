/**
 * The default CRA process-flow template used by the public demo seed.
 *
 * Extracted into its own module (rather than living inline in `seedDemo.ts`) so
 * it can be imported and asserted against WITHOUT triggering the seed script's
 * top-level `seed()` self-invocation. The demo's artifact step deliberately
 * authors a canonical, generatable artifact type so the run-side
 * "Create / link artifact" action auto-links the generated document instead of
 * forcing a manual pick — see `seedDemoFlow.test.ts` for the regression guard.
 */
import type { FlowStep } from "@workspace/db";

export const CRA_FLOW_KEY = "cra-default";

// An ordered set of typed steps a team works through for a Cyber Resilience Act
// assessment. Seeded as a reusable template (admin-authored flow-builder UI is a
// documented follow-up); a run is started against the demo assessment so the
// Flow runner panel is populated on login.
export const CRA_FLOW_STEPS: FlowStep[] = [
  {
    id: "scope",
    type: "activity",
    title: "Confirm scope & classification",
    description:
      "Verify the product is in scope of the CRA and its risk class (default / important / critical) is correct.",
    requirementRefs: [{ regulationKey: "cra", refCode: "Art 13" }],
  },
  {
    id: "harmonised",
    type: "question",
    title: "Are harmonised standards fully applied?",
    description: "Determines whether self-assessment (Module A) is available or a notified body is required.",
    requirementRefs: [{ regulationKey: "cra", refCode: "Annex V" }],
    config: { options: ["yes", "partially", "no"] },
  },
  {
    id: "bom",
    type: "investigation",
    title: "Ingest & analyze the SBOM/CBOM",
    description:
      "Import the software and cryptography bills of materials and triage the resulting vulnerability and crypto-agility findings.",
    requirementRefs: [
      { regulationKey: "cra", refCode: "Annex I Part II(1)" },
      { regulationKey: "cra", refCode: "Art 13(5)" },
    ],
  },
  {
    id: "gaps",
    type: "checkpoint",
    title: "All blocker gaps resolved",
    description: "No essential requirement is left in a not-met state before drafting the conformity documentation.",
    requirementRefs: [{ regulationKey: "cra", refCode: "Annex I(1)" }],
  },
  {
    id: "docs",
    type: "artifact",
    title: "Generate technical documentation & DoC",
    description: "Compile the technical file and draft EU Declaration of Conformity from the captured state.",
    requirementRefs: [
      { regulationKey: "cra", refCode: "Annex VII" },
      { regulationKey: "cra", refCode: "Annex V" },
    ],
    config: { artifactType: "eu_doc" },
  },
  {
    id: "review",
    type: "checkpoint",
    title: "Ready for internal review",
    description: "Readiness grade meets the bar with no blockers or open incidents. Not a legal declaration of conformity.",
    requirementRefs: [{ regulationKey: "cra", refCode: "Art 13(8)" }],
  },
];

/**
 * The complete canonical row for the default CRA flow. Shared by the demo seed
 * (upsert) and the startup bootstrap (restore-if-missing) so a restored flow is
 * byte-for-byte the same template — same appliesTo, isTemplate and sortOrder.
 */
export const CRA_FLOW_VALUES = {
  key: CRA_FLOW_KEY,
  name: "CRA conformity flow",
  description:
    "The default end-to-end process for a Cyber Resilience Act self-assessment: scope, standards, xBOM, gaps, documentation and review.",
  appliesTo: { regulationKeys: ["cra"] },
  steps: CRA_FLOW_STEPS,
  isTemplate: true,
  sortOrder: 0,
};
