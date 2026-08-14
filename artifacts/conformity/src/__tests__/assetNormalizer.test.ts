import { describe, it, expect } from "vitest";
import { normalizeAndSanitizeAssetInput } from "../lib/assetNormalizer";

describe("OT Asset Normalizer & Sanitizer", () => {
  it("strips private IPs and parses Nozomi Networks CSV export", () => {
    const rawNozomiCsv = `Asset_ID,IP_Address,Vendor,Model,Firmware\n1,10.24.120.45,Siemens,Scalance XC-208,V4.1.2\n2,192.168.1.10,Moxa,EDS-508A,V3.8`;
    
    const result = normalizeAndSanitizeAssetInput(rawNozomiCsv);

    expect(result.sourceDetected).toBe("NOZOMI");
    expect(result.assets).toHaveLength(2);
    expect(result.assets[0].vendor).toBe("Siemens");
    expect(result.assets[1].vendor).toBe("Moxa");
    expect(result.sanitizationReport.replacedCount).toBeGreaterThanOrEqual(2);
    expect(result.sanitizationReport.sanitizedText).not.toContain("10.24.120.45");
    expect(result.sanitizationReport.sanitizedText).not.toContain("192.168.1.10");
  });

  it("handles plain text legacy hardware model lists", () => {
    const plainList = `Hirschmann RS20-0800\nSiemens W788-1\nCisco Catalyst 2960`;
    const result = normalizeAndSanitizeAssetInput(plainList);

    expect(result.assets).toHaveLength(3);
    expect(result.assets[0].vendor).toBe("Hirschmann");
    expect(result.assets[1].vendor).toBe("Siemens");
    expect(result.assets[2].vendor).toBe("Cisco");
  });
});
