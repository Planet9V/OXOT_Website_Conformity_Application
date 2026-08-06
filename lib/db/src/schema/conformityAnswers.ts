import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * A single answer captured by the wizard, keyed by the flow-definition question
 * key. `value` is flexible so one table serves boolean, single-select,
 * multi-select and free-text questions. Answers drive scoping, classification
 * and route computation.
 */
export type AnswerValue = {
  bool?: boolean;
  text?: string;
  options?: string[];
};

export const conformityAnswersTable = pgTable(
  "conformity_answers",
  {
    id: serial("id").primaryKey(),
    assessmentId: integer("assessment_id")
      .notNull()
      .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
    questionKey: text("question_key").notNull(),
    value: jsonb("value").$type<AnswerValue>().notNull().default({}),
    note: text("note").notNull().default(""),
    answeredAt: timestamp("answered_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("conformity_answers_assessment_question_unique").on(
      table.assessmentId,
      table.questionKey,
    ),
  ],
);

export const insertConformityAnswerSchema = createInsertSchema(
  conformityAnswersTable,
).omit({ id: true, answeredAt: true });
export type InsertConformityAnswer = z.infer<typeof insertConformityAnswerSchema>;
export type ConformityAnswerRow = typeof conformityAnswersTable.$inferSelect;
