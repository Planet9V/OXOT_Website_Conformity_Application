import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pagesTable } from "./pages";

export const pageSectionsTable = pgTable("page_sections", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id")
    .notNull()
    .references(() => pagesTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertPageSectionSchema = createInsertSchema(pageSectionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPageSection = z.infer<typeof insertPageSectionSchema>;
export type PageSectionRow = typeof pageSectionsTable.$inferSelect;
