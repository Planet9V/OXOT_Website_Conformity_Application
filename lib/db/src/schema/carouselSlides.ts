import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { mediaAssetsTable } from "./mediaAssets";

/**
 * A single slide in the homepage hero carousel. Each slide displays one image
 * (`imagePath`, an App Storage key). A multi-page PDF upload expands into one
 * slide per page — those slides share a `groupId` and carry `pageIndex` — so
 * the carousel autoplays through them LinkedIn-style. Captions are bilingual.
 */
export const carouselSlidesTable = pgTable("carousel_slides", {
  id: serial("id").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  kind: text("kind").notNull(), // 'image' | 'pdf'
  imagePath: text("image_path").notNull(),
  mediaAssetId: integer("media_asset_id").references(() => mediaAssetsTable.id, {
    onDelete: "set null",
  }),
  groupId: text("group_id"),
  pageIndex: integer("page_index"),
  captionEn: text("caption_en"),
  captionNl: text("caption_nl"),
  linkUrl: text("link_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertCarouselSlideSchema = createInsertSchema(carouselSlidesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCarouselSlide = z.infer<typeof insertCarouselSlideSchema>;
export type CarouselSlideRow = typeof carouselSlidesTable.$inferSelect;
