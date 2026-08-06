import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A partner / affiliate link. Public copy never links to `targetUrl` directly —
 * it links through the click-tracking redirect (`/api/go/:id`) so every click is
 * recorded. `sponsored` controls the rel attribute (sponsored vs nofollow).
 */
export const affiliateLinksTable = pgTable("affiliate_links", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetUrl: text("target_url").notNull(),
  description: text("description"),
  sponsored: boolean("sponsored").notNull().default(true),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertAffiliateLinkSchema = createInsertSchema(affiliateLinksTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAffiliateLink = z.infer<typeof insertAffiliateLinkSchema>;
export type AffiliateLinkRow = typeof affiliateLinksTable.$inferSelect;
