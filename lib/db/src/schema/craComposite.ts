import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const craCompositeSystems = pgTable("cra_composite_systems", {
  id: serial("id").primaryKey(),
  systemName: text("system_name").notNull(),
  machineType: text("machine_type").notNull(), // packaging_machine, robot_workcell, skid_controller, agv_system
  manufacturerName: text("manufacturer_name").notNull(),
  systemVersion: text("system_version").notNull().default("1.0.0"),
  totalComponentsCount: integer("total_components_count").notNull().default(0),
  compliantComponentsCount: integer("compliant_components_count").notNull().default(0),
  compositeComplianceStatus: text("composite_compliance_status").notNull().default("IN_REVIEW"), // COMPLIANT, NON_COMPLIANT, IN_REVIEW
  integrationRiskScore: integer("integration_risk_score").notNull().default(0), // 0 to 100
  ieee62443ZoneSegregation: boolean("ieee62443_zone_segregation").notNull().default(true),
  docSealedHash: text("doc_sealed_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const craCompositeComponents = pgTable("cra_composite_components", {
  id: serial("id").primaryKey(),
  compositeSystemId: integer("composite_system_id").notNull(),
  componentName: text("component_name").notNull(),
  vendor: text("vendor").notNull(),
  componentRole: text("component_role").notNull(), // plc, hmi, drive, sensor, industrial_pc, gateway
  firmwareVersion: text("firmware_version"),
  ceMarkPresent: boolean("ce_mark_present").notNull().default(false),
  docAvailable: boolean("doc_available").notNull().default(false),
  docUrl: text("doc_url"),
  supportExpiryDate: text("support_expiry_date"),
  riskFlag: text("risk_flag"), // NONE, EOS_UNPATCHABLE, MISSING_DOC, NON_CE
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CraCompositeSystem = typeof craCompositeSystems.$inferSelect;
export type InsertCraCompositeSystem = typeof craCompositeSystems.$inferInsert;
export type CraCompositeComponent = typeof craCompositeComponents.$inferSelect;
export type InsertCraCompositeComponent = typeof craCompositeComponents.$inferInsert;
