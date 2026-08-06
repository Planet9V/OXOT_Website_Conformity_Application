import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A newsletter campaign. Content is authored/stored as Markdown and rendered to
 * HTML at send time. Lifecycle: `draft` -> (optionally `scheduled`) -> `sending`
 * -> `sent` (or `failed`). Only confirmed subscribers receive a send. Delivery
 * counts are denormalised onto the row for quick reporting; per-recipient rows
 * live in `newsletter_sends`.
 */
export const newslettersTable = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  preheader: text("preheader"),
  contentMarkdown: text("content_markdown").notNull().default(""),
  // Optional topic tag, e.g. "AI Act", "CRA", "NIS2".
  topic: text("topic"),
  locale: text("locale").notNull().default("en"),
  // draft | scheduled | sending | sent | failed
  status: text("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  recipientCount: integer("recipient_count").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertNewsletterSchema = createInsertSchema(newslettersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type NewsletterRow = typeof newslettersTable.$inferSelect;
