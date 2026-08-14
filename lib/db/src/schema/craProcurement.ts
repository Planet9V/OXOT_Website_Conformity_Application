import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const craProcurementEvaluations = pgTable("cra_procurement_evaluations", {
  id: serial("id").primaryKey(),
  vendorName: text("vendor_name").notNull(),
  productName: text("product_name").notNull(),
  productClass: text("product_class").notNull().default("default"), // default, important_class_1, important_class_2, critical
  ceMarkVerified: boolean("ce_mark_verified").notNull().default(false),
  docVerified: boolean("doc_verified").notNull().default(false),
  docUrl: text("doc_url"),
  supportPeriodYears: integer("support_period_years").notNull().default(5),
  vulnerabilityContact: text("vulnerability_contact"),
  sbomFormat: text("sbom_format").notNull().default("cyclonedx_json"), // cyclonedx_json, spdx_json, none
  scorecardStatus: text("scorecard_status").notNull().default("CONDITIONAL"), // APPROVED, CONDITIONAL, REJECTED
  evaluationScore: integer("evaluation_score").notNull().default(0), // 0 to 100
  evaluatedBy: text("evaluated_by"),
  evaluationNotes: text("evaluation_notes"),
  criteriaScores: jsonb("criteria_scores").$type<{
    ceMark: boolean;
    euDoc: boolean;
    supportLifetime: boolean;
    vulnerabilityChannel: boolean;
    machineReadableSbom: boolean;
    freeSecurityPatches: boolean;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CraProcurementEvaluation = typeof craProcurementEvaluations.$inferSelect;
export type InsertCraProcurementEvaluation = typeof craProcurementEvaluations.$inferInsert;
