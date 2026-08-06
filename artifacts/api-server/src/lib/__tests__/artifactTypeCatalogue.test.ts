/**
 * Regression guard: the generatable artifact-type catalogue must stay in sync
 * across the client/server boundary.
 *
 * `GeneratableArtifactType` (OpenAPI schema, generated into @workspace/api-zod
 * and @workspace/api-client-react) is the single shared source of truth from
 * which the flow builder's artifact-type picker derives. The server's actual
 * generator (`conformityEngine.ts` ARTIFACT_TYPES / buildAllArtifacts) is what
 * decides which types can really be produced. If those two lists diverge — a
 * type added, removed, or renamed on one side only — the builder would offer a
 * type the runner can't generate (so its step never auto-links), or drop a type
 * the runner can. This test fails loudly the moment they diverge, forcing the
 * OpenAPI enum (and the regenerated client) to be updated in lockstep.
 */
import { describe, it, expect } from "vitest";
import { GeneratableArtifactType } from "@workspace/api-zod";
import { ARTIFACT_TYPES, ARTIFACT_LABELS } from "../conformityEngine";

const specTypes = Object.values(GeneratableArtifactType).sort();
const engineTypes = [...ARTIFACT_TYPES].sort();

describe("generatable artifact-type catalogue", () => {
  it("the shared spec enum matches the server's generatable ARTIFACT_TYPES exactly", () => {
    expect(
      engineTypes,
      "conformityEngine.ARTIFACT_TYPES and the shared GeneratableArtifactType enum " +
        "(lib/api-spec/openapi.yaml) have drifted. Update the OpenAPI enum and " +
        "regenerate the client (pnpm --filter @workspace/api-spec run codegen) so the " +
        "flow builder only offers types the runner can actually generate.",
    ).toEqual(specTypes);
  });

  it("every generatable type has a server-side label", () => {
    for (const type of ARTIFACT_TYPES) {
      expect(
        typeof ARTIFACT_LABELS[type],
        `ARTIFACT_LABELS is missing a label for generatable type "${type}".`,
      ).toBe("string");
    }
  });
});
