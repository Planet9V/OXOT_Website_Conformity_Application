/**
 * Article 27 — presumption of conformity.
 *
 * The regulation grants a presumption by exactly three routes, and conformity
 * with a standard is not one of them unless that standard has been through the
 * relevant procedure:
 *
 *   27(1)  harmonised standards "the references of which have been PUBLISHED IN
 *          THE OFFICIAL JOURNAL of the European Union". Publication is the
 *          operative act. A standard that is excellent, widely adopted and
 *          directly on point grants nothing until its reference is cited.
 *   27(5)  common specifications established by Commission implementing acts
 *          under 27(2).
 *   27(8)  an EU statement of conformity or certificate issued under a European
 *          cybersecurity certification scheme adopted under Reg. (EU) 2019/881,
 *          so far as it covers the requirements in question.
 *
 * In every case the presumption extends only to the Annex I requirements
 * "covered by those standards or parts thereof" — never to the product at large.
 *
 * This module previously did not exist, and the standards matrix asserted
 * honesty-ok: describes the false claim this module removed; it does not make it.
 * "FULL_STATUTORY_PRESUMPTION_ARTICLE_34" once a score passed 95%. That was
 * wrong twice over: Article 34 is not the presumption article, and no score
 * computed from IEC 62443 or ETSI clauses can create a presumption that Art. 27
 * makes conditional on OJEU publication. Telling a manufacturer they hold a
 * presumption they do not hold is the most consequential error this application
 * could make — it is the difference between self-assessment being lawful and
 * being a breach of Art. 32(2).
 *
 * Whether a given standard has been cited is a FACT ABOUT THE WORLD that changes
 * when the Commission publishes. It is therefore recorded as dated, sourced data
 * below rather than baked into the logic, so that it can be updated by editing a
 * record instead of by changing behaviour.
 */

export interface StandardCitationRecord {
  key: string;
  title: string;
  /**
   * The OJ reference citing this standard as a harmonised standard FOR THE CRA,
   * or null where no such citation has been published. Being harmonised under
   * some other instrument (e.g. the RED) does not carry over to the CRA.
   */
  craOjReference: string | null;
  /** Which Annex I requirements the citation covers. Empty when not cited. */
  coversAnnexI: string[];
  /** When this record was last checked against the OJEU, and against what. */
  verifiedOn: string;
  source: string;
  note: string;
}

export type PresumptionBasis =
  | "harmonised_standard"
  | "common_specification"
  | "certification_scheme"
  | "none";

export interface PresumptionInput {
  /** Standard keys the manufacturer claims conformity with. */
  claimedStandards?: string[];
  /** Common specifications (Art. 27(5)) claimed, by implementing-act reference. */
  claimedCommonSpecifications?: string[];
  /**
   * A European cybersecurity certificate under Reg. (EU) 2019/881, if held.
   * `assuranceLevel` matters: Art. 27(9) removes the third-party conformity
   * assessment obligation only at 'substantial' or above.
   */
  certificate?: {
    scheme: string;
    assuranceLevel: "basic" | "substantial" | "high";
    coversAnnexI: string[];
  } | null;
}

export interface PresumptionAssessment {
  basis: PresumptionBasis;
  /** True only where Art. 27 actually grants a presumption. */
  presumptionAvailable: boolean;
  /** Annex I requirements the presumption extends to. Never "all". */
  coversAnnexI: string[];
  citation: string;
  /** Standards claimed that grant no presumption, and why. */
  evidenceOnly: { key: string; reason: string }[];
  message: string;
}

/**
 * The citation register.
 *
 * Each entry states what has been published, when it was checked and against
 * what source. An entry with craOjReference === null is a positive, dated
 * finding that no citation existed at that time — not an absence of data.
 */
const CHECKED_ON = "2026-08-15";
const OJEU_SOURCE =
  "Commission harmonised standards portal and the consolidated summary of references published in the OJEU (ec.europa.eu/docsroom/documents/64474), neither of which contains any section for Regulation (EU) 2024/2847; Commission CRA standardisation page (digital-strategy.ec.europa.eu/en/policies/cra-standardisation), which describes standardisation request M/606 but lists no cited standard.";

/**
 * Standardisation request M/606 (Commission Decision C(2025) 618) asks CEN,
 * CENELEC and ETSI for 41 standards supporting the CRA. The ESOs accepted it on
 * 3 April 2025 and are drafting: the horizontal EN 40000 series and the ETSI
 * EN 304 6xx product standards were in or past public enquiry as at the date
 * checked. None had been ratified, assessed by the Commission and cited in the
 * OJEU, which is what Art. 27(1) requires.
 *
 * A null citation here is a finding, not a gap: it is the recorded result of
 * checking the registers on CHECKED_ON. Re-check and update the date rather than
 * assuming it still holds — this is precisely the fact most likely to change
 * before the CRA applies on 11 December 2027.
 */
export const STANDARD_CITATIONS: StandardCitationRecord[] = [
  {
    key: "IEC_62443_4_2",
    title: "IEC 62443-4-2 — Technical security requirements for IACS components",
    craOjReference: null,
    coversAnnexI: [],
    verifiedOn: CHECKED_ON,
    source: OJEU_SOURCE,
    note: "The most likely harmonising basis for OT, and the one this application maps against. Mapping is not citation: until a reference is published in the OJEU, conformity with 62443-4-2 is evidence towards Annex VII, not a presumption.",
  },
  {
    key: "IEC_62443_4_1",
    title: "IEC 62443-4-1 — Secure product development lifecycle requirements",
    craOjReference: null,
    coversAnnexI: [],
    verifiedOn: CHECKED_ON,
    source: OJEU_SOURCE,
    note: "Process standard behind the Annex I Part II vulnerability-handling duties. Not cited for the CRA.",
  },
  {
    key: "ETSI_EN_303_645",
    title: "ETSI EN 303 645 — Cyber security for consumer internet of things",
    craOjReference: null,
    coversAnnexI: [],
    verifiedOn: CHECKED_ON,
    source: OJEU_SOURCE,
    note: "Harmonisation under one instrument does not carry over to another: the standards cited under the Radio Equipment Directive (the EN 18031 series) confer no presumption under the CRA. The CRA's own consumer-IoT standards sit in the ETSI EN 304 6xx series requested by M/606, still in enquiry.",
  },
  {
    key: "ISO_IEC_27001",
    title: "ISO/IEC 27001 — Information security management systems",
    craOjReference: null,
    coversAnnexI: [],
    verifiedOn: CHECKED_ON,
    source: OJEU_SOURCE,
    note: "An organisational management-system standard. It is not a product standard, was not requested under M/606, and cannot be harmonised for Annex I product requirements.",
  },
];

/**
 * Art. 27(5) — common specifications adopted by Commission implementing act.
 * Empty, and checked: no implementing act establishing CRA common specifications
 * has been adopted. Art. 27(2) permits them only where standardisation has
 * failed, and M/606 was accepted and is being delivered.
 */
export const COMMON_SPECIFICATIONS: { reference: string; coversAnnexI: string[] }[] = [];

/** A standard grants a presumption only if it appears here with a citation. */
export function citationFor(
  key: string,
  register: StandardCitationRecord[] = STANDARD_CITATIONS,
): StandardCitationRecord | undefined {
  return register.find((s) => s.key === key);
}

/**
 * `register` is injectable so that tests pin the RULE rather than today's facts.
 * A test asserting "no presumption is available" against the live register would
 * start failing the day the Commission publishes a citation — reporting a
 * correct change in the world as a broken build.
 */
export function assessPresumption(
  input: PresumptionInput,
  register: StandardCitationRecord[] = STANDARD_CITATIONS,
): PresumptionAssessment {
  const evidenceOnly: { key: string; reason: string }[] = [];
  const covered = new Set<string>();
  let basis: PresumptionBasis = "none";

  // 27(1) — harmonised standards cited in the OJEU.
  for (const key of input.claimedStandards ?? []) {
    const record = citationFor(key, register);
    if (record?.craOjReference) {
      basis = "harmonised_standard";
      for (const r of record.coversAnnexI) covered.add(r);
    } else {
      evidenceOnly.push({
        key,
        reason: record
          ? `No reference to ${record.title} has been published in the Official Journal as a harmonised standard for Regulation (EU) 2024/2847 (checked ${record.verifiedOn}). Conformity with it is supporting evidence under Annex VII, not a presumption under Article 27(1).`
          : `${key} is not in the citation register, so no presumption can be derived from it. Article 27(1) requires publication of the reference in the Official Journal.`,
      });
    }
  }

  // 27(5) — common specifications.
  for (const spec of input.claimedCommonSpecifications ?? []) {
    basis = basis === "none" ? "common_specification" : basis;
    covered.add(spec);
  }

  // 27(8) — European cybersecurity certification scheme.
  if (input.certificate) {
    if (basis === "none") basis = "certification_scheme";
    for (const r of input.certificate.coversAnnexI) covered.add(r);
  }

  const presumptionAvailable = basis !== "none";
  const coversAnnexI = [...covered].sort();

  const message = presumptionAvailable
    ? `A presumption of conformity applies under Article 27 for the Annex I requirements covered: ${coversAnnexI.join(", ")}. It does not extend to any other requirement.`
    : "No presumption of conformity is available. Article 27(1) grants it only where the reference to a harmonised standard has been published in the Official Journal; Article 27(5) and 27(8) require a common specification or a European cybersecurity certificate. Conformity with an uncited standard is evidence towards Annex VII, and each Annex I requirement must still be demonstrated on its own merits.";

  return {
    basis,
    presumptionAvailable,
    coversAnnexI,
    citation: "Article 27",
    evidenceOnly,
    message,
  };
}
