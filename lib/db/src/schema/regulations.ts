import { pgTable, serial, text, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A regulation or standard mapped by the conformity engine (CRA, EU AI Act,
 * Machinery Regulation 2023/1230, IEC 62443). `keyDates` is an ordered list of
 * {date, label} milestones (application dates, reporting-obligation dates, etc.)
 * used to drive the dashboard timeline.
 */
export const regulationsTable = pgTable("regulations", {
  id: serial("id").primaryKey(),
  // Stable slug used across the app: cra | ai_act | machinery | iec_62443
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  fullTitle: text("full_title").notNull(),
  jurisdiction: text("jurisdiction").notNull(),
  summary: text("summary").notNull(),
  // ISO date string (YYYY-MM-DD) or null when not yet / not applicable.
  inForceDate: text("in_force_date"),
  sourceUrl: text("source_url").notNull(),
  // Array<{ date: string; label: string }>
  keyDates: jsonb("key_dates").notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertRegulationSchema = createInsertSchema(regulationsTable).omit({
  id: true,
});
export type InsertRegulation = z.infer<typeof insertRegulationSchema>;
export type RegulationRow = typeof regulationsTable.$inferSelect;
