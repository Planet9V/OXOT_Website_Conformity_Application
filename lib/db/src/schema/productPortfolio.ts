import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityProductsTable } from "./conformityProducts";

/**
 * The product document vault — the ONLY survivor of the retired
 * product-portfolio donor (9.1; hygiene H1 dropped the rest).
 *
 * The four parallel demo tables that lived here (`cra_portfolio_products`,
 * `cra_product_releases`, `cra_enterprise_customers`,
 * `cra_customer_deployments`) were a second product registry seeded with
 * fabricated data; after 9.1 nothing read or wrote them, and they are gone.
 *
 * `productId` previously had NO foreign key and was keyed AMBIGUOUSLY: the
 * donor page wrote portfolio-registry ids while the product file wrote
 * conformity-registry ids into the same column (id-collision risk in the
 * vault). It now references the real registry, cascade on delete — the only
 * registry that exists.
 */
export const productDocumentsTable = pgTable("cra_product_documents", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => conformityProductsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  docCategory: text("doc_category").notNull().default("Product Specification"),
  description: text("description").notNull().default(""),
  fileVersion: text("file_version").notNull().default("v1.0"),
  originalFileName: text("original_file_name").notNull(),
  mimeType: text("mime_type").notNull().default("application/octet-stream"),
  fileSizeBytes: integer("file_size_bytes").notNull().default(0),
  fileContentText: text("file_content_text").notNull().default(""), // Text content for in-app preview of MD/TXT
  storagePath: text("storage_path").notNull(),
  sha256Hash: text("sha256_hash").notNull().default(""),
  // No fabricated default: the route refuses an upload without a named actor.
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertProductDocumentSchema = createInsertSchema(productDocumentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProductDocument = z.infer<typeof insertProductDocumentSchema>;
export type ProductDocumentRow = typeof productDocumentsTable.$inferSelect;
