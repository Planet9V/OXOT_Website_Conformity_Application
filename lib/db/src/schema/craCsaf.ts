import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const craCsafAdvisories = pgTable("cra_csaf_advisories", {
  id: serial("id").primaryKey(),
  trackingId: text("tracking_id").notNull(), // e.g. SSA-123456
  title: text("title").notNull(),
  publisher: text("publisher").notNull(), // Siemens, Moxa, Phoenix Contact, Cisco
  cveId: text("cve_id").notNull(),
  cvssScore: text("cvss_score").notNull().default("0.0"),
  severity: text("severity").notNull(), // CRITICAL, HIGH, MEDIUM, LOW
  status: text("status").notNull().default("final"), // interim, final
  remediationSummary: text("remediation_summary"),
  affectedProductSkus: jsonb("affected_product_skus").$type<string[]>().notNull(),
  fixedVersion: text("fixed_version"),
  csirtNotificationRequired: boolean("csirt_notification_required").notNull().default(false),
  csirtNotificationDeadline: timestamp("csirt_notification_deadline", { withTimezone: true }),
  rawCsafJson: jsonb("raw_csaf_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CraCsafAdvisory = typeof craCsafAdvisories.$inferSelect;
export type InsertCraCsafAdvisory = typeof craCsafAdvisories.$inferInsert;
