import { describe, it, expect } from "vitest";
import { assembleCompositeSystem } from "../lib/compositeEngine";

describe("CRA Article 20 Composite System & Machine Builder Engine", () => {
  it("evaluates a compliant composite machine with 100% verified sub-components", () => {
    const result = assembleCompositeSystem({
      systemName: "High-Speed Pharmaceutical Bottling Skid",
      machineType: "skid_controller",
      manufacturerName: "Aalberts Industrial Automation",
      systemVersion: "2.4.0",
      ieee62443ZoneSegregation: true,
      components: [
        {
          componentName: "Main Controller PLC",
          vendor: "Siemens",
          componentRole: "plc",
          firmwareVersion: "V4.2.1",
          ceMarkPresent: true,
          docAvailable: true,
          docUrl: "https://siemens.com/doc.pdf",
          supportExpiryDate: "2032-12-31"
        },
        {
          componentName: "Operator HMI Panel",
          vendor: "Schneider Electric",
          componentRole: "hmi",
          firmwareVersion: "V3.1.0",
          ceMarkPresent: true,
          docAvailable: true,
          docUrl: "https://se.com/doc.pdf",
          supportExpiryDate: "2030-06-30"
        }
      ]
    });

    expect(result.compositeComplianceStatus).toBe("COMPLIANT");
    expect(result.totalComponentsCount).toBe(2);
    expect(result.compliantComponentsCount).toBe(2);
    expect(result.integrationRiskScore).toBe(0);
    expect(result.docSealedHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("flags NON_COMPLIANT when an uncertified component or missing DoC is present", () => {
    const result = assembleCompositeSystem({
      systemName: "Automated Packaging Line",
      machineType: "packaging_machine",
      manufacturerName: "Industrial Packaging B.V.",
      systemVersion: "1.0.0",
      ieee62443ZoneSegregation: false,
      components: [
        {
          componentName: "Certified PLC",
          vendor: "Siemens",
          componentRole: "plc",
          ceMarkPresent: true,
          docAvailable: true,
        },
        {
          componentName: "Uncertified Wi-Fi Bridge",
          vendor: "Generic Wireless",
          componentRole: "gateway",
          ceMarkPresent: false,
          docAvailable: false,
        }
      ]
    });

    expect(result.compositeComplianceStatus).toBe("NON_COMPLIANT");
    expect(result.compliantComponentsCount).toBe(1);
    expect(result.integrationRiskScore).toBeGreaterThanOrEqual(40);
    expect(result.flaggedComponents).toHaveLength(1);
    expect(result.flaggedComponents[0].riskFlag).toBe("NON_CE_OR_MISSING_DOC");
  });
});
