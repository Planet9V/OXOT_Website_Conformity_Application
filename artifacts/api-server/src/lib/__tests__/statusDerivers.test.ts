/**
 * W1.3 — the status-deriver registry.
 *
 * Two things must hold, and they pull in opposite directions:
 *
 *   1. Behaviour did not change. The Art. 14 answer is identical to what the
 *      inline `isArt14` branch produced, including the awkward
 *      `no_reportable_events` -> `not_started` mapping.
 *   2. Nothing else became derived by accident. An obligation with no deriver
 *      must fall through to the recorded evaluations — a registry that answers
 *      for keys it was never given is worse than the if/else it replaced.
 */
import { describe, it, expect } from "vitest";
import { deriveStatus, hasDeriver, registeredDerivers } from "../statusDerivers";
import type { ReportingObligationAssessment } from "../reportingObligation";

function reporting(
  over: Partial<ReportingObligationAssessment> = {},
): ReportingObligationAssessment {
  return {
    status: "met",
    citation: "Article 14",
    incidentCount: 2,
    overdueCount: 0,
    unevidencedCount: 0,
    findings: [],
    message: "All stages evidenced.",
    ...over,
  };
}

describe("lookup", () => {
  it("derives CRA Article 14", () => {
    expect(hasDeriver("cra", "Art 14")).toBe(true);
  });

  /** The key is act-scoped: "Art 14" of another act is a different obligation. */
  it("does not answer for the same article number under a different act", () => {
    expect(hasDeriver("nis2", "Art 14")).toBe(false);
    expect(deriveStatus("nis2", "Art 14", { reporting: reporting() })).toBeNull();
  });

  it("returns null for an unregistered obligation so the caller falls back", () => {
    expect(deriveStatus("cra", "Art 13", { reporting: reporting() })).toBeNull();
  });

  /**
   * Guards the honest claim in the module header: no act has been given a
   * speculative deriver. Update this number only when a real one is added.
   */
  it("registers exactly one deriver today", () => {
    expect(registeredDerivers()).toEqual(["cra::Art 14"]);
  });
});

describe("cra::Art 14 — unchanged from the inline branch", () => {
  it("passes the reporting status through", () => {
    const d = deriveStatus("cra", "Art 14", {
      reporting: reporting({ status: "not_met", overdueCount: 1 }),
    });
    expect(d?.status).toBe("not_met");
  });

  /**
   * The list's vocabulary has no word for "the duty was never engaged", so an
   * empty record reads as not_started rather than met — silence is not
   * compliance.
   */
  it("maps no_reportable_events to not_started, keeping the real status in derivedFrom", () => {
    const d = deriveStatus("cra", "Art 14", {
      reporting: reporting({ status: "no_reportable_events", incidentCount: 0 }),
    });
    expect(d?.status).toBe("not_started");
    expect(d?.derivedFrom.status).toBe("no_reportable_events");
  });

  /** A reader must be able to check the derivation rather than trust it. */
  it("names the ledger it was derived from", () => {
    const d = deriveStatus("cra", "Art 14", { reporting: reporting({ unevidencedCount: 3 }) });
    expect(d?.derivedFrom.source).toBe("conformity_incident_submissions");
    expect(d?.derivedFrom.citation).toBe("Article 14");
    expect(d?.derivedFrom.unevidencedCount).toBe(3);
  });
});
