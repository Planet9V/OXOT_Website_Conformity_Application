import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Outcome log for a single social post attempt (LinkedIn or X). Written after
 * every attempt — manual composer sends and fire-and-forget auto-shares on
 * publish alike — so failures (expired token, quota, bad credentials) are never
 * silent. The Social tab reads recent rows to surface a "Recent posts" log.
 */
export const socialPostsTable = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  // linkedin | x
  platform: text("platform").notNull(),
  success: boolean("success").notNull(),
  error: text("error"),
  // The (truncated) text that was posted, for context in the log.
  text: text("text").notNull().default(""),
  // manual | publish — how the post was triggered.
  source: text("source").notNull().default("manual"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSocialPostSchema = createInsertSchema(socialPostsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type SocialPostRow = typeof socialPostsTable.$inferSelect;
