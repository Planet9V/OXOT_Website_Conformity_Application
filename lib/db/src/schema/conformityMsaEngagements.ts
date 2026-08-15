import { pgTable, serial, text, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityProductsTable } from "./conformityProducts";

/**
 * Chapter V engagements with a market surveillance authority.
 *
 * Covers both things an authority can put to an economic operator: a reasoned
 * request for access to data under Art. 53, and a requirement to take corrective
 * action, withdraw or recall under Art. 54(1).
 *
 * `prescribedDeadline` is deliberately nullable and deliberately not defaulted.
 * The Regulation fixes no period for corrective action — Art. 54(1) says
 * "within a reasonable period, commensurate with the nature of the cybersecurity
 * risk, as the market surveillance authority may prescribe". The period is
 * therefore an input copied from the authority's communication, never something
 * this system computes. A null means nobody has recorded it yet.
 */
export const conformityMsaEngagementsTable = pgTable(
  "conformity_msa_engagements",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").references(() => conformityProductsTable.id, {
      onDelete: "set null",
    }),
    // data_access_request (Art. 53) | corrective_action_requirement (Art. 54(1))
    kind: text("kind").notNull().default("data_access_request"),
    /** The authority, and the Member State it acts for. */
    authorityName: text("authority_name").notNull().default(""),
    memberState: text("member_state").notNull().default(""),
    /** The authority's own case reference. */
    reference: text("reference").notNull().default(""),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    /** Art. 54(1) — the period the AUTHORITY prescribed. Never computed here. */
    prescribedDeadline: timestamp("prescribed_deadline", { withTimezone: true }),
    /** Art. 54(4): national | union_wide. Null until recorded. */
    scope: text("scope"),
    /** Art. 54(1): corrective_action | withdrawal | recall. */
    requiredMeasure: text("required_measure").notNull().default(""),
    /** Art. 53: data supplied in a language easily understood by the authority. */
    languageConfirmed: boolean("language_confirmed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    /** Art. 54(1), final subparagraph: the notified body must be informed. */
    notifiedBodyInformedAt: timestamp("notified_body_informed_at", { withTimezone: true }),
    notes: text("notes").notNull().default(""),
    recordedBy: text("recorded_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("conformity_msa_engagements_product_idx").on(t.productId, t.kind)],
);

export const insertConformityMsaEngagementSchema = createInsertSchema(
  conformityMsaEngagementsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConformityMsaEngagement = z.infer<
  typeof insertConformityMsaEngagementSchema
>;
export type ConformityMsaEngagementRow =
  typeof conformityMsaEngagementsTable.$inferSelect;
