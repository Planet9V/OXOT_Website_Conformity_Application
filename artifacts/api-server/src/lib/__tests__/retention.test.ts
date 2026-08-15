/**
 * Article 13 retention clocks.
 *
 * The acceptance criterion for this task: each of the three clocks is computed
 * from its OWN start date, and the "whichever is longer" branch is covered both
 * ways for each. The failure this guards against is collapsing them into one
 * field — they read alike, but 13(9) runs from the update's issue date while
 * 13(13) and 13(18) run from placing on the market, so one product can owe three
 * different end dates at once.
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import {
  technicalDocumentationRetention,
  userInformationRetention,
  securityUpdateAvailability,
  daysUntil,
} from "../retention";

const PLACED = "2027-01-01";

describe("Art. 13(13) — technical documentation and the EU DoC", () => {
  it("runs 10 years from placing on the market when that is longer", () => {
    const r = technicalDocumentationRetention({
      placedOnMarket: PLACED,
      supportPeriodEnd: "2032-01-01",
    });
    expect(r.until).toBe("2037-01-01");
    expect(r.basis).toBe("ten_years");
    expect(r.citation).toBe("Article 13(13)");
  });

  it("runs to the end of the support period when that is longer", () => {
    const r = technicalDocumentationRetention({
      placedOnMarket: PLACED,
      supportPeriodEnd: "2040-06-30",
    });
    expect(r.until).toBe("2040-06-30");
    expect(r.basis).toBe("support_period");
    expect(r.message).toMatch(/end of the support period/);
  });

  it("cannot compute without a placing-on-the-market date, and says so", () => {
    const r = technicalDocumentationRetention({ supportPeriodEnd: "2040-01-01" });
    expect(r.until).toBeNull();
    expect(r.basis).toBe("unknown");
    expect(r.message).toMatch(/not recorded/);
  });
});

describe("Art. 13(18) — Annex II information and instructions to the user", () => {
  it("runs 10 years from placing on the market when that is longer", () => {
    const r = userInformationRetention({
      placedOnMarket: PLACED,
      supportPeriodEnd: "2030-01-01",
    });
    expect(r.until).toBe("2037-01-01");
    expect(r.basis).toBe("ten_years");
    expect(r.citation).toBe("Article 13(18)");
  });

  it("runs to the end of the support period when that is longer", () => {
    const r = userInformationRetention({
      placedOnMarket: PLACED,
      supportPeriodEnd: "2039-03-15",
    });
    expect(r.until).toBe("2039-03-15");
    expect(r.basis).toBe("support_period");
  });

  it("is a separate duty from 13(13) even when the dates coincide", () => {
    const args = { placedOnMarket: PLACED, supportPeriodEnd: "2032-01-01" };
    const doc = technicalDocumentationRetention(args);
    const info = userInformationRetention(args);
    expect(info.until).toBe(doc.until);
    expect(info.citation).not.toBe(doc.citation);
    // 13(18) is owed to users too, and covers the online copy.
    expect(info.subject).toMatch(/online/);
  });
});

describe("Art. 13(9) — availability of a security update", () => {
  it("runs 10 years from the update's issue date, not from placing on the market", () => {
    const r = securityUpdateAvailability({
      updateIssuedOn: "2030-05-01",
      supportPeriodEnd: "2032-01-01",
    });
    expect(r.until).toBe("2040-05-01");
    expect(r.basis).toBe("ten_years");
    expect(r.citation).toBe("Article 13(9)");
  });

  it("runs to the remainder of the support period when that is longer", () => {
    const r = securityUpdateAvailability({
      updateIssuedOn: "2028-01-01",
      supportPeriodEnd: "2045-01-01",
    });
    expect(r.until).toBe("2045-01-01");
    expect(r.basis).toBe("support_period");
  });

  it("cannot be computed from the product alone — it needs the update's date", () => {
    const r = securityUpdateAvailability({ supportPeriodEnd: "2040-01-01" });
    expect(r.until).toBeNull();
    expect(r.message).toMatch(/the date the update was issued/);
  });
});

describe("the three clocks are genuinely distinct", () => {
  it("one product, one support period, three different end dates", () => {
    const supportPeriodEnd = "2032-01-01";
    const doc = technicalDocumentationRetention({ placedOnMarket: PLACED, supportPeriodEnd });
    const info = userInformationRetention({ placedOnMarket: PLACED, supportPeriodEnd });
    // A late update issued near the end of the support period outlives both.
    const update = securityUpdateAvailability({
      updateIssuedOn: "2031-11-30",
      supportPeriodEnd,
    });
    expect(doc.until).toBe("2037-01-01");
    expect(info.until).toBe("2037-01-01");
    expect(update.until).toBe("2041-11-30");
    expect(update.until! > doc.until!).toBe(true);
  });
});

describe("daysUntil", () => {
  it("is positive before the date and negative after it", () => {
    expect(daysUntil("2026-08-25", new Date("2026-08-15T00:00:00Z"))).toBe(10);
    expect(daysUntil("2026-08-05", new Date("2026-08-15T00:00:00Z"))).toBe(-10);
  });

  it("is null when there is no date to run to", () => {
    expect(daysUntil(null, new Date("2026-08-15T00:00:00Z"))).toBeNull();
  });
});
