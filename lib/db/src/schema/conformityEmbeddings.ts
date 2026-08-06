import { pgTable, serial, text, integer, timestamp, vector, index } from "drizzle-orm/pg-core";
import { conformityAssessmentsTable } from "./conformityAssessments";
import { EMBEDDING_DIMENSIONS } from "./contentChunks";

/**
 * Per-assessment workspace embeddings the Conformity Copilot retrieves from
 * (distinct from `content_chunks`, which is the public site's marketing RAG).
 * Auto-populated on BOM ingest / evidence / artifact / flow answers; queried by
 * cosine distance against the user's question embedding. Rows are replaced for a
 * given (assessmentId, sourceType, sourceId) when the underlying source changes.
 */
export const conformityEmbeddingsTable = pgTable(
  "conformity_embeddings",
  {
    id: serial("id").primaryKey(),
    assessmentId: integer("assessment_id")
      .notNull()
      .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
    // bom | evidence | artifact | flow_answer
    sourceType: text("source_type").notNull(),
    sourceId: integer("source_id"),
    title: text("title").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    assessmentIdx: index("conformity_embeddings_assessment_idx").on(table.assessmentId),
    sourceTypeIdx: index("conformity_embeddings_source_type_idx").on(table.sourceType),
  })
);

export type ConformityEmbeddingRow = typeof conformityEmbeddingsTable.$inferSelect;
export type InsertConformityEmbedding = typeof conformityEmbeddingsTable.$inferInsert;
