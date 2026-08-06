import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * The provenance / chain-of-custody ledger. Every meaningful action (evidence
 * added, BOM ingested/parsed/analyzed, artifact generated, flow step completed)
 * appends one append-only row. `hash` carries a content hash where relevant so an
 * auditor can tie the event to an exact byte payload.
 */
export const conformityActivityTable = pgTable("conformity_activity", {
  id: serial("id").primaryKey(),
  // null = a workspace-level event not tied to a single assessment.
  assessmentId: integer("assessment_id").references(() => conformityAssessmentsTable.id, {
    onDelete: "cascade",
  }),
  // bom | evidence | artifact | flow_run | assessment | grade | incident |
  // evaluation | member
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  // created | updated | parsed | analyzed | generated | completed | deleted
  action: text("action").notNull(),
  // Session role/username that performed the action.
  actor: text("actor").notNull().default(""),
  // ui | system
  source: text("source").notNull().default("system"),
  hash: text("hash").notNull().default(""),
  summary: text("summary").notNull(),
  detail: jsonb("detail").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformityActivitySchema = createInsertSchema(conformityActivityTable).omit({
  id: true,
  createdAt: true,
});
export type InsertConformityActivity = z.infer<typeof insertConformityActivitySchema>;
export type ConformityActivityRow = typeof conformityActivityTable.$inferSelect;
