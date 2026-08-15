/**
 * Version-aware obligations.
 *
 * The acceptance criterion from Phase 1B.3: a substantial modification recorded
 * against version 2.1 must not silently change version 1.0's obligations.
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import { resolveVersion, scopeModificationToVersions, type VersionLevel } from "../productVersions";

const product = {
  placedOnMarketDate: "2027-01-01",
  supportPeriodStart: "2027-01-01",
  supportPeriodEnd: "2032-01-01",
};

const v1: VersionLevel = { id: 1, version: "1.0", placedOnMarketDate: "2027-01-01" };
const v2: VersionLevel = { id: 2, version: "2.1", placedOnMarketDate: "2030-06-01" };

describe("retention anchors on the version's own placing date", () => {
  /**
   * The defect this prevents: using the product line's first placing date for a
   * version shipped three years later would end the retention duty three years
   * early.
   */
  it("runs a later version's clock from its own date, not the line's", () => {
    const r1 = resolveVersion(product, v1);
    const r2 = resolveVersion(product, v2);
    expect(r1.technicalDocumentationRetention.until).toBe("2037-01-01");
    expect(r2.technicalDocumentationRetention.until).toBe("2040-06-01");
    expect(r2.technicalDocumentationRetention.until! > r1.technicalDocumentationRetention.until!).toBe(true);
  });

  it("refuses to substitute the line's date when the version has none", () => {
    const r = resolveVersion(product, { id: 3, version: "3.0" });
    expect(r.placedOnMarket).toBeNull();
    expect(r.technicalDocumentationRetention.until).toBeNull();
    expect(r.gaps.join(" ")).toMatch(/not a substitute/);
  });
});

describe("support period inheritance", () => {
  it("inherits the product's period when the version declares none", () => {
    const r = resolveVersion(product, v2);
    expect(r.supportPeriodEnd).toBe("2032-01-01");
    expect(r.supportPeriodSource).toBe("product");
  });

  it("uses the version's own period when it has one", () => {
    const r = resolveVersion(product, { ...v2, supportPeriodEnd: "2035-06-01" });
    expect(r.supportPeriodEnd).toBe("2035-06-01");
    expect(r.supportPeriodSource).toBe("version");
  });

  it("reports a gap when neither level has one", () => {
    const r = resolveVersion({}, { id: 4, version: "4.0", placedOnMarketDate: "2028-01-01" });
    expect(r.supportPeriodSource).toBe("unset");
    expect(r.gaps.join(" ")).toMatch(/Article 13\(8\)/);
  });

  it("lets a longer version-specific period extend retention", () => {
    const r = resolveVersion(product, { ...v1, supportPeriodEnd: "2045-01-01" });
    // Support period beats 10 years from placing.
    expect(r.technicalDocumentationRetention.until).toBe("2045-01-01");
    expect(r.technicalDocumentationRetention.basis).toBe("support_period");
  });
});

describe("a modification attaches to the version it was made to", () => {
  /** The Phase 1B.3 acceptance criterion. */
  it("does not touch versions placed on the market before it", () => {
    const r = scopeModificationToVersions({ targetVersionId: 2, versions: [v1, v2] });
    expect(r.affectedVersionIds).toEqual([2]);
    expect(r.unaffectedVersionIds).toEqual([1]);
    expect(r.message).toMatch(/not a change to versions placed on the market before it/);
  });

  it("covers the entire version where cybersecurity is affected product-wide", () => {
    const r = scopeModificationToVersions({
      targetVersionId: 2,
      versions: [v1, v2],
      cybersecurityImpactIsProductWide: true,
    });
    expect(r.message).toMatch(/entire version/);
    expect(r.message).toMatch(/Article 22\(2\)/);
    // Still does not reach v1.
    expect(r.affectedVersionIds).toEqual([2]);
  });

  it("covers only the affected part by default", () => {
    const r = scopeModificationToVersions({
      targetVersionId: 2,
      versions: [v1, v2],
      cybersecurityImpactIsProductWide: false,
    });
    expect(r.message).toMatch(/part affected by the modification/);
  });

  it("says nothing about other versions when there are none", () => {
    const r = scopeModificationToVersions({ targetVersionId: 1, versions: [v1] });
    expect(r.unaffectedVersionIds).toEqual([]);
    expect(r.message).not.toMatch(/other version/);
  });
});
