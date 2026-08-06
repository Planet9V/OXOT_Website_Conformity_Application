import { pgTable, serial, text, integer, timestamp, vector } from "drizzle-orm/pg-core";

/** Embedding dimension for OpenAI `text-embedding-3-small` (via OpenRouter). */
export const EMBEDDING_DIMENSIONS = 1536;

/**
 * Chunks of published site content embedded for retrieval-augmented generation.
 * Rebuilt from published pages/sections by the reindex routine; queried by
 * cosine distance against the visitor's question embedding.
 */
export const contentChunksTable = pgTable("content_chunks", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id"),
  locale: text("locale").notNull(),
  source: text("source").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  // Copied from the source page's visibility at index time so retrieval can
  // filter by the requesting session's access tier without a join.
  visibility: text("visibility").notNull().default("public"),
  embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ContentChunkRow = typeof contentChunksTable.$inferSelect;
export type InsertContentChunk = typeof contentChunksTable.$inferInsert;
