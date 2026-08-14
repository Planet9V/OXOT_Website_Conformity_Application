import { describe, it, expect } from "vitest";
import { assessArticle21SubstantialModification } from "../lib/article21Engine";

describe("CRA Article 21 Substantial Modification Assessment Engine", () => {
  it("certifies Integrator Exemption when all 4 conditions are met", () => {
    const result = assessArticle21SubstantialModification({
      systemIntegratorName: "Axians Netherlands B.V.",
      clientSiteName: "Rotterdam Chemical Terminal",
      projectName: "OT Core Switch Modernization",
      targetHardwareModel: "Hirschmann RS20-0800M2M2SDAE",
      targetSku: "943434-001",
      q1IdenticalReplacement: true,        // Identical replacement part
      q2OemSignedFirmware: true,          // Vendor-provided signed update
      q3IntendedPurposeUnchanged: true,   // Pure layer-2 switching in same cell
      q4PerformanceEnvelopeConstant: true // No change to hazard/safety threshold
    });

    expect(result.classification).toBe("INTEGRATOR_EXEMPT");
    expect(result.statutoryBasis).toContain("Recital 34 & Article 21(1)");
    expect(result.isManufacturerLiabilityTriggered).toBe(false);
    expect(result.certificateHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.recommendationText).toContain("Integrator Due Diligence Certificate");
  });

  it("flags Manufacturer Designation (Article 20) if non-OEM firmware or purpose change occurs", () => {
    const result = assessArticle21SubstantialModification({
      systemIntegratorName: "Custom OT Integrations B.V.",
      clientSiteName: "Automotive Plant",
      projectName: "Gateway Protocol Re-Engineering",
      targetHardwareModel: "Generic Linux Gateway",
      q1IdenticalReplacement: false,
      q2OemSignedFirmware: false,          // Custom unsigned SI firmware
      q3IntendedPurposeUnchanged: false,   // Repurposed from monitoring to safety interlock
      q4PerformanceEnvelopeConstant: false
    });

    expect(result.classification).toBe("MANUFACTURER_TRIGGERED");
    expect(result.isManufacturerLiabilityTriggered).toBe(true);
    expect(result.fineExposureArticle61).toBe("UP_TO_15M_OR_2_5_PERCENT");
    expect(result.warningAlert).toContain("ARTICLE_20_FULL_MANUFACTURER_DUTIES_APPLY");
  });
});
