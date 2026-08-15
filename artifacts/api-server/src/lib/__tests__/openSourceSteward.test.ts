/**
 * The stewardship shape — Article 24.
 *
 * Two assertions carry this file. Art. 24(3) applies Art. 14 reporting on two
 * separately-conditional limbs, which the plan missed entirely. And
 * Art. 64(10)(b) removes the FINES and nothing else — a steward still has the
 * obligations and is still subject to Chapter V.
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import {
  assessStewardPolicy,
  assessStewardCooperation,
  assessStewardReporting,
  stewardLegalPosition,
  POLICY_ASPECTS,
  type PolicyAspect,
} from "../openSourceSteward";

const ALL_ASPECTS = Object.keys(POLICY_ASPECTS) as PolicyAspect[];

describe("Art. 24(1) — the policy, documented in a verifiable manner", () => {
  it("is satisfied when documented, published, versioned and complete", () => {
    const r = assessStewardPolicy({
      policyDocumented: true,
      policyUrl: "https://example.org/security-policy",
      policyVersion: "2.1",
      aspectsCovered: ALL_ASPECTS,
    });
    expect(r.documented).toBe(true);
    expect(r.gaps).toEqual([]);
    expect(r.aspectsMissing).toEqual([]);
  });

  /** Having the practice without the document does not satisfy 24(1). */
  it("is not satisfied by practice alone", () => {
    const r = assessStewardPolicy({
      policyDocumented: false,
      policyUrl: "https://example.org/p",
      policyVersion: "1",
      aspectsCovered: ALL_ASPECTS,
    });
    expect(r.documented).toBe(false);
    expect(r.gaps.join(" ")).toMatch(/Having the practice without the document/);
  });

  it("requires somewhere to verify it", () => {
    const r = assessStewardPolicy({ policyDocumented: true, policyVersion: "1", aspectsCovered: ALL_ASPECTS });
    expect(r.documented).toBe(false);
    expect(r.gaps.join(" ")).toMatch(/someone else can check it/);
  });

  it("names each aspect of Article 24(1) the policy does not yet cover", () => {
    const r = assessStewardPolicy({
      policyDocumented: true,
      policyUrl: "https://example.org/p",
      policyVersion: "1",
      aspectsCovered: ["secure_development"],
    });
    expect(r.aspectsMissing.length).toBe(ALL_ASPECTS.length - 1);
    expect(r.gaps.join(" ")).toMatch(/voluntary reporting of vulnerabilities as laid down in Article 15/);
    expect(r.gaps.join(" ")).toMatch(/within the open-source community/);
  });
});

describe("Art. 24(2) — cooperation on a reasoned request", () => {
  it("separates holding the documentation from being asked for it", () => {
    const r = assessStewardCooperation({});
    expect(r.outstanding).toBe(false);
    expect(r.message).toMatch(/does not wait for one/);
  });

  it("is outstanding until the documentation is provided", () => {
    const r = assessStewardCooperation({ reasonedRequestReceivedAt: "2027-03-01" });
    expect(r.outstanding).toBe(true);
    expect(r.gaps.join(" ")).toMatch(/paper or electronic form/);
  });

  it("requires a language the authority easily understands", () => {
    const r = assessStewardCooperation({
      reasonedRequestReceivedAt: "2027-03-01",
      documentationProvidedAt: "2027-03-05",
      languageUnderstoodByAuthority: null,
    });
    expect(r.outstanding).toBe(true);
    expect(r.gaps.join(" ")).toMatch(/easily understood by that authority/);
  });

  it("closes when provided in an understood language", () => {
    const r = assessStewardCooperation({
      reasonedRequestReceivedAt: "2027-03-01",
      documentationProvidedAt: "2027-03-05",
      languageUnderstoodByAuthority: true,
    });
    expect(r.outstanding).toBe(false);
  });
});

describe("Art. 24(3) — the reporting duties the plan missed", () => {
  /** Two limbs, conditional on different things, answered separately. */
  it("applies Article 14(1) only where the steward develops the product", () => {
    const yes = assessStewardReporting({ involvedInDevelopment: true });
    expect(yes.article14_1Applies).toBe(true);
    expect(yes.message).toMatch(/Article 14\(1\) APPLIES/);

    const no = assessStewardReporting({ involvedInDevelopment: false });
    expect(no.article14_1Applies).toBe(false);
    expect(no.message).toMatch(/only to the extent you are involved in the development/);
  });

  it("applies Article 14(3) and (8) only for incidents on systems the steward provides", () => {
    const yes = assessStewardReporting({ incidentAffectsStewardProvidedSystems: true });
    expect(yes.article14_3and8Apply).toBe(true);
    expect(yes.message).toMatch(/Article 14\(3\) and \(8\) APPLY/);
  });

  /** A steward can be inside one limb and outside the other. */
  it("lets the two limbs disagree", () => {
    const r = assessStewardReporting({
      involvedInDevelopment: true,
      incidentAffectsStewardProvidedSystems: false,
    });
    expect(r.article14_1Applies).toBe(true);
    expect(r.article14_3and8Apply).toBe(false);
  });

  it("reports each limb as unknown rather than guessing", () => {
    const r = assessStewardReporting({});
    expect(r.article14_1Applies).toBeNull();
    expect(r.article14_3and8Apply).toBeNull();
    expect(r.message).toMatch(/has not been recorded/);
  });
});

describe("the two things everyone gets wrong, in opposite directions", () => {
  const pos = stewardLegalPosition();

  /** Art. 64(10)(b) removes the fines. It does not remove the duties. */
  it("states the fine exemption without implying the obligations vanish", () => {
    expect(pos.fines.citation).toBe("Article 64(10)(b)");
    expect(pos.fines.statement).toMatch(/exempts open-source software stewards from the administrative fines/);
    expect(pos.fines.statement).toMatch(/still bind you/);
    expect(pos.fines.statement).toMatch(/withdrawal, recall/);
  });

  /** Art. 25 is an empowerment, not a programme. */
  it("does not present an Article 25 attestation as available", () => {
    expect(pos.attestation.available).toBe(false);
    expect(pos.attestation.statement).toMatch(/Empowerment is not enactment/);
    expect(pos.attestation.statement).toMatch(/no such programme exists/i);
  });

  it("says plainly that a steward has no CE marking or declaration of conformity", () => {
    expect(pos.obligations.statement).toMatch(/no CE marking, no EU declaration of conformity/);
  });

  /**
   * The honesty gate matches "is/are exempt from". Describing a real statutory
   * exemption with the ARTICLE as the subject must not trip it, or every
   * correct statement of the law would need a waiver.
   */
  it("phrases the exemption so it reads as describing the law, not granting it", () => {
    const GRANTS = /\b(is|are|you are) exempt from\b|exemption (?:is )?granted|safe harbou?r/i;
    for (const v of Object.values(pos)) {
      expect(v.statement, v.statement).not.toMatch(GRANTS);
    }
  });
});
