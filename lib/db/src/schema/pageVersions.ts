import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pagesTable } from "./pages";

/**
 * A point-in-time snapshot of a page's full content (metadata + ordered
 * sections). Versions drive draft/publish and rollback:
 * - `draft`     — the working copy the admin edits; at most one per page.
 * - `published` — the version currently mirrored into pages/pageSections
 *                 (what the public site renders); at most one per page.
 * - `archived`  — a previously published version kept for history/rollback.
 */
export type SectionSnapshot = {
  type: string;
  sortOrder: number;
  data: Record<string, unknown>;
};

export const pageVersionsTable = pgTable("page_versions", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id")
    .notNull()
    .references(() => pagesTable.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  state: text("state").notNull().default("draft"),
  title: text("title").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  sections: jsonb("sections").$type<SectionSnapshot[]>().notNull().default([]),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertPageVersionSchema = createInsertSchema(pageVersionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPageVersion = z.infer<typeof insertPageVersionSchema>;
export type PageVersionRow = typeof pageVersionsTable.$inferSelect;
