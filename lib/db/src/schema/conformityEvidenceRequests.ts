import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import type { TeamRole } from "./conformityMembers";

/**
 * An evidence request — the "ask" half of the P2 primitive (ask, receive,
 * hash, attest). The receive/hash/attest half is the existing evidence and
 * attestation machinery; this table records who was asked for what, for
 * which obligation, and by when.
 *
 * This is WORKFLOW, not statute: the CRA binds the organisation to hold
 * evidence, but who inside the organisation is asked to produce it, and the
 * internal deadline, are the organisation's own choices. Nothing here
 * computes a statutory clock, and fulfilling a request never implies the
 * obligation it serves is met — that stays with the obligation's own status.
 */
export const conformityEvidenceRequestsTable = pgTable(
  "conformity_evidence_requests",
  {
    id: serial("id").primaryKey(),

    /** The obligation the evidence is for — the reference layer's natural key. */
    regulationKey: text("regulation_key").notNull(),
    refCode: text("ref_code").notNull(),

    /** Optional product scope, when the evidence is product-specific. */
    productId: integer("product_id"),

    /** What is being asked for, in the requester's words. */
    title: text("title").notNull(),
    detail: text("detail").notNull().default(""),

    /**
     * Who is asked: a team role (the 6.3 routing vocabulary), optionally
     * narrowed to a named member. Role stays null only if a username is
     * given — a request must land in SOMEONE's inbox.
     */
    requestedOfRole: text("requested_of_role").$type<TeamRole>(),
    requestedOfUsername: text("requested_of_username").notNull().default(""),

    /** Internal deadline chosen by the requester. Never a statutory clock. */
    dueDate: text("due_date"),

    /** open | fulfilled | withdrawn */
    status: text("status").notNull().default("open"),
    /** What was provided or why it was withdrawn — the closing note. */
    resolution: text("resolution").notNull().default(""),
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
    fulfilledBy: text("fulfilled_by").notNull().default(""),

    requestedBy: text("requested_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("conformity_evidence_requests_inbox_idx").on(t.status, t.requestedOfRole),
    index("conformity_evidence_requests_obligation_idx").on(t.regulationKey, t.refCode),
  ],
);

export type ConformityEvidenceRequestRow = typeof conformityEvidenceRequestsTable.$inferSelect;
