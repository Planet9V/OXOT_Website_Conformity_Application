/**
 * Notified body engagement — Article 32 routes, Annex VIII, Article 30(4).
 *
 * The gap this closes is the largest one in the manufacturer journey. Art. 32(2)
 * means an important Class I product cannot use internal control while no
 * harmonised standard has been cited, and no standard has been. So most
 * manufacturers of important products must engage a notified body today, and
 * the application had nothing for it: no record of which body, no submission
 * pack, no certificate, no findings.
 *
 * Three provisions do the work.
 *
 *   Annex VIII, Part II, point 3 — what a Module B application must contain.
 *     The manufacturer lodges with "a SINGLE notified body of its choice", and
 *     must include a written declaration that the same application has not been
 *     lodged with any other body. That declaration is a specific, checkable
 *     obligation, and it is the one people forget.
 *
 *   Annex VIII, Part II, point 7 — modifications to the approved type that may
 *     affect conformity require an ADDITION to the certificate. This is where
 *     the Art. 21/22 substantial-modification work lands for a product that
 *     went through EU-type examination.
 *
 *   Art. 30(4) — the notified body's identification number follows the CE
 *     marking "where that body is involved in the conformity assessment
 *     procedure based on full quality assurance (BASED ON MODULE H)".
 *
 * That last one is narrower than almost everyone assumes. A notified body is
 * equally involved in Module B+C, and its number does NOT go on the CE marking
 * there. Affixing a number the Regulation does not call for is a marking
 * offence; omitting one it does call for is equally wrong. So the rule is
 * derived from the route, never typed by hand.
 */

import { technicalDocumentationRetention, type RetentionResult } from "./retention";

export type ConformityModule = "module_a" | "module_b_c" | "module_h" | "eu_certification_scheme";

export type EngagementStatus =
  | "not_required"
  | "draft"
  | "lodged"
  | "under_examination"
  | "certificate_issued"
  | "refused"
  | "withdrawn";

/**
 * Art. 30(4): the identification number follows the CE marking only for the
 * full-quality-assurance route. Deliberately a function of the route alone.
 */
export function ceMarkingCarriesNotifiedBodyNumber(module: ConformityModule): boolean {
  return module === "module_h";
}

/** Does this route involve a notified body at all? */
export function routeInvolvesNotifiedBody(module: ConformityModule): boolean {
  return module === "module_b_c" || module === "module_h";
}

export interface SubmissionPackInput {
  module: ConformityModule;
  /** Annex VIII II.3.1 */
  manufacturerName?: string | null;
  manufacturerAddress?: string | null;
  /** Where the authorised representative lodges instead. */
  lodgedByAuthorisedRepresentative?: boolean | null;
  authorisedRepresentativeName?: string | null;
  authorisedRepresentativeAddress?: string | null;
  /**
   * Annex VIII II.3.2 — the written declaration that the same application has
   * not been lodged with any other notified body. Tri-state: unanswered is not
   * "declared".
   */
  soleApplicationDeclared?: boolean | null;
  /** Annex VIII II.3.3 — the Annex VII technical documentation. */
  technicalDocumentationComplete?: boolean | null;
  /** Annex VIII II.3.4 — supporting evidence for the design solutions. */
  supportingEvidenceProvided?: boolean | null;
  /**
   * Annex VIII II.3.4 requires the supporting evidence to mention the documents
   * used, "in particular where the relevant harmonised standards or technical
   * specifications have not been applied in full". Since no CRA harmonised
   * standard has been cited, that condition is met for every product today.
   */
  standardsApplicationDocumented?: boolean | null;
  /** The single body the application is lodged with. */
  notifiedBodyName?: string | null;
  notifiedBodyNumber?: string | null;
}

export interface SubmissionPackAssessment {
  applicable: boolean;
  ready: boolean;
  gaps: string[];
  citations: string[];
  message: string;
}

/** A NANDO identification number is four digits. */
const NANDO = /^\d{4}$/;

export function assessSubmissionPack(input: SubmissionPackInput): SubmissionPackAssessment {
  if (!routeInvolvesNotifiedBody(input.module)) {
    return {
      applicable: false,
      ready: false,
      gaps: [],
      citations: ["Article 32"],
      message:
        "This route does not involve a notified body, so there is no application to lodge.",
    };
  }

  const gaps: string[] = [];
  const citations = ["Article 32", "Annex VIII, Part II, point 3"];

  if (!input.manufacturerName?.trim() || !input.manufacturerAddress?.trim()) {
    gaps.push("Annex VIII II.3.1: the name and address of the manufacturer.");
  }
  if (input.lodgedByAuthorisedRepresentative === true) {
    if (
      !input.authorisedRepresentativeName?.trim() ||
      !input.authorisedRepresentativeAddress?.trim()
    ) {
      gaps.push(
        "Annex VIII II.3.1: where the authorised representative lodges the application, its name and address are required too.",
      );
    }
  }

  // The declaration people forget.
  if (input.soleApplicationDeclared !== true) {
    gaps.push(
      input.soleApplicationDeclared === false
        ? "Annex VIII II.3.2: the application must be lodged with a SINGLE notified body. You have indicated it has been lodged elsewhere as well."
        : "Annex VIII II.3.2: a written declaration that the same application has not been lodged with any other notified body.",
    );
  }

  if (input.technicalDocumentationComplete !== true) {
    gaps.push(
      "Annex VIII II.3.3: the technical documentation, containing at least the Annex VII elements.",
    );
  }
  if (input.supportingEvidenceProvided !== true) {
    gaps.push(
      "Annex VIII II.3.4: supporting evidence for the adequacy of the design, development and vulnerability handling solutions.",
    );
  }
  if (input.standardsApplicationDocumented !== true) {
    gaps.push(
      "Annex VIII II.3.4: the supporting evidence must state which documents were used, in particular where harmonised standards have not been applied in full. No CRA harmonised standard has been cited in the Official Journal, so this applies to every product.",
    );
  }

  if (!input.notifiedBodyName?.trim()) {
    gaps.push("Annex VIII II.3: the single notified body the application is lodged with.");
  }
  if (input.notifiedBodyNumber && !NANDO.test(input.notifiedBodyNumber.trim())) {
    gaps.push(
      `"${input.notifiedBodyNumber}" is not a four-digit notified body identification number.`,
    );
  }

  const ready = gaps.length === 0;
  return {
    applicable: true,
    ready,
    gaps,
    citations,
    message: ready
      ? "The application is complete against Annex VIII, Part II, point 3."
      : `To complete: ${gaps.join(" ")}`,
  };
}

export interface CertificateInput {
  module: ConformityModule;
  status: EngagementStatus;
  certificateNumber?: string | null;
  issuedAt?: string | null;
  /** Annex VIII II.6 — the certificate may carry conditions for its validity. */
  conditions?: string | null;
  /** Retention anchors, Annex VIII II.10 — the same clock as Art. 13(13). */
  placedOnMarket?: string | null;
  supportPeriodEnd?: string | null;
}

export interface CertificateAssessment {
  held: boolean;
  /** Whether the product may be placed on the market on this route. */
  clearedToPlaceOnMarket: boolean;
  retention: RetentionResult | null;
  citations: string[];
  message: string;
}

export function assessCertificate(input: CertificateInput): CertificateAssessment {
  if (!routeInvolvesNotifiedBody(input.module)) {
    return {
      held: false,
      clearedToPlaceOnMarket: true,
      retention: null,
      citations: ["Article 32"],
      message:
        "This route does not involve a notified body, so no EU-type examination certificate is required.",
    };
  }

  if (input.status === "refused") {
    return {
      held: false,
      clearedToPlaceOnMarket: false,
      retention: null,
      citations: ["Annex VIII, Part II, point 6"],
      message:
        "The notified body refused to issue a certificate. Annex VIII II.6 requires it to give detailed reasons; the product may not be placed on the market on this route until the refusal is resolved.",
    };
  }

  const held = input.status === "certificate_issued" && Boolean(input.certificateNumber?.trim());
  if (!held) {
    return {
      held: false,
      clearedToPlaceOnMarket: false,
      retention: null,
      citations: ["Annex VIII, Part II, point 6"],
      message:
        "No EU-type examination certificate is held. On this route the product may not be placed on the market until the notified body issues one.",
    };
  }

  /**
   * Annex VIII II.10 — the certificate, its annexes and additions are kept with
   * the technical documentation for ten years after placing on the market or
   * for the support period, whichever is longer. Identical to Art. 13(13), so
   * the same clock computes it rather than a second implementation drifting.
   */
  const retention = technicalDocumentationRetention({
    placedOnMarket: input.placedOnMarket,
    supportPeriodEnd: input.supportPeriodEnd,
  });

  return {
    held: true,
    clearedToPlaceOnMarket: true,
    retention,
    citations: ["Annex VIII, Part II, point 6", "Annex VIII, Part II, point 10"],
    message: input.conditions?.trim()
      ? `EU-type examination certificate ${input.certificateNumber} is held, subject to conditions for its validity: ${input.conditions}`
      : `EU-type examination certificate ${input.certificateNumber} is held.`,
  };
}

/**
 * Annex VIII, Part II, point 7 — a modification to the approved type that may
 * affect conformity, or the conditions for the certificate's validity, requires
 * an ADDITION to the original certificate.
 *
 * This is where the Art. 21/22 substantial-modification determination lands for
 * a product that went through EU-type examination: the transition tells you the
 * obligations moved, and this tells you the certificate must be re-opened.
 */
export function modificationRequiresCertificateAddition(input: {
  module: ConformityModule;
  certificateHeld: boolean;
  affectsConformityOrValidity: boolean | null;
}): { required: boolean | null; citation: string; message: string } {
  const citation = "Annex VIII, Part II, point 7";
  if (!routeInvolvesNotifiedBody(input.module) || !input.certificateHeld) {
    return {
      required: false,
      citation,
      message: "No EU-type examination certificate is held, so there is nothing to add to.",
    };
  }
  if (input.affectsConformityOrValidity === null) {
    return {
      required: null,
      citation,
      message:
        "Whether the modification may affect conformity with the essential cybersecurity requirements, or the conditions for the certificate's validity, has not been assessed.",
    };
  }
  return input.affectsConformityOrValidity
    ? {
        required: true,
        citation,
        message:
          "You must inform the notified body that holds the technical documentation. The modification requires additional approval in the form of an addition to the original EU-type examination certificate.",
      }
    : {
        required: false,
        citation,
        message:
          "The modification has been assessed as not affecting conformity or the conditions for the certificate's validity, so no addition is required.",
      };
}
