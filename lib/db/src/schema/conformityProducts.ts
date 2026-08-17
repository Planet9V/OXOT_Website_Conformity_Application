import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { conformitySuppliersTable } from "./conformitySuppliers";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A concrete "product with digital elements" that an operator is taking through
 * a conformity assessment. This is the working-layer counterpart to the
 * read-only reference tables (regulations, requirements, product classes,
 * routes): the reference layer describes the rulebook, this describes one real
 * product being assessed against it.
 */
export const conformityProductsTable = pgTable("conformity_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  manufacturerName: text("manufacturer_name").notNull().default(""),
  manufacturerAddress: text("manufacturer_address").notNull().default(""),
  authorizedRep: text("authorized_rep").notNull().default(""),
  // hardware | software | hardware_with_software | remote_data_processing
  productType: text("product_type").notNull().default("software"),
  /**
   * The role THIS organisation holds for THIS product — one of the
   * CANONICAL_ROLES keys (orgRoles.ts), or null until somebody declares it
   * (D5: role is per product, never inherited from the org; never guessed).
   * Selects which stages the product file renders: creation stages for a
   * manufacturer, the Arts. 19/20 verification gate for importer/distributor.
   */
  orgRole: text("org_role"),
  version: text("version").notNull().default(""),
  intendedUse: text("intended_use").notNull().default(""),
  // ISO date (YYYY-MM-DD) or null. Art. 13(8): five years is the default, not an
  // absolute floor — a shorter period is lawful where the product is expected to
  // be in use for less than five years and the period corresponds to that.
  supportPeriodStart: text("support_period_start"),
  supportPeriodEnd: text("support_period_end"),
  /**
   * Whether this product is radio equipment in a category designated by
   * Delegated Regulation (EU) 2022/30 under RED Art 3(3)(d)/(e)/(f) —
   * internet-connected, child/wearable, or processing personal/traffic/
   * location data. Drives the RED→CRA handover guidance in the product
   * file: those requirements end 2027-12-11 when 2022/30 is repealed by
   * 2026/339 and the CRA governs. Null until somebody answers — it is a
   * scoping FACT, never defaulted or guessed.
   */
  redInScope: boolean("red_in_scope"),
  /**
   * The supplier this product was procured from (conformity_suppliers) — the
   * operator/asset-owner pivot (Phase 21). Null for products the organisation
   * makes itself, or until somebody records the relationship. Deliberately a
   * SEPARATE fact from manufacturerName: who built it and who sold it to you
   * are different questions (a distributor sells another maker's device).
   */
  supplierId: integer("supplier_id").references(() => conformitySuppliersTable.id, {
    onDelete: "set null",
  }),
  /**
   * ISO date the product was placed on the market, or null before it has been.
   * This is the anchor for the Art. 13(13) and 13(18) retention clocks. It is
   * NOT the date this record was created — a row created during design work says
   * nothing about when the product was placed on the market, and using the row's
   * createdAt produced retention dates that were simply wrong.
   */
  placedOnMarketDate: text("placed_on_market_date"),
  /**
   * How long the product is expected to be in use, in months. This is what makes
   * a support period under five years lawful under Art. 13(8), so it is recorded
   * rather than inferred.
   */
  expectedUseTimeMonths: integer("expected_use_time_months"),
  /**
   * What the manufacturer took into account when determining the support period
   * — user expectations, nature and intended purpose, comparable products,
   * component support, ADCO guidance. Art. 13(8) requires this information in the
   * Annex VII technical documentation, so it is evidence, not a note.
   */
  supportPeriodRationale: text("support_period_rationale").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertConformityProductSchema = createInsertSchema(
  conformityProductsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConformityProduct = z.infer<typeof insertConformityProductSchema>;
export type ConformityProductRow = typeof conformityProductsTable.$inferSelect;
