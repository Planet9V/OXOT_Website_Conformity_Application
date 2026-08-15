/**
 * The VERIFICATION shape — importers (Art. 19) and distributors (Art. 20).
 *
 * `DESIGN_five_shapes.md` calls this a different shape from the manufacturer's,
 * and the articles bear that out: the manufacturer CREATES conformity, these two
 * CHECK someone else's. But they are also different from each other, and the app
 * previously conflated them into one "importer/distributor" persona. Four
 * differences make that untenable:
 *
 * 1. THE STANDARD.
 *    Art. 19(2) — importers "shall ENSURE" four things before placing.
 *    Art. 20(1) — distributors "shall act with DUE CARE", and 20(2) has them
 *    "verify" two things. Ensuring and acting with due care are not the same
 *    duty, and the shorter list is not an oversight.
 *
 * 2. THE TRIGGER.
 *    Importer: before PLACING ON THE MARKET (Art. 3(21), the first making
 *    available). Distributor: before MAKING AVAILABLE (Art. 3(22)). A
 *    distributor's duty bites on every onward supply, not once.
 *
 * 3. THE KNOWLEDGE STANDARD, and this is the one most easily missed.
 *    Art. 19(3): "considers or has reason to believe" — unqualified.
 *    Art. 20(3): "considers or has reason to believe, ON THE BASIS OF
 *    INFORMATION IN ITS POSSESSION".
 *    A distributor is judged on what it actually holds; an importer on what it
 *    should have ensured. Applying the importer's standard to a distributor
 *    invents a duty to investigate that Art. 20 does not impose.
 *
 * 4. RETENTION.
 *    Art. 19(6) gives importers a ten-year duty. Article 20 has NO retention
 *    paragraph. A distributor's only retention is Art. 23(2) traceability — a
 *    flat ten years from supply events, no support-period limb. Handing
 *    distributors the importer's clock would be inventing an obligation.
 *
 * One more asymmetry worth stating: Art. 19(4) requires the importer to put its
 * OWN name and contact details on the product. Distributors have no equivalent.
 */

export type OperatorRole = "importer" | "distributor";

/** Tri-state throughout: unanswered is never "verified". */
type Tri = boolean | null | undefined;

export interface ImporterVerificationInput {
  /** 19(2)(a) — Art. 32 conformity assessment carried out by the manufacturer. */
  conformityAssessmentCarriedOut?: Tri;
  /** 19(2)(b) — the manufacturer drew up the technical documentation. */
  technicalDocumentationDrawnUp?: Tri;
  /** 19(2)(c) — CE marking present. */
  ceMarkingPresent?: Tri;
  /** 19(2)(c) — accompanied by the EU declaration of conformity. */
  euDeclarationAccompanies?: Tri;
  /** 19(2)(c) — Annex II information, in a language easily understood. */
  userInformationPresent?: Tri;
  userInformationLanguageUnderstood?: Tri;
  /** 19(2)(d) — manufacturer complied with Art. 13(15), (16) and (19). */
  manufacturerIdentificationComplied?: Tri;
  /** 19(2) final subparagraph — the importer can produce the proving documents. */
  canProvideProvingDocuments?: Tri;
  /** 19(4) — the importer's own contact details on the product or packaging. */
  ownContactDetailsAffixed?: Tri;
}

export interface DistributorVerificationInput {
  /** 20(2)(a) — CE marking present. */
  ceMarkingPresent?: Tri;
  /**
   * 20(2)(b) — the manufacturer AND the importer complied with Art. 13(15),
   * (16), (18), (19) and (20) and Art. 19(4), and provided all necessary
   * documents to the distributor.
   */
  upstreamObligationsComplied?: Tri;
  necessaryDocumentsProvided?: Tri;
}

export interface VerificationAssessment {
  role: OperatorRole;
  /** The act the duty attaches to. */
  trigger: "placing_on_the_market" | "making_available_on_the_market";
  standard: string;
  cleared: boolean;
  gaps: string[];
  citations: string[];
  message: string;
}

const unverified = (v: Tri) => v !== true;

/** Art. 19(2) — four checks, before PLACING on the market. */
export function assessImporterVerification(
  input: ImporterVerificationInput,
): VerificationAssessment {
  const gaps: string[] = [];

  if (unverified(input.conformityAssessmentCarriedOut))
    gaps.push("Article 19(2)(a): that the appropriate conformity assessment procedures under Article 32 have been carried out by the manufacturer.");
  if (unverified(input.technicalDocumentationDrawnUp))
    gaps.push("Article 19(2)(b): that the manufacturer has drawn up the technical documentation.");
  if (unverified(input.ceMarkingPresent))
    gaps.push("Article 19(2)(c): that the product bears the CE marking.");
  if (unverified(input.euDeclarationAccompanies))
    gaps.push("Article 19(2)(c): that the product is accompanied by the EU declaration of conformity.");
  if (unverified(input.userInformationPresent))
    gaps.push("Article 19(2)(c): that the Annex II information and instructions accompany the product.");
  if (unverified(input.userInformationLanguageUnderstood))
    gaps.push("Article 19(2)(c): that those instructions are in a language which can be easily understood by users and market surveillance authorities.");
  if (unverified(input.manufacturerIdentificationComplied))
    gaps.push("Article 19(2)(d): that the manufacturer has complied with Article 13(15), (16) and (19).");
  if (unverified(input.canProvideProvingDocuments))
    gaps.push("Article 19(2), final subparagraph: that you can provide the documents proving these requirements are fulfilled.");
  // 19(4) is a duty in its own right, not a precondition to placing.
  if (unverified(input.ownContactDetailsAffixed))
    gaps.push("Article 19(4): your own name and contact details on the product, its packaging or an accompanying document, in a language easily understood.");

  const cleared = gaps.length === 0;
  return {
    role: "importer",
    trigger: "placing_on_the_market",
    standard: "Article 19(2): importers shall ENSURE these before placing the product on the market.",
    cleared,
    gaps,
    citations: ["Article 19(2)", "Article 19(4)", "Article 32", "Article 30", "Annex II"],
    message: cleared
      ? "Every Article 19(2) check is verified, and your contact details are affixed under Article 19(4)."
      : `Not cleared to place on the market. To complete: ${gaps.join(" ")}`,
  };
}

/** Art. 20(2) — two checks, before MAKING AVAILABLE on the market. */
export function assessDistributorVerification(
  input: DistributorVerificationInput,
): VerificationAssessment {
  const gaps: string[] = [];

  if (unverified(input.ceMarkingPresent))
    gaps.push("Article 20(2)(a): that the product bears the CE marking.");
  if (unverified(input.upstreamObligationsComplied))
    gaps.push("Article 20(2)(b): that the manufacturer and the importer have complied with Article 13(15), (16), (18), (19) and (20) and Article 19(4).");
  if (unverified(input.necessaryDocumentsProvided))
    gaps.push("Article 20(2)(b): that they have provided all necessary documents to you.");

  const cleared = gaps.length === 0;
  return {
    role: "distributor",
    trigger: "making_available_on_the_market",
    standard:
      "Article 20(1): distributors shall act with DUE CARE. Article 20(2) requires verification of these before making the product available — a narrower list than the importer's, and deliberately so.",
    cleared,
    gaps,
    citations: ["Article 20(1)", "Article 20(2)"],
    message: cleared
      ? "Both Article 20(2) checks are verified."
      : `Not cleared to make available. To complete: ${gaps.join(" ")}`,
  };
}

export interface DutyToRefrainInput {
  role: OperatorRole;
  /** Do you consider, or have reason to believe, that it is non-conforming? */
  believesNonConforming?: Tri;
  /**
   * Art. 20(3) qualifies the distributor's belief with "on the basis of
   * information in its possession". Recorded so the narrower standard is
   * visible rather than assumed away.
   */
  basedOnInformationInPossession?: Tri;
  /** Does it present a significant cybersecurity risk? */
  significantCybersecurityRisk?: Tri;
  /** Art. 19(3), 2nd subpara — importers only: non-technical risk factors. */
  significantRiskFromNonTechnicalFactors?: Tri;
  manufacturerInformedAt?: string | null;
  marketSurveillanceInformedAt?: string | null;
  broughtIntoConformityAt?: string | null;
}

export interface DutyToRefrainAssessment {
  role: OperatorRole;
  /** True while the operator must not place / make available. */
  held: boolean;
  blockedAction: "placing_on_the_market" | "making_available_on_the_market" | null;
  gaps: string[];
  citations: string[];
  message: string;
}

/**
 * Arts. 19(3) and 20(3) — the duty to refrain.
 *
 * The verdict is deliberately the plain-English one: while you believe it is
 * non-conforming, you must NOT put it on the market. An earlier version of this
 * screener in the app had the verdict inverted.
 */
export function assessDutyToRefrain(input: DutyToRefrainInput): DutyToRefrainAssessment {
  const isImporter = input.role === "importer";
  const citations = isImporter ? ["Article 19(3)"] : ["Article 20(3)"];
  const blockedAction = isImporter
    ? ("placing_on_the_market" as const)
    : ("making_available_on_the_market" as const);
  const gaps: string[] = [];

  if (input.believesNonConforming !== true) {
    return {
      role: input.role,
      held: false,
      blockedAction: null,
      gaps: input.believesNonConforming == null
        ? ["Whether you consider, or have reason to believe, the product is non-conforming has not been recorded."]
        : [],
      citations,
      message:
        input.believesNonConforming == null
          ? "No determination recorded. This is not a finding that the product may be supplied."
          : `No belief of non-conformity is recorded, so Article ${isImporter ? "19(3)" : "20(3)"} does not currently hold the product.`,
    };
  }

  // The distributor's narrower standard.
  if (!isImporter && input.basedOnInformationInPossession !== true) {
    gaps.push(
      "Article 20(3) qualifies the belief as being 'on the basis of information in its possession'. Record what you actually hold that grounds it — a distributor is judged on the information it has, not on what it might have discovered.",
    );
  }

  if (input.significantCybersecurityRisk === true) {
    if (!input.manufacturerInformedAt)
      gaps.push(`Article ${isImporter ? "19(3)" : "20(3)"}: where the product presents a significant cybersecurity risk, inform the manufacturer.`);
    if (!input.marketSurveillanceInformedAt)
      gaps.push(`Article ${isImporter ? "19(3)" : "20(3)"}: and inform the market surveillance authorities.`);
    if (!isImporter && input.manufacturerInformedAt && input.marketSurveillanceInformedAt) {
      // 20(3) adds a timeliness qualifier the importer's paragraph does not.
      gaps.push("");
    }
  }

  /** Art. 19(3), second subparagraph — importers only. */
  if (isImporter && input.significantRiskFromNonTechnicalFactors === true) {
    citations.push("Article 54(2)");
    if (!input.marketSurveillanceInformedAt) {
      gaps.push(
        "Article 19(3), second subparagraph: where you have reason to believe the product may present a significant cybersecurity risk in light of NON-TECHNICAL risk factors, inform the market surveillance authorities. They then follow the Article 54(2) procedure.",
      );
    }
  }

  const released = Boolean(input.broughtIntoConformityAt);
  const cleanGaps = gaps.filter(Boolean);

  return {
    role: input.role,
    held: !released,
    blockedAction: released ? null : blockedAction,
    gaps: cleanGaps,
    citations,
    message: released
      ? `Brought into conformity on ${input.broughtIntoConformityAt}. The Article ${isImporter ? "19(3)" : "20(3)"} hold is lifted.`
      : `HELD. Article ${isImporter ? "19(3)" : "20(3)"}: you must not ${isImporter ? "place this product on the market" : "make this product available on the market"} until it, or the processes put in place by the manufacturer, have been brought into conformity.` +
        (cleanGaps.length ? ` To complete: ${cleanGaps.join(" ")}` : ""),
  };
}
