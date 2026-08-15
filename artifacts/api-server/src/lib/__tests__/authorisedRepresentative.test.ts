/**
 * The custody shape — Article 18.
 *
 * The plan's acceptance criteria, as assertions: a mandate can be recorded,
 * scoped and expired, expiry removes the obligations, and the representative's
 * obligations are a strict subset of what the mandate grants.
 *
 * Art. 18 bounds the mandate from both ends, so both are tested: the Art. 18(3)
 * floor and the Art. 18(2) ceiling.
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import {
  assessMandate,
  obligationsAreWithinMandate,
  MANDATORY_TASKS,
  NON_DELEGABLE,
  type MandateInput,
} from "../authorisedRepresentative";

const NOW = new Date("2028-06-01T00:00:00Z");
const ALL_MANDATORY = Object.keys(MANDATORY_TASKS);

function mandate(over: Partial<MandateInput> = {}): MandateInput {
  return {
    writtenMandateHeld: true,
    appointingManufacturer: "Shenzhen Controls Ltd",
    effectiveFrom: "2027-01-01",
    effectiveTo: null,
    tasksGranted: ALL_MANDATORY,
    placedOnMarket: "2027-06-01",
    supportPeriodEnd: "2032-06-01",
    ...over,
  };
}

describe("Art. 18(1) — the mandate is written", () => {
  it("is a defect when no written mandate is held", () => {
    const r = assessMandate(mandate({ writtenMandateHeld: false }), NOW);
    expect(r.state).toBe("not_recorded");
    expect(r.defects.join(" ")).toMatch(/BY A WRITTEN MANDATE/);
    // 18(3) requires a copy to be producible on request.
    expect(r.defects.join(" ")).toMatch(/copy to be provided to market surveillance/);
  });
});

describe("Art. 18(3) — the floor", () => {
  it("accepts a mandate granting all three mandatory tasks", () => {
    const r = assessMandate(mandate(), NOW);
    expect(r.state).toBe("in_force");
    expect(r.defects).toEqual([]);
    expect(r.obligations.length).toBe(3);
  });

  it("reports a mandate granting less than Article 18(3) requires", () => {
    const r = assessMandate(
      mandate({ tasksGranted: ["keep_doc_and_technical_documentation"] }),
      NOW,
    );
    expect(r.defects.length).toBe(2);
    expect(r.defects.join(" ")).toMatch(/AT LEAST/);
    expect(r.defects.join(" ")).toMatch(/reasoned request/);
    expect(r.defects.join(" ")).toMatch(/eliminate the risks/);
  });

  /** Art. 18(3)(a) runs on the same clock as Art. 13(13) and 19(6). */
  it("computes the retention clock for the documents it holds", () => {
    const r = assessMandate(mandate(), NOW);
    // 10 years from placing (2037) beats the support period (2032).
    expect(r.retention?.until).toBe("2037-06-01");
  });
});

describe("Art. 18(2) — the ceiling", () => {
  /**
   * The failure this prevents: telling a representative they are responsible
   * for work the Regulation says cannot be given to them.
   */
  it("refuses to treat a non-delegable duty as delegated", () => {
    const r = assessMandate(
      mandate({ tasksGranted: [...ALL_MANDATORY, "article_13_1_to_11"] }),
      NOW,
    );
    expect(r.ineffectiveClauses.length).toBe(1);
    expect(r.ineffectiveClauses[0]).toMatch(/shall NOT form part/);
    expect(r.ineffectiveClauses[0]).toMatch(/remains the manufacturer's obligation/);
    // And it does not appear among the representative's obligations.
    expect(r.obligations.map((o) => o.task)).not.toContain("article_13_1_to_11");
  });

  it("names drawing up the technical documentation specifically", () => {
    const r = assessMandate(
      mandate({ tasksGranted: [...ALL_MANDATORY, "article_13_12_first_subparagraph"] }),
      NOW,
    );
    expect(r.ineffectiveClauses.join(" ")).toMatch(/first subparagraph/);
    expect(r.ineffectiveClauses.join(" ")).toMatch(/technical documentation referred to in Article 31/);
  });

  it("covers series-production conformity too", () => {
    const r = assessMandate(mandate({ tasksGranted: [...ALL_MANDATORY, "article_13_14"] }), NOW);
    expect(r.ineffectiveClauses.join(" ")).toMatch(/series production/);
  });

  it("knows exactly three things cannot be delegated", () => {
    expect(Object.keys(NON_DELEGABLE)).toHaveLength(3);
  });
});

describe("the mandate's life", () => {
  it("is not yet effective before its start date", () => {
    const r = assessMandate(mandate({ effectiveFrom: "2029-01-01" }), NOW);
    expect(r.state).toBe("not_yet_effective");
    expect(r.obligations).toEqual([]);
  });

  /** The acceptance criterion: expiry removes the obligations. */
  it("empties the obligation set on expiry", () => {
    const r = assessMandate(mandate({ effectiveTo: "2028-01-01" }), NOW);
    expect(r.state).toBe("expired");
    expect(r.obligations).toEqual([]);
    expect(r.retention).toBeNull();
  });

  /** But expiry removes the representative, not the manufacturer's duties. */
  it("says plainly that expiry does not discharge the manufacturer", () => {
    const r = assessMandate(mandate({ effectiveTo: "2028-01-01" }), NOW);
    expect(r.message).toMatch(/removes the representative, not the obligations/);
  });
});

describe("obligations are a strict subset of the mandate", () => {
  it("passes when everything shown was granted", () => {
    const r = obligationsAreWithinMandate(ALL_MANDATORY, ALL_MANDATORY);
    expect(r.within).toBe(true);
  });

  it("catches an obligation shown but never granted", () => {
    const r = obligationsAreWithinMandate(
      [...ALL_MANDATORY, "affix_ce_marking"],
      ALL_MANDATORY,
    );
    expect(r.within).toBe(false);
    expect(r.outside).toEqual(["affix_ce_marking"]);
  });

  /**
   * Even if a mandate purports to grant it, a non-delegable duty is still
   * outside — Art. 18(2) puts it beyond ANY mandate.
   */
  it("catches a non-delegable duty even when the mandate granted it", () => {
    const granted = [...ALL_MANDATORY, "article_13_14"];
    const r = obligationsAreWithinMandate(granted, granted);
    expect(r.within).toBe(false);
    expect(r.outside).toEqual(["article_13_14"]);
    expect(r.message).toMatch(/beyond any mandate/);
  });
});
