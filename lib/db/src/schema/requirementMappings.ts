import { pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A cross-regulation link between two requirements. Stored by natural key
 * (regulationKey + refCode) so the mapping survives reseeds where serial ids
 * change. Each row is resolved to concrete requirement ids at query time and
 * presented from both requirements' perspectives.
 *
 * relationship: equivalent (same obligation) | overlaps (partial) | supports
 * (one helps satisfy the other).
 */
export const requirementMappingsTable = pgTable("requirement_mappings", {
  id: serial("id").primaryKey(),
  sourceRegulationKey: text("source_regulation_key").notNull(),
  sourceRefCode: text("source_ref_code").notNull(),
  targetRegulationKey: text("target_regulation_key").notNull(),
  targetRefCode: text("target_ref_code").notNull(),
  relationship: text("relationship").notNull(),
  note: text("note"),
}, (table) => [
  // Prevent duplicate mapping pairs, which would double-count in aggregations.
  uniqueIndex("requirement_mappings_pair_unique").on(
    table.sourceRegulationKey,
    table.sourceRefCode,
    table.targetRegulationKey,
    table.targetRefCode,
  ),
]);

export const insertRequirementMappingSchema = createInsertSchema(
  requirementMappingsTable,
).omit({ id: true });
export type InsertRequirementMapping = z.infer<
  typeof insertRequirementMappingSchema
>;
export type RequirementMappingRow =
  typeof requirementMappingsTable.$inferSelect;
