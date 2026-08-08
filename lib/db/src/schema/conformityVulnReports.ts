import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityProductsTable } from "./conformityProducts";

/**
 * External vulnerability reports received through the public CVD intake
 * (Annex I Part II CRA). Reporters submit against a free-text product name so
 * the intake never leaks the product catalogue; PSIRT maps the report to a
 * concrete product during triage.
 *
 * Remediation lifecycle (enforced server-side):
 *   received → triaged → (confirmed | rejected)
 *   confirmed → fix_in_progress → fix_available → disclosed
 * Every transition appends a conformity_vuln_report_events row.
 */
export const VULN_REPORT_STATUSES = [
  "received",
  "triaged",
  "confirmed",
  "rejected",
  "fix_in_progress",
  "fix_available",
  "disclosed",
] as const;
export type VulnReportStatus = (typeof VULN_REPORT_STATUSES)[number];

export const conformityVulnReportsTable = pgTable("conformity_vuln_reports", {
  id: serial("id").primaryKey(),
  // Free text as submitted by the reporter; mapped to productId at triage.
  productName: text("product_name").notNull(),
  productId: integer("product_id").references(() => conformityProductsTable.id, {
    onDelete: "set null",
  }),
  reporterName: text("reporter_name").notNull().default(""),
  reporterEmail: text("reporter_email").notNull().default(""),
  title: text("title").notNull(),
  description: text("description").notNull(),
  affectedVersions: text("affected_versions").notNull().default(""),
  // Reporter-claimed severity (low|medium|high|critical|""), re-assessed at triage.
  claimedSeverity: text("claimed_severity").notNull().default(""),
  assessedSeverity: text("assessed_severity").notNull().default(""),
  status: text("status").notNull().default("received"),
  owner: text("owner").notNull().default(""),
  // Assigned identifier once known (e.g. CVE).
  vulnerabilityId: text("vulnerability_id").notNull().default(""),
  resolutionNotes: text("resolution_notes").notNull().default(""),
  // Coordinated-disclosure target derived from the product PSIRT profile at triage.
  disclosureDueAt: timestamp("disclosure_due_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("conformity_vuln_reports_product_id_idx").on(table.productId),
]);

/** Append-only lifecycle ledger for a vulnerability report. */
export const conformityVulnReportEventsTable = pgTable("conformity_vuln_report_events", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .notNull()
    .references(() => conformityVulnReportsTable.id, { onDelete: "cascade" }),
  fromStatus: text("from_status").notNull().default(""),
  toStatus: text("to_status").notNull(),
  actor: text("actor").notNull().default(""),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("conformity_vuln_report_events_report_id_idx").on(table.reportId),
]);

export const insertConformityVulnReportSchema = createInsertSchema(
  conformityVulnReportsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConformityVulnReport = z.infer<typeof insertConformityVulnReportSchema>;
export type ConformityVulnReportRow = typeof conformityVulnReportsTable.$inferSelect;
export type ConformityVulnReportEventRow = typeof conformityVulnReportEventsTable.$inferSelect;
