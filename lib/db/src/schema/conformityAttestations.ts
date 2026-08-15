import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";

/**
 * The provenance ledger — P6.
 *
 * `DESIGN_five_shapes.md` D1 committed to the system-of-record posture: the
 * artifacts generated here are the ones handed to a notified body or a market
 * surveillance authority. A system of record without provenance is a filing
 * cabinet with no lock.
 *
 * APPEND-ONLY. There is no updatedAt, and nothing updates a row. A correction
 * is a NEW attestation with `supersedes` pointing at the one it replaces,
 * because the history of what was attested — and by whom, and when — is the
 * thing being preserved. Rewriting an attestation would destroy the only
 * evidence that the earlier statement was ever made.
 *
 * `subject` is a stable string like "artifact:eu_doc:12" or "evidence:44",
 * rather than a foreign key, so an attestation survives the deletion of what it
 * describes. An attestation whose subject has been deleted is itself a fact
 * worth keeping.
 */
export const conformityAttestationsTable = pgTable(
  "conformity_attestations",
  {
    id: serial("id").primaryKey(),

    /**
     * evidence_upload | artifact_generated | artifact_approved
     * | declaration_signed | determination_recorded
     */
    kind: text("kind").notNull(),
    /** What this attaches to, e.g. "artifact:eu_doc:12". */
    subject: text("subject").notNull(),
    /** "role:username" — who is standing behind this. */
    actor: text("actor").notNull(),
    /** What the actor is asserting, in words. */
    statement: text("statement").notNull().default(""),

    /** SHA-256 over the attested bytes alone. */
    contentDigest: text("content_digest").notNull(),
    contentBytes: integer("content_bytes").notNull().default(0),
    /**
     * SHA-256 over the whole record. Changing the actor, the time, the subject
     * or the content digest changes this, so an attestation cannot be quietly
     * re-pointed at different content or a different person.
     */
    recordDigest: text("record_digest").notNull(),

    attestedAt: timestamp("attested_at", { withTimezone: true }).notNull(),
    /** The attestation this one corrects. Append-only corrections. */
    supersedes: integer("supersedes"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("conformity_attestations_subject_idx").on(t.subject, t.attestedAt)],
);

export type ConformityAttestationRow = typeof conformityAttestationsTable.$inferSelect;
export type InsertConformityAttestation = typeof conformityAttestationsTable.$inferInsert;
