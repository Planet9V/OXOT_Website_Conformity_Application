/**
 * The verification shape — Art. 19 (importer) and Art. 20 (distributor).
 *
 * Phase 3.1's whole point is that these are NOT one persona. The assertions
 * below pin the four differences: the standard, the trigger, the knowledge
 * qualifier, and what each must verify.
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import {
  assessImporterVerification,
  assessDistributorVerification,
  assessDutyToRefrain,
  type ImporterVerificationInput,
  type DistributorVerificationInput,
} from "../economicOperatorVerification";

function importerOk(over: Partial<ImporterVerificationInput> = {}): ImporterVerificationInput {
  return {
    conformityAssessmentCarriedOut: true,
    technicalDocumentationDrawnUp: true,
    ceMarkingPresent: true,
    euDeclarationAccompanies: true,
    userInformationPresent: true,
    userInformationLanguageUnderstood: true,
    manufacturerIdentificationComplied: true,
    canProvideProvingDocuments: true,
    ownContactDetailsAffixed: true,
    ...over,
  };
}

function distributorOk(over: Partial<DistributorVerificationInput> = {}): DistributorVerificationInput {
  return {
    ceMarkingPresent: true,
    upstreamObligationsComplied: true,
    necessaryDocumentsProvided: true,
    ...over,
  };
}

describe("the two roles are not one persona", () => {
  it("attaches to different acts", () => {
    expect(assessImporterVerification(importerOk()).trigger).toBe("placing_on_the_market");
    expect(assessDistributorVerification(distributorOk()).trigger).toBe("making_available_on_the_market");
  });

  it("holds them to different standards", () => {
    expect(assessImporterVerification(importerOk()).standard).toMatch(/shall ENSURE/);
    expect(assessDistributorVerification(distributorOk()).standard).toMatch(/DUE CARE/);
  });

  /**
   * The distributor's list is genuinely shorter. Applying the importer's four
   * checks to a distributor would invent obligations Art. 20 does not impose.
   */
  it("asks the distributor for less, and that is deliberate", () => {
    const imp = assessImporterVerification({});
    const dist = assessDistributorVerification({});
    expect(imp.gaps.length).toBeGreaterThan(dist.gaps.length);
    expect(dist.gaps.join(" ")).not.toMatch(/conformity assessment procedures/);
    expect(dist.gaps.join(" ")).not.toMatch(/technical documentation/);
  });
});

describe("Art. 19(2) — the importer ensures four things", () => {
  it("clears when every check is verified", () => {
    const r = assessImporterVerification(importerOk());
    expect(r.cleared).toBe(true);
    expect(r.gaps).toEqual([]);
  });

  it("requires the Article 32 conformity assessment", () => {
    const r = assessImporterVerification(importerOk({ conformityAssessmentCarriedOut: null }));
    expect(r.cleared).toBe(false);
    expect(r.gaps.join(" ")).toMatch(/Article 19\(2\)\(a\)/);
  });

  /** The language qualifier is part of the duty, not a nicety. */
  it("requires the instructions to be in an understood language", () => {
    const r = assessImporterVerification(importerOk({ userInformationLanguageUnderstood: false }));
    expect(r.cleared).toBe(false);
    expect(r.gaps.join(" ")).toMatch(/easily understood by users and market surveillance/);
  });

  it("requires the importer to be able to produce the proving documents", () => {
    const r = assessImporterVerification(importerOk({ canProvideProvingDocuments: null }));
    expect(r.gaps.join(" ")).toMatch(/final subparagraph/);
  });

  /** Art. 19(4) — a duty distributors do not have. */
  it("requires the importer's own contact details", () => {
    const r = assessImporterVerification(importerOk({ ownContactDetailsAffixed: null }));
    expect(r.gaps.join(" ")).toMatch(/Article 19\(4\)/);
  });

  it("treats unanswered as unverified, never as cleared", () => {
    const r = assessImporterVerification({});
    expect(r.cleared).toBe(false);
    expect(r.gaps.length).toBe(9);
  });
});

describe("Art. 20(2) — the distributor verifies two things", () => {
  it("clears when both are verified", () => {
    const r = assessDistributorVerification(distributorOk());
    expect(r.cleared).toBe(true);
  });

  it("requires the CE marking", () => {
    const r = assessDistributorVerification(distributorOk({ ceMarkingPresent: null }));
    expect(r.gaps.join(" ")).toMatch(/Article 20\(2\)\(a\)/);
  });

  it("requires upstream compliance and the documents being handed over", () => {
    const r = assessDistributorVerification({ ceMarkingPresent: true });
    expect(r.gaps.join(" ")).toMatch(/Article 13\(15\), \(16\), \(18\), \(19\) and \(20\)/);
    expect(r.gaps.join(" ")).toMatch(/provided all necessary documents/);
  });
});

describe("the duty to refrain", () => {
  it("HOLDS the product, and says so plainly", () => {
    const r = assessDutyToRefrain({ role: "importer", believesNonConforming: true });
    expect(r.held).toBe(true);
    expect(r.blockedAction).toBe("placing_on_the_market");
    expect(r.message).toMatch(/must not place this product on the market/);
  });

  it("blocks the distributor's onward supply instead", () => {
    const r = assessDutyToRefrain({
      role: "distributor",
      believesNonConforming: true,
      basedOnInformationInPossession: true,
    });
    expect(r.blockedAction).toBe("making_available_on_the_market");
    expect(r.message).toMatch(/must not make this product available/);
  });

  /**
   * Art. 20(3)'s qualifier. A distributor is judged on the information it
   * holds; applying the importer's unqualified standard would invent a duty to
   * investigate.
   */
  it("asks the distributor what information grounds the belief", () => {
    const r = assessDutyToRefrain({ role: "distributor", believesNonConforming: true });
    expect(r.gaps.join(" ")).toMatch(/information in its possession/);
    expect(r.gaps.join(" ")).toMatch(/not on what it might have discovered/);
  });

  it("does not ask the importer for that qualifier", () => {
    const r = assessDutyToRefrain({ role: "importer", believesNonConforming: true });
    expect(r.gaps.join(" ")).not.toMatch(/information in its possession/);
  });

  it("requires both notifications on a significant risk", () => {
    const r = assessDutyToRefrain({
      role: "importer",
      believesNonConforming: true,
      significantCybersecurityRisk: true,
    });
    expect(r.gaps.join(" ")).toMatch(/inform the manufacturer/);
    expect(r.gaps.join(" ")).toMatch(/market surveillance authorities/);
  });

  /** Art. 19(3) second subparagraph — importers only, routing to Art. 54(2). */
  it("routes non-technical risk factors to Article 54(2), for importers only", () => {
    const imp = assessDutyToRefrain({
      role: "importer",
      believesNonConforming: true,
      significantRiskFromNonTechnicalFactors: true,
    });
    expect(imp.citations).toContain("Article 54(2)");
    expect(imp.gaps.join(" ")).toMatch(/NON-TECHNICAL/);

    const dist = assessDutyToRefrain({
      role: "distributor",
      believesNonConforming: true,
      basedOnInformationInPossession: true,
      significantRiskFromNonTechnicalFactors: true,
    });
    expect(dist.citations).not.toContain("Article 54(2)");
  });

  it("lifts once brought into conformity", () => {
    const r = assessDutyToRefrain({
      role: "importer",
      believesNonConforming: true,
      broughtIntoConformityAt: "2027-05-01",
    });
    expect(r.held).toBe(false);
    expect(r.message).toMatch(/hold is lifted/);
  });

  /** Silence is not clearance. */
  it("does not read an unrecorded determination as permission to supply", () => {
    const r = assessDutyToRefrain({ role: "distributor" });
    expect(r.held).toBe(false);
    expect(r.message).toMatch(/not a finding that the product may be supplied/);
  });
});
