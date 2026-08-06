import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityBomsTable } from "./conformityBoms";

/**
 * Version differentials computed between two CycloneDX BOM releases (e.g., Release v2.4.0 vs v2.5.0).
 * Stores exact component additions, deletions, version upgrades, and new/resolved CVE vulnerability diffs.
 */
export const conformityBomDifferentialsTable = pgTable("conformity_bom_differentials", {
  id: serial("id").primaryKey(),
  baseBomId: integer("base_bom_id")
    .notNull()
    .references(() => conformityBomsTable.id, { onDelete: "cascade" }),
  targetBomId: integer("target_bom_id")
    .notNull()
    .references(() => conformityBomsTable.id, { onDelete: "cascade" }),
  addedComponentsCount: integer("added_components_count").notNull().default(0),
  removedComponentsCount: integer("removed_components_count").notNull().default(0),
  upgradedComponentsCount: integer("upgraded_components_count").notNull().default(0),
  newVulnerabilitiesCount: integer("new_vulnerabilities_count").notNull().default(0),
  resolvedVulnerabilitiesCount: integer("resolved_vulnerabilities_count").notNull().default(0),
  
  // High-resolution diff payloads for SQL querying:
  addedComponents: jsonb("added_components").$type<Array<{ name: string; version: string; purl: string; bomType: string }>>().notNull().default([]),
  removedComponents: jsonb("removed_components").$type<Array<{ name: string; version: string; purl: string; bomType: string }>>().notNull().default([]),
  upgradedComponents: jsonb("upgraded_components").$type<Array<{ name: string; oldVersion: string; newVersion: string; purl: string }>>().notNull().default([]),
  newVulnerabilities: jsonb("new_vulnerabilities").$type<Array<{ cveId: string; severity: string; componentName: string }>>().notNull().default([]),
  resolvedVulnerabilities: jsonb("resolved_vulnerabilities").$type<Array<{ cveId: string; componentName: string }>>().notNull().default([]),
  
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformityBomDifferentialSchema = createInsertSchema(
  conformityBomDifferentialsTable,
).omit({ id: true, createdAt: true });

export type InsertConformityBomDifferential = z.infer<typeof insertConformityBomDifferentialSchema>;
export type ConformityBomDifferentialRow = typeof conformityBomDifferentialsTable.$inferSelect;
