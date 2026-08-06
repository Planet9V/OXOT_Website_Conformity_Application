import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityBomComponentsTable } from "./conformityBomComponents";

/**
 * Data Classification & Data Lineage Bill of Materials (DBOM) asset inventory.
 * Captures GDPR PII data flows, encryption status, and storage retention under CRA Annex I(2)(f).
 */
export const conformityDataAssetsTable = pgTable("conformity_data_assets", {
  id: serial("id").primaryKey(),
  componentId: integer("component_id")
    .notNull()
    .references(() => conformityBomComponentsTable.id, { onDelete: "cascade" }),
  datasetName: text("dataset_name").notNull(),
  // Public | Internal | Confidential | PII | Strictly_Secret
  classificationLevel: text("classification_level").notNull().default("Confidential"),
  storageType: text("storage_type").notNull().default("PostgreSQL"), // PostgreSQL | Redis | S3 | VectorDB
  isEncryptedAtRest: boolean("is_encrypted_at_rest").notNull().default(true),
  isEncryptedInTransit: boolean("is_encrypted_in_transit").notNull().default(true),
  retentionPeriodYears: integer("retention_period_years").notNull().default(10),
  containsPii: boolean("contains_pii").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformityDataAssetSchema = createInsertSchema(
  conformityDataAssetsTable,
).omit({ id: true, createdAt: true });

export type InsertConformityDataAsset = z.infer<typeof insertConformityDataAssetSchema>;
export type ConformityDataAssetRow = typeof conformityDataAssetsTable.$inferSelect;
