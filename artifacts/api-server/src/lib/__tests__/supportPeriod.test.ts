import { describe, it, expect } from "vitest";
import {
  assessSupportPeriod,
  monthsBetween,
  DEFAULT_SUPPORT_PERIOD_MONTHS,
} from "../supportPeriod";

/**
 * Article 13(8) has two limbs and the rule is wrong if it only implements one:
 *
 *   "the support period shall be at least five years. Where the product with
 *    digital elements is expected to be in use for less than five years, the
 *    support period shall correspond to the expected use time."
 *
 * A check that rejects everything under five years would flag a compliant
 * manufacturer. A check that accepts anything would be useless. Both directions
 * are tested deliberately.
 */
describe("Article 13(8) support period", () => {
  it("counts whole months, not calendar years", () => {
    expect(monthsBetween("2027-01-01", "2032-01-01")).toBe(60);
    expect(monthsBetween("2027-01-15", "2032-01-14")).toBe(59);
    expect(monthsBetween("2027-01-01", "2027-01-01")).toBe(0);
    expect(monthsBetween(null, "2032-01-01")).toBeNull();
    expect(monthsBetween("2027-01-01", null)).toBeNull();
  });

  it("accepts a period meeting the five-year default", () => {
    const a = assessSupportPeriod({
      supportPeriodStart: "2027-12-11",
      supportPeriodEnd: "2032-12-11",
    });
    expect(a.months).toBe(DEFAULT_SUPPORT_PERIOD_MONTHS);
    expect(a.status).toBe("meets_default");
    expect(a.satisfiesArticle13_8).toBe(true);
  });

  it("flags a short period with no declared expected use time", () => {
    const a = assessSupportPeriod({
      supportPeriodStart: "2027-12-11",
      supportPeriodEnd: "2028-12-11",
    });
    expect(a.months).toBe(12);
    expect(a.status).toBe("short_unjustified");
    expect(a.satisfiesArticle13_8).toBe(false);
    expect(a.citation).toBe("Article 13(8)");
  });

  // The direction the original plan got wrong: this configuration is LAWFUL.
  it("accepts the same short period when expected use time matches it", () => {
    const a = assessSupportPeriod({
      supportPeriodStart: "2027-12-11",
      supportPeriodEnd: "2028-12-11",
      expectedUseTimeMonths: 12,
      supportPeriodRationale: "Single-season agricultural sensor; housing degrades after one harvest cycle.",
    });
    expect(a.months).toBe(12);
    expect(a.status).toBe("short_justified");
    expect(a.satisfiesArticle13_8).toBe(true);
  });

  it("still accepts a short justified period without a rationale, but asks for one", () => {
    const a = assessSupportPeriod({
      supportPeriodStart: "2027-12-11",
      supportPeriodEnd: "2028-12-11",
      expectedUseTimeMonths: 12,
    });
    expect(a.satisfiesArticle13_8).toBe(true);
    expect(a.hasRationale).toBe(false);
    // Art. 13(8) carries the determination inputs into the Annex VII file.
    expect(a.message).toMatch(/Annex VII/);
  });

  it("rejects a support period shorter than the declared expected use time", () => {
    const a = assessSupportPeriod({
      supportPeriodStart: "2027-12-11",
      supportPeriodEnd: "2029-12-11",
      expectedUseTimeMonths: 48,
    });
    expect(a.status).toBe("shorter_than_expected_use");
    expect(a.satisfiesArticle13_8).toBe(false);
  });

  it("rejects a short period when expected use is five years or more", () => {
    const a = assessSupportPeriod({
      supportPeriodStart: "2027-12-11",
      supportPeriodEnd: "2030-12-11",
      expectedUseTimeMonths: 120,
    });
    expect(a.status).toBe("shorter_than_expected_use");
    expect(a.satisfiesArticle13_8).toBe(false);
  });

  it("reports an unset period rather than assuming compliance", () => {
    const a = assessSupportPeriod({});
    expect(a.status).toBe("not_set");
    expect(a.satisfiesArticle13_8).toBe(false);
  });

  it("catches an end date before the start date", () => {
    const a = assessSupportPeriod({
      supportPeriodStart: "2030-01-01",
      supportPeriodEnd: "2029-01-01",
    });
    expect(a.status).toBe("invalid_dates");
    expect(a.satisfiesArticle13_8).toBe(false);
  });

  it("never asserts overall conformity", () => {
    const messages = [
      assessSupportPeriod({ supportPeriodStart: "2027-01-01", supportPeriodEnd: "2032-01-01" }),
      assessSupportPeriod({ supportPeriodStart: "2027-01-01", supportPeriodEnd: "2028-01-01" }),
    ].map((a) => a.message);
    for (const m of messages) {
      expect(m).not.toMatch(/compliant|conformity (achieved|confirmed)/i);
    }
  });
});
