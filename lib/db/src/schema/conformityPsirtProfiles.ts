import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityProductsTable } from "./conformityProducts";

/**
 * The per-product PSIRT / coordinated-vulnerability-disclosure profile
 * (Annex I Part II CRA): the published security contact, the CVD policy and
 * the disclosure-coordination window. One row per product; the public intake
 * form and the published advisory listing surface these fields.
 */
export const conformityPsirtProfilesTable = pgTable("conformity_psirt_profiles", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .unique()
    .references(() => conformityProductsTable.id, { onDelete: "cascade" }),
  // Published single point of contact for vulnerability reports (Annex I Part II (2), (5)).
  contactEmail: text("contact_email").notNull().default(""),
  contactUrl: text("contact_url").notNull().default(""),
  // Full CVD policy text (published verbatim on the intake page) and/or a canonical URL.
  policyText: text("policy_text").notNull().default(""),
  policyUrl: text("policy_url").notNull().default(""),
  // Target coordinated-disclosure window in days (workbench SLA, not statutory).
  disclosureDays: integer("disclosure_days").notNull().default(90),
  updatedBy: text("updated_by").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertConformityPsirtProfileSchema = createInsertSchema(
  conformityPsirtProfilesTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConformityPsirtProfile = z.infer<typeof insertConformityPsirtProfileSchema>;
export type ConformityPsirtProfileRow = typeof conformityPsirtProfilesTable.$inferSelect;
