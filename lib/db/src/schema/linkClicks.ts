import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { affiliateLinksTable } from "./affiliateLinks";

/** One recorded click on an affiliate link via the tracking redirect. */
export const linkClicksTable = pgTable(
  "link_clicks",
  {
    id: serial("id").primaryKey(),
    affiliateLinkId: integer("affiliate_link_id")
      .notNull()
      .references(() => affiliateLinksTable.id, { onDelete: "cascade" }),
    path: text("path"),
    locale: text("locale"),
    sessionId: text("session_id"),
    referrer: text("referrer"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("link_clicks_link_idx").on(table.affiliateLinkId),
    index("link_clicks_created_idx").on(table.createdAt),
  ],
);

export const insertLinkClickSchema = createInsertSchema(linkClicksTable).omit({
  id: true,
  createdAt: true,
});
export type InsertLinkClick = z.infer<typeof insertLinkClickSchema>;
export type LinkClickRow = typeof linkClicksTable.$inferSelect;
