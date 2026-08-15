/**
 * Notified body engagement — Art. 32, Annex VIII, Art. 30(4).
 *
 * The assertion that matters most is the CE marking one: Art. 30(4) attaches the
 * notified body's identification number to the CE marking ONLY for Module H,
 * even though a notified body is equally involved in Module B+C. Getting that
 * wrong in either direction is a marking offence.
 *
 * Text pinned against docs/cra_statutory_corpus/{02_articles,03_annexes}_full.json.
 */
import { describe, it, expect } from "vitest";
import {
  ceMarkingCarriesNotifiedBodyNumber,
  routeInvolvesNotifiedBody,
  assessSubmissionPack,
  assessCertificate,
  modificationRequiresCertificateAddition,
  type SubmissionPackInput,
} from "../notifiedBody";

describe("Art. 30(4) — whose number goes on the CE marking", () => {
  /**
   * The subtlety. A notified body performs the EU-type examination under Module
   * B, and its number still does NOT follow the CE marking — Art. 30(4) names
   * full quality assurance (Module H) specifically.
   */
  it("attaches the number for Module H only", () => {
    expect(ceMarkingCarriesNotifiedBodyNumber("module_h")).toBe(true);
  });

  it("does NOT attach it for Module B+C, even though a notified body is involved", () => {
    expect(routeInvolvesNotifiedBody("module_b_c")).toBe(true);
    expect(ceMarkingCarriesNotifiedBodyNumber("module_b_c")).toBe(false);
  });

  it("does not attach it for internal control", () => {
    expect(routeInvolvesNotifiedBody("module_a")).toBe(false);
    expect(ceMarkingCarriesNotifiedBodyNumber("module_a")).toBe(false);
  });
});

describe("Annex VIII II.3 — the application", () => {
  function complete(over: Partial<SubmissionPackInput> = {}): SubmissionPackInput {
    return {
      module: "module_b_c",
      manufacturerName: "ACME Industrial BV",
      manufacturerAddress: "Keizersgracht 1, Amsterdam",
      soleApplicationDeclared: true,
      technicalDocumentationComplete: true,
      supportingEvidenceProvided: true,
      standardsApplicationDocumented: true,
      notifiedBodyName: "TÜV Rheinland",
      notifiedBodyNumber: "0197",
      ...over,
    };
  }

  it("is ready when every element is present", () => {
    const r = assessSubmissionPack(complete());
    expect(r.applicable).toBe(true);
    expect(r.ready).toBe(true);
    expect(r.gaps).toEqual([]);
  });

  it("does not apply on a route with no notified body", () => {
    const r = assessSubmissionPack(complete({ module: "module_a" }));
    expect(r.applicable).toBe(false);
    expect(r.message).toMatch(/no application to lodge/);
  });

  /** The one people forget. */
  it("requires the single-body declaration, and treats unanswered as missing", () => {
    const r = assessSubmissionPack(complete({ soleApplicationDeclared: null }));
    expect(r.ready).toBe(false);
    expect(r.gaps.join(" ")).toMatch(/has not been lodged with any other notified body/);
  });

  it("reports lodging with more than one body as a distinct problem", () => {
    const r = assessSubmissionPack(complete({ soleApplicationDeclared: false }));
    expect(r.gaps.join(" ")).toMatch(/SINGLE notified body/);
    expect(r.gaps.join(" ")).toMatch(/lodged elsewhere as well/);
  });

  it("requires the authorised representative's details only when it lodges", () => {
    const notLodging = assessSubmissionPack(complete({ lodgedByAuthorisedRepresentative: false }));
    expect(notLodging.ready).toBe(true);

    const lodging = assessSubmissionPack(complete({ lodgedByAuthorisedRepresentative: true }));
    expect(lodging.ready).toBe(false);
    expect(lodging.gaps.join(" ")).toMatch(/authorised representative lodges/);
  });

  it("requires the standards-application statement, which applies to every product today", () => {
    const r = assessSubmissionPack(complete({ standardsApplicationDocumented: null }));
    expect(r.ready).toBe(false);
    expect(r.gaps.join(" ")).toMatch(/No CRA harmonised standard has been cited/);
  });

  it("rejects an identification number that is not four digits", () => {
    const r = assessSubmissionPack(complete({ notifiedBodyNumber: "TUV-123" }));
    expect(r.ready).toBe(false);
    expect(r.gaps.join(" ")).toMatch(/four-digit/);
  });
});

describe("Annex VIII II.6 — the certificate gates placing on the market", () => {
  const base = { module: "module_b_c" as const, placedOnMarket: "2027-01-01", supportPeriodEnd: "2032-01-01" };

  it("blocks placing on the market while no certificate is held", () => {
    const r = assessCertificate({ ...base, status: "under_examination" });
    expect(r.held).toBe(false);
    expect(r.clearedToPlaceOnMarket).toBe(false);
  });

  it("blocks it on refusal, and cites the duty to give reasons", () => {
    const r = assessCertificate({ ...base, status: "refused" });
    expect(r.clearedToPlaceOnMarket).toBe(false);
    expect(r.message).toMatch(/detailed reasons/);
  });

  it("clears it once a certificate is issued, and starts the retention clock", () => {
    const r = assessCertificate({
      ...base,
      status: "certificate_issued",
      certificateNumber: "EU-TYPE-2027-0042",
    });
    expect(r.held).toBe(true);
    expect(r.clearedToPlaceOnMarket).toBe(true);
    // Annex VIII II.10 runs on the same clock as Art. 13(13).
    expect(r.retention?.until).toBe("2037-01-01");
  });

  it("surfaces conditions attached to the certificate's validity", () => {
    const r = assessCertificate({
      ...base,
      status: "certificate_issued",
      certificateNumber: "EU-TYPE-2027-0042",
      conditions: "Valid only for firmware branch 4.x",
    });
    expect(r.message).toMatch(/conditions for its validity/);
    expect(r.message).toMatch(/firmware branch 4\.x/);
  });

  it("requires no certificate at all on internal control", () => {
    const r = assessCertificate({ ...base, module: "module_a", status: "not_required" });
    expect(r.clearedToPlaceOnMarket).toBe(true);
  });
});

describe("Annex VIII II.7 — modifications reopen the certificate", () => {
  const held = { module: "module_b_c" as const, certificateHeld: true };

  it("requires an addition where the modification may affect conformity", () => {
    const r = modificationRequiresCertificateAddition({ ...held, affectsConformityOrValidity: true });
    expect(r.required).toBe(true);
    expect(r.message).toMatch(/addition to the original EU-type examination certificate/);
  });

  it("requires none where it does not", () => {
    const r = modificationRequiresCertificateAddition({ ...held, affectsConformityOrValidity: false });
    expect(r.required).toBe(false);
  });

  /** Unanswered is not "no" — the same discipline as the Art. 21/22 wizard. */
  it("returns null while the question is unanswered", () => {
    const r = modificationRequiresCertificateAddition({ ...held, affectsConformityOrValidity: null });
    expect(r.required).toBeNull();
    expect(r.message).toMatch(/has not been assessed/);
  });

  it("has nothing to add to when no certificate is held", () => {
    const r = modificationRequiresCertificateAddition({
      module: "module_b_c",
      certificateHeld: false,
      affectsConformityOrValidity: true,
    });
    expect(r.required).toBe(false);
  });
});
