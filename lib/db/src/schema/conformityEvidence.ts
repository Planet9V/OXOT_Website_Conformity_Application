import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * A piece of evidence backing an assessment. Optionally scoped to a specific
 * requirement (by natural-key refCode). Uploaded files live in object storage
 * (objectPath); external references use url.
 */
export const conformityEvidenceTable = pgTable("conformity_evidence", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id")
    .notNull()
    .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
  // null = general evidence for the whole assessment.
  requirementRefCode: text("requirement_ref_code"),
  title: text("title").notNull(),
  // document | url | sbom | test_report | policy | other
  evidenceType: text("evidence_type").notNull().default("document"),
  url: text("url").notNull().default(""),
  objectPath: text("object_path").notNull().default(""),
  fileName: text("file_name").notNull().default(""),
  // SHA-256 (hex) of the uploaded file's bytes, computed server-side at link
  // time so an auditor can verify an attachment hasn't been silently swapped.
  // Empty for url-only evidence or when the object could not be read.
  fileHash: text("file_hash").notNull().default(""),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("conformity_evidence_assessment_id_idx").on(table.assessmentId),
]);

export const insertConformityEvidenceSchema = createInsertSchema(
  conformityEvidenceTable,
).omit({ id: true, createdAt: true });
export type InsertConformityEvidence = z.infer<typeof insertConformityEvidenceSchema>;
export type ConformityEvidenceRow = typeof conformityEvidenceTable.$inferSelect;
