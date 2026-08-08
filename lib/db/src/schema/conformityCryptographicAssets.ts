import { pgTable, serial, text, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityBomComponentsTable } from "./conformityBomComponents";

/**
 * Cryptography Bill of Materials (CBOM) asset inventory.
 * Captures algorithms, key lengths, certificates, and PQC readiness.
 */
export const conformityCryptographicAssetsTable = pgTable("conformity_cryptographic_assets", {
  id: serial("id").primaryKey(),
  componentId: integer("component_id")
    .notNull()
    .references(() => conformityBomComponentsTable.id, { onDelete: "cascade" }),
  algorithmName: text("algorithm_name").notNull(), // e.g. "AES-256-GCM", "RSA-2048", "Dilithium3"
  assetType: text("asset_type").notNull().default("algorithm"), // algorithm | key | certificate | protocol
  keySizeBits: integer("key_size_bits"),
  isDeprecated: boolean("is_deprecated").notNull().default(false), // true for MD5, SHA-1, DES
  isPqcReady: boolean("is_pqc_ready").notNull().default(false), // Post-Quantum Cryptography status
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("conformity_cryptographic_assets_component_id_idx").on(table.componentId),
]);

export const insertConformityCryptographicAssetSchema = createInsertSchema(
  conformityCryptographicAssetsTable,
).omit({ id: true, createdAt: true });

export type InsertConformityCryptographicAsset = z.infer<typeof insertConformityCryptographicAssetSchema>;
export type ConformityCryptographicAssetRow = typeof conformityCryptographicAssetsTable.$inferSelect;
