import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A first-party visitor page-view event, recorded by a lightweight beacon fired
 * once per public route view. No cookies or PII — `sessionId` is a random,
 * client-generated id kept in localStorage for coarse unique-visitor counts.
 */
export const pageViewsTable = pgTable(
  "page_views",
  {
    id: serial("id").primaryKey(),
    path: text("path").notNull(),
    locale: text("locale").notNull().default("en"),
    sessionId: text("session_id"),
    referrer: text("referrer"),
    device: text("device"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("page_views_created_idx").on(table.createdAt),
    index("page_views_path_idx").on(table.path),
  ],
);

export const insertPageViewSchema = createInsertSchema(pageViewsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type PageViewRow = typeof pageViewsTable.$inferSelect;
