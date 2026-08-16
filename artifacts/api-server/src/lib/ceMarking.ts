import { ceMarkingCarriesNotifiedBodyNumber, type ConformityModule } from "./notifiedBody";

/**
 * CE marking — CRA Arts. 29/30, derivation only.
 *
 * This module states what the RECORD shows against what Art. 30 requires.
 * It never says "you may affix the CE marking": affixing follows a valid
 * conformity assessment (Art. 32), and whether that assessment is valid is
 * the manufacturer's or the notified body's call, not this application's.
 * What it CAN derive:
 *
 *   - the EU declaration of conformity exists and is signed (Art. 28 — the
 *     document the marking travels with, per Art. 30(1) second sentence);
 *   - the product's placing-on-the-market date versus Art. 30(3): the CE
 *     marking shall be affixed BEFORE placing on the market — a recorded
 *     placing with no signed DoC is a gap the record itself proves;
 *   - Art. 30(4): the notified body's identification number follows the CE
 *     marking IF AND ONLY IF the module-H procedure is used — both the
 *     missing number under module H and a number present on any other route
 *     are defects.
 *
 * Physical facts (visibly, legibly, indelibly; the 5 mm height rule) are
 * not derivable from data and are listed as requirements, never assumed.
 */

export interface CeMarkingInput {
  euDocGenerated: boolean;
  euDocSigned: boolean;
  /** ISO date or null — null means not yet placed on the market. */
  placedOnMarketDate: string | null;
  /** The open notified-body module, where one exists. */
  nbModule: ConformityModule | null;
  nbCertificateCleared: boolean | null;
}

export interface CeMarkingAssessment {
  requirements: { citation: string; text: string; state: "met" | "gap" | "not_derivable" }[];
  nbNumberMustFollowMarking: boolean | null;
  gaps: string[];
  citations: string[];
}

export function assessCeMarking(input: CeMarkingInput): CeMarkingAssessment {
  const gaps: string[] = [];
  const requirements: CeMarkingAssessment["requirements"] = [];
  const citations = ["Article 29", "Article 30"];

  // Art. 28 / Art. 30(1): the DoC the marking accompanies.
  if (!input.euDocGenerated) {
    gaps.push(
      "No EU declaration of conformity has been generated (Article 28). The CE marking accompanies that declaration; there is nothing for it to accompany.",
    );
    requirements.push({
      citation: "Article 28",
      text: "EU declaration of conformity drawn up",
      state: "gap",
    });
  } else if (!input.euDocSigned) {
    gaps.push(
      "The EU declaration of conformity is generated but not signed (Article 28, Annex V: signed for and on behalf of the manufacturer).",
    );
    requirements.push({
      citation: "Article 28",
      text: "EU declaration of conformity signed",
      state: "gap",
    });
  } else {
    requirements.push({
      citation: "Article 28",
      text: "EU declaration of conformity drawn up and signed",
      state: "met",
    });
  }

  // Art. 30(3): CE before placing on the market.
  if (input.placedOnMarketDate && !(input.euDocGenerated && input.euDocSigned)) {
    gaps.push(
      `Article 30(3): the CE marking shall be affixed before the product is placed on the market — the record shows placing on ${input.placedOnMarketDate} without a signed declaration of conformity behind the marking.`,
    );
  }
  requirements.push({
    citation: "Article 30(3)",
    text: "CE marking affixed before placing on the market",
    state: input.placedOnMarketDate === null ? "not_derivable" : input.euDocGenerated && input.euDocSigned ? "met" : "gap",
  });

  // Art. 30(4): the notified-body number rule cuts both ways.
  const nbNumberMustFollowMarking =
    input.nbModule === null ? null : ceMarkingCarriesNotifiedBodyNumber(input.nbModule);
  if (input.nbModule !== null) {
    citations.push("Article 30(4)");
    requirements.push({
      citation: "Article 30(4)",
      text: nbNumberMustFollowMarking
        ? "The notified body's identification number follows the CE marking (module H)"
        : "The CE marking is NOT followed by a notified body number on this route (Article 30(4) applies it to module H only)",
      state: "not_derivable",
    });
    if (nbNumberMustFollowMarking && input.nbCertificateCleared === false) {
      gaps.push(
        "The module-H engagement has no clearing certificate: a notified body number after the CE marking without the certificate behind it would misstate the assessment.",
      );
    }
  }

  // Physical requirements — stated, never assumed.
  requirements.push({
    citation: "Article 30(1)",
    text: "Affixed visibly, legibly and indelibly (or to the packaging and the declaration where the product's nature warrants it)",
    state: "not_derivable",
  });

  return { requirements, nbNumberMustFollowMarking, gaps, citations };
}
