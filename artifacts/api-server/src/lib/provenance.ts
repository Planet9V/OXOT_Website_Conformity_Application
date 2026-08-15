/**
 * P6 — provenance.
 *
 * `DESIGN_five_shapes.md` D1 committed to the system-of-record posture: the
 * artifacts generated here are the ones handed to a notified body or a market
 * surveillance authority. A system of record without provenance is a filing
 * cabinet with no lock.
 *
 * Provenance answers four questions, and all four have to survive an argument
 * years later with someone who was not in the room:
 *
 *   WHO   attested to this
 *   WHEN  they did
 *   WHAT  exactly they attested to — the bytes, not the description
 *   SINCE has it changed
 *
 * Two deliberate limits, both stated rather than implied:
 *
 * 1. This is a cryptographic attestation bound to an application identity. It
 *    is NOT an eIDAS qualified electronic signature, and nothing here may be
 *    presented as one. Confirmed acceptable in D1's assumptions.
 *
 * 2. The digest covers the bytes attested to. It proves the content has not
 *    changed since; it does not prove the content was true. An assessor
 *    attesting to a wrong statement produces a perfectly valid attestation of a
 *    wrong statement.
 *
 * Annex V requires the EU declaration of conformity to be signed on behalf of
 * the manufacturer, which is why the actor's identity and role are part of the
 * record rather than a log line.
 */

import { createHash } from "node:crypto";

export type AttestationKind =
  | "evidence_upload"
  | "artifact_generated"
  | "artifact_approved"
  | "declaration_signed"
  | "determination_recorded";

export interface AttestationInput {
  kind: AttestationKind;
  /** "role:username" — who is standing behind this. */
  actor: string;
  /** The exact bytes attested to. */
  content: string | Buffer;
  /** ISO timestamp. Passed in so callers control the clock and tests are stable. */
  attestedAt: string;
  /** What this attaches to, e.g. "artifact:eu_doc:12". */
  subject: string;
  /** Free-text statement of what the actor is asserting. */
  statement?: string;
  /** For a corrected attestation: the id of the one it supersedes. */
  supersedes?: number | null;
}

export interface AttestationRecord {
  kind: AttestationKind;
  actor: string;
  attestedAt: string;
  subject: string;
  statement: string;
  /** SHA-256 over the attested bytes alone. */
  contentDigest: string;
  contentBytes: number;
  /**
   * SHA-256 over the whole record — content digest plus who, when, subject and
   * statement. Changing any of them changes this, so an attestation cannot be
   * quietly re-pointed at different content or a different person.
   */
  recordDigest: string;
  supersedes: number | null;
}

const sha256 = (b: string | Buffer) => createHash("sha256").update(b).digest("hex");

export function attest(input: AttestationInput): AttestationRecord {
  const contentBuf = Buffer.isBuffer(input.content)
    ? input.content
    : Buffer.from(input.content, "utf8");
  const contentDigest = sha256(contentBuf);
  const statement = input.statement ?? "";

  /**
   * The record digest deliberately includes the content digest rather than the
   * content, so the record can be verified without retaining the bytes — which
   * matters for a ten-year retention obligation over large files.
   */
  const recordDigest = sha256(
    JSON.stringify({
      kind: input.kind,
      actor: input.actor,
      attestedAt: input.attestedAt,
      subject: input.subject,
      statement,
      contentDigest,
      supersedes: input.supersedes ?? null,
    }),
  );

  return {
    kind: input.kind,
    actor: input.actor,
    attestedAt: input.attestedAt,
    subject: input.subject,
    statement,
    contentDigest,
    contentBytes: contentBuf.length,
    recordDigest,
    supersedes: input.supersedes ?? null,
  };
}

export type VerificationState = "intact" | "content_changed" | "record_tampered";

export interface Verification {
  state: VerificationState;
  message: string;
}

/**
 * Verify an attestation against the content it claims to cover.
 *
 * Distinguishes two different failures, because they mean different things:
 *   content_changed  the bytes differ from what was attested — the document was
 *                    edited after someone stood behind it
 *   record_tampered  the record's own fields no longer hash to its recordDigest
 *                    — the attestation itself was altered
 */
export function verifyAttestation(
  record: AttestationRecord,
  content: string | Buffer | null,
): Verification {
  const expected = sha256(
    JSON.stringify({
      kind: record.kind,
      actor: record.actor,
      attestedAt: record.attestedAt,
      subject: record.subject,
      statement: record.statement,
      contentDigest: record.contentDigest,
      supersedes: record.supersedes,
    }),
  );
  if (expected !== record.recordDigest) {
    return {
      state: "record_tampered",
      message:
        "The attestation record does not hash to its own recordDigest: who attested, when, or to what has been altered since it was made.",
    };
  }

  if (content === null) {
    return {
      state: "intact",
      message: `Attestation by ${record.actor} on ${record.attestedAt} is internally consistent. The content was not supplied, so it was not compared.`,
    };
  }

  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
  if (sha256(buf) !== record.contentDigest) {
    return {
      state: "content_changed",
      message: `The content has changed since ${record.actor} attested to it on ${record.attestedAt}. The attestation covers the earlier bytes and does not extend to the current ones.`,
    };
  }

  return {
    state: "intact",
    message: `Attested by ${record.actor} on ${record.attestedAt}, and the content is unchanged since.`,
  };
}

/**
 * The Annex V signature on the EU declaration of conformity.
 *
 * Kept separate from a generic attestation because it carries a legal weight
 * the others do not: it is made ON BEHALF OF THE MANUFACTURER, and Art. 64
 * liability follows it. Signing an incomplete declaration is the specific thing
 * worth refusing.
 */
export interface DeclarationSignatureInput {
  actor: string;
  actorRoleInOrganisation: string;
  signedAt: string;
  declarationContent: string;
  /** Every section complete? A declaration is not partially true. */
  declarationComplete: boolean;
  /** Whether this actor is authorised to bind the manufacturer. */
  authorisedToBind: boolean | null;
}

export interface DeclarationSignatureResult {
  signed: boolean;
  attestation: AttestationRecord | null;
  refusals: string[];
  citations: string[];
  message: string;
}

export function signDeclaration(input: DeclarationSignatureInput): DeclarationSignatureResult {
  const citations = ["Article 28", "Annex V"];
  const refusals: string[] = [];

  if (!input.declarationComplete) {
    refusals.push(
      "The declaration is not complete. Annex V sets out what an EU declaration of conformity must contain, and a declaration is not partially true — signing an incomplete one asserts conformity that has not been established.",
    );
  }
  if (input.authorisedToBind !== true) {
    refusals.push(
      input.authorisedToBind === false
        ? "This person is not authorised to bind the manufacturer. Article 28 requires the declaration to be drawn up on the manufacturer's behalf."
        : "Whether this person is authorised to bind the manufacturer has not been recorded. It is not assumed.",
    );
  }

  if (refusals.length) {
    return {
      signed: false,
      attestation: null,
      refusals,
      citations,
      message: `Not signed. ${refusals.join(" ")}`,
    };
  }

  const attestation = attest({
    kind: "declaration_signed",
    actor: input.actor,
    content: input.declarationContent,
    attestedAt: input.signedAt,
    subject: "eu_declaration_of_conformity",
    statement:
      `Signed on behalf of the manufacturer by ${input.actor} (${input.actorRoleInOrganisation}), ` +
      `declaring that the applicable essential cybersecurity requirements set out in Annex I have been fulfilled.`,
  });

  return {
    signed: true,
    attestation,
    refusals: [],
    citations,
    message: `Signed by ${input.actor} on ${input.signedAt}. This is a cryptographic attestation bound to an application identity, not an eIDAS qualified electronic signature.`,
  };
}
