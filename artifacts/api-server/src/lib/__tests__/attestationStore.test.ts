/**
 * The provenance ledger — the persistence half of P6.
 *
 * `provenance.test.ts` pins the rules. This pins that the ledger round-trips
 * them: an attestation read back from the database must verify exactly as the
 * one that was written, because if the two ever diverged a tampered row could
 * verify clean.
 */
import { afterAll, describe, expect, it } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { db, conformityAttestationsTable } from "@workspace/db";
import { recordAttestation, attestationsFor, verifyStored, subjectFor } from "../attestationStore";

const SUBJECT = `test:provenance:${Date.now()}`;
const created: number[] = [];

afterAll(async () => {
  if (created.length) {
    await db.delete(conformityAttestationsTable).where(inArray(conformityAttestationsTable.id, created));
  }
});

describe("recording", () => {
  it("stores an attestation and reads it back verifying clean", async () => {
    const row = await recordAttestation({
      kind: "artifact_generated",
      subject: SUBJECT,
      actor: "admin:tester",
      content: "the exact bytes",
      statement: "Generated for the test.",
    });
    created.push(row.id);

    expect(row.contentDigest).toHaveLength(64);
    expect(row.recordDigest).toHaveLength(64);

    const [stored] = await attestationsFor(SUBJECT);
    const v = verifyStored(stored!, "the exact bytes");
    expect(v.state).toBe("intact");
  });

  it("detects content that changed after the attestation", async () => {
    const [stored] = await attestationsFor(SUBJECT);
    const v = verifyStored(stored!, "different bytes entirely");
    expect(v.state).toBe("content_changed");
    expect(v.message).toMatch(/does not extend to the current ones/);
  });

  /**
   * The reason verifyStored rebuilds the record rather than trusting the row:
   * if someone edits the actor column directly, the record digest no longer
   * matches and the ledger says so.
   */
  it("detects a row edited directly in the database", async () => {
    const [stored] = await attestationsFor(SUBJECT);
    const tampered = { ...stored!, actor: "admin:someone.else" };
    const v = verifyStored(tampered, "the exact bytes");
    expect(v.state).toBe("record_tampered");
  });
});

describe("append-only corrections", () => {
  it("supersedes rather than updating, keeping both on the ledger", async () => {
    const first = (await attestationsFor(SUBJECT))[0]!;
    const correction = await recordAttestation({
      kind: "artifact_generated",
      subject: SUBJECT,
      actor: "admin:tester",
      content: "corrected bytes",
      statement: "Regenerated after a correction.",
      supersedes: first.id,
    });
    created.push(correction.id);

    const all = await attestationsFor(SUBJECT);
    // Both survive; the history of what was attested is the thing preserved.
    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(all.some((a) => a.id === first.id)).toBe(true);
    expect(all.find((a) => a.id === correction.id)?.supersedes).toBe(first.id);

    // The superseded one still verifies against ITS content, not the new one.
    const original = all.find((a) => a.id === first.id)!;
    expect(verifyStored(original, "the exact bytes").state).toBe("intact");
  });
});

describe("subject keys", () => {
  it("spells a subject one way", () => {
    expect(subjectFor.evidence(44)).toBe("evidence:44");
    expect(subjectFor.artifact(12, "eu_doc")).toBe("artifact:eu_doc:12");
    expect(subjectFor.declaration(12)).toBe("declaration:eu_doc:12");
  });
});
