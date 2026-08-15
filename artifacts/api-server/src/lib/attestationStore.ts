/**
 * Recording and checking attestations — the persistence half of P6.
 *
 * `provenance.ts` holds the pure rules: how a digest is formed, what verifying
 * one means, and when a declaration may be signed. This puts them on the
 * ledger, so every call site records the same shape and nobody hand-rolls a
 * hash into an ad-hoc column.
 *
 * The ledger is append-only. A correction is a new attestation superseding the
 * old one, never an update — see the schema comment for why.
 */
import { desc, eq } from "drizzle-orm";
import { db, conformityAttestationsTable } from "@workspace/db";
import { attest, verifyAttestation, type AttestationKind, type AttestationRecord } from "./provenance";

export interface RecordAttestationInput {
  kind: AttestationKind;
  subject: string;
  actor: string;
  content: string | Buffer;
  statement?: string;
  supersedes?: number | null;
  /** Injected so callers control the clock and tests stay stable. */
  attestedAt?: Date;
}

/** Attest to some bytes and put it on the ledger. */
export async function recordAttestation(input: RecordAttestationInput) {
  const attestedAt = input.attestedAt ?? new Date();
  const record: AttestationRecord = attest({
    kind: input.kind,
    subject: input.subject,
    actor: input.actor,
    content: input.content,
    statement: input.statement,
    supersedes: input.supersedes ?? null,
    attestedAt: attestedAt.toISOString(),
  });

  const [row] = await db
    .insert(conformityAttestationsTable)
    .values({
      kind: record.kind,
      subject: record.subject,
      actor: record.actor,
      statement: record.statement,
      contentDigest: record.contentDigest,
      contentBytes: record.contentBytes,
      recordDigest: record.recordDigest,
      attestedAt,
      supersedes: record.supersedes,
    })
    .returning();
  return row!;
}

/** The attestation history for one subject, newest first. */
export async function attestationsFor(subject: string) {
  return db
    .select()
    .from(conformityAttestationsTable)
    .where(eq(conformityAttestationsTable.subject, subject))
    .orderBy(desc(conformityAttestationsTable.attestedAt));
}

/**
 * Check a stored attestation against content.
 *
 * Rebuilds the in-memory record from the row so the same verification logic
 * runs whether the attestation came from the ledger or was just made. If the
 * two ever diverged, a tampered row could verify.
 */
export function verifyStored(
  row: typeof conformityAttestationsTable.$inferSelect,
  content: string | Buffer | null,
) {
  const record: AttestationRecord = {
    kind: row.kind as AttestationKind,
    subject: row.subject,
    actor: row.actor,
    statement: row.statement,
    contentDigest: row.contentDigest,
    contentBytes: row.contentBytes,
    recordDigest: row.recordDigest,
    attestedAt: row.attestedAt.toISOString(),
    supersedes: row.supersedes,
  };
  return verifyAttestation(record, content);
}

/** Stable subject keys, so a subject is never spelled two ways. */
export const subjectFor = {
  evidence: (id: number) => `evidence:${id}`,
  artifact: (assessmentId: number, artifactType: string) =>
    `artifact:${artifactType}:${assessmentId}`,
  declaration: (assessmentId: number) => `declaration:eu_doc:${assessmentId}`,
};
