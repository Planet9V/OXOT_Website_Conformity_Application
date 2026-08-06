import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * Access tokens for external Notified Body auditors (TÜV SÜD, DNV, Bureau Veritas)
 * reviewing Module B (EU-type examination) or Module H (Full QA) technical files.
 */
export const conformityAuditorAccessTable = pgTable("conformity_auditor_access", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id")
    .notNull()
    .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
  auditorEmail: text("auditor_email").notNull(),
  notifiedBodyName: text("notified_body_name").notNull(),
  notifiedBodyNumber: text("notified_body_number").notNull(),
  accessToken: text("access_token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformityAuditorAccessSchema = createInsertSchema(
  conformityAuditorAccessTable
).omit({ id: true, createdAt: true });

export type InsertConformityAuditorAccess = z.infer<typeof insertConformityAuditorAccessSchema>;
export type ConformityAuditorAccessRow = typeof conformityAuditorAccessTable.$inferSelect;
