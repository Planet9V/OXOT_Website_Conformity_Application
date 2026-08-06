import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityBomComponentsTable } from "./conformityBomComponents";

/**
 * SaaS & Cloud Service Bill of Materials (SaaSBOM) asset inventory.
 * Captures Remote Data Processing Solutions (RDPS) under CRA Article 3(1).
 */
export const conformitySaasAssetsTable = pgTable("conformity_saas_assets", {
  id: serial("id").primaryKey(),
  componentId: integer("component_id")
    .notNull()
    .references(() => conformityBomComponentsTable.id, { onDelete: "cascade" }),
  endpointUrl: text("endpoint_url").notNull(),
  cloudProvider: text("cloud_provider").notNull().default("AWS"), // AWS | Azure | GCP | Custom
  dataResidencyJurisdiction: text("data_residency_jurisdiction").notNull().default("EU"), // EU | US | Global
  authenticationMethod: text("authentication_method").notNull().default("OAuth2_OIDC"),
  slaUptimePercentage: text("sla_uptime_percentage").notNull().default("99.99"),
  isThirdPartyManaged: boolean("is_third_party_managed").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformitySaasAssetSchema = createInsertSchema(
  conformitySaasAssetsTable,
).omit({ id: true, createdAt: true });

export type InsertConformitySaasAsset = z.infer<typeof insertConformitySaasAssetSchema>;
export type ConformitySaasAssetRow = typeof conformitySaasAssetsTable.$inferSelect;
