/**
 * Article 32 — which conformity assessment procedures are actually open.
 *
 * The seeded route table says module A applies to "default" and
 * "important_class_i". That is the rule as written in the abstract, but it is
 * not the position today, and the difference is the whole point of Art. 32(2):
 *
 *   32(2) Where, for an important product under CLASS I, the manufacturer "has
 *         not applied or has applied only in part harmonised standards, common
 *         specifications or European cybersecurity certification schemes at
 *         assurance level at least 'substantial' as referred to in Article 27,
 *         OR WHERE SUCH ... DO NOT EXIST", the product must go to module B+C or
 *         module H.
 *
 * The final limb is the operative one right now. No CRA harmonised standard has
 * been cited in the OJEU and no common specification has been adopted (see
 * lib/presumption.ts, which records that as dated, sourced data). So the
 * condition that would let an important Class I manufacturer self-assess cannot
 * currently be met, and module A is not available to them — the opposite of what
 * a static table says.
 *
 * The other paragraphs:
 *   32(1) default products — module A, B+C, H, or a certification scheme.
 *   32(3) important Class II — B+C, H, or a certification scheme at least
 *         'substantial'. Module A is never available.
 *   32(4) critical — a certification scheme under Art. 8(1); failing that, the
 *         32(3) procedures.
 *   32(5) FOSS falling under an Annex III category may use the 32(1) procedures
 *         — including module A — PROVIDED the Art. 31 technical documentation is
 *         public at the time of placing on the market. This carve-out is absent
 *         from the static table entirely.
 */

export type ProductClassKey =
  | "default"
  | "important_class_i"
  | "important_class_ii"
  | "critical";

export type RouteKey =
  | "module_a"
  | "module_b_c"
  | "module_h"
  | "eu_certification_scheme";

export interface RouteSelectionInput {
  classKey: ProductClassKey;
  /**
   * Whether the manufacturer has applied harmonised standards, common
   * specifications, or a certification scheme at assurance level at least
   * 'substantial', IN FULL. Art. 32(2) treats partial application the same as
   * none, so this is deliberately not a percentage.
   */
  appliedArt27BasisInFull: boolean;
  /** Whether such a basis exists to apply at all — the "do not exist" limb. */
  art27BasisExists: boolean;
  /** Art. 32(5): FOSS under an Annex III category. */
  isFreeAndOpenSource?: boolean;
  /** Art. 32(5) proviso: Art. 31 documentation public at placing on the market. */
  technicalDocumentationPublic?: boolean;
  /** Art. 32(4)(a) / Art. 8(1): a scheme is available for this critical product. */
  art8SchemeAvailable?: boolean;
}

export interface RouteOption {
  key: RouteKey;
  available: boolean;
  reason: string;
}

export interface RouteSelection {
  classKey: ProductClassKey;
  citation: string;
  options: RouteOption[];
  availableRoutes: RouteKey[];
  thirdPartyRequired: boolean;
  message: string;
}

const ALL: RouteKey[] = ["module_a", "module_b_c", "module_h", "eu_certification_scheme"];

function build(
  classKey: ProductClassKey,
  citation: string,
  decide: (key: RouteKey) => { available: boolean; reason: string },
  message: string,
): RouteSelection {
  const options = ALL.map((key) => ({ key, ...decide(key) }));
  const availableRoutes = options.filter((o) => o.available).map((o) => o.key);
  return {
    classKey,
    citation,
    options,
    availableRoutes,
    // Module A is the only route a manufacturer can complete alone.
    thirdPartyRequired: !availableRoutes.includes("module_a"),
    message,
  };
}

export function selectConformityRoutes(input: RouteSelectionInput): RouteSelection {
  const {
    classKey,
    appliedArt27BasisInFull,
    art27BasisExists,
    isFreeAndOpenSource,
    technicalDocumentationPublic,
    art8SchemeAvailable,
  } = input;

  // Art. 32(5) — the FOSS carve-out, which reaches back to the 32(1) menu even
  // for products in an Annex III category. It only applies with the proviso met.
  const foss32_5 =
    isFreeAndOpenSource === true &&
    classKey !== "default" &&
    technicalDocumentationPublic === true;

  if (foss32_5) {
    return build(
      classKey,
      "Article 32(5)",
      (key) => ({
        available: true,
        reason:
          key === "module_a"
            ? "Article 32(5): free and open-source software falling under an Annex III category may use the Article 32(1) procedures, including internal control, because the Article 31 technical documentation is public at the time of placing on the market."
            : "Article 32(5) opens the full Article 32(1) menu for this product.",
      }),
      "Article 32(5) applies: this is free and open-source software in an Annex III category and its technical documentation is public, so the Article 32(1) procedures are available — including internal control.",
    );
  }

  if (classKey === "default") {
    return build(
      "default",
      "Article 32(1)",
      () => ({
        available: true,
        reason: "Article 32(1): any of the four procedures may be used for a default product.",
      }),
      "Article 32(1): any of the four procedures may be used, including internal control under module A.",
    );
  }

  if (classKey === "important_class_i") {
    // The whole rule turns on this one condition.
    const selfAssessmentOpen = art27BasisExists && appliedArt27BasisInFull;
    const why = !art27BasisExists
      ? "No harmonised standard has been cited in the Official Journal, no common specification has been adopted, and no European cybersecurity certification scheme at assurance level at least 'substantial' is available. Article 32(2) therefore closes internal control: its final limb bites where such a basis does not exist."
      : !appliedArt27BasisInFull
        ? "A basis under Article 27 exists but has not been applied in full. Article 32(2) treats partial application the same as none, so internal control is closed."
        : "A basis under Article 27 has been applied in full, so internal control remains available under Article 32(1).";

    return build(
      "important_class_i",
      "Article 32(2)",
      (key) => {
        if (key === "module_a") return { available: selfAssessmentOpen, reason: why };
        if (key === "eu_certification_scheme") {
          return {
            available: art27BasisExists,
            reason: art27BasisExists
              ? "Available under Article 32(1)(d) where applicable."
              : "No European cybersecurity certification scheme is available for this product.",
          };
        }
        return {
          available: true,
          reason: "Article 32(2) directs important Class I products to module B+C or module H.",
        };
      },
      selfAssessmentOpen
        ? "Internal control is available: a basis under Article 27 has been applied in full."
        : `Internal control is NOT available for this important Class I product. ${why}`,
    );
  }

  if (classKey === "important_class_ii") {
    return build(
      "important_class_ii",
      "Article 32(3)",
      (key) => {
        if (key === "module_a") {
          return {
            available: false,
            reason:
              "Article 32(3) does not offer internal control for important Class II products in any circumstances.",
          };
        }
        if (key === "eu_certification_scheme") {
          return {
            available: art27BasisExists,
            reason: art27BasisExists
              ? "Article 32(3)(c): available where applicable, at assurance level at least 'substantial'."
              : "No European cybersecurity certification scheme at assurance level at least 'substantial' is available for this product.",
          };
        }
        return { available: true, reason: "Article 32(3)(a) or (b)." };
      },
      "Article 32(3): an important Class II product requires module B+C, module H, or a European cybersecurity certification scheme at assurance level at least 'substantial'. Internal control is never available.",
    );
  }

  // Critical — Art. 32(4).
  return build(
    "critical",
    "Article 32(4)",
    (key) => {
      if (key === "eu_certification_scheme") {
        return {
          available: art8SchemeAvailable === true,
          reason:
            art8SchemeAvailable === true
              ? "Article 32(4)(a): a European cybersecurity certification scheme applies under Article 8(1)."
              : "No scheme has been made mandatory under Article 8(1) for this product, so Article 32(4)(b) falls back to the Article 32(3) procedures.",
        };
      }
      if (key === "module_a") {
        return {
          available: false,
          reason: "Article 32(4) never offers internal control for a critical product.",
        };
      }
      return {
        available: true,
        reason: "Article 32(4)(b): the Article 32(3) procedures apply where Article 8(1) is not met.",
      };
    },
    art8SchemeAvailable === true
      ? "Article 32(4)(a): this critical product must use the European cybersecurity certification scheme required under Article 8(1)."
      : "Article 32(4)(b): no scheme is required under Article 8(1), so the Article 32(3) procedures apply — module B+C or module H.",
  );
}
