import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityProductsTable } from "./conformityProducts";

/**
 * Product Version Lifecycle & Revision History.
 * Enforces CRA Article 10(12) 5-Year Mandatory Security Update Period
 * and Article 13(14) 10-Year Annex VII Technical File Retention Vault.
 */
export const conformityProductRevisionsTable = pgTable("conformity_product_revisions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => conformityProductsTable.id, { onDelete: "cascade" }),
  versionString: text("version_string").notNull(), // e.g. "v2.4.0", "v2.5.0-rc1"
  revisionNotes: text("revision_notes").notNull().default(""),
  // active | deprecated | end_of_life
  lifecycleState: text("lifecycle_state").notNull().default("active"),
  
  // CRA Statutory Timers:
  supportPeriodStartDate: timestamp("support_period_start_date", { withTimezone: true }).notNull().defaultNow(),
  // Must be >= 5 years from start date under CRA Art. 10(12)
  supportPeriodEndDate: timestamp("support_period_end_date", { withTimezone: true }).notNull(),
  // Must be >= 10 years from placing on market under CRA Art. 13(14)
  technicalFileRetentionExpiry: timestamp("technical_file_retention_expiry", { withTimezone: true }).notNull(),
  
  isCurrentRelease: boolean("is_current_release").notNull().default(true),
  releasedBy: text("released_by").notNull().default("system"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformityProductRevisionSchema = createInsertSchema(
  conformityProductRevisionsTable,
).omit({ id: true, createdAt: true });

export type InsertConformityProductRevision = z.infer<typeof insertConformityProductRevisionSchema>;
export type ConformityProductRevisionRow = typeof conformityProductRevisionsTable.$inferSelect;
