import { describe, expect, it } from "vitest";
import { TEAM_ROLES } from "@workspace/db";

/**
 * Drift guard for the team role model (DESIGN_five_shapes.md D2/D12).
 *
 * The four roles are a design decision, not an open set: compliance
 * coordinator, engineering evidence provider, PSIRT, and the legal/executive
 * signatory (who Annex V makes legally distinct — the DoC is signed on behalf
 * of the manufacturer). A fifth role appearing here, or one disappearing,
 * must be a deliberate design-doc change, not a drive-by edit — the same
 * guard pattern as registeredDerivers() in statusDerivers.test.ts.
 */
describe("TEAM_ROLES", () => {
  it("is exactly the four roles decided in D2/D12", () => {
    expect([...TEAM_ROLES].sort()).toEqual([
      "compliance_coordinator",
      "engineering_lead",
      "psirt",
      "signatory",
    ]);
  });
});
