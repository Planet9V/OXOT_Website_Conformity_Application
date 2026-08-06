import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * An uploaded file stored in Replit App Storage. `kind` is "image" or "pdf".
 * For PDFs, `pageCount` is set and each page is rendered to a separate image
 * media asset (see carouselSlides) on upload.
 */
export const mediaAssetsTable = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),
  objectPath: text("object_path").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull().default(0),
  width: integer("width"),
  height: integer("height"),
  pageCount: integer("page_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssetsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type MediaAssetRow = typeof mediaAssetsTable.$inferSelect;
