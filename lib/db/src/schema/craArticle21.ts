import { pgTable, serial, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const craArticle21Audits = pgTable("cra_article21_audits", {
  id: serial("id").primaryKey(),
  systemIntegratorName: text("system_integrator_name").notNull(),
  clientSiteName: text("client_site_name").notNull(),
  projectName: text("project_name").notNull(),
  targetHardwareModel: text("target_hardware_model").notNull(),
  targetSku: text("target_sku"),
  // 4 statutory gating questions
  q1IdenticalReplacement: boolean("q1_identical_replacement").notNull().default(true), // Recital 34 identical part
  q2OemSignedFirmware: boolean("q2_oem_signed_firmware").notNull().default(true),       // OEM-provided signed update
  q3IntendedPurposeUnchanged: boolean("q3_intended_purpose_unchanged").notNull().default(true), // Original operational envelope
  q4PerformanceEnvelopeConstant: boolean("q4_performance_envelope_constant").notNull().default(true), // No expansion of hazard zone
  classification: text("classification").notNull().default("INTEGRATOR_EXEMPT"), // INTEGRATOR_EXEMPT, MANUFACTURER_TRIGGERED
  exemptionBasis: text("exemption_basis"),
  certificateHash: text("certificate_hash").notNull(),
  auditedBy: text("audited_by"),
  assessmentMetadata: jsonb("assessment_metadata").$type<{
    purdueLevel?: string;
    originalPlacementYear?: number;
    statutoryJustification?: string;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CraArticle21Audit = typeof craArticle21Audits.$inferSelect;
export type InsertCraArticle21Audit = typeof craArticle21Audits.$inferInsert;
