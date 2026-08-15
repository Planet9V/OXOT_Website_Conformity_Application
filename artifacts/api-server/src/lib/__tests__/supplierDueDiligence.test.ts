/**
 * Article 13(5) — due diligence on third-party components.
 *
 * The assertion that matters: Recital 34 offers its four actions as
 * ALTERNATIVES ("one or more"), scaled to risk. Requiring all four would invent
 * obligations, which is the failure this codebase exists to correct.
 *
 * Text pinned against docs/cra_statutory_corpus/{02_articles,01_recitals}_full.json.
 */
import { describe, it, expect } from "vitest";
import {
  assessComponentDueDiligence,
  summariseProductDueDiligence,
  type ComponentDueDiligenceInput,
} from "../supplierDueDiligence";

function component(over: Partial<ComponentDueDiligenceInput> = {}): ComponentDueDiligenceInput {
  return {
    componentName: "libmodbus 3.1.6",
    supplier: "OSS project",
    risk: "low",
    actionsTaken: ["conformity_verified"],
    ...over,
  };
}

describe("Recital 34 offers alternatives, not a checklist", () => {
  it("accepts a single action on a low-risk component", () => {
    const r = assessComponentDueDiligence(component());
    expect(r.status).toBe("proportionate");
    expect(r.gaps).toEqual([]);
  });

  it("expects more as risk rises, and says it is proportionality not a legal minimum", () => {
    const r = assessComponentDueDiligence(component({ risk: "high" }));
    expect(r.status).toBe("insufficient");
    expect(r.expected).toBe(3);
    expect(r.gaps.join(" ")).toMatch(/not a legal minimum/);
  });

  it("is satisfied at high risk once enough actions are evidenced", () => {
    const r = assessComponentDueDiligence(
      component({
        risk: "high",
        actionsTaken: ["conformity_verified", "update_history_verified", "vulnerability_database_checked"],
      }),
    );
    expect(r.status).toBe("proportionate");
  });

  it("flags a component with no due diligence at all", () => {
    const r = assessComponentDueDiligence(component({ actionsTaken: [] }));
    expect(r.status).toBe("not_assessed");
    expect(r.gaps.join(" ")).toMatch(/Article 13\(5\) requires due diligence/);
  });

  /** Recital 34 makes the level depend on risk, so risk must be known first. */
  it("cannot judge proportionality while the component risk is unassessed", () => {
    const r = assessComponentDueDiligence(component({ risk: null }));
    expect(r.gaps.join(" ")).toMatch(/cannot be judged proportionate until the risk is known/);
  });
});

describe("free and open-source components are expressly in scope", () => {
  it("says so rather than leaving it to be assumed the other way", () => {
    const r = assessComponentDueDiligence(component({ isFreeAndOpenSource: true }));
    expect(r.message).toMatch(/covers it expressly/);
    expect(r.message).toMatch(/never made available on the market/);
  });
});

describe("Recital 34 follow-through when diligence finds something", () => {
  const found = { vulnerabilityFound: true as const };

  it("requires the maintainer to be informed", () => {
    const r = assessComponentDueDiligence(component({ ...found }));
    expect(r.status).toBe("follow_up_open");
    expect(r.gaps.join(" ")).toMatch(/inform the person or entity manufacturing or maintaining/);
  });

  it("requires remediation and the fix to be offered back", () => {
    const r = assessComponentDueDiligence(
      component({ ...found, maintainerInformedAt: "2027-02-01" }),
    );
    expect(r.gaps.join(" ")).toMatch(/not recorded as remediated/);
    expect(r.gaps.join(" ")).toMatch(/applied security fix to be provided/);
  });

  it("closes once informed, remediated and the fix provided", () => {
    const r = assessComponentDueDiligence(
      component({
        ...found,
        maintainerInformedAt: "2027-02-01",
        remediatedAt: "2027-02-10",
        securityFixProvidedToMaintainer: true,
      }),
    );
    expect(r.status).toBe("proportionate");
    expect(r.gaps).toEqual([]);
  });
});

describe("the product roll-up", () => {
  it("reports counts, never a percentage", () => {
    const s = summariseProductDueDiligence([
      assessComponentDueDiligence(component()),
      assessComponentDueDiligence(component({ componentName: "openssl", actionsTaken: [] })),
      assessComponentDueDiligence(component({ componentName: "busybox", risk: "high" })),
    ]);
    expect(s.componentsTotal).toBe(3);
    expect(s.notAssessed).toBe(1);
    expect(s.insufficient).toBe(1);
    expect(s.proportionate).toBe(1);
    // "87% due diligence" reads as reassurance while components go unlooked-at.
    expect(s.message).not.toMatch(/%/);
    expect(s.message).toMatch(/no due diligence recorded at all/);
  });

  it("does not call an empty component list compliant", () => {
    const s = summariseProductDueDiligence([]);
    expect(s.message).toMatch(/cannot be evidenced/);
  });

  it("surfaces open vulnerability follow-ups first", () => {
    const s = summariseProductDueDiligence([
      assessComponentDueDiligence(component({ vulnerabilityFound: true })),
      assessComponentDueDiligence(component()),
    ]);
    expect(s.followUpOpen).toBe(1);
    expect(s.message).toMatch(/^1 component\(s\) have an open follow-up/);
  });
});
