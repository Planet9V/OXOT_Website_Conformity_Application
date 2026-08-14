import { describe, it, expect } from "vitest";
import { evaluateProcurementVendor } from "../lib/procurementEngine";

describe("CRA Pre-Procurement Evaluation Engine (Art. 18 & 19)", () => {
  it("approves vendor satisfying all mandatory CRA criteria", () => {
    const result = evaluateProcurementVendor({
      vendorName: "Siemens AG",
      productName: "Scalance XC-200 Managed Switch",
      productClass: "important_class_1",
      ceMarkVerified: true,
      docVerified: true,
      docUrl: "https://siemens.com/compliance/doc-xc200.pdf",
      supportPeriodYears: 5,
      vulnerabilityContact: "productcert@siemens.com",
      sbomFormat: "cyclonedx_json",
      freeSecurityPatches: true,
    });

    expect(result.scorecardStatus).toBe("APPROVED");
    expect(result.evaluationScore).toBeGreaterThanOrEqual(90);
    expect(result.rejectionReasons).toHaveLength(0);
    expect(result.contractualClauses).toContain("CRA_ART_10_FREE_PATCHES_WARRANTY");
  });

  it("rejects vendor with unverified CE mark or missing EU Declaration of Conformity", () => {
    const result = evaluateProcurementVendor({
      vendorName: "Unknown Non-EU OEM",
      productName: "Generic Modbus Gateway",
      productClass: "default",
      ceMarkVerified: false,
      docVerified: false,
      supportPeriodYears: 1,
      vulnerabilityContact: "",
      sbomFormat: "none",
      freeSecurityPatches: false,
    });

    expect(result.scorecardStatus).toBe("REJECTED");
    expect(result.evaluationScore).toBeLessThan(50);
    expect(result.rejectionReasons).toContain("CRA_ART_18_CE_MARK_MISSING");
    expect(result.rejectionReasons).toContain("CRA_ART_18_DOC_UNAVAILABLE");
    expect(result.rejectionReasons).toContain("CRA_ART_13_SUPPORT_TERM_SUB_STANDARD");
  });

  it("marks vendor as CONDITIONAL if support is 5+ years and CE verified but SBOM is missing", () => {
    const result = evaluateProcurementVendor({
      vendorName: "Legacy Automation Co",
      productName: "Serial Converter",
      productClass: "default",
      ceMarkVerified: true,
      docVerified: true,
      docUrl: "https://legacy.com/doc.pdf",
      supportPeriodYears: 5,
      vulnerabilityContact: "support@legacy.com",
      sbomFormat: "none",
      freeSecurityPatches: true,
    });

    expect(result.scorecardStatus).toBe("CONDITIONAL");
    expect(result.evaluationScore).toBeGreaterThanOrEqual(60);
    expect(result.conditionalRemediations).toContain("REQUEST_CYCLONEDX_SBOM_DELIVERY");
  });
});
