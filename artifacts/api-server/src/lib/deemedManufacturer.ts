/**
 * Articles 21 and 22 — when someone else becomes the manufacturer.
 *
 * This is not a persona. It is a STATE TRANSITION: the moment it fires, the
 * actor acquires the Article 13 and 14 obligations that Phase 1 implements.
 *
 * Art. 21  "An importer or distributor shall be considered to be a manufacturer
 *          ... and shall be subject to Articles 13 and 14, where that importer
 *          or distributor places a product with digital elements on the market
 *          under its name or trademark OR carries out a substantial
 *          modification of a product with digital elements already placed on
 *          the market."
 *
 * Art. 22(1) "A natural or legal person, OTHER THAN the manufacturer, the
 *          importer or the distributor, that carries out a substantial
 *          modification ... AND makes that product available on the market,
 *          shall be considered to be a manufacturer."
 *
 * Art. 22(2) "... shall be subject to the obligations set out in Articles 13
 *          and 14 FOR THE PART of the product affected by the substantial
 *          modification or, if the substantial modification has an impact on
 *          the cybersecurity of the product as a whole, FOR THE ENTIRE
 *          product."
 *
 * Three differences that a single "substantial modification?" wizard gets wrong:
 *
 *   1. WHO decides which article applies. Art. 21 is for importers and
 *      distributors; Art. 22 is expressly for anyone else. A system integrator
 *      is normally an "other person" under Art. 22, not Art. 21.
 *   2. Art. 21 has a SECOND trigger with nothing to do with modification —
 *      putting your own name or trademark on the product. Rebranding alone
 *      makes you the manufacturer.
 *   3. Art. 22 obligations are SCOPED to the affected part unless cybersecurity
 *      is affected product-wide. Art. 21 carries no such limit. Treating them
 *      alike either overstates or understates the duty.
 *
 * "Substantial modification" is defined, and the definition is dispositive —
 * Art. 3(30): "a change to the product with digital elements FOLLOWING ITS
 * PLACING ON THE MARKET, which affects the compliance of the product with the
 * essential cybersecurity requirements set out in Part I of Annex I OR which
 * results in a modification to the intended purpose for which the product has
 * been assessed". Two limbs joined by OR, both gated on the change coming after
 * placing on the market.
 *
 * What this module does NOT do is grant anything. There is no safe harbour here
 * to hand out. The engine this replaces cited "Recital 34" as a "full statutory
 * safe harbor for industrial system integrators"; Recital 34 is about a
 * MANUFACTURER'S due diligence over third-party components and confers nothing
 * on anyone. A determination that the transition did not fire is a finding about
 * the facts supplied, not an exemption issued by this application.
 */

export type ActorRole = "importer" | "distributor" | "other_person" | "manufacturer";

export type ObligationScope = "entire_product" | "affected_part";

export interface DeemedManufacturerInput {
  actorRole: ActorRole;
  /** Art. 21, first limb: placed on the market under the actor's own name or trademark. */
  placedUnderOwnNameOrTrademark?: boolean | null;
  /** Whether any change was made to the product at all. */
  modificationMade?: boolean | null;
  /** Art. 3(30) gate: the change came AFTER the product was placed on the market. */
  changeFollowsPlacingOnMarket?: boolean | null;
  /** Art. 3(30), first limb. */
  affectsAnnexIPartICompliance?: boolean | null;
  /** Art. 3(30), second limb. */
  modifiesAssessedIntendedPurpose?: boolean | null;
  /** Art. 22(2): does the modification affect the cybersecurity of the whole product? */
  cybersecurityImpactIsProductWide?: boolean | null;
  /** Art. 22(1): dispositive for an "other person" — was it made available on the market? */
  makesAvailableOnMarket?: boolean | null;
}

export interface DeemedManufacturerAssessment {
  /** null where the facts supplied cannot answer it. Never defaulted to false. */
  isSubstantialModification: boolean | null;
  deemedManufacturer: boolean;
  /** Which article effects the transition, or null where none does. */
  governingArticle: "Article 21" | "Article 22" | null;
  /** Which limb fired, in the regulation's own words. */
  trigger: string | null;
  obligationScope: ObligationScope | null;
  /** The obligations acquired. Always Arts. 13 and 14 when the transition fires. */
  obligations: string[];
  /** Facts still needed before a determination can be made. */
  unanswered: string[];
  citations: string[];
  message: string;
}

/** Art. 3(30). Returns null where a limb has not been answered. */
function substantialModification(input: DeemedManufacturerInput): {
  result: boolean | null;
  unanswered: string[];
} {
  const unanswered: string[] = [];

  if (input.modificationMade !== true) {
    // No change at all means no substantial modification. This is a finding on
    // the facts, not an exemption.
    if (input.modificationMade === false) return { result: false, unanswered };
    unanswered.push("Article 3(30): whether any change was made to the product.");
    return { result: null, unanswered };
  }

  if (input.changeFollowsPlacingOnMarket == null) {
    unanswered.push(
      "Article 3(30): whether the change came after the product was placed on the market. A change made before that is part of manufacturing it, not a substantial modification of it.",
    );
  } else if (input.changeFollowsPlacingOnMarket === false) {
    return { result: false, unanswered };
  }

  const affects = input.affectsAnnexIPartICompliance;
  const purpose = input.modifiesAssessedIntendedPurpose;

  // Either limb is sufficient, so one confirmed "yes" settles it even if the
  // other is unknown.
  if (affects === true || purpose === true) {
    return { result: unanswered.length ? null : true, unanswered };
  }
  if (affects == null) {
    unanswered.push(
      "Article 3(30): whether the change affects compliance with the essential cybersecurity requirements in Part I of Annex I.",
    );
  }
  if (purpose == null) {
    unanswered.push(
      "Article 3(30): whether the change modifies the intended purpose for which the product was assessed.",
    );
  }
  if (unanswered.length) return { result: null, unanswered };
  return { result: false, unanswered };
}

export function assessDeemedManufacturer(
  input: DeemedManufacturerInput,
): DeemedManufacturerAssessment {
  const citations = ["Article 3(30)"];
  const { result: isSubstantial, unanswered } = substantialModification(input);

  const none = (message: string, extraUnanswered: string[] = []): DeemedManufacturerAssessment => ({
    isSubstantialModification: isSubstantial,
    deemedManufacturer: false,
    governingArticle: null,
    trigger: null,
    obligationScope: null,
    obligations: [],
    unanswered: [...unanswered, ...extraUnanswered],
    citations,
    message,
  });

  // A manufacturer is already the manufacturer; neither article transfers
  // anything to them.
  if (input.actorRole === "manufacturer") {
    return none(
      "You are already the manufacturer. Articles 21 and 22 transfer manufacturer obligations to someone else; they do not apply to you.",
    );
  }

  if (input.actorRole === "importer" || input.actorRole === "distributor") {
    citations.push("Article 21");

    // Art. 21, first limb — rebranding. Independent of any modification.
    if (input.placedUnderOwnNameOrTrademark === true) {
      return {
        isSubstantialModification: isSubstantial,
        deemedManufacturer: true,
        governingArticle: "Article 21",
        trigger:
          "placing the product on the market under your own name or trademark",
        // Art. 21 carries no scope limitation.
        obligationScope: "entire_product",
        obligations: ["Article 13", "Article 14"],
        unanswered: [],
        citations,
        message:
          "Article 21: an importer or distributor who places a product on the market under its own name or trademark is considered to be the manufacturer and is subject to Articles 13 and 14 in full. This applies whether or not the product was modified.",
      };
    }

    if (isSubstantial === true) {
      return {
        isSubstantialModification: true,
        deemedManufacturer: true,
        governingArticle: "Article 21",
        trigger:
          "carrying out a substantial modification of a product already placed on the market",
        obligationScope: "entire_product",
        obligations: ["Article 13", "Article 14"],
        unanswered: [],
        citations,
        message:
          "Article 21: an importer or distributor who carries out a substantial modification of a product already placed on the market is considered to be the manufacturer and is subject to Articles 13 and 14 in full.",
      };
    }

    if (isSubstantial === null) {
      return none(
        "Cannot determine whether Article 21 applies until the substantial-modification questions are answered.",
        input.placedUnderOwnNameOrTrademark == null
          ? ["Article 21: whether the product is placed on the market under your own name or trademark."]
          : [],
      );
    }

    return none(
      "Article 21 does not apply on these facts: the product is not placed on the market under your own name or trademark, and no substantial modification was carried out. This records what was assessed; it is not an exemption.",
    );
  }

  // Art. 22 — any other person.
  citations.push("Article 22");

  if (isSubstantial === null) {
    return none(
      "Cannot determine whether Article 22 applies until the substantial-modification questions are answered.",
      input.makesAvailableOnMarket == null
        ? ["Article 22(1): whether you make the modified product available on the market."]
        : [],
    );
  }

  if (isSubstantial === false) {
    return none(
      "Article 22 does not apply on these facts: no substantial modification was carried out. This records what was assessed; it is not an exemption.",
    );
  }

  // Substantial modification confirmed. Making available is dispositive, and is
  // the question the previous wizard never asked.
  if (input.makesAvailableOnMarket == null) {
    return none(
      "A substantial modification was carried out, but Article 22(1) also requires that you make the product available on the market. That question has not been answered, so no determination can be made.",
      ["Article 22(1): whether you make the modified product available on the market."],
    );
  }

  if (input.makesAvailableOnMarket === false) {
    return none(
      "Article 22(1) requires BOTH a substantial modification AND making the product available on the market. A substantial modification was carried out, but the product is not made available on the market, so the transition does not fire. Modifying a product you operate yourself does not make you its manufacturer.",
    );
  }

  // Art. 22(2) scope.
  const productWide = input.cybersecurityImpactIsProductWide;
  if (productWide == null) {
    return {
      isSubstantialModification: true,
      deemedManufacturer: true,
      governingArticle: "Article 22",
      trigger:
        "carrying out a substantial modification and making the product available on the market",
      obligationScope: null,
      obligations: ["Article 13", "Article 14"],
      unanswered: [
        "Article 22(2): whether the modification affects the cybersecurity of the product as a whole. This decides whether the obligations cover only the affected part or the entire product.",
      ],
      citations,
      message:
        "Article 22(1): you are considered to be the manufacturer and are subject to Articles 13 and 14. The SCOPE is not yet determined — Article 22(2) limits the obligations to the part affected by the modification unless the modification affects the cybersecurity of the product as a whole.",
    };
  }

  return {
    isSubstantialModification: true,
    deemedManufacturer: true,
    governingArticle: "Article 22",
    trigger:
      "carrying out a substantial modification and making the product available on the market",
    obligationScope: productWide ? "entire_product" : "affected_part",
    obligations: ["Article 13", "Article 14"],
    unanswered: [],
    citations,
    message: productWide
      ? "Article 22(1) and 22(2): you are considered to be the manufacturer. Because the modification affects the cybersecurity of the product as a whole, the Article 13 and 14 obligations apply to the ENTIRE product."
      : "Article 22(1) and 22(2): you are considered to be the manufacturer. The Article 13 and 14 obligations apply to the PART of the product affected by the substantial modification.",
  };
}
