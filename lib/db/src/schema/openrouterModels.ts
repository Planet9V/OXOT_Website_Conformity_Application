import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Real-time cached OpenRouter.ai models table in Postgres.
 * Populated dynamically directly from OpenRouter's live API (`https://openrouter.ai/api/v1/models`).
 */
export const openrouterModelsCacheTable = pgTable("openrouter_models_cache", {
  id: text("id").primaryKey(), // e.g. "deepseek/deepseek-v4-flash-0731"
  name: text("name").notNull(),
  provider: text("provider").notNull().default("OpenRouter Live"),
  category: text("category").notNull().default("General LLM"),
  description: text("description"),
  contextLength: integer("context_length").notNull().default(128000),
  pricingPrompt: text("pricing_prompt").notNull().default("Free"),
  pricingCompletion: text("pricing_completion").notNull().default("Free"),
  roles: jsonb("roles").$type<string[]>().notNull().default([]),
  rawPricing: jsonb("raw_pricing"),
  rawArchitecture: jsonb("raw_architecture"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertOpenrouterModelsCacheSchema = createInsertSchema(openrouterModelsCacheTable);
export type InsertOpenrouterModelsCache = z.infer<typeof insertOpenrouterModelsCacheSchema>;
export type OpenrouterModelsCacheRow = typeof openrouterModelsCacheTable.$inferSelect;
