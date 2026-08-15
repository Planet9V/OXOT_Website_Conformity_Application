import { pgTable, serial, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { conformityProductsTable } from "./conformityProducts";

/**
 * An importer's or distributor's verification of one product, and any hold
 * placed on it — Arts. 19(2)/(3) and 20(2)/(3).
 *
 * One row per (product, role), because the two roles verify different things
 * against different standards and an organisation can hold both roles for
 * different products. Storing a single "verified" flag per product would lose
 * which role did the verifying, and therefore which list applied.
 *
 * Every check is nullable. Unanswered is not verified — a blank field must
 * never read as a clearance to place a product on the market.
 */
export const conformityOperatorChecksTable = pgTable(
  "conformity_operator_checks",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => conformityProductsTable.id, { onDelete: "cascade" }),
    /** importer | distributor — decides which article applies. */
    role: text("role").notNull(),

    // ---- Art. 19(2): the importer's four checks --------------------------
    conformityAssessmentCarriedOut: boolean("conformity_assessment_carried_out"),
    technicalDocumentationDrawnUp: boolean("technical_documentation_drawn_up"),
    euDeclarationAccompanies: boolean("eu_declaration_accompanies"),
    userInformationPresent: boolean("user_information_present"),
    userInformationLanguageUnderstood: boolean("user_information_language_understood"),
    manufacturerIdentificationComplied: boolean("manufacturer_identification_complied"),
    canProvideProvingDocuments: boolean("can_provide_proving_documents"),
    /** Art. 19(4) — the importer's own contact details. No distributor equivalent. */
    ownContactDetailsAffixed: boolean("own_contact_details_affixed"),

    // ---- Shared / Art. 20(2): the distributor's two ----------------------
    ceMarkingPresent: boolean("ce_marking_present"),
    upstreamObligationsComplied: boolean("upstream_obligations_complied"),
    necessaryDocumentsProvided: boolean("necessary_documents_provided"),

    // ---- Arts. 19(3) / 20(3): the duty to refrain ------------------------
    believesNonConforming: boolean("believes_non_conforming"),
    /**
     * Art. 20(3) qualifies the distributor's belief with "on the basis of
     * information in its possession". Stored so the narrower standard is
     * visible in the record rather than assumed away.
     */
    basedOnInformationInPossession: boolean("based_on_information_in_possession"),
    informationHeld: text("information_held").notNull().default(""),
    significantCybersecurityRisk: boolean("significant_cybersecurity_risk"),
    /** Art. 19(3), second subparagraph — importers only, routes to Art. 54(2). */
    significantRiskFromNonTechnicalFactors: boolean("significant_risk_non_technical"),
    manufacturerInformedAt: timestamp("manufacturer_informed_at", { withTimezone: true }),
    marketSurveillanceInformedAt: timestamp("market_surveillance_informed_at", { withTimezone: true }),
    broughtIntoConformityAt: timestamp("brought_into_conformity_at", { withTimezone: true }),

    notes: text("notes").notNull().default(""),
    recordedBy: text("recorded_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("conformity_operator_checks_product_idx").on(t.productId, t.role)],
);

export type ConformityOperatorCheckRow = typeof conformityOperatorChecksTable.$inferSelect;
export type InsertConformityOperatorCheck = typeof conformityOperatorChecksTable.$inferInsert;
