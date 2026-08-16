import { describe, expect, it } from "vitest";
import { assessCeMarking } from "../ceMarking";

/**
 * CE marking derivations — Arts. 28/29/30. The load-bearing assertions: the
 * module dependence of the NB-number rule cuts BOTH ways (Art. 30(4)), a
 * recorded placing without a signed DoC is a gap the record proves
 * (Art. 30(3)), and physical facts are never assumed.
 */
describe("assessCeMarking", () => {
  it("no DoC at all is the first gap", () => {
    const a = assessCeMarking({
      euDocGenerated: false,
      euDocSigned: false,
      placedOnMarketDate: null,
      nbModule: null,
      nbCertificateCleared: null,
    });
    expect(a.gaps.some((g) => g.includes("No EU declaration of conformity"))).toBe(true);
  });

  it("a generated but unsigned DoC is its own distinct gap", () => {
    const a = assessCeMarking({
      euDocGenerated: true,
      euDocSigned: false,
      placedOnMarketDate: null,
      nbModule: null,
      nbCertificateCleared: null,
    });
    expect(a.gaps.some((g) => g.includes("not signed"))).toBe(true);
  });

  it("placing on the market without a signed DoC violates Art. 30(3) on the record's own evidence", () => {
    const a = assessCeMarking({
      euDocGenerated: true,
      euDocSigned: false,
      placedOnMarketDate: "2026-08-01",
      nbModule: null,
      nbCertificateCleared: null,
    });
    expect(a.gaps.some((g) => g.includes("Article 30(3)"))).toBe(true);
  });

  it("module H requires the notified body number to follow the marking", () => {
    const a = assessCeMarking({
      euDocGenerated: true,
      euDocSigned: true,
      placedOnMarketDate: null,
      nbModule: "module_h",
      nbCertificateCleared: true,
    });
    expect(a.nbNumberMustFollowMarking).toBe(true);
  });

  it("module B+C must NOT carry a notified body number — the rule cuts both ways", () => {
    const a = assessCeMarking({
      euDocGenerated: true,
      euDocSigned: true,
      placedOnMarketDate: null,
      nbModule: "module_b_c",
      nbCertificateCleared: true,
    });
    expect(a.nbNumberMustFollowMarking).toBe(false);
    expect(a.requirements.some((r) => r.text.includes("NOT followed"))).toBe(true);
  });

  it("physical affixture is never derivable from data", () => {
    const a = assessCeMarking({
      euDocGenerated: true,
      euDocSigned: true,
      placedOnMarketDate: "2026-08-01",
      nbModule: null,
      nbCertificateCleared: null,
    });
    const physical = a.requirements.find((r) => r.text.includes("visibly"));
    expect(physical?.state).toBe("not_derivable");
  });

  it("all preconditions met leaves no gaps but no verdict either", () => {
    const a = assessCeMarking({
      euDocGenerated: true,
      euDocSigned: true,
      placedOnMarketDate: "2026-08-01",
      nbModule: "module_h",
      nbCertificateCleared: true,
    });
    expect(a.gaps).toHaveLength(0);
    // The module never emits an affixture permission — grep-proof: no such field exists.
    expect(Object.keys(a)).not.toContain("mayAffix");
  });
});
