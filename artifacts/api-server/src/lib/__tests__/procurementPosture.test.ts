/**
 * The procurement-posture derivation (21.2): tri-state discipline and the
 * statutory/contractual boundary. The three states must stay distinct —
 * folding "unanswered" into "missing" invents a gap nobody reported.
 */
import { describe, expect, it } from "vitest";
import {
  deriveProcurementPosture,
  PROCUREMENT_ITEMS,
} from "../procurementPosture";

describe("deriveProcurementPosture", () => {
  it("reports everything unanswered when nothing has been recorded", () => {
    const p = deriveProcurementPosture({});
    expect(p.unanswered).toBe(PROCUREMENT_ITEMS.length);
    expect(p.onFile).toBe(0);
    expect(p.notProvided).toBe(0);
    expect(p.items.every((i) => i.status === "unanswered")).toBe(true);
  });

  it("keeps the three states distinct — false is an answer, null is not", () => {
    const p = deriveProcurementPosture({
      docOnFile: true,
      supportPeriodStated: false,
      ceMarkingSighted: null,
    });
    expect(p.items.find((i) => i.key === "docOnFile")!.status).toBe("on_file");
    expect(p.items.find((i) => i.key === "supportPeriodStated")!.status).toBe("not_provided");
    expect(p.items.find((i) => i.key === "ceMarkingSighted")!.status).toBe("unanswered");
    expect(p.onFile).toBe(1);
    expect(p.notProvided).toBe(1);
    expect(p.unanswered).toBe(PROCUREMENT_ITEMS.length - 2);
  });

  it("keeps the SBOM out of the statutory counts — it is a contractual ask", () => {
    const everything = Object.fromEntries(
      PROCUREMENT_ITEMS.map((i) => [i.key, true]),
    );
    const p = deriveProcurementPosture(everything);
    expect(p.onFile).toBe(PROCUREMENT_ITEMS.length);
    expect(p.statutoryTotal).toBe(PROCUREMENT_ITEMS.length - 1);
    expect(p.statutoryOnFile).toBe(PROCUREMENT_ITEMS.length - 1);
    const sbom = p.items.find((i) => i.key === "sbomReceived")!;
    expect(sbom.kind).toBe("contractual");
    expect(sbom.anchor).toBe("contractual");
  });

  it("anchors every statutory item to a manufacturer-side CRA citation", () => {
    for (const item of PROCUREMENT_ITEMS.filter((i) => i.kind === "statutory")) {
      expect(item.anchor, item.key).toMatch(/^CRA Art 13/);
    }
  });

  it("never emits any verdict-shaped output", () => {
    const p = deriveProcurementPosture({ docOnFile: true });
    const words = JSON.stringify(p).toLowerCase();
    for (const forbidden of ["compliant", "conformant", "verdict", "passed"]) {
      expect(words).not.toContain(forbidden);
    }
  });
});

describe("rollupSupplierPosture", () => {
  const product = (over: any = {}) => ({
    id: 1,
    name: "P",
    productType: "hardware",
    supportPeriodEnd: null,
    redInScope: null,
    facts: {},
    ...over,
  });

  it("an all-unanswered estate rolls up as unanswered, never as fine", async () => {
    const { rollupSupplierPosture, PROCUREMENT_ITEMS } = await import("../procurementPosture");
    const r = rollupSupplierPosture([product({ id: 1 }), product({ id: 2 })]);
    expect(r.statutoryOnFile).toBe(0);
    expect(r.unanswered).toBe(2 * PROCUREMENT_ITEMS.length);
    expect(r.earliestSupportEnd).toBeNull();
  });

  it("takes the SOONEST support end as the horizon", async () => {
    const { rollupSupplierPosture } = await import("../procurementPosture");
    const r = rollupSupplierPosture([
      product({ id: 1, supportPeriodEnd: "2028-06-30" }),
      product({ id: 2, supportPeriodEnd: "2027-01-31" }),
      product({ id: 3, supportPeriodEnd: null }),
    ]);
    expect(r.earliestSupportEnd).toBe("2027-01-31");
    expect(r.productCount).toBe(3);
  });

  it("sums per-product statutory counts", async () => {
    const { rollupSupplierPosture } = await import("../procurementPosture");
    const r = rollupSupplierPosture([
      product({ id: 1, facts: { docOnFile: true, ceMarkingSighted: true } }),
      product({ id: 2, facts: { docOnFile: true, sbomReceived: true } }),
    ]);
    // sbomReceived is contractual — three statutory facts on file in total.
    expect(r.statutoryOnFile).toBe(3);
  });
});
