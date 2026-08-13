import { pgTable, serial, text, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A product / risk classification defined by a regulation (e.g. CRA Default /
 * Important Class I / Important Class II / Critical; AI Act prohibited / high /
 * limited / minimal). `defaultRouteKey` points at the typical conformity route
 * for that class within the same regulation.
 */
export const productClassesTable = pgTable("product_classes", {
  id: serial("id").primaryKey(),
  regulationKey: text("regulation_key").notNull(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  riskLevel: text("risk_level"),
  defaultRouteKey: text("default_route_key"),
  subcategoryKey: text("subcategory_key"),
  annexIiiRef: text("annex_iii_ref"),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [
  uniqueIndex("product_classes_reg_key_unique").on(table.regulationKey, table.key),
]);

export const insertProductClassSchema = createInsertSchema(
  productClassesTable,
).omit({ id: true });
export type InsertProductClass = z.infer<typeof insertProductClassSchema>;
export type ProductClassRow = typeof productClassesTable.$inferSelect;
