/**
 * The operator's procurement posture (Phase 21.2) — a pure derivation.
 *
 * Input: the tri-state procurement facts recorded for one product.
 * Output: per-item status and honest counts. Three principles:
 *
 *  1. Every item cites the CRA duty that binds the MANUFACTURER — verified
 *     verbatim against the corpus (Art 13(12) with Art 30; 13(15)–(20)).
 *     The operator's own statutory hook is NIS2 Art 21(2)(d); nothing here
 *     is an operator duty and nothing says it is.
 *  2. Tri-state discipline (L40): unanswered is its own state, never folded
 *     into "missing" — an unasked question is not a gap, it is an unasked
 *     question.
 *  3. No verdicts. The output says what is on file, what is reported not
 *     provided, and what nobody has answered. "Supplier compliant" is not a
 *     thing this application can conclude, and it never appears.
 */

export type Tri = boolean | null | undefined;

export interface ProcurementFacts {
  ceMarkingSighted?: Tri;
  docOnFile?: Tri;
  userInformationReceived?: Tri;
  supportPeriodStated?: Tri;
  securityContactKnown?: Tri;
  manufacturerIdentified?: Tri;
  sbomReceived?: Tri;
}

export type ItemKind = "statutory" | "contractual";
export type ItemStatus = "on_file" | "not_provided" | "unanswered";

export interface ProcurementItemDef {
  key: keyof ProcurementFacts;
  label: string;
  /** The duty that binds the supplier's manufacturer — the citation shown. */
  anchor: string;
  kind: ItemKind;
}

/**
 * The checklist. Order is presentation order. Anchors verified against the
 * CRA corpus on 2026-08-17 (Art 13 paragraphs quoted in the panel copy).
 */
export const PROCUREMENT_ITEMS: ProcurementItemDef[] = [
  {
    key: "ceMarkingSighted",
    label: "CE marking affixed to the product",
    anchor: "CRA Art 13(12), Art 30",
    kind: "statutory",
  },
  {
    key: "docOnFile",
    label: "EU declaration of conformity (or simplified DoC) received",
    anchor: "CRA Art 13(20)",
    kind: "statutory",
  },
  {
    key: "userInformationReceived",
    label: "Annex II information and instructions accompany the product",
    anchor: "CRA Art 13(18)",
    kind: "statutory",
  },
  {
    key: "supportPeriodStated",
    label: "Support-period end date specified at the time of purchase",
    anchor: "CRA Art 13(19)",
    kind: "statutory",
  },
  {
    key: "securityContactKnown",
    label: "Manufacturer's single point of contact known",
    anchor: "CRA Art 13(17)",
    kind: "statutory",
  },
  {
    key: "manufacturerIdentified",
    label: "Product identification and manufacturer name/contacts present",
    anchor: "CRA Art 13(15), 13(16)",
    kind: "statutory",
  },
  {
    key: "sbomReceived",
    label: "SBOM received (contractual ask — the CRA keeps it in the technical documentation)",
    anchor: "contractual",
    kind: "contractual",
  },
];

export interface ProcurementItemResult extends ProcurementItemDef {
  status: ItemStatus;
}

export interface ProcurementPosture {
  items: ProcurementItemResult[];
  onFile: number;
  notProvided: number;
  unanswered: number;
  /** Statutory items only — the contractual ask never counts toward these. */
  statutoryOnFile: number;
  statutoryTotal: number;
}

export interface SupplierProductInput {
  id: number;
  name: string;
  productType: string;
  supportPeriodEnd: string | null;
  redInScope: boolean | null;
  facts: ProcurementFacts;
}

export interface SupplierRollup {
  products: Array<{
    id: number;
    name: string;
    productType: string;
    supportPeriodEnd: string | null;
    redInScope: boolean | null;
    statutoryOnFile: number;
    statutoryTotal: number;
    notProvided: number;
    unanswered: number;
  }>;
  productCount: number;
  statutoryOnFile: number;
  statutoryTotal: number;
  unanswered: number;
  /** Soonest recorded support-period end, or null when none is recorded. */
  earliestSupportEnd: string | null;
}

/**
 * The per-supplier rollup (21.3) — sums of the per-product postures plus the
 * support-period horizon. Sums of facts, not judgements: a supplier with
 * everything unanswered rolls up as unanswered, never as fine.
 */
export function rollupSupplierPosture(products: SupplierProductInput[]): SupplierRollup {
  const rows = products.map((p) => {
    const posture = deriveProcurementPosture(p.facts);
    return {
      id: p.id,
      name: p.name,
      productType: p.productType,
      supportPeriodEnd: p.supportPeriodEnd,
      redInScope: p.redInScope,
      statutoryOnFile: posture.statutoryOnFile,
      statutoryTotal: posture.statutoryTotal,
      notProvided: posture.notProvided,
      unanswered: posture.unanswered,
    };
  });
  const ends = rows.map((r) => r.supportPeriodEnd).filter((d): d is string => !!d);
  return {
    products: rows,
    productCount: rows.length,
    statutoryOnFile: rows.reduce((n, r) => n + r.statutoryOnFile, 0),
    statutoryTotal: rows.reduce((n, r) => n + r.statutoryTotal, 0),
    unanswered: rows.reduce((n, r) => n + r.unanswered, 0),
    earliestSupportEnd: ends.length ? ends.slice().sort()[0]! : null,
  };
}

export function deriveProcurementPosture(facts: ProcurementFacts): ProcurementPosture {
  const items: ProcurementItemResult[] = PROCUREMENT_ITEMS.map((def) => {
    const v = facts[def.key];
    const status: ItemStatus = v === true ? "on_file" : v === false ? "not_provided" : "unanswered";
    return { ...def, status };
  });
  const count = (s: ItemStatus) => items.filter((i) => i.status === s).length;
  const statutory = items.filter((i) => i.kind === "statutory");
  return {
    items,
    onFile: count("on_file"),
    notProvided: count("not_provided"),
    unanswered: count("unanswered"),
    statutoryOnFile: statutory.filter((i) => i.status === "on_file").length,
    statutoryTotal: statutory.length,
  };
}
