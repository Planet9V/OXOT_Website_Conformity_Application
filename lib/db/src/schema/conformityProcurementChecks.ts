import { pgTable, serial, integer, boolean, text, timestamp } from "drizzle-orm/pg-core";

/**
 * The operator's procurement check (Phase 21.2) — one row per product.
 *
 * Every fact is a TRI-STATE (true / false / null = unanswered, L40) about
 * what the SUPPLIER'S manufacturer has provided with the product. Each fact
 * anchors to a CRA duty that binds the manufacturer, not the operator — the
 * operator's own hook is NIS2 Art 21(2)(d) supply-chain security. The
 * derivation (procurementPosture lib) reports what is on file, what is
 * missing and what is unanswered; it never concludes anything about the
 * supplier's conformity.
 */
export const conformityProcurementChecksTable = pgTable("conformity_procurement_checks", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().unique(),
  /** Art 13(12)/Art 30 — the manufacturer affixes the CE marking. */
  ceMarkingSighted: boolean("ce_marking_sighted"),
  /** Art 13(20) — a copy of the EU DoC (or simplified DoC) with the product. */
  docOnFile: boolean("doc_on_file"),
  /** Art 13(18) — Annex II information and instructions accompany the product. */
  userInformationReceived: boolean("user_information_received"),
  /** Art 13(19) — support-period end date specified at the time of purchase. */
  supportPeriodStated: boolean("support_period_stated"),
  /** Art 13(17) — the manufacturer's single point of contact is known. */
  securityContactKnown: boolean("security_contact_known"),
  /** Art 13(15)/(16) — identification element + manufacturer name and contacts. */
  manufacturerIdentified: boolean("manufacturer_identified"),
  /**
   * CONTRACTUAL, not statutory: the CRA puts the SBOM in the manufacturer's
   * technical documentation (Annex I Part II / Annex VII), not in the
   * delivery to a buyer. Recorded because operators ask for it in contracts.
   */
  sbomReceived: boolean("sbom_received"),
  note: text("note").notNull().default(""),
  updatedBy: text("updated_by").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type ConformityProcurementCheckRow =
  typeof conformityProcurementChecksTable.$inferSelect;
