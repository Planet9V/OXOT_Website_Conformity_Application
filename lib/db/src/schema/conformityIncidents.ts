import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * A post-market security incident tracked against the CRA Article 14 reporting
 * clock. Two statutory tracks (`kind`):
 *
 *  - "exploited_vulnerability" (Art 14(1)): early warning <= 24h, notification
 *    <= 72h of awareness, final report <= 14 days after a corrective or
 *    mitigating measure is AVAILABLE (`correctiveAvailableAt`). Until that
 *    anchor is known the workbench keeps a conservative detection + 14 days.
 *  - "severe_incident" (Art 14(3)): same 24h/72h clocks, final report <= one
 *    calendar month (EU Regulation 1182/71) after the 72h notification was
 *    SUBMITTED (`notificationDoneAt`). Conservative fallback: detection + 72h
 *    + one calendar month until the notification is marked done.
 *
 * Due timestamps are recomputed transactionally whenever their anchors change;
 * the *DoneAt fields record submission. The Art 14 content fields capture what
 * the ENISA Single Reporting Platform notification must contain.
 */
export const conformityIncidentsTable = pgTable("conformity_incidents", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id")
    .notNull()
    .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  // exploited_vulnerability | severe_incident (CRA Art 14(1) vs 14(3))
  kind: text("kind").notNull().default("exploited_vulnerability"),
  // low | medium | high | critical
  severity: text("severity").notNull().default("medium"),
  // Username of the assigned member ("" = unassigned). A username, not a serial
  // id, so re-seeding/deactivating members never orphans the assignment.
  owner: text("owner").notNull().default(""),
  detectedAt: timestamp("detected_at", { withTimezone: true }).notNull(),
  earlyWarningDueAt: timestamp("early_warning_due_at", { withTimezone: true }).notNull(),
  earlyWarningDoneAt: timestamp("early_warning_done_at", { withTimezone: true }),
  notificationDueAt: timestamp("notification_due_at", { withTimezone: true }).notNull(),
  notificationDoneAt: timestamp("notification_done_at", { withTimezone: true }),
  finalReportDueAt: timestamp("final_report_due_at", { withTimezone: true }).notNull(),
  finalReportDoneAt: timestamp("final_report_done_at", { withTimezone: true }),
  // When a corrective/mitigating measure became AVAILABLE (vulnerability track
  // final-report anchor). Null until known.
  correctiveAvailableAt: timestamp("corrective_available_at", { withTimezone: true }),
  // ── Article 14 notification content (SRP report package) ──────────────────
  // EU member states affected (free text, e.g. "NL, DE, FR" or "all").
  memberStates: text("member_states").notNull().default(""),
  // Severe incidents: suspected to be caused by unlawful or malicious acts.
  suspectedMalicious: boolean("suspected_malicious").notNull().default(false),
  // Nature of the exploit / vulnerability / incident (incl. severity & impact).
  exploitNature: text("exploit_nature").notNull().default(""),
  // ── Structured origin link (incident reported from a BOM finding) ─────────
  // The vulnerability identifier (e.g. CVE) the incident originated from, and
  // the affected component ("name@version"). Free text, "" when the incident
  // was reported manually — display-only provenance, not a foreign key, so it
  // survives BOM re-analysis regenerating finding rows.
  sourceVulnerabilityId: text("source_vulnerability_id").notNull().default(""),
  sourceComponent: text("source_component").notNull().default(""),
  // Corrective or mitigating measures taken by the manufacturer.
  correctiveMeasures: text("corrective_measures").notNull().default(""),
  // Corrective or mitigating measures USERS can apply.
  userMitigations: text("user_mitigations").notNull().default(""),
  // Known information about the malicious actor, where available.
  threatActorInfo: text("threat_actor_info").notNull().default(""),
  // Manufacturer considers the notified information highly sensitive.
  sensitive: boolean("sensitive").notNull().default(false),
  // open | closed
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertConformityIncidentSchema = createInsertSchema(
  conformityIncidentsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConformityIncident = z.infer<typeof insertConformityIncidentSchema>;
export type ConformityIncidentRow = typeof conformityIncidentsTable.$inferSelect;
