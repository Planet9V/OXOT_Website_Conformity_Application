import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * A stored xBOM (any typed inventory) attached to an assessment. The uploaded
 * document lives in object storage (`objectPath`); the parsed components and
 * findings live in the sibling `conformity_bom_components` / `_findings` tables.
 * The row itself carries rollup counts, a per-type editable `checklist`, parser
 * `meta`, and a `provenance` record (who uploaded, byte hash, which parser ran).
 */
export type BomChecklistItem = {
  key: string;
  label: string;
  done: boolean;
  note?: string;
};

export type BomProvenance = {
  uploadedBy?: string;
  fileHash?: string;
  parser?: string;
  parsedAt?: string;
  source?: string;
};

export const conformityBomsTable = pgTable("conformity_boms", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id")
    .notNull()
    .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
  // sbom | cbom | hbom | opsbom | saasbom | processbom
  bomType: text("bom_type").notNull().default("sbom"),
  // cyclonedx | spdx | other
  format: text("format").notNull().default("cyclonedx"),
  name: text("name").notNull(),
  objectPath: text("object_path").notNull().default(""),
  fileName: text("file_name").notNull().default(""),
  // SHA-256 (hex) of the uploaded document bytes (chain-of-custody).
  fileHash: text("file_hash").notNull().default(""),
  componentCount: integer("component_count").notNull().default(0),
  findingCount: integer("finding_count").notNull().default(0),
  // stored | analyzing | analyzed | error
  status: text("status").notNull().default("stored"),
  checklist: jsonb("checklist").$type<BomChecklistItem[]>().notNull().default([]),
  meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
  provenance: jsonb("provenance").$type<BomProvenance>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertConformityBomSchema = createInsertSchema(conformityBomsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertConformityBom = z.infer<typeof insertConformityBomSchema>;
export type ConformityBomRow = typeof conformityBomsTable.$inferSelect;
