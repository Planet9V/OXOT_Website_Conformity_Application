import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * The gap state for one applicable requirement within an assessment. Links to
 * the reference layer by the natural key (regulationKey, requirementRefCode) —
 * never a serial id — so evaluations survive a reference reseed. Also carries
 * the remediation fields (owner, dueDate) so a gap and its remediation are one
 * row rather than a separate task table.
 */
export const conformityEvaluationsTable = pgTable(
  "conformity_evaluations",
  {
    id: serial("id").primaryKey(),
    assessmentId: integer("assessment_id")
      .notNull()
      .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
    regulationKey: text("regulation_key").notNull(),
    requirementRefCode: text("requirement_ref_code").notNull(),
    // not_started | in_progress | met | partial | not_met | not_applicable
    status: text("status").notNull().default("not_started"),
    implementationNote: text("implementation_note").notNull().default(""),
    // low | medium | high | critical | null
    riskRating: text("risk_rating"),
    owner: text("owner").notNull().default(""),
    dueDate: text("due_date"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("conformity_evaluations_unique").on(
      table.assessmentId,
      table.regulationKey,
      table.requirementRefCode,
    ),
  ],
);

export const insertConformityEvaluationSchema = createInsertSchema(
  conformityEvaluationsTable,
).omit({ id: true, updatedAt: true });
export type InsertConformityEvaluation = z.infer<
  typeof insertConformityEvaluationSchema
>;
export type ConformityEvaluationRow = typeof conformityEvaluationsTable.$inferSelect;
