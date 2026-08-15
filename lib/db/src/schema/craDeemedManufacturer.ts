import { pgTable, serial, text, boolean, timestamp, jsonb, integer, index } from "drizzle-orm/pg-core";
import { conformityProductsTable } from "./conformityProducts";

/**
 * Article 21 / 22 deemed-manufacturer assessments.
 *
 * Replaces `cra_article21_audits`, which encoded a legal model that does not
 * exist: four invented gating questions ("identical replacement", "OEM signed
 * firmware", "performance envelope constant"), an `INTEGRATOR_EXEMPT`
 * classification, an `exemption_basis`, and a `certificate_hash`. The CRA has
 * no such exemption and issues no such certificate, and the questions were
 * proxies for the Art. 3(30) test rather than the test itself. Nothing ever
 * read or wrote that table.
 *
 * This is an ASSESSMENT RECORD, not a certificate: the facts supplied, the
 * determination that follows from them, the articles relied on, when it was
 * made and by whom. It confers nothing. A negative determination records that
 * the transition did not fire on the facts given — it does not grant immunity,
 * and re-assessing with different facts can produce a different answer.
 *
 * The columns mirror the statutory test one-to-one, deliberately: each nullable
 * boolean is a question the regulation actually asks, and null means unanswered
 * rather than "no". Collapsing unanswered into false is how a wizard tells
 * someone they are in the clear because nobody filled in a field.
 */
export const craDeemedManufacturerAssessments = pgTable(
  "cra_deemed_manufacturer_assessments",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").references(() => conformityProductsTable.id, {
      onDelete: "set null",
    }),
    /** Free-text identification of what was assessed. */
    subjectName: text("subject_name").notNull().default(""),
    siteName: text("site_name").notNull().default(""),
    projectName: text("project_name").notNull().default(""),

    /** importer | distributor | other_person | manufacturer — decides the article. */
    actorRole: text("actor_role").notNull(),

    // ---- The facts. Null means unanswered, never "no". -------------------
    /** Art. 21, first limb. */
    placedUnderOwnNameOrTrademark: boolean("placed_under_own_name_or_trademark"),
    modificationMade: boolean("modification_made"),
    /** Art. 3(30) gate. */
    changeFollowsPlacingOnMarket: boolean("change_follows_placing_on_market"),
    /** Art. 3(30), first limb. */
    affectsAnnexIPartICompliance: boolean("affects_annex_i_part_i_compliance"),
    /** Art. 3(30), second limb. */
    modifiesAssessedIntendedPurpose: boolean("modifies_assessed_intended_purpose"),
    /** Art. 22(1) — dispositive, and never asked by the previous wizard. */
    makesAvailableOnMarket: boolean("makes_available_on_market"),
    /** Art. 22(2) — decides affected part vs entire product. */
    cybersecurityImpactIsProductWide: boolean("cybersecurity_impact_is_product_wide"),

    // ---- The determination ------------------------------------------------
    isSubstantialModification: boolean("is_substantial_modification"),
    deemedManufacturer: boolean("deemed_manufacturer").notNull(),
    /** "Article 21" | "Article 22" | null */
    governingArticle: text("governing_article"),
    /** Which limb fired, in the regulation's own words. */
    trigger: text("trigger"),
    /** entire_product | affected_part | null */
    obligationScope: text("obligation_scope"),
    unanswered: jsonb("unanswered").$type<string[]>().notNull().default([]),
    citations: jsonb("citations").$type<string[]>().notNull().default([]),
    message: text("message").notNull().default(""),

    /** The assessment opened this manufacturer obligation set, where it did. */
    openedAssessmentId: integer("opened_assessment_id"),

    assessedBy: text("assessed_by").notNull().default(""),
    /**
     * A real timestamp. The engine this replaces hashed a hardcoded
     * "2026-08-14T12:00:00Z", so two assessments months apart produced an
     * identical "certificate hash" — the one thing a hash was there to prevent.
     */
    assessedAt: timestamp("assessed_at", { withTimezone: true }).notNull().defaultNow(),
    /** SHA-256 over the recorded facts, determination and assessedAt. */
    recordHash: text("record_hash").notNull().default(""),
  },
  (t) => [index("cra_deemed_manufacturer_product_idx").on(t.productId, t.assessedAt)],
);

export type CraDeemedManufacturerAssessment =
  typeof craDeemedManufacturerAssessments.$inferSelect;
export type InsertCraDeemedManufacturerAssessment =
  typeof craDeemedManufacturerAssessments.$inferInsert;
