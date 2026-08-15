/**
 * P6 — provenance.
 *
 * A system of record without provenance is a filing cabinet with no lock. The
 * assertions that matter are the two failure modes, which mean different
 * things: content_changed (the document was edited after someone stood behind
 * it) and record_tampered (the attestation itself was altered).
 */
import { describe, it, expect } from "vitest";
import { attest, verifyAttestation, signDeclaration } from "../provenance";

const BASE = {
  kind: "artifact_approved" as const,
  actor: "admin:j.mcknney",
  attestedAt: "2027-03-01T10:00:00Z",
  subject: "artifact:technical_documentation:12",
  statement: "Reviewed and approved for submission to the notified body.",
};

describe("attesting", () => {
  it("binds who, when, subject and the exact bytes", () => {
    const a = attest({ ...BASE, content: "the technical file" });
    expect(a.actor).toBe("admin:j.mcknney");
    expect(a.contentDigest).toHaveLength(64);
    expect(a.recordDigest).toHaveLength(64);
    expect(a.contentBytes).toBe("the technical file".length);
  });

  it("gives different content different digests", () => {
    const a = attest({ ...BASE, content: "version one" });
    const b = attest({ ...BASE, content: "version two" });
    expect(a.contentDigest).not.toBe(b.contentDigest);
    expect(a.recordDigest).not.toBe(b.recordDigest);
  });

  it("gives the same content attested by different people different records", () => {
    const a = attest({ ...BASE, content: "same bytes" });
    const b = attest({ ...BASE, actor: "admin:someone.else", content: "same bytes" });
    expect(a.contentDigest).toBe(b.contentDigest);
    // ...but the record differs, so an attestation cannot be re-attributed.
    expect(a.recordDigest).not.toBe(b.recordDigest);
  });
});

describe("verifying", () => {
  it("confirms intact content", () => {
    const a = attest({ ...BASE, content: "unchanged" });
    const v = verifyAttestation(a, "unchanged");
    expect(v.state).toBe("intact");
    expect(v.message).toMatch(/unchanged since/);
  });

  it("detects the document being edited after attestation", () => {
    const a = attest({ ...BASE, content: "original" });
    const v = verifyAttestation(a, "edited afterwards");
    expect(v.state).toBe("content_changed");
    expect(v.message).toMatch(/does not extend to the current ones/);
  });

  it("detects the attestation itself being altered", () => {
    const a = attest({ ...BASE, content: "original" });
    // Someone re-points the attestation at a different person.
    const tampered = { ...a, actor: "admin:not.the.signer" };
    const v = verifyAttestation(tampered, "original");
    expect(v.state).toBe("record_tampered");
    expect(v.message).toMatch(/altered since it was made/);
  });

  /** Ten-year retention over large files means verifying without keeping bytes. */
  it("can verify the record alone when the content is not supplied", () => {
    const a = attest({ ...BASE, content: "big file" });
    const v = verifyAttestation(a, null);
    expect(v.state).toBe("intact");
    expect(v.message).toMatch(/was not compared/);
  });
});

describe("Annex V — signing the declaration", () => {
  const ok = {
    actor: "admin:j.mcknney",
    actorRoleInOrganisation: "Managing Director",
    signedAt: "2027-04-01T09:00:00Z",
    declarationContent: "EU DoC, all sections complete",
    declarationComplete: true,
    authorisedToBind: true,
  };

  it("signs a complete declaration by an authorised person", () => {
    const r = signDeclaration(ok);
    expect(r.signed).toBe(true);
    expect(r.attestation?.kind).toBe("declaration_signed");
    expect(r.attestation?.statement).toMatch(/on behalf of the manufacturer/);
  });

  /** A declaration is not partially true. */
  it("refuses to sign an incomplete declaration", () => {
    const r = signDeclaration({ ...ok, declarationComplete: false });
    expect(r.signed).toBe(false);
    expect(r.attestation).toBeNull();
    expect(r.refusals.join(" ")).toMatch(/not partially true/);
  });

  it("refuses when the signer cannot bind the manufacturer", () => {
    const r = signDeclaration({ ...ok, authorisedToBind: false });
    expect(r.signed).toBe(false);
    expect(r.refusals.join(" ")).toMatch(/not authorised to bind/);
  });

  it("does not assume authority when it is unrecorded", () => {
    const r = signDeclaration({ ...ok, authorisedToBind: null });
    expect(r.signed).toBe(false);
    expect(r.refusals.join(" ")).toMatch(/It is not assumed/);
  });

  /** The limit must be stated, never implied. */
  it("says plainly that this is not an eIDAS qualified signature", () => {
    const r = signDeclaration(ok);
    expect(r.message).toMatch(/not an eIDAS qualified electronic signature/);
  });
});
