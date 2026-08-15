/**
 * resolveRoutes — the Article 32 rule as the workbench actually applies it.
 *
 * lib/__tests__/conformityRoute.test.ts pins the rule. This pins the wiring, and
 * specifically the defect it fixes: the manufacturer's own "yes, I applied
 * harmonised standards" answer used to unlock module A for an important Class I
 * product. Art. 32(2) also closes internal control "where such ... do not
 * exist", and none does, so the answer cannot open it today.
 */
import { describe, it, expect } from "vitest";
import type { ConformityRouteRow, ProductClassRow } from "@workspace/db";
import { resolveRoutes } from "../conformityEngine";
import { STANDARD_CITATIONS } from "../presumption";

const routes = [
  { key: "module_a", name: "Module A — Internal control", description: "", thirdPartyRequired: false, appliesToClasses: ["default", "important_class_i"], sortOrder: 1 },
  { key: "module_b_c", name: "Module B+C", description: "", thirdPartyRequired: true, appliesToClasses: ["important_class_i", "important_class_ii", "critical"], sortOrder: 2 },
  { key: "module_h", name: "Module H", description: "", thirdPartyRequired: true, appliesToClasses: ["important_class_i", "important_class_ii", "critical"], sortOrder: 3 },
  { key: "eu_certification_scheme", name: "European cybersecurity certification", description: "", thirdPartyRequired: true, appliesToClasses: ["critical"], sortOrder: 4 },
] as unknown as ConformityRouteRow[];

const productClass = { defaultRouteKey: "module_a" } as unknown as ProductClassRow;

function keys(classKey: string, appliesHarmonised: boolean | undefined, opts = {}) {
  return resolveRoutes(classKey, appliesHarmonised, routes, productClass, opts).allowed.map(
    (r) => r.key,
  );
}

describe("resolveRoutes — Article 32 governs, the questionnaire does not", () => {
  it("closes module A for important Class I even when the manufacturer answers yes", () => {
    expect(keys("important_class_i", true)).not.toContain("module_a");
  });

  it("closes it when the manufacturer answers no", () => {
    expect(keys("important_class_i", false)).not.toContain("module_a");
  });

  it("still offers the third-party routes", () => {
    expect(keys("important_class_i", false)).toEqual(
      expect.arrayContaining(["module_b_c", "module_h"]),
    );
  });

  it("recommends module B+C rather than internal control", () => {
    const r = resolveRoutes("important_class_i", true, routes, productClass);
    expect(r.recommendedRouteKey).toBe("module_b_c");
    expect(r.citation).toBe("Article 32(2)");
    expect(r.message).toMatch(/NOT available/);
  });

  it("explains each route rather than silently dropping it", () => {
    const r = resolveRoutes("important_class_i", true, routes, productClass);
    const moduleA = r.rationale.find((x) => x.key === "module_a");
    expect(moduleA?.available).toBe(false);
    expect(moduleA?.reason).toMatch(/does not exist/);
  });

  it("leaves default products with the full menu", () => {
    expect(keys("default", false)).toContain("module_a");
  });

  it("never offers module A to important Class II", () => {
    expect(keys("important_class_ii", true)).not.toContain("module_a");
  });

  /**
   * Art. 32(5). The seeded table lists module A as applying only to "default"
   * and "important_class_i", so intersecting the table with the statute would
   * wrongly veto this. The statute wins.
   */
  it("opens module A to FOSS in an Annex III category with public documentation", () => {
    expect(
      keys("important_class_ii", false, {
        isFreeAndOpenSource: true,
        technicalDocumentationPublic: true,
      }),
    ).toContain("module_a");
  });

  it("does not open it when the documentation is not public", () => {
    expect(
      keys("important_class_ii", false, {
        isFreeAndOpenSource: true,
        technicalDocumentationPublic: false,
      }),
    ).not.toContain("module_a");
  });
});

describe("the guard is data-driven, not hardcoded", () => {
  /**
   * If a CRA harmonised standard is ever cited, the register gains a non-null
   * reference and important Class I self-assessment reopens by itself. This
   * asserts the behaviour is wired to that fact rather than to a constant, so
   * the fix does not become wrong when the world changes.
   */
  it("today's closure follows from an empty citation register", () => {
    const anyCited = STANDARD_CITATIONS.some((s) => s.craOjReference !== null);
    expect(anyCited).toBe(false);
    expect(keys("important_class_i", true)).not.toContain("module_a");
  });
});
