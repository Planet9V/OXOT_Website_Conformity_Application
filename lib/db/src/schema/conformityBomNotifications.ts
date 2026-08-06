import { pgTable, serial, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * CRA Art 13(6) upstream notification tracking: when a vulnerability is found in
 * a third-party component, the manufacturer must report it to whoever maintains
 * that component. One row tracks that duty for one (component, vulnerability)
 * pair on an assessment.
 *
 * Deliberately NOT foreign-keyed to a finding row: findings are wiped and
 * regenerated on every BOM (re)analysis. The record is keyed by the stable
 * natural identity instead — `componentKey` (the purl, or `name@version` when no
 * purl exists) + the vulnerability identifier — so re-ingesting or re-analyzing
 * a newer BOM re-attaches the tracking record instead of orphaning it.
 */
export const conformityBomNotificationsTable = pgTable(
  "conformity_bom_notifications",
  {
    id: serial("id").primaryKey(),
    assessmentId: integer("assessment_id")
      .notNull()
      .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
    // Canonical component identity: purl if present, else `name@version`.
    componentKey: text("component_key").notNull(),
    // Denormalized display fields (the component row may be gone after a re-upload).
    componentName: text("component_name").notNull().default(""),
    componentVersion: text("component_version").notNull().default(""),
    purl: text("purl").notNull().default(""),
    // CVE / OSV / GHSA identifier the notification concerns.
    vulnerabilityId: text("vulnerability_id").notNull(),
    // not_required | pending | notified | acknowledged
    status: text("status").notNull().default("pending"),
    // Maintainer / upstream contact (email, security.txt URL, tracker, …).
    maintainerContact: text("maintainer_contact").notNull().default(""),
    // How the notification was (or will be) made: email | security_advisory | issue_tracker | other
    method: text("method").notNull().default(""),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    // Art 13(6) has no statutory deadline, but "upon identifying" implies
    // promptness — dueAt is the workbench's own SLA clock (set at creation,
    // e.g. detection + 72h) so pending notifications surface in alerting.
    dueAt: timestamp("due_at", { withTimezone: true }),
    // When the upstream maintainer acknowledged receipt (closes the loop).
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    notes: text("notes").notNull().default(""),
    // Session actor ("role:username") who recorded / last updated the record.
    recordedBy: text("recorded_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("conformity_bom_notifications_unique").on(
      t.assessmentId,
      t.componentKey,
      t.vulnerabilityId,
    ),
  ],
);

export const insertConformityBomNotificationSchema = createInsertSchema(
  conformityBomNotificationsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConformityBomNotification = z.infer<
  typeof insertConformityBomNotificationSchema
>;
export type ConformityBomNotificationRow = typeof conformityBomNotificationsTable.$inferSelect;
