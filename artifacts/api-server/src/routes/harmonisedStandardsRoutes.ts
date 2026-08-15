import { Router, type IRouter } from "express";
import { assessPresumption, STANDARD_CITATIONS } from "../lib/presumption";

export const harmonisedStandardsRouter: IRouter = Router();

export interface StandardClauseMapping {
  standard: "IEC_62443_4_2" | "IEC_62443_4_1" | "ETSI_EN_303_645" | "ISO_IEC_27001";
  clauseId: string;
  clauseTitle: string;
  craAnnexIRef: string;
  craStatutoryText: string;
  presumptionLevel: "FULL_PRESUMPTION" | "PARTIAL_PRESUMPTION" | "SUPPORTING_EVIDENCE";
  securityLevelTarget?: "SL1" | "SL2" | "SL3" | "SL4";
}

export const standardClauseMappings: StandardClauseMapping[] = [
  {
    standard: "IEC_62443_4_2",
    clauseId: "CR 1.1",
    clauseTitle: "Human User Identification and Authentication",
    craAnnexIRef: "Annex I Part I (2)",
    craStatutoryText: "Appropriate identification, authentication and access control mechanisms, including multi-factor authentication where appropriate.",
    presumptionLevel: "FULL_PRESUMPTION",
    securityLevelTarget: "SL2",
  },
  {
    standard: "IEC_62443_4_2",
    clauseId: "CR 1.2",
    clauseTitle: "Software Process and Device Identification",
    craAnnexIRef: "Annex I Part I (2)",
    craStatutoryText: "Ensure device authentication and mutual verification across machine-to-machine interfaces.",
    presumptionLevel: "FULL_PRESUMPTION",
    securityLevelTarget: "SL2",
  },
  {
    standard: "IEC_62443_4_2",
    clauseId: "CR 1.5",
    clauseTitle: "Authenticator Management & Password Complexity",
    craAnnexIRef: "Annex I Part I (1)",
    craStatutoryText: "Delivered without known exploitable vulnerabilities and with secure default configuration, prohibiting default unchangeable passwords.",
    presumptionLevel: "FULL_PRESUMPTION",
    securityLevelTarget: "SL1",
  },
  {
    standard: "IEC_62443_4_2",
    clauseId: "CR 2.1",
    clauseTitle: "Authorization Enforcement & Least Privilege",
    craAnnexIRef: "Annex I Part I (3)",
    craStatutoryText: "Enforce least privilege principles, access rights limitation, and role-based segregation.",
    presumptionLevel: "FULL_PRESUMPTION",
    securityLevelTarget: "SL2",
  },
  {
    standard: "IEC_62443_4_2",
    clauseId: "CR 3.14",
    clauseTitle: "Data Integrity & Cryptographic Signatures",
    craAnnexIRef: "Annex I Part I (5)",
    craStatutoryText: "Protect the integrity of stored, transmitted or otherwise processed data against unauthorized modification or deletion.",
    presumptionLevel: "FULL_PRESUMPTION",
    securityLevelTarget: "SL2",
  },
  {
    standard: "IEC_62443_4_2",
    clauseId: "CR 4.1",
    clauseTitle: "Information Confidentiality & Encryption in Transit",
    craAnnexIRef: "Annex I Part I (4)",
    craStatutoryText: "Protect the confidentiality of stored, transmitted or otherwise processed personal and operational data using state-of-the-art cryptography.",
    presumptionLevel: "FULL_PRESUMPTION",
    securityLevelTarget: "SL2",
  },
  {
    standard: "IEC_62443_4_2",
    clauseId: "CR 7.1",
    clauseTitle: "Denial of Service Protection & Rate Limiting",
    craAnnexIRef: "Annex I Part I (7)",
    craStatutoryText: "Design resilience against denial-of-service attacks, resource exhaustion, and packet flooding.",
    presumptionLevel: "FULL_PRESUMPTION",
    securityLevelTarget: "SL2",
  },
  {
    standard: "IEC_62443_4_1",
    clauseId: "SD-1 / SM-8",
    clauseTitle: "Secure by Design Lifecycle & Threat Modeling",
    craAnnexIRef: "Annex I Part I (1)",
    craStatutoryText: "Design, develop and produce products based on a comprehensive cybersecurity risk assessment.",
    presumptionLevel: "FULL_PRESUMPTION",
  },
  {
    standard: "IEC_62443_4_1",
    clauseId: "SVV-1",
    clauseTitle: "Security Verification & Independent Penetration Testing",
    craAnnexIRef: "Annex I Part II (3)",
    craStatutoryText: "Regularly test and review security of the product using automated tools and manual penetration testing.",
    presumptionLevel: "FULL_PRESUMPTION",
  },
  {
    standard: "IEC_62443_4_1",
    clauseId: "DM-1 / DM-4",
    clauseTitle: "Vulnerability Management & Coordinated Disclosure (CVD)",
    craAnnexIRef: "Annex I Part II (1) & (5)",
    craStatutoryText: "Put in place a coordinated vulnerability disclosure policy and address vulnerabilities without delay via free security updates.",
    presumptionLevel: "FULL_PRESUMPTION",
  },
  {
    standard: "ETSI_EN_303_645",
    clauseId: "Provision 5.1-1",
    clauseTitle: "No Default Universal Passwords",
    craAnnexIRef: "Annex I Part I (1)",
    craStatutoryText: "Prohibit default universal passwords and require unique pre-shared keys.",
    presumptionLevel: "FULL_PRESUMPTION",
  },
  {
    standard: "ETSI_EN_303_645",
    clauseId: "Provision 5.3-13",
    clauseTitle: "Published Defined Support Period (Minimum 5 Years)",
    craAnnexIRef: "Article 10(6) & Annex II (8)",
    craStatutoryText: "Explicitly declare and publish the defined security support period.",
    presumptionLevel: "FULL_PRESUMPTION",
  },
];

/**
 * GET /api/standards/matrix
 * Returns all harmonised standards clause mappings and their CRA Annex I presumption equivalents.
 */
harmonisedStandardsRouter.get("/matrix", (_req, res) => {
  /**
   * The presumption position for the standards this matrix maps, derived from
   * the citation register rather than asserted. Sent with the matrix so the
   * client never has to infer a legal status from a coverage percentage.
   */
  const presumption = assessPresumption({
    claimedStandards: Array.from(new Set(standardClauseMappings.map((m) => m.standard))),
  });

  res.json({
    totalMappings: standardClauseMappings.length,
    statutoryBasis: "Regulation (EU) 2024/2847 Article 27 (Presumption of Conformity)",
    mappings: standardClauseMappings,
    presumption: {
      available: presumption.presumptionAvailable,
      basis: presumption.basis,
      citation: presumption.citation,
      coversAnnexI: presumption.coversAnnexI,
      message: presumption.message,
      evidenceOnly: presumption.evidenceOnly,
    },
    /** What was checked, when, and against what — so the claim is auditable. */
    citationRegister: STANDARD_CITATIONS.map((s) => ({
      standard: s.key,
      title: s.title,
      craOjReference: s.craOjReference,
      verifiedOn: s.verifiedOn,
      note: s.note,
    })),
  });
});

/**
 * POST /api/standards/evaluate-presumption
 * Calculates the automated CRA Annex I Presumption score based on verified standard clauses.
 */
harmonisedStandardsRouter.post("/evaluate-presumption", (req, res) => {
  const verifiedClauses: string[] = Array.isArray(req.body?.verifiedClauses)
    ? req.body.verifiedClauses
    : [];
  const targetStandard = typeof req.body?.targetStandard === "string"
    ? req.body.targetStandard
    : undefined;

  const filteredMappings = targetStandard
    ? standardClauseMappings.filter((m) => m.standard === targetStandard)
    : standardClauseMappings;

  const totalPossible = filteredMappings.length;
  const matched = filteredMappings.filter((m) => verifiedClauses.includes(m.clauseId));
  const verifiedCount = matched.length;
  const presumptionScore = totalPossible > 0 ? Math.round((verifiedCount / totalPossible) * 100) : 0;

  const coveredAnnexIReqs = Array.from(new Set(matched.map((m) => m.craAnnexIRef)));

  /**
   * Coverage against a standard's clauses is real, useful information — it is
   * how a manufacturer shows in Annex VII that it has addressed each Annex I
   * requirement. What it is NOT is a presumption of conformity. That is granted
   * by Art. 27 alone, and only where a reference has been published in the OJEU,
   * a common specification adopted, or a European cybersecurity certificate
   * issued. A percentage cannot substitute for any of those.
   *
   * honesty-ok: describes the false claim this code removed; it does not make it.
   * This endpoint previously returned FULL_STATUTORY_PRESUMPTION_ARTICLE_34 once
   * the score passed 95%. Article 34 is not the presumption article, and the
   * claim itself was false for every product: no CRA harmonised standard has
   * been cited. Acting on it — self-assessing an important Class I product on
   * the strength of a score — would have been a breach of Art. 32(2).
   */
  const presumption = assessPresumption({
    claimedStandards: Array.from(new Set(matched.map((m) => m.standard))),
  });

  res.json({
    clauseCoverageScore: presumptionScore,
    verifiedCount,
    totalPossible,
    coveredAnnexIRequirements: coveredAnnexIReqs,
    presumption: {
      available: presumption.presumptionAvailable,
      basis: presumption.basis,
      citation: presumption.citation,
      coversAnnexI: presumption.coversAnnexI,
      message: presumption.message,
      evidenceOnly: presumption.evidenceOnly,
    },
    /**
     * What clause coverage actually buys you, stated without overclaiming.
     */
    effect:
      "Clause coverage is evidence towards the Annex VII technical documentation. It demonstrates how each Annex I essential requirement has been addressed; it does not confer a presumption of conformity.",
    recommendations: filteredMappings
      .filter((m) => !verifiedClauses.includes(m.clauseId))
      .map(
        (m) =>
          `Evidence ${m.standard} ${m.clauseId} (${m.clauseTitle}) to support ${m.craAnnexIRef} in the technical documentation.`,
      ),
  });
});
