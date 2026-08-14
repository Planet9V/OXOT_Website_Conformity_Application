import { pgTable, serial, text, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export interface SanitizedAssetItem {
  id: string; // Sanitized/hashed asset ID
  vendor: string; // e.g. "Siemens"
  model: string; // e.g. "Scalance X208"
  firmwareVersion?: string; // e.g. "V5.2.1"
  category: "switch" | "firewall" | "router" | "gateway" | "plc" | "other";
  craAnnexClass: "CLASS_I" | "CLASS_II" | "DEFAULT" | "OUT_OF_SCOPE";
  isGrandfatheredPre2027: boolean; // Article 69(2) status
  isArt14Exposed: boolean; // Reached EOS / unpatchable vulnerability gap
  hasSpareMatch: boolean; // Matching warehouse spare identified
  matchedSpareSku?: string; // Stock SKU
  matchedSpareLeadHours?: number; // Dispatch speed (e.g. 48h)
  recommendedAction: "PULL_FORWARD_SPARE" | "MODERNIZE_CRA_HW" | "IEC_62443_CONDUIT" | "RETAIN";
}

export interface CommercialActionPlan {
  headline: string;
  summary: string;
  totalCapexPullForwardEstimateEur: number;
  totalModernizationCapexEstimateEur: number;
  annualNaasOpexEstimateEur: number;
  recommendedNextSteps: string[];
  salesDialoguePrompts: {
    urgencyPrompt: string;
    installedBasePrompt: string;
    roadmapPrompt: string;
    partnerValuePrompt: string;
  };
}

/**
 * Customer Network Scope Assessment & Commercial Modernization Dossier.
 * Single-tenant assessment record storing sanitized hardware asset inventories,
 * CRA statutory classifications, Article 61 fine liabilities, and commercial transition plans.
 */
export const networkScopeAssessmentsTable = pgTable("network_scope_assessments", {
  id: serial("id").primaryKey(),
  partnerId: text("partner_id").notNull().default("axians"),
  accountManagerName: text("account_manager_name"),
  accountManagerEmail: text("account_manager_email"),
  clientCompanyName: text("client_company_name").notNull(),
  clientIndustry: text("client_industry").notNull().default("Industrial Manufacturing / OT"),
  clientAnnualTurnoverEur: numeric("client_annual_turnover_eur", { precision: 15, scale: 2 }),
  article61FineExposureEur: numeric("article_61_fine_exposure_eur", { precision: 15, scale: 2 }),
  totalAssetsCount: integer("total_assets_count").notNull().default(0),
  classIAssetsCount: integer("class_i_assets_count").notNull().default(0),
  classIiAssetsCount: integer("class_ii_assets_count").notNull().default(0),
  grandfatheredPre2027Count: integer("grandfathered_pre_2027_count").notNull().default(0),
  art14ExposedCount: integer("art_14_exposed_count").notNull().default(0), // Assets at immediate reporting risk
  spareStockMatchesCount: integer("spare_stock_matches_count").notNull().default(0),
  sanitizedAssets: jsonb("sanitized_assets").$type<SanitizedAssetItem[]>().default([]),
  commercialActionPlan: jsonb("commercial_action_plan").$type<CommercialActionPlan>(),
  status: text("status").notNull().default("completed"), // "draft" | "completed" | "shared_with_client" | "won"
  locale: text("locale").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNetworkScopeAssessmentSchema = createInsertSchema(networkScopeAssessmentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNetworkScopeAssessment = z.infer<typeof insertNetworkScopeAssessmentSchema>;
export type NetworkScopeAssessmentRow = typeof networkScopeAssessmentsTable.$inferSelect;
