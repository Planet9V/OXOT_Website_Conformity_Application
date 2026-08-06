import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A newsletter subscriber. GDPR-compliant double opt-in: a subscriber starts as
 * `pending` and only becomes `confirmed` after clicking the confirmation link
 * (recorded via `confirmedAt` + `consentIp` as proof of consent). A confirmed
 * subscriber can opt out at any time via a one-click unsubscribe link, moving
 * to `unsubscribed` (with `unsubscribedAt`). Tokens are unguessable secrets used
 * in the confirm / unsubscribe links.
 */
export const newsletterSubscribersTable = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  // pending | confirmed | unsubscribed
  status: text("status").notNull().default("pending"),
  locale: text("locale").notNull().default("en"),
  // Where the subscription originated (e.g. "footer", "homepage").
  source: text("source"),
  confirmToken: text("confirm_token"),
  unsubscribeToken: text("unsubscribe_token").notNull(),
  // Proof-of-consent: set when double opt-in completes.
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  consentIp: text("consent_ip"),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(
  newsletterSubscribersTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriberRow = typeof newsletterSubscribersTable.$inferSelect;
