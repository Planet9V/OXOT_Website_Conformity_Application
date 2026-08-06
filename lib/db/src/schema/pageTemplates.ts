import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A reusable landing-page blueprint saved by the page wizard. `config` holds
 * the wizard inputs (topic, persona, CTA, tone) plus the section blueprint
 * (ordered list of section types) so the wizard can be re-run and adjusted to
 * generate new pages for different products/services.
 */
export const pageTemplatesTable = pgTable("page_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertPageTemplateSchema = createInsertSchema(pageTemplatesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPageTemplate = z.infer<typeof insertPageTemplateSchema>;
export type PageTemplateRow = typeof pageTemplatesTable.$inferSelect;
