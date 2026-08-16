import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityProductsTable } from "./conformityProducts";
import { conformityAdvisoriesTable } from "./conformityAdvisories";

/**
 * The product-user register and user-notification record (task 10.2).
 *
 * CRA Art. 14(8): after becoming aware of an actively exploited
 * vulnerability or a severe incident, the manufacturer SHALL inform the
 * impacted users (and where appropriate all users), including risk
 * mitigation and corrective measures — where appropriate in a structured,
 * machine-readable format. NIS2 Art. 23(2) has the sibling duty toward
 * recipients of services for significant cyber threats.
 *
 * Discipline notes:
 * - The register records FACTS as stated: a user's deployed version or
 *   contact may be absent ("") and is never invented. Absence renders as
 *   absence; an absent version means an advisory match CANNOT RULE THE
 *   USER OUT (tri-state, L40).
 * - The notification table records the ORGANISATION'S OWN ACT — who says
 *   they informed which scope, when, how. This application transmits
 *   nothing and never claims to; `recordedBy` and `statedAt` carry the
 *   provenance, with no defaults (L50).
 */
export const conformityProductUsersTable = pgTable(
  "conformity_product_users",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => conformityProductsTable.id, { onDelete: "cascade" }),
    /** The user as the organisation knows them (customer org, channel, fleet). */
    name: text("name").notNull(),
    /** Contact channel as recorded — free text, "" until known. */
    contact: text("contact").notNull().default(""),
    /** The version this user is recorded as running — "" until known. */
    deployedVersion: text("deployed_version").notNull().default(""),
    notes: text("notes").notNull().default(""),
    /** Provenance: who registered this row. Never defaulted. */
    registeredBy: text("registered_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("conformity_product_users_product_id_idx").on(table.productId)],
);

export const insertConformityProductUserSchema = createInsertSchema(
  conformityProductUsersTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConformityProductUser = z.infer<typeof insertConformityProductUserSchema>;
export type ConformityProductUserRow = typeof conformityProductUsersTable.$inferSelect;

export const conformityUserNotificationsTable = pgTable(
  "conformity_user_notifications",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => conformityProductsTable.id, { onDelete: "cascade" }),
    /** The advisory this notification concerns, when there is one. */
    advisoryId: integer("advisory_id").references(() => conformityAdvisoriesTable.id, {
      onDelete: "set null",
    }),
    /** Art. 14(8)'s two scopes: impacted_users | all_users. */
    scope: text("scope").notNull(),
    /** When the organisation states it informed the users. No default. */
    statedAt: timestamp("stated_at", { withTimezone: true }).notNull(),
    /** How, as stated (e-mail to registered contacts, portal notice, …). */
    method: text("method").notNull(),
    /** The mitigations/corrective measures communicated, as stated. */
    measuresSummary: text("measures_summary").notNull().default(""),
    /** Machine-readable format used, if any (e.g. CSAF) — "" when none. */
    machineReadableFormat: text("machine_readable_format").notNull().default(""),
    /** Provenance: who recorded this act. Never defaulted. */
    recordedBy: text("recorded_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("conformity_user_notifications_product_id_idx").on(table.productId),
    index("conformity_user_notifications_advisory_id_idx").on(table.advisoryId),
  ],
);

export const insertConformityUserNotificationSchema = createInsertSchema(
  conformityUserNotificationsTable,
).omit({ id: true, createdAt: true });
export type InsertConformityUserNotification = z.infer<
  typeof insertConformityUserNotificationSchema
>;
export type ConformityUserNotificationRow = typeof conformityUserNotificationsTable.$inferSelect;
