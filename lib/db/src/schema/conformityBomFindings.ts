import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityBomsTable } from "./conformityBoms";
import { conformityBomComponentsTable } from "./conformityBomComponents";

/**
 * A finding raised by BOM analysis — a vulnerability (OSV/CVE match on a
 * component purl) or a crypto weakness (agility heuristic on a CBOM asset), or a
 * license/policy flag. Optionally tied to the specific component it concerns.
 */
export const conformityBomFindingsTable = pgTable("conformity_bom_findings", {
  id: serial("id").primaryKey(),
  bomId: integer("bom_id")
    .notNull()
    .references(() => conformityBomsTable.id, { onDelete: "cascade" }),
  // null = a BOM-level finding not tied to one component.
  componentId: integer("component_id").references(() => conformityBomComponentsTable.id, {
    onDelete: "cascade",
  }),
  // vulnerability | crypto_weakness | license | outdated | policy
  findingType: text("finding_type").notNull().default("vulnerability"),
  // CVE / OSV / GHSA id, algorithm name, etc.
  identifier: text("identifier").notNull().default(""),
  // critical | high | medium | low | info | unknown
  severity: text("severity").notNull().default("unknown"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  // osv | crypto-agility | license-scan | manual
  source: text("source").notNull().default(""),
  detail: jsonb("detail").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformityBomFindingSchema = createInsertSchema(
  conformityBomFindingsTable,
).omit({ id: true, createdAt: true });
export type InsertConformityBomFinding = z.infer<typeof insertConformityBomFindingSchema>;
export type ConformityBomFindingRow = typeof conformityBomFindingsTable.$inferSelect;
