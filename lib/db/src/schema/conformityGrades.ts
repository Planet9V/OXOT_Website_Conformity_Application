import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * A point-in-time readiness score for an assessment, snapshotted so the UI can
 * show a trend. Computed as a weighted rollup of requirement-evaluation status
 * plus artifact completeness; any unmet mandatory requirement caps the grade.
 */
export type ThemeScore = {
  themeKey: string;
  themeName: string;
  score: number;
  met: number;
  total: number;
};
export type ArtifactScore = {
  artifactType: string;
  completeness: number;
};

export const conformityGradesTable = pgTable("conformity_grades", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id")
    .notNull()
    .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
  overallScore: integer("overall_score").notNull(),
  // A | B | C | D | F
  overallGrade: text("overall_grade").notNull(),
  blockerCount: integer("blocker_count").notNull().default(0),
  perTheme: jsonb("per_theme").$type<ThemeScore[]>().notNull().default([]),
  perArtifact: jsonb("per_artifact").$type<ArtifactScore[]>().notNull().default([]),
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformityGradeSchema = createInsertSchema(
  conformityGradesTable,
).omit({ id: true, computedAt: true });
export type InsertConformityGrade = z.infer<typeof insertConformityGradeSchema>;
export type ConformityGradeRow = typeof conformityGradesTable.$inferSelect;
