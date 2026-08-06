import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
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
  version: text("version").notNull().default(""),
  intendedUse: text("intended_use").notNull().default(""),
  // ISO date (YYYY-MM-DD) or null; the CRA support period (>= 5 years / lifetime).
  supportPeriodStart: text("support_period_start"),
  supportPeriodEnd: text("support_period_end"),
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
