import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A cross-cutting conformity theme (e.g. secure_by_design, vulnerability_handling,
 * risk_management). Themes are the pivot that makes cross-regulation mapping
 * possible: requirements from different regulations that address the same theme
 * are shown together, so one control can satisfy many clauses.
 */
export const conformityThemesTable = pgTable("conformity_themes", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertConformityThemeSchema = createInsertSchema(
  conformityThemesTable,
).omit({ id: true });
export type InsertConformityTheme = z.infer<typeof insertConformityThemeSchema>;
export type ConformityThemeRow = typeof conformityThemesTable.$inferSelect;
