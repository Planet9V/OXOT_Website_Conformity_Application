import { pgTable, serial, text, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pagesTable = pgTable(
  "pages",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    // Immutable canonical page identity, set once at seed time (equal to the
    // source filename slug). Stays constant even if an admin renames `slug` in
    // the CMS, so editorial relationships (e.g. the related-services strip) can
    // be wired on something that survives slug renames instead of the slug.
    serviceKey: text("service_key"),
    locale: text("locale").notNull(),
    title: text("title").notNull(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    // SEO / social metadata. Kept live (not part of the versioned content
    // snapshot) because it is operational SEO config edited via the SEO admin.
    ogTitle: text("og_title"),
    ogDescription: text("og_description"),
    ogImage: text("og_image"),
    canonicalUrl: text("canonical_url"),
    metaKeywords: text("meta_keywords"),
    noindex: boolean("noindex").notNull().default(false),
    // Tiered access: "public" (anonymous), "members" (logged-in conformity
    // members/demo/admin), "admin" (site admins only). Operational metadata,
    // like noindex — NOT part of the versioned content snapshot.
    visibility: text("visibility").notNull().default("public"),
    // Regulation tracks this page belongs to, using the SAME natural keys as
    // the conformity requirement catalogue (regulations.key: "cra", "ai_act",
    // …). Empty = cross-cutting content. Drives Knowledge Hub grouping.
    regulationKeys: text("regulation_keys").array().notNull().default([]),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("pages_slug_locale_unique").on(table.slug, table.locale)],
);

export const insertPageSchema = createInsertSchema(pagesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPage = z.infer<typeof insertPageSchema>;
export type PageRow = typeof pagesTable.$inferSelect;
