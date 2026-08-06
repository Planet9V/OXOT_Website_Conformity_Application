import { pgTable, serial, text, integer, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A single normative requirement drawn from a regulation (e.g. CRA Annex I
 * Part I(2)(a), AI Act Art 9, Machinery Annex III 1.1.9, IEC 62443-4-1 SM-1).
 * `refCode` is the citation within the regulation and is unique per regulation.
 * `themeKey` links the requirement to a cross-cutting theme so it can be mapped
 * against equivalent requirements in other regulations.
 */
export const requirementsTable = pgTable("requirements", {
  id: serial("id").primaryKey(),
  regulationKey: text("regulation_key").notNull(),
  // Nullable: a requirement may not fit a cross-cutting theme.
  themeKey: text("theme_key"),
  refCode: text("ref_code").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // product_requirement | process | documentation | reporting | governance
  obligationType: text("obligation_type").notNull(),
  // string[] — e.g. ["manufacturer"], ["provider","deployer"]
  appliesTo: jsonb("applies_to").notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [
  // Natural key relied on by cross-regulation mapping resolution.
  uniqueIndex("requirements_reg_ref_unique").on(table.regulationKey, table.refCode),
]);

export const insertRequirementSchema = createInsertSchema(requirementsTable).omit(
  { id: true },
);
export type InsertRequirement = z.infer<typeof insertRequirementSchema>;
export type RequirementRow = typeof requirementsTable.$inferSelect;
