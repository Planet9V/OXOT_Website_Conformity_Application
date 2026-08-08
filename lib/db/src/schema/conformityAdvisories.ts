import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityProductsTable } from "./conformityProducts";
import { conformityVulnReportsTable } from "./conformityVulnReports";
import { conformityIncidentsTable } from "./conformityIncidents";

/**
 * Security advisories (Annex I Part II (4), (8) CRA): the manufacturer's
 * public disclosure of a fixed vulnerability. Draft → published; published
 * advisories are served on the public security page. `advisoryCode` is the
 * stable external identifier (OXOT-SA-<year>-<seq>), assigned at creation.
 */
export const conformityAdvisoriesTable = pgTable("conformity_advisories", {
  id: serial("id").primaryKey(),
  advisoryCode: text("advisory_code").notNull().unique(),
  productId: integer("product_id").references(() => conformityProductsTable.id, {
    onDelete: "set null",
  }),
  // Frozen product name so a published advisory survives product deletion/rename.
  productName: text("product_name").notNull().default(""),
  vulnReportId: integer("vuln_report_id").references(() => conformityVulnReportsTable.id, {
    onDelete: "set null",
  }),
  incidentId: integer("incident_id").references(() => conformityIncidentsTable.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  // low | medium | high | critical
  severity: text("severity").notNull().default("medium"),
  vulnerabilityId: text("vulnerability_id").notNull().default(""),
  affectedVersions: text("affected_versions").notNull().default(""),
  fixedVersions: text("fixed_versions").notNull().default(""),
  workarounds: text("workarounds").notNull().default(""),
  credits: text("credits").notNull().default(""),
  // draft | published
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdBy: text("created_by").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("conformity_advisories_product_id_idx").on(table.productId),
  index("conformity_advisories_vuln_report_id_idx").on(table.vulnReportId),
  index("conformity_advisories_incident_id_idx").on(table.incidentId),
]);

export const insertConformityAdvisorySchema = createInsertSchema(conformityAdvisoriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertConformityAdvisory = z.infer<typeof insertConformityAdvisorySchema>;
export type ConformityAdvisoryRow = typeof conformityAdvisoriesTable.$inferSelect;
