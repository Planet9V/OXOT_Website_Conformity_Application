import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type SocialLinkValue = { platform: string; url: string };

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  locale: text("locale").notNull().unique(),
  siteName: text("site_name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  contactEmail: text("contact_email"),
  footerText: text("footer_text").notNull(),
  socialLinks: jsonb("social_links").$type<SocialLinkValue[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettingsRow = typeof siteSettingsTable.$inferSelect;
