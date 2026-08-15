/**
 * End of support — what stops, and what does not.
 *
 * The failure this guards against: a product goes past support, drops off the
 * dashboard, and someone deletes a technical file that Art. 13(13) still
 * requires for years. "End of support" changes WHICH obligations apply; it is
 * never the end of obligations.
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import { assessEndOfSupport } from "../endOfSupport";

const NOW = new Date("2035-06-01T00:00:00Z");

/** Placed 2027, supported to 2032 — so at NOW the product is past support. */
function pastSupport(over = {}) {
  return {
    supportPeriodStart: "2027-01-01",
    supportPeriodEnd: "2032-01-01",
    placedOnMarket: "2027-01-01",
    endDateCommunicatedToUsers: true,
    ...over,
  };
}

describe("what ends", () => {
  it("ends vulnerability handling when the support period expires", () => {
    const r = assessEndOfSupport(pastSupport(), NOW);
    expect(r.state).toBe("past_support");
    const vh = r.obligations.find((o) => o.subject === "Vulnerability handling")!;
    expect(vh.state).toBe("ended");
    expect(vh.citation).toMatch(/Annex I, Part II/);
  });

  it("keeps it running while in support", () => {
    const r = assessEndOfSupport(pastSupport(), new Date("2030-01-01T00:00:00Z"));
    expect(r.state).toBe("in_support");
    expect(r.obligations.find((o) => o.subject === "Vulnerability handling")!.state).toBe("continues");
  });
});

describe("what continues — the part people miss", () => {
  it("keeps the technical documentation and DoC well past support", () => {
    const r = assessEndOfSupport(pastSupport(), NOW);
    const doc = r.obligations.find((o) => o.citation === "Article 13(13)")!;
    expect(doc.state).toBe("continues");
    // 10 years from placing on market (2037) beats the support end (2032).
    expect(doc.until).toBe("2037-01-01");
  });

  it("keeps the Annex II user information too", () => {
    const r = assessEndOfSupport(pastSupport(), NOW);
    const info = r.obligations.find((o) => o.citation === "Article 13(18)")!;
    expect(info.state).toBe("continues");
    expect(info.until).toBe("2037-01-01");
  });

  /**
   * The one that can outlast everything: an update issued in the final month of
   * support stays available for ten years from ITS issue date.
   */
  it("keeps a late security update available ten years from its own issue date", () => {
    const r = assessEndOfSupport(
      pastSupport({ securityUpdatesIssuedOn: ["2031-12-01"] }),
      NOW,
    );
    const upd = r.obligations.find((o) => o.subject.startsWith("Security update"))!;
    expect(upd.state).toBe("continues");
    expect(upd.until).toBe("2041-12-01");
    // Outlasts the technical documentation clock.
    expect(upd.until! > "2037-01-01").toBe(true);
  });

  it("refuses to present a past-support product as closed", () => {
    const r = assessEndOfSupport(pastSupport({ securityUpdatesIssuedOn: ["2031-12-01"] }), NOW);
    expect(r.message).toMatch(/must not be treated as closed/);
    expect(r.message).toMatch(/2041-12-01/);
  });
});

describe("Annex II — telling the user when support ends", () => {
  it("flags recording the date without communicating it", () => {
    const r = assessEndOfSupport(pastSupport({ endDateCommunicatedToUsers: null }), NOW);
    expect(r.gaps.join(" ")).toMatch(/not the same as having communicated it/);
  });
});

describe("when nothing is recorded", () => {
  it("says the expiry cannot be tracked rather than implying it is fine", () => {
    const r = assessEndOfSupport({}, NOW);
    expect(r.state).toBe("not_set");
    expect(r.gaps.join(" ")).toMatch(/end of the support period is not recorded/);
    expect(r.message).toMatch(/neither its expiry nor what survives it/);
  });
});

describe("survivors are counted, not merely 'continuing'", () => {
  /**
   * Caught live on the product file, not by these tests: with a support period
   * but NO placing-on-market date, both retention clocks return null, and the
   * only obligation carrying a date was vulnerability handling — whose date IS
   * the support end. The message became self-contradictory: "3 obligations will
   * continue after that date, the last until <that same date>".
   *
   * Every fixture above sets placedOnMarket, so none of them could reach it.
   */
  it("does not count vulnerability handling as surviving its own end date", () => {
    const r = assessEndOfSupport(
      {
        supportPeriodStart: "2026-01-01",
        supportPeriodEnd: "2031-08-15",
        placedOnMarket: null,
        endDateCommunicatedToUsers: true,
      },
      new Date("2027-01-01T00:00:00Z"),
    );
    expect(r.state).toBe("in_support");
    // Nothing outlives the support period on these facts, so the message must
    // not name the support date as the last surviving obligation.
    expect(r.message).not.toMatch(/the last until 2031-08-15/);
  });

  it("still counts the retention clocks once a placing date exists", () => {
    const r = assessEndOfSupport(
      {
        supportPeriodStart: "2026-01-01",
        supportPeriodEnd: "2031-08-15",
        placedOnMarket: "2026-01-01",
        endDateCommunicatedToUsers: true,
      },
      new Date("2027-01-01T00:00:00Z"),
    );
    // 10 years from placing (2036) genuinely outlasts support (2031).
    expect(r.message).toMatch(/the last until 2036-01-01/);
  });
});
