import { pgTable, serial, text, integer, boolean, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A conformity-assessment route offered by a regulation (e.g. CRA Module A
 * self-assessment, Module B+C type examination, Module H full QMS, or an EU
 * cybersecurity certification scheme). `appliesToClasses` lists the product-class
 * keys (within the same regulation) for which the route is available.
 */
export const conformityRoutesTable = pgTable("conformity_routes", {
  id: serial("id").primaryKey(),
  regulationKey: text("regulation_key").notNull(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  thirdPartyRequired: boolean("third_party_required").notNull().default(false),
  // string[] of product-class keys within the same regulation.
  appliesToClasses: jsonb("applies_to_classes").notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [
  uniqueIndex("conformity_routes_reg_key_unique").on(table.regulationKey, table.key),
]);

export const insertConformityRouteSchema = createInsertSchema(
  conformityRoutesTable,
).omit({ id: true });
export type InsertConformityRoute = z.infer<typeof insertConformityRouteSchema>;
export type ConformityRouteRow = typeof conformityRoutesTable.$inferSelect;
