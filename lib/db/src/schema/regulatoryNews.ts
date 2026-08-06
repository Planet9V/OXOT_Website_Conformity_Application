import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * PostgreSQL table for caching live EU Cyber Resilience Act (CRA) news & feeds.
 * Queried dynamically via the OpenRouter searchModel configured in app_settings.
 */
export const regulatoryNewsCacheTable = pgTable("regulatory_news_cache", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  source: text("source").notNull().default("OpenRouter Live Search"),
  url: text("url"),
  category: text("category").notNull().default("EU CRA Update"),
  modelUsed: text("model_used"),
  fullArticle: text("full_article").notNull().default(""),
  complianceImpact: text("compliance_impact").notNull().default(""),
  citations: text("citations").notNull().default("[]"),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertRegulatoryNewsCacheSchema = createInsertSchema(regulatoryNewsCacheTable).omit({ id: true });
export type InsertRegulatoryNewsCache = z.infer<typeof insertRegulatoryNewsCacheSchema>;
export type RegulatoryNewsCacheRow = typeof regulatoryNewsCacheTable.$inferSelect;
