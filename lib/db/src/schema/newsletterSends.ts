import { pgTable, serial, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { newslettersTable } from "./newsletters";
import { newsletterSubscribersTable } from "./newsletterSubscribers";

/**
 * Per-recipient delivery record for a newsletter send. Powers engagement
 * reporting: `openedAt` is stamped by the tracking pixel. The unique index on
 * (newsletter, subscriber) makes a send idempotent — a retried send never
 * double-delivers to the same subscriber.
 */
export const newsletterSendsTable = pgTable(
  "newsletter_sends",
  {
    id: serial("id").primaryKey(),
    newsletterId: integer("newsletter_id")
      .notNull()
      .references(() => newslettersTable.id, { onDelete: "cascade" }),
    subscriberId: integer("subscriber_id")
      .notNull()
      .references(() => newsletterSubscribersTable.id, { onDelete: "cascade" }),
    // sent | failed
    status: text("status").notNull().default("sent"),
    error: text("error"),
    openedAt: timestamp("opened_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("newsletter_sends_unique").on(table.newsletterId, table.subscriberId),
  ],
);

export const insertNewsletterSendSchema = createInsertSchema(newsletterSendsTable).omit({
  id: true,
  sentAt: true,
});
export type InsertNewsletterSend = z.infer<typeof insertNewsletterSendSchema>;
export type NewsletterSendRow = typeof newsletterSendsTable.$inferSelect;
