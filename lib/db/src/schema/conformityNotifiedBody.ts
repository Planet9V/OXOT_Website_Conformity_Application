import { pgTable, serial, text, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { conformityProductsTable } from "./conformityProducts";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * A manufacturer's engagement with a notified body — Art. 32, Annex VIII.
 *
 * This is the largest gap the application had. Art. 32(2) means an important
 * Class I product cannot use internal control while no harmonised standard has
 * been cited in the OJEU, and none has been. So most manufacturers of important
 * products must engage a notified body today, and there was nowhere to record
 * which body, what was lodged, what came back, or the certificate itself.
 *
 * One engagement is one application to one body, because Annex VIII, Part II,
 * point 3 requires the application to be lodged with "a SINGLE notified body of
 * its choice" and accompanied by a written declaration that it has not been
 * lodged with any other. Modelling it as one-to-many would quietly permit the
 * thing the Regulation forbids.
 */
export const conformityNotifiedBodyEngagementsTable = pgTable(
  "conformity_notified_body_engagements",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => conformityProductsTable.id, { onDelete: "cascade" }),
    assessmentId: integer("assessment_id").references(() => conformityAssessmentsTable.id, {
      onDelete: "set null",
    }),

    /** module_b_c | module_h — the routes that involve a notified body. */
    module: text("module").notNull(),

    // ---- The body ---------------------------------------------------------
    notifiedBodyName: text("notified_body_name").notNull().default(""),
    /** NANDO identification number: four digits. */
    notifiedBodyNumber: text("notified_body_number").notNull().default(""),
    notifiedBodyCountry: text("notified_body_country").notNull().default(""),

    // ---- The application, Annex VIII II.3 ---------------------------------
    /**
     * II.3.2, the written declaration that the same application has not been
     * lodged with any other notified body. Nullable on purpose: unanswered is
     * not "declared", and this is the element people forget.
     */
    soleApplicationDeclared: boolean("sole_application_declared"),
    lodgedByAuthorisedRepresentative: boolean("lodged_by_authorised_representative"),
    /** II.3.3 — the Annex VII technical documentation. */
    technicalDocumentationComplete: boolean("technical_documentation_complete"),
    /** II.3.4 — supporting evidence for the design and development solutions. */
    supportingEvidenceProvided: boolean("supporting_evidence_provided"),
    /**
     * II.3.4 also requires the evidence to state which documents were used,
     * "in particular where the relevant harmonised standards ... have not been
     * applied in full". No CRA harmonised standard has been cited, so this
     * applies to every product today.
     */
    standardsApplicationDocumented: boolean("standards_application_documented"),
    lodgedAt: timestamp("lodged_at", { withTimezone: true }),

    /**
     * not_required | draft | lodged | under_examination | certificate_issued
     * | refused | withdrawn
     */
    status: text("status").notNull().default("draft"),

    // ---- The certificate, Annex VIII II.6 ---------------------------------
    certificateNumber: text("certificate_number").notNull().default(""),
    certificateIssuedAt: timestamp("certificate_issued_at", { withTimezone: true }),
    /** II.6 — the certificate may carry conditions for its validity. */
    certificateConditions: text("certificate_conditions").notNull().default(""),
    /** II.6 — a refusal must be accompanied by detailed reasons. */
    refusalReasons: text("refusal_reasons").notNull().default(""),
    /**
     * II.7 — modifications to the approved type require additional approval as
     * an ADDITION to the original certificate. Append-only history.
     */
    certificateAdditions: jsonb("certificate_additions")
      .$type<{ reference: string; issuedAt: string; reason: string }[]>()
      .notNull()
      .default([]),

    /** Findings and questions raised by the body during examination. */
    findings: jsonb("findings")
      .$type<{ raisedAt: string; summary: string; resolvedAt: string | null }[]>()
      .notNull()
      .default([]),

    notes: text("notes").notNull().default(""),
    recordedBy: text("recorded_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("conformity_nb_engagements_product_idx").on(t.productId, t.status)],
);

export type ConformityNotifiedBodyEngagementRow =
  typeof conformityNotifiedBodyEngagementsTable.$inferSelect;
export type InsertConformityNotifiedBodyEngagement =
  typeof conformityNotifiedBodyEngagementsTable.$inferInsert;
