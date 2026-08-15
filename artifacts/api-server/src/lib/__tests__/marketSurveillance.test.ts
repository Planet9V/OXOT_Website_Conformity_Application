/**
 * Chapter V — cooperation with market surveillance authorities.
 *
 * Acceptance criterion: the authority's prescribed period is recorded rather
 * than computed, corrective action is Union-wide under Art. 54(4), and the
 * Art. 54(5) escalation exposure is derived from the record.
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import { assessMsaEngagement, type MsaEngagementInput } from "../marketSurveillance";

const NOW = new Date("2026-08-15T12:00:00Z");

function corrective(over: Partial<MsaEngagementInput> = {}): MsaEngagementInput {
  return {
    kind: "corrective_action_requirement",
    receivedAt: "2026-07-01T09:00:00Z",
    prescribedDeadline: "2026-09-01T00:00:00Z",
    completedAt: null,
    scope: "union_wide",
    ...over,
  };
}

describe("Art. 54(1) — the period is the authority's, not ours", () => {
  /**
   * The Regulation fixes no number here. Substituting a default would be
   * inventing law, so an unrecorded period is a gap in the file.
   */
  it("treats a missing prescribed period as a gap, never assuming one", () => {
    const r = assessMsaEngagement(corrective({ prescribedDeadline: null }), NOW);
    expect(r.status).toBe("incomplete_record");
    expect(r.gaps.join(" ")).toMatch(/period prescribed by the market surveillance authority/);
    expect(r.gaps.join(" ")).toMatch(/sets no fixed period/);
    // With no period recorded, nothing can be overdue.
    expect(r.escalationExposure).toBe(false);
  });

  it("is open while inside the prescribed period", () => {
    const r = assessMsaEngagement(corrective(), NOW);
    expect(r.status).toBe("open");
    expect(r.escalationExposure).toBe(false);
  });
});

describe("Art. 54(4) — corrective action is Union-wide", () => {
  /**
   * Fixing only the market whose authority came knocking is the expensive
   * mistake this guards against.
   */
  it("flags a remedy limited to the national market", () => {
    const r = assessMsaEngagement(corrective({ scope: "national" }), NOW);
    expect(r.gaps.join(" ")).toMatch(/throughout the Union/);
    expect(r.status).toBe("incomplete_record");
  });

  it("accepts a Union-wide remedy", () => {
    const r = assessMsaEngagement(corrective({ completedAt: "2026-08-10T00:00:00Z" }), NOW);
    expect(r.status).toBe("closed");
    expect(r.gaps).toEqual([]);
  });

  it("flags an unrecorded scope", () => {
    const r = assessMsaEngagement(corrective({ scope: null }), NOW);
    expect(r.gaps.join(" ")).toMatch(/scope of the corrective action is not recorded/);
  });
});

describe("Art. 54(5) — provisional measures", () => {
  it("reports the exposure once the prescribed period passes unmet", () => {
    const r = assessMsaEngagement(
      corrective({ prescribedDeadline: "2026-08-01T00:00:00Z" }),
      NOW,
    );
    expect(r.status).toBe("overdue");
    expect(r.escalationExposure).toBe(true);
    expect(r.message).toMatch(/withdraw it, or recall it/);
    expect(r.citations).toContain("Article 54(5)");
  });

  it("does not report exposure once the action is complete", () => {
    const r = assessMsaEngagement(
      corrective({
        prescribedDeadline: "2026-08-01T00:00:00Z",
        completedAt: "2026-07-30T00:00:00Z",
      }),
      NOW,
    );
    expect(r.escalationExposure).toBe(false);
    expect(r.status).toBe("closed");
  });
});

describe("Art. 53 — access to data on a reasoned request", () => {
  it("requires it to be recorded that the language was understood by the authority", () => {
    const r = assessMsaEngagement(
      { kind: "data_access_request", receivedAt: "2026-08-01T00:00:00Z" },
      NOW,
    );
    expect(r.gaps.join(" ")).toMatch(/language easily understood/);
    expect(r.citations).toContain("Article 53");
  });

  it("closes when answered in an understood language", () => {
    const r = assessMsaEngagement(
      {
        kind: "data_access_request",
        receivedAt: "2026-08-01T00:00:00Z",
        completedAt: "2026-08-05T00:00:00Z",
        languageConfirmed: true,
      },
      NOW,
    );
    expect(r.status).toBe("closed");
  });

  /** Art. 53 carries no prescribed period, so an open request is not overdue. */
  it("never becomes overdue on its own", () => {
    const r = assessMsaEngagement(
      {
        kind: "data_access_request",
        receivedAt: "2020-01-01T00:00:00Z",
        languageConfirmed: true,
      },
      NOW,
    );
    expect(r.status).toBe("open");
    expect(r.escalationExposure).toBe(false);
  });
});

describe("the record itself", () => {
  it("flags a missing receipt date, since every period runs from it", () => {
    const r = assessMsaEngagement(corrective({ receivedAt: null }), NOW);
    expect(r.gaps.join(" ")).toMatch(/date the authority's request was received/);
  });
});
