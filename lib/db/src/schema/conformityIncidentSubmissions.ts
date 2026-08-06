import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityIncidentsTable } from "./conformityIncidents";

/**
 * Append-only proof-of-submission ledger for CRA Article 14 reporting stages.
 *
 * Marking a stage done in the workbench is an internal state change; THIS row
 * is the durable record of the actual submission to the CSIRT/ENISA single
 * reporting platform: when it was submitted, through which channel, the
 * platform's reference number, and a SHA-256 of the submitted content.
 *
 * Rows are never updated or deleted (no updatedAt by design). A correction is
 * a NEW row with `supersedes` pointing at the original — the history of what
 * was told to the authority must stay intact.
 */
export const conformityIncidentSubmissionsTable = pgTable(
  "conformity_incident_submissions",
  {
    id: serial("id").primaryKey(),
    incidentId: integer("incident_id")
      .notNull()
      .references(() => conformityIncidentsTable.id, { onDelete: "cascade" }),
    // early_warning | notification | final_report
    stage: text("stage").notNull(),
    // When the report was actually submitted to the authority.
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull(),
    // srp (single reporting platform) | csirt_email | enisa_portal | other
    channel: text("channel").notNull().default("srp"),
    // Authority-issued reference / case number, if any.
    reference: text("reference").notNull().default(""),
    // SHA-256 (hex) of the submitted report content — ties the proof to bytes.
    contentHash: text("content_hash").notNull().default(""),
    notes: text("notes").notNull().default(""),
    // Session actor ("role:username") who recorded the submission.
    recordedBy: text("recorded_by").notNull().default(""),
    // Points at the submission this row corrects (append-only corrections).
    supersedes: integer("supersedes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("conformity_incident_submissions_incident_idx").on(t.incidentId, t.stage)],
);

export const insertConformityIncidentSubmissionSchema = createInsertSchema(
  conformityIncidentSubmissionsTable,
).omit({ id: true, createdAt: true });
export type InsertConformityIncidentSubmission = z.infer<
  typeof insertConformityIncidentSubmissionSchema
>;
export type ConformityIncidentSubmissionRow =
  typeof conformityIncidentSubmissionsTable.$inferSelect;
