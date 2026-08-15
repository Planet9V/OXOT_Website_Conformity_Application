import { pgTable, boolean, serial, text, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityBomsTable } from "./conformityBoms";

/**
 * One parsed entry from a BOM. Generic across BOM types: for an SBOM this is a
 * software component, for a CBOM a crypto-asset (algorithm/key/certificate) whose
 * details land in `cryptoProperties`. `raw` keeps the original parsed node so the
 * UI can show everything the source provided without a schema migration.
 */
export const conformityBomComponentsTable = pgTable("conformity_bom_components", {
  id: serial("id").primaryKey(),
  bomId: integer("bom_id")
    .notNull()
    .references(() => conformityBomsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  version: text("version").notNull().default(""),
  // library | application | framework | operating-system | device | crypto-asset | ...
  componentType: text("component_type").notNull().default("library"),
  purl: text("purl").notNull().default(""),
  supplier: text("supplier").notNull().default(""),
  // Document-local reference (CycloneDX `bom-ref` / SPDX `SPDXID`) — the join
  // key for the dependency graph in `conformity_bom_dependencies`.
  bomRef: text("bom_ref").notNull().default(""),
  // Typed, SQL-queryable attributes promoted out of the raw node.
  group: text("group").notNull().default(""),
  cpe: text("cpe").notNull().default(""),
  scope: text("scope").notNull().default(""),
  description: text("description").notNull().default(""),
  // Hardware/device attributes (HBOM/MBOM/OBOM); blank for pure software rows.
  manufacturer: text("manufacturer").notNull().default(""),
  partNumber: text("part_number").notNull().default(""),
  serialNumber: text("serial_number").notNull().default(""),
  firmwareVersion: text("firmware_version").notNull().default(""),
  licenses: jsonb("licenses").$type<string[]>().notNull().default([]),
  hashes: jsonb("hashes").$type<Record<string, string>>().notNull().default({}),
  // Present for CBOM crypto-assets (algorithm, keySize, primitive, nistQuantumSecurityLevel…).
  cryptoProperties: jsonb("crypto_properties").$type<Record<string, unknown> | null>(),
  findingCount: integer("finding_count").notNull().default(0),
  // 6-Type xBOM Discriminator: sbom | hbom | cbom | saasbom | dbom | aibom
  bomType: text("bom_type").notNull().default("sbom"),
  // Hierarchical Multi-Tier OEM Supply Chain Lineage:
  parentComponentId: integer("parent_component_id"),
  tierLevel: integer("tier_level").notNull().default(1),
  chipsetArchitecture: text("chipset_architecture").notNull().default(""),
  pqcReadinessScore: integer("pqc_readiness_score").notNull().default(100),

  /**
   * Article 13(5) due diligence over this third-party component.
   *
   * Recital 34 makes the appropriate level depend on the component's
   * cybersecurity risk, and offers four actions as ALTERNATIVES ("one or
   * more"). So risk is recorded, the actions actually taken are recorded, and
   * neither is defaulted — an unassessed component must read as unassessed
   * rather than as low risk with nothing required.
   */
  dueDiligenceRisk: text("due_diligence_risk"),
  /** Subset of: conformity_verified, update_history_verified,
   *  vulnerability_database_checked, additional_security_testing. */
  dueDiligenceActions: jsonb("due_diligence_actions").$type<string[]>().notNull().default([]),
  /** Recital 34 follow-through where diligence found a vulnerability. */
  dueDiligenceVulnerabilityFound: boolean("due_diligence_vulnerability_found"),
  dueDiligenceMaintainerInformedAt: text("due_diligence_maintainer_informed_at"),
  dueDiligenceRemediatedAt: text("due_diligence_remediated_at"),
  dueDiligenceFixProvided: boolean("due_diligence_fix_provided"),
  raw: jsonb("raw").$type<Record<string, unknown>>().notNull().default({}),
}, (table) => [
  index("conformity_bom_components_bom_id_idx").on(table.bomId),
]);

export const insertConformityBomComponentSchema = createInsertSchema(
  conformityBomComponentsTable,
).omit({ id: true });
export type InsertConformityBomComponent = z.infer<typeof insertConformityBomComponentSchema>;
export type ConformityBomComponentRow = typeof conformityBomComponentsTable.$inferSelect;
