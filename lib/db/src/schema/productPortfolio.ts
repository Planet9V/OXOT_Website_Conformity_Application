import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Enterprise CRA Product Catalog & Portfolio Engine
 */
export const craProductsTable = pgTable("cra_portfolio_products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().default(""),
  name: text("name").notNull(),
  category: text("category").notNull().default("Industrial Automation"),
  description: text("description").notNull().default(""),
  craClass: text("cra_class").notNull().default("Class I"), // Class I | Class II | Default
  currentStatus: text("current_status").notNull().default("compliant"), // compliant | under_assessment | non_compliant
  hasActivePsirtIncident: boolean("has_active_psirt_incident").notNull().default(false),
  activeIncidentCve: text("active_incident_cve").notNull().default(""),
  customerGuidance: text("customer_guidance").notNull().default(""), // Long text markdown guidance stored in Postgres
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertCraProductSchema = createInsertSchema(craProductsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCraProduct = z.infer<typeof insertCraProductSchema>;
export type CraProductRow = typeof craProductsTable.$inferSelect;

/**
 * Product Versions and Specific Release History
 */
export const productReleasesTable = pgTable("cra_product_releases", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  version: text("version").notNull(), // e.g. "v2.1.4"
  releaseDate: text("release_date").notNull(), // ISO YYYY-MM-DD
  craReevaluationDate: text("cra_reevaluation_date").notNull(), // Mandatory CRA re-assessment target date
  isLatest: boolean("is_latest").notNull().default(true),
  changelog: text("changelog").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductReleaseSchema = createInsertSchema(productReleasesTable).omit({ id: true, createdAt: true });
export type InsertProductRelease = z.infer<typeof insertProductReleaseSchema>;
export type ProductReleaseRow = typeof productReleasesTable.$inferSelect;

/**
 * Enterprise Customers with CISA Critical Infrastructure Sectors
 */
export const enterpriseCustomersTable = pgTable("cra_enterprise_customers", {
  id: serial("id").primaryKey(),
  orgName: text("org_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactTitle: text("contact_title").notNull().default("CISO / Security Director"),
  contactEmail: text("contact_email").notNull(),
  region: text("region").notNull().default("EU-Central (Germany)"),
  cisaSector: text("cisa_sector").notNull().default("Energy"), // Official CISA Critical Infrastructure Sectors
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertEnterpriseCustomerSchema = createInsertSchema(enterpriseCustomersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEnterpriseCustomer = z.infer<typeof insertEnterpriseCustomerSchema>;
export type EnterpriseCustomerRow = typeof enterpriseCustomersTable.$inferSelect;

/**
 * Customer Deployments (Mapping Customers <-> Product Versions & Quantities)
 */
export const customerDeploymentsTable = pgTable("cra_customer_deployments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  productId: integer("product_id").notNull(),
  releaseId: integer("release_id").notNull(),
  deployedVersion: text("deployed_version").notNull(),
  quantity: integer("quantity").notNull().default(1),
  isOutdatedVersion: boolean("is_outdated_version").notNull().default(false),
  deploymentDate: text("deployment_date").notNull().default("2026-01-15"),
  notes: text("notes").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertCustomerDeploymentSchema = createInsertSchema(customerDeploymentsTable).omit({ id: true, updatedAt: true });
export type InsertCustomerDeployment = z.infer<typeof insertCustomerDeploymentSchema>;
export type CustomerDeploymentRow = typeof customerDeploymentsTable.$inferSelect;

/**
 * Product Supporting Documents & 5-10 Year CRA Statutory Provenance Vault
 */
export const productDocumentsTable = pgTable("cra_product_documents", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
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
  uploadedBy: text("uploaded_by").notNull().default("Security Administrator"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertProductDocumentSchema = createInsertSchema(productDocumentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProductDocument = z.infer<typeof insertProductDocumentSchema>;
export type ProductDocumentRow = typeof productDocumentsTable.$inferSelect;
