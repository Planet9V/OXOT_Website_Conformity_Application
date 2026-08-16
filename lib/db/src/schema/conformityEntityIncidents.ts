import { pgTable, serial, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

/**
 * A significant incident of the ORGANISATION as a NIS2 essential/important
 * entity (Art. 23) — entity-scoped, deliberately not product- or
 * assessment-scoped: NIS2 binds the entity's services, and forcing these
 * rows under a product would misstate whose incident it is.
 *
 * The three stage timestamps record SUBMISSIONS to the CSIRT or competent
 * authority. Deadlines are computed by lib/nis2Reporting.ts from awareAt
 * (and, for the final report, from the notification submission — its
 * statutory anchor) — never stored, so a corrected awareness time cannot
 * leave a stale deadline behind.
 */
export const conformityEntityIncidentsTable = pgTable(
  "conformity_entity_incidents",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    /** When the entity became aware — every Art. 23(4) clock runs from here. */
    awareAt: timestamp("aware_at", { withTimezone: true }).notNull(),

    /** Art. 23(4)(a): content indicators for the early warning. */
    suspectedMalicious: boolean("suspected_malicious"),
    possibleCrossBorderImpact: boolean("possible_cross_border_impact"),

    /** Stage submissions. Recorded when made; null until then. */
    earlyWarningAt: timestamp("early_warning_at", { withTimezone: true }),
    notificationAt: timestamp("notification_at", { withTimezone: true }),
    finalReportAt: timestamp("final_report_at", { withTimezone: true }),
    /** Free-text record of where each went — the national transposition
     * decides the recipient, so it is captured, not derived. */
    submittedTo: text("submitted_to").notNull().default(""),

    /** open | closed */
    status: text("status").notNull().default("open"),
    recordedBy: text("recorded_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("conformity_entity_incidents_status_idx").on(t.status, t.awareAt)],
);

export type ConformityEntityIncidentRow = typeof conformityEntityIncidentsTable.$inferSelect;
