import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { conformityIncidentsTable } from "./conformityIncidents";

/**
 * Dedupe / outcome ledger for CRA deadline alert emails.
 *
 * One row per logical alert (alertKey), claimed with INSERT .. ON CONFLICT DO
 * NOTHING before sending so concurrent or re-run scans never double-send the
 * same alert. If the send fails, the claim row is deleted so the next scan
 * retries. Keys look like `incident:<id>:<stage>:<phase>` (e.g.
 * `incident:12:early_warning:breached`), repeat "still overdue" reminders
 * `incident:<id>:<stage>:breached:reminder:<n>`, or `digest:<yyyy-mm-dd>`.
 */
export const conformityAlertStateTable = pgTable("conformity_alert_state", {
  id: serial("id").primaryKey(),
  alertKey: text("alert_key").notNull().unique(),
  // Nullable: digest rows aren't tied to one incident. Cascade cleans up
  // incident rows when the incident is deleted (a re-created incident gets a
  // new serial id, so stale keys can never suppress its alerts).
  incidentId: integer("incident_id").references(() => conformityIncidentsTable.id, {
    onDelete: "cascade",
  }),
  delivered: boolean("delivered").notNull().default(false),
  detail: text("detail").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ConformityAlertStateRow = typeof conformityAlertStateTable.$inferSelect;
