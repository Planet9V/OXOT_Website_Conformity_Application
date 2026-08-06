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
 * A document compiled from the captured assessment state (not a free-form
 * upload), so it is always consistent with the assessment and can report which
 * fields are still missing. One current row per (assessment, artifactType);
 * regeneration bumps `version` and overwrites `content`.
 */
export type ArtifactSection = {
  key: string;
  label: string;
  body: string;
  complete: boolean;
};

export const conformityArtifactsTable = pgTable(
  "conformity_artifacts",
  {
    id: serial("id").primaryKey(),
    assessmentId: integer("assessment_id")
      .notNull()
      .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
    // risk_assessment | technical_documentation | eu_doc | cvd_policy | sbom_reference | support_statement
    artifactType: text("artifact_type").notNull(),
    // draft | final
    status: text("status").notNull().default("draft"),
    content: jsonb("content")
      .$type<{ sections: ArtifactSection[] }>()
      .notNull()
      .default({ sections: [] }),
    version: integer("version").notNull().default(1),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("conformity_artifacts_unique").on(
      table.assessmentId,
      table.artifactType,
    ),
  ],
);

export const insertConformityArtifactSchema = createInsertSchema(
  conformityArtifactsTable,
).omit({ id: true, generatedAt: true });
export type InsertConformityArtifact = z.infer<typeof insertConformityArtifactSchema>;
export type ConformityArtifactRow = typeof conformityArtifactsTable.$inferSelect;
