import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * Requests for Information (RFIs), Non-Conformity findings, and observations
 * submitted by Notified Body auditors during CRA Module B/H conformity audits.
 */
export const conformityAuditorRfisTable = pgTable("conformity_auditor_rfis", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id")
    .notNull()
    .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
  requirementRefCode: text("requirement_ref_code"),
  auditorEmail: text("auditor_email").notNull(),
  question: text("question").notNull(),
  // rfi | non_conformity | observation
  severity: text("severity").notNull().default("rfi"),
  // open | answered | closed
  status: text("status").notNull().default("open"),
  manufacturerResponse: text("manufacturer_response").notNull().default(""),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformityAuditorRfiSchema = createInsertSchema(
  conformityAuditorRfisTable
).omit({ id: true, createdAt: true });

export type InsertConformityAuditorRfi = z.infer<typeof insertConformityAuditorRfiSchema>;
export type ConformityAuditorRfiRow = typeof conformityAuditorRfisTable.$inferSelect;
