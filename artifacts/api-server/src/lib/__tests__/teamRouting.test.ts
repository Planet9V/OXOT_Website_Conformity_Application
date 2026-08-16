import { describe, expect, it } from "vitest";
import { defaultTeamRoleFor, routedThemes } from "../teamRouting";

describe("defaultTeamRoleFor", () => {
  it("routes statutory-clock work to the PSIRT", () => {
    expect(defaultTeamRoleFor("incident_reporting")).toBe("psirt");
    expect(defaultTeamRoleFor("vulnerability_handling")).toBe("psirt");
  });

  it("routes the declaration of conformity to the signatory", () => {
    expect(defaultTeamRoleFor("conformity_declaration")).toBe("signatory");
  });

  it("routes product-engineering evidence to the engineering lead", () => {
    expect(defaultTeamRoleFor("technical_documentation")).toBe("engineering_lead");
    expect(defaultTeamRoleFor("secure_by_design")).toBe("engineering_lead");
  });

  it("falls through to the compliance coordinator, never to nobody", () => {
    // The safe failure mode: an unknown theme lands with the dispatcher
    // rather than vanishing from every inbox.
    expect(defaultTeamRoleFor("some_future_theme")).toBe("compliance_coordinator");
    expect(defaultTeamRoleFor(null)).toBe("compliance_coordinator");
    expect(defaultTeamRoleFor(undefined)).toBe("compliance_coordinator");
  });

  it("covers the full theme vocabulary seeded across the ten acts", () => {
    // The act-independent theme keys present in the requirements seed on the
    // day this registry was written. A theme added to the seeds without a
    // routing decision still routes (coordinator fall-through), but this
    // guard makes the vocabulary drift visible instead of silent.
    expect(routedThemes()).toEqual(
      [
        "access_control",
        "conformity_declaration",
        "data_governance",
        "data_protection",
        "human_oversight",
        "incident_reporting",
        "logging_monitoring",
        "post_market",
        "resilience",
        "risk_management",
        "sbom_supply_chain",
        "secure_by_design",
        "secure_update",
        "technical_documentation",
        "vulnerability_handling",
      ].sort(),
    );
  });
});
