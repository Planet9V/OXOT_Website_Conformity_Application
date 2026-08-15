/**
 * Article 23 — identification of economic operators.
 *
 * Acceptance criterion: both ten-year clocks run from their own supply event,
 * the later one governs, and limb (b)'s "where available" is honoured without
 * letting an unanswered question pass as a lawful "none".
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import { assessTraceabilityRecord } from "../traceability";

const supplier = { name: "Siemens AG", address: "Werner-von-Siemens-Str. 1, Munich, DE" };
const customer = { name: "Axians NL BV", address: "Rivium 1, Capelle aan den IJssel, NL" };

function complete(over = {}) {
  return {
    suppliedBy: supplier,
    receivedOn: "2027-03-01",
    suppliedTo: customer,
    suppliedOn: "2027-09-15",
    downstreamAvailable: true,
    ...over,
  };
}

describe("Art. 23(2) — the two ten-year clocks", () => {
  it("runs to ten years after supplying when that is later", () => {
    const r = assessTraceabilityRecord(complete());
    expect(r.status).toBe("complete");
    expect(r.mustPresentUntil).toBe("2037-09-15");
    expect(r.basis).toBe("supplied");
  });

  it("runs to ten years after being supplied when that is later", () => {
    const r = assessTraceabilityRecord(
      complete({ receivedOn: "2028-01-10", suppliedOn: "2027-09-15" }),
    );
    expect(r.mustPresentUntil).toBe("2038-01-10");
    expect(r.basis).toBe("received");
  });

  it("uses the only clock available when the product has not been supplied on", () => {
    const r = assessTraceabilityRecord(
      complete({ suppliedOn: null, suppliedTo: null, downstreamAvailable: false }),
    );
    expect(r.mustPresentUntil).toBe("2037-03-01");
    expect(r.basis).toBe("received");
    expect(r.status).toBe("complete");
  });

  it("cannot start a clock with no supply date at all", () => {
    const r = assessTraceabilityRecord(
      complete({ receivedOn: null, suppliedOn: null }),
    );
    expect(r.status).toBe("no_dates");
    expect(r.mustPresentUntil).toBeNull();
    expect(r.message).toMatch(/ten-year clock cannot start/);
  });

  /**
   * The distinction from Art. 13(13), which is "10 years or the support period,
   * whichever is longer". Art. 23(2) has no support-period limb, so a long
   * support period must not extend this duty.
   */
  it("is a flat ten years — a support period does not extend it", () => {
    // A support period is deliberately not part of the input at all; passing one
    // must change nothing.
    const r = assessTraceabilityRecord(complete({ supportPeriodEnd: "2050-01-01" }));
    expect(r.mustPresentUntil).toBe("2037-09-15");
  });
});

describe("Art. 23(1)(a) — who supplied us, unconditional", () => {
  it("is a gap when absent", () => {
    const r = assessTraceabilityRecord(complete({ suppliedBy: null }));
    expect(r.status).toBe("incomplete");
    expect(r.gaps.join(" ")).toMatch(/23\(1\)\(a\)/);
  });

  it("is a gap when the name is there but the address is not", () => {
    const r = assessTraceabilityRecord(
      complete({ suppliedBy: { name: "Siemens AG", address: "" } }),
    );
    expect(r.status).toBe("incomplete");
    expect(r.gaps.join(" ")).toMatch(/name and address/);
  });
});

describe('Art. 23(1)(b) — who we supplied, "where available"', () => {
  it("is satisfied when the operator has declared there is no downstream operator", () => {
    const r = assessTraceabilityRecord(
      complete({ suppliedTo: null, downstreamAvailable: false }),
    );
    expect(r.status).toBe("complete");
    expect(r.gaps).toEqual([]);
  });

  it("requires name and address once a downstream operator is declared available", () => {
    const r = assessTraceabilityRecord(
      complete({ suppliedTo: { name: "Axians NL BV", address: "" } }),
    );
    expect(r.status).toBe("incomplete");
    expect(r.gaps.join(" ")).toMatch(/23\(1\)\(b\)/);
  });

  // The one that matters: silence is not a lawful answer.
  it("treats an unanswered question as a gap, not as 'not available'", () => {
    const r = assessTraceabilityRecord(
      complete({ suppliedTo: null, downstreamAvailable: null }),
    );
    expect(r.status).toBe("incomplete");
    expect(r.gaps.join(" ")).toMatch(/not the same as there being none/);
  });

  it("treats an omitted field the same as an explicit null", () => {
    const { downstreamAvailable, ...withoutTheField } = complete({ suppliedTo: null });
    void downstreamAvailable;
    const r = assessTraceabilityRecord(withoutTheField);
    expect(r.status).toBe("incomplete");
  });
});
