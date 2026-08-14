import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Supplier Compliance & Distributor Tracking Schema (CRA Articles 18 & 19).
 * Tracks OEM equipment vendors (Cisco, Siemens, Hirschmann, Moxa, etc.) and their
 * CE-marking status, EU Declaration of Conformity (DoC) records, and support lifespans.
 */
export const suppliersTable = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  partnerId: text("partner_id").notNull().default("axians"),
  name: text("name").notNull(), // e.g. "Siemens AG", "Cisco Systems", "Belden / Hirschmann"
  vendorKey: text("vendor_key").notNull(), // "siemens", "cisco", "hirschmann", "moxa"
  country: text("country").notNull().default("DE"),
  isEuManufacturer: boolean("is_eu_manufacturer").notNull().default(true),
  complianceStatus: text("compliance_status").notNull().default("VERIFIED_CE_COMPLIANT"), // "VERIFIED_CE_COMPLIANT" | "PENDING_DOCS" | "NON_COMPLIANT_HALT_SALES" | "LEGACY_EOS"
  hasPublishedDoC: boolean("has_published_doc").notNull().default(true), // Holds EU Declaration of Conformity
  psirtContactUrl: text("psirt_contact_url"),
  declaredSupportYears: integer("declared_support_years").notNull().default(5), // Article 13(6) support period
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const supplierProductsTable = pgTable("supplier_products", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliersTable.id, { onDelete: "cascade" }),
  modelName: text("model_name").notNull(), // e.g. "Scalance XC-208", "RS20-0800"
  category: text("category").notNull(), // "switch" | "firewall" | "router" | "plc"
  craAnnexClass: text("cra_annex_class").notNull().default("CLASS_I"),
  hasCeMark: boolean("has_ce_mark").notNull().default(true),
  docUrl: text("doc_url"), // Link to EU Declaration of Conformity
  isAvailableOnMarket: boolean("is_available_on_market").notNull().default(true), // Duty to refrain under Art 19(2)
  eosDate: text("eos_date"), // End-of-Support milestone date
  replacementModelKey: text("replacement_model_key"), // Suggested compliant replacement model
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierProductSchema = createInsertSchema(supplierProductsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type SupplierRow = typeof suppliersTable.$inferSelect;
export type InsertSupplierProduct = z.infer<typeof insertSupplierProductSchema>;
export type SupplierProductRow = typeof supplierProductsTable.$inferSelect;
