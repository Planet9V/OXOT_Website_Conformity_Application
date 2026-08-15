/**
 * Article 32 — conformity assessment route selection.
 *
 * Acceptance criterion: routes are derived from the Article 27 position, not
 * read from a static table. The case that matters most is the flip — an
 * important Class I manufacturer CANNOT self-assess while no harmonised
 * standard has been cited, which is the opposite of what the seeded table said.
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import { selectConformityRoutes, type RouteSelectionInput } from "../conformityRoute";

/** The world as it stands: no cited standard, no common specification. */
const TODAY = { appliedArt27BasisInFull: false, art27BasisExists: false };

function routes(over: Partial<RouteSelectionInput> & { classKey: RouteSelectionInput["classKey"] }) {
  return selectConformityRoutes({ ...TODAY, ...over });
}

describe("Art. 32(1) — default products", () => {
  it("may use any procedure, including internal control", () => {
    const r = routes({ classKey: "default" });
    expect(r.availableRoutes).toContain("module_a");
    expect(r.thirdPartyRequired).toBe(false);
    expect(r.citation).toBe("Article 32(1)");
  });
});

describe("Art. 32(2) — important Class I, the flip", () => {
  it("CANNOT self-assess while no Article 27 basis exists", () => {
    const r = routes({ classKey: "important_class_i" });
    expect(r.availableRoutes).not.toContain("module_a");
    expect(r.thirdPartyRequired).toBe(true);
    expect(r.message).toMatch(/NOT available/);
    expect(r.message).toMatch(/does not exist/);
  });

  it("regains internal control once a basis exists and is applied in full", () => {
    const r = routes({
      classKey: "important_class_i",
      art27BasisExists: true,
      appliedArt27BasisInFull: true,
    });
    expect(r.availableRoutes).toContain("module_a");
    expect(r.thirdPartyRequired).toBe(false);
  });

  // Art. 32(2) treats "applied only in part" exactly like "not applied".
  it("does not regain internal control on partial application", () => {
    const r = routes({
      classKey: "important_class_i",
      art27BasisExists: true,
      appliedArt27BasisInFull: false,
    });
    expect(r.availableRoutes).not.toContain("module_a");
    expect(r.options.find((o) => o.key === "module_a")!.reason).toMatch(
      /partial application the same as none/,
    );
  });

  it("always leaves module B+C and module H open", () => {
    const r = routes({ classKey: "important_class_i" });
    expect(r.availableRoutes).toEqual(expect.arrayContaining(["module_b_c", "module_h"]));
  });
});

describe("Art. 32(3) — important Class II", () => {
  it("never offers internal control, even with a full Article 27 basis", () => {
    const r = routes({
      classKey: "important_class_ii",
      art27BasisExists: true,
      appliedArt27BasisInFull: true,
    });
    expect(r.availableRoutes).not.toContain("module_a");
    expect(r.thirdPartyRequired).toBe(true);
    expect(r.options.find((o) => o.key === "module_a")!.reason).toMatch(/in any circumstances/);
  });
});

describe("Art. 32(4) — critical products", () => {
  it("requires the Article 8(1) scheme where one applies", () => {
    const r = routes({ classKey: "critical", art8SchemeAvailable: true });
    expect(r.availableRoutes).toContain("eu_certification_scheme");
    expect(r.message).toMatch(/Article 32\(4\)\(a\)/);
  });

  it("falls back to the Article 32(3) procedures where Article 8(1) is not met", () => {
    const r = routes({ classKey: "critical", art8SchemeAvailable: false });
    expect(r.availableRoutes).toEqual(expect.arrayContaining(["module_b_c", "module_h"]));
    expect(r.availableRoutes).not.toContain("module_a");
    expect(r.message).toMatch(/Article 32\(4\)\(b\)/);
  });
});

describe("Art. 32(5) — the free and open-source carve-out", () => {
  it("opens internal control to FOSS in an Annex III category when the documentation is public", () => {
    const r = routes({
      classKey: "important_class_ii",
      isFreeAndOpenSource: true,
      technicalDocumentationPublic: true,
    });
    expect(r.availableRoutes).toContain("module_a");
    expect(r.citation).toBe("Article 32(5)");
    expect(r.thirdPartyRequired).toBe(false);
  });

  // The proviso is not optional — without it, the ordinary rule applies.
  it("does not apply when the technical documentation is not public", () => {
    const r = routes({
      classKey: "important_class_ii",
      isFreeAndOpenSource: true,
      technicalDocumentationPublic: false,
    });
    expect(r.availableRoutes).not.toContain("module_a");
    expect(r.citation).toBe("Article 32(3)");
  });

  it("changes nothing for a default product, which already has the full menu", () => {
    const r = routes({
      classKey: "default",
      isFreeAndOpenSource: true,
      technicalDocumentationPublic: true,
    });
    expect(r.citation).toBe("Article 32(1)");
    expect(r.availableRoutes).toContain("module_a");
  });
});
