import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Partner Warehouse Spare Parts & Modernization Replacement Inventory.
 * Single-tenant catalog of hardware units held in stock to service pre-2027 legacy
 * installed bases (identical spare parts under CRA Recital 34 & Art 2(2)) and provide
 * immediate 48h swap-out units to replace unpatchable EOL components.
 */
export const partnerSparePartsTable = pgTable("partner_spare_parts", {
  id: serial("id").primaryKey(),
  partnerId: text("partner_id").notNull().default("axians"), // Partner identifier for single-tenant / white-label
  sku: text("sku").notNull(), // Part Number / SKU (e.g. "6GK5208-0BA00-2AB2")
  vendor: text("vendor").notNull(), // Manufacturer (e.g. "Siemens", "Cisco", "Hirschmann", "Moxa")
  model: text("model").notNull(), // Model name (e.g. "Scalance XC-208", "IE-4000-8GS4G-E")
  category: text("category").notNull(), // "switch" | "firewall" | "router" | "gateway" | "plc" | "power_supply"
  craAnnexClass: text("cra_annex_class").notNull().default("CLASS_I"), // "CLASS_I" | "CLASS_II" | "DEFAULT"
  stockQuantity: integer("stock_quantity").notNull().default(0), // Available units in warehouse
  warehouseLocation: text("warehouse_location").notNull().default("Primary Regional Depot"),
  dispatchLeadHours: integer("dispatch_lead_hours").notNull().default(48), // In-stock dispatch time vs factory lead time
  isIdenticalSpare: boolean("is_identical_spare").notNull().default(true), // Recital 34 identical part exemption flag
  pre2027Grandfathered: boolean("pre_2027_grandfathered").notNull().default(true), // Pre-11 Dec 2027 placement flag
  compatibleTargetModels: jsonb("compatible_target_models").$type<string[]>().default([]), // List of EOL target models this unit replaces
  unitPriceEstimate: text("unit_price_estimate"), // Estimated unit price or pricing tier
  notes: text("notes"), // Engineering notes (e.g. "Direct DIN-rail replacement for RS20-0800")
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPartnerSparePartSchema = createInsertSchema(partnerSparePartsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPartnerSparePart = z.infer<typeof insertPartnerSparePartSchema>;
export type PartnerSparePartRow = typeof partnerSparePartsTable.$inferSelect;
