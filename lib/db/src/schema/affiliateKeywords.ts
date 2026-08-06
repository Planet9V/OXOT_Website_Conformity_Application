import { pgTable, serial, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { affiliateLinksTable } from "./affiliateLinks";

/**
 * A keyword that maps to an affiliate link, per locale. Used by the AI-assisted
 * link insertion flow to find candidate anchor text within page copy.
 */
export const affiliateKeywordsTable = pgTable(
  "affiliate_keywords",
  {
    id: serial("id").primaryKey(),
    affiliateLinkId: integer("affiliate_link_id")
      .notNull()
      .references(() => affiliateLinksTable.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    locale: text("locale").notNull().default("en"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("affiliate_keywords_link_idx").on(table.affiliateLinkId)],
);

export const insertAffiliateKeywordSchema = createInsertSchema(affiliateKeywordsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAffiliateKeyword = z.infer<typeof insertAffiliateKeywordSchema>;
export type AffiliateKeywordRow = typeof affiliateKeywordsTable.$inferSelect;
