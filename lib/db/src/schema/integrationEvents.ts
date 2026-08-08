import { pgTable, serial, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Unified activity/observability log for the admin Integrations console. Every
 * integration (email / linkedin / x) writes best-effort events here so the
 * admin gets one reverse-chronological feed spanning config saves, verify/test
 * checks, OAuth callbacks, sends, posts, and token warnings. Complements
 * `social_posts` (per-post outcomes) — the activity endpoint merges both.
 */
export const integrationEventsTable = pgTable(
  "integration_events",
  {
    id: serial("id").primaryKey(),
    // email | linkedin | x | slack
    integration: text("integration").notNull(),
    // config_saved | verify | test_email | send | post | oauth | token_warning ...
    kind: text("kind").notNull(),
    success: boolean("success").notNull(),
    detail: text("detail"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("integration_events_created_at_idx").on(table.createdAt)],
);

export const insertIntegrationEventSchema = createInsertSchema(integrationEventsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertIntegrationEvent = z.infer<typeof insertIntegrationEventSchema>;
export type IntegrationEventRow = typeof integrationEventsTable.$inferSelect;
