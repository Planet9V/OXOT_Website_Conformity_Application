import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const navItemsTable = pgTable("nav_items", {
  id: serial("id").primaryKey(),
  locale: text("locale").notNull(),
  label: text("label").notNull(),
  href: text("href").notNull(),
  placement: text("placement").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  external: boolean("external").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertNavItemSchema = createInsertSchema(navItemsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNavItem = z.infer<typeof insertNavItemSchema>;
export type NavItemRow = typeof navItemsTable.$inferSelect;
