import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * Executive reporting suite. A report is generated from a FROZEN data snapshot
 * (pattern: flow-run snapshot) so it never silently drifts when live assessment
 * data changes. Deterministic sections (tables, charts, citations, KPI figures)
 * are pre-rendered HTML computed at creation; AI sections are markdown drafted
 * in the background from the same snapshot, individually editable/regenerable
 * while the report is `draft`, and locked once `final`.
 */

/** deterministic = pre-rendered, never editable; ai = drafted prose, editable. */
export type ReportSectionKind = "deterministic" | "ai";
/** pending/failed only ever apply to ai sections. */
export type ReportSectionStatus = "ready" | "pending" | "failed";

export type ReportSection = {
  key: string;
  heading: string;
  kind: ReportSectionKind;
  status: ReportSectionStatus;
  /** Pre-rendered HTML for deterministic sections ("" for ai sections). */
  html: string;
  /** Editable markdown for ai sections ("" for deterministic sections). */
  contentMd: string;
  /** Set when a member hand-edits an ai section. */
  editedBy?: string;
  editedAt?: string;
  /** Non-fatal generation note (e.g. invalid citation markers stripped). */
  note?: string;
};

export type ReportCitationKind = "regulation" | "standard" | "bibliography" | "evidence";

export type ReportCitation = {
  /** 1-based reference number used by in-text [n] markers. */
  n: number;
  /** Stable dedupe key, e.g. "reg:cra", "std:EN 18031-1:2024", "ev:12". */
  key: string;
  /** Fully rendered reference-list entry. */
  label: string;
  kind: ReportCitationKind;
};

export type ReportOptions = {
  includeAnnexes: boolean;
  includeEvidenceRegister: boolean;
  includeIncidentDetail: boolean;
};

export const conformityReportsTable = pgTable("conformity_reports", {
  id: serial("id").primaryKey(),
  // assessment | portfolio
  scope: text("scope").notNull(),
  // Set for scope=assessment; null for portfolio reports.
  assessmentId: integer("assessment_id").references(() => conformityAssessmentsTable.id, {
    onDelete: "cascade",
  }),
  // briefing | full | readout
  reportType: text("report_type").notNull(),
  // board | regulator
  audience: text("audience").notNull(),
  // generating | draft | final | failed
  status: text("status").notNull().default("generating"),
  title: text("title").notNull(),
  options: jsonb("options").$type<ReportOptions>().notNull(),
  // Frozen dataset the report was built from (shape owned by reportEngine).
  dataSnapshot: jsonb("data_snapshot").$type<Record<string, unknown>>().notNull(),
  citations: jsonb("citations").$type<ReportCitation[]>().notNull().default([]),
  sections: jsonb("sections").$type<ReportSection[]>().notNull().default([]),
  // Session actor ("role:username") that generated the report.
  createdBy: text("created_by").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertConformityReportSchema = createInsertSchema(conformityReportsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertConformityReport = z.infer<typeof insertConformityReportSchema>;
export type ConformityReportRow = typeof conformityReportsTable.$inferSelect;
