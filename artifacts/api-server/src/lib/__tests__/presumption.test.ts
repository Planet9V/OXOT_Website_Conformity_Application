/**
 * Article 27 — presumption of conformity.
 *
 * These tests pin the RULE against a fixture register, not against today's facts.
 * The live register records what has actually been published in the OJEU; if a
 * test asserted "no presumption available" against it, the Commission publishing
 * a citation would break the build, which is exactly backwards.
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import {
  assessPresumption,
  STANDARD_CITATIONS,
  type StandardCitationRecord,
} from "../presumption";

const CITED: StandardCitationRecord = {
  key: "EN_FICTIONAL_CITED",
  title: "EN 00000:2027",
  craOjReference: "OJ L, 2027/00001, 1.1.2027",
  coversAnnexI: ["Annex I Part I(2)", "Annex I Part I(3)"],
  verifiedOn: "2027-01-02",
  source: "fixture",
  note: "fixture — a standard that has been cited",
};

const NOT_CITED: StandardCitationRecord = {
  key: "IEC_62443_4_2",
  title: "IEC 62443-4-2",
  craOjReference: null,
  coversAnnexI: [],
  verifiedOn: "2026-08-15",
  source: "fixture",
  note: "fixture — a standard that has not been cited",
};

const register = [CITED, NOT_CITED];

describe("Art. 27(1) — publication in the Official Journal is the operative act", () => {
  it("grants a presumption for a standard whose reference has been published", () => {
    const r = assessPresumption({ claimedStandards: ["EN_FICTIONAL_CITED"] }, register);
    expect(r.presumptionAvailable).toBe(true);
    expect(r.basis).toBe("harmonised_standard");
    expect(r.coversAnnexI).toEqual(["Annex I Part I(2)", "Annex I Part I(3)"]);
  });

  it("grants NO presumption for an uncited standard, however well it maps", () => {
    const r = assessPresumption({ claimedStandards: ["IEC_62443_4_2"] }, register);
    expect(r.presumptionAvailable).toBe(false);
    expect(r.basis).toBe("none");
    expect(r.coversAnnexI).toEqual([]);
    expect(r.evidenceOnly[0].reason).toMatch(/not a presumption under Article 27\(1\)/);
  });

  it("grants no presumption for a standard absent from the register", () => {
    const r = assessPresumption({ claimedStandards: ["ISO_IEC_27001"] }, register);
    expect(r.presumptionAvailable).toBe(false);
    expect(r.evidenceOnly[0].reason).toMatch(/not in the citation register/);
  });

  it("covers only the requirements the cited standard covers, never the product at large", () => {
    const r = assessPresumption(
      { claimedStandards: ["EN_FICTIONAL_CITED", "IEC_62443_4_2"] },
      register,
    );
    expect(r.presumptionAvailable).toBe(true);
    // The uncited standard contributes nothing, and is reported as evidence only.
    expect(r.coversAnnexI).toEqual(["Annex I Part I(2)", "Annex I Part I(3)"]);
    expect(r.evidenceOnly.map((e) => e.key)).toEqual(["IEC_62443_4_2"]);
    expect(r.message).toMatch(/does not extend to any other requirement/);
  });
});

describe("Art. 27(5) and 27(8) — the other two routes", () => {
  it("a common specification grants a presumption", () => {
    const r = assessPresumption(
      { claimedCommonSpecifications: ["Annex I Part I(1)"] },
      register,
    );
    expect(r.presumptionAvailable).toBe(true);
    expect(r.basis).toBe("common_specification");
  });

  it("a European cybersecurity certificate grants a presumption for what it covers", () => {
    const r = assessPresumption(
      {
        certificate: {
          scheme: "EUCC",
          assuranceLevel: "substantial",
          coversAnnexI: ["Annex I Part I(5)"],
        },
      },
      register,
    );
    expect(r.presumptionAvailable).toBe(true);
    expect(r.basis).toBe("certification_scheme");
    expect(r.coversAnnexI).toEqual(["Annex I Part I(5)"]);
  });
});

describe("the default position", () => {
  it("claiming nothing yields no presumption and says why", () => {
    const r = assessPresumption({}, register);
    expect(r.presumptionAvailable).toBe(false);
    expect(r.message).toMatch(/No presumption of conformity is available/);
    expect(r.message).toMatch(/must still be demonstrated on its own merits/);
  });
});

describe("the live citation register", () => {
  /**
   * Not an assertion about whether anything has been cited — that changes. It
   * asserts the register is auditable: every record says when it was checked and
   * against what, so a null citation is a dated finding rather than a gap.
   */
  it("every record carries a verification date and a source", () => {
    for (const record of STANDARD_CITATIONS) {
      expect(record.verifiedOn, `${record.key} must record when it was checked`).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
      expect(record.source.length, `${record.key} must cite a source`).toBeGreaterThan(0);
    }
  });
});
