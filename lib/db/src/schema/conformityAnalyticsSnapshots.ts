import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * Time-series analytics snapshots capturing historical compliance metrics,
 * Post-Quantum Cryptography (PQC) readiness, active CVE counts, and domain scores.
 */
export const conformityAnalyticsSnapshotsTable = pgTable("conformity_analytics_snapshots", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id")
    .notNull()
    .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
  compliancePercentage: integer("compliance_percentage").notNull(),
  pqcReadinessScore: integer("pqc_readiness_score").notNull().default(100),
  activeVulnerabilitiesCount: integer("active_vulnerabilities_count").notNull().default(0),
  openRfisCount: integer("open_rfis_count").notNull().default(0),
  domainScores: jsonb("domain_scores").$type<Record<string, number>>().notNull().default({}),
  snapshotDate: timestamp("snapshot_date", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformityAnalyticsSnapshotSchema = createInsertSchema(
  conformityAnalyticsSnapshotsTable,
).omit({ id: true, snapshotDate: true });

export type InsertConformityAnalyticsSnapshot = z.infer<typeof insertConformityAnalyticsSnapshotSchema>;
export type ConformityAnalyticsSnapshotRow = typeof conformityAnalyticsSnapshotsTable.$inferSelect;
