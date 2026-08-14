import type { ProcurementEvaluationRequest } from "@workspace/api-zod";

export interface ProcurementEvaluationResult {
  vendorName: string;
  productName: string;
  productClass: string;
  scorecardStatus: "APPROVED" | "CONDITIONAL" | "REJECTED";
  evaluationScore: number; // 0 - 100
  rejectionReasons: string[];
  conditionalRemediations: string[];
  contractualClauses: string[];
  criteriaScores: {
    ceMark: boolean;
    euDoc: boolean;
    supportLifetime: boolean;
    vulnerabilityChannel: boolean;
    machineReadableSbom: boolean;
    freeSecurityPatches: boolean;
  };
}

export function evaluateProcurementVendor(input: ProcurementEvaluationRequest): ProcurementEvaluationResult {
  const rejectionReasons: string[] = [];
  const conditionalRemediations: string[] = [];
  const contractualClauses: string[] = [];

  let score = 0;

  // 1. CE Mark Check (Mandatory under CRA Art. 18 & 22)
  const cePass = Boolean(input.ceMarkVerified);
  if (cePass) {
    score += 25;
  } else {
    rejectionReasons.push("CRA_ART_18_CE_MARK_MISSING");
  }

  // 2. EU Declaration of Conformity (Mandatory under CRA Art. 18 & Annex V)
  const docPass = Boolean(input.docVerified && input.docUrl);
  if (docPass) {
    score += 25;
  } else {
    rejectionReasons.push("CRA_ART_18_DOC_UNAVAILABLE");
  }

  // 3. Support Lifetime (CRA Art. 13 minimum 5 years)
  const supportPass = input.supportPeriodYears >= 5;
  if (supportPass) {
    score += 20;
    contractualClauses.push("CRA_ART_13_5_YEAR_LIFETIME_GUARANTEE");
  } else {
    rejectionReasons.push("CRA_ART_13_SUPPORT_TERM_SUB_STANDARD");
  }

  // 4. Free Security Patches (CRA Art. 10)
  const freePatchesPass = Boolean(input.freeSecurityPatches);
  if (freePatchesPass) {
    score += 15;
    contractualClauses.push("CRA_ART_10_FREE_PATCHES_WARRANTY");
  } else {
    conditionalRemediations.push("NEGOTIATE_FREE_SECURITY_PATCHES_CLAUSE");
  }

  // 5. Machine Readable SBOM (CycloneDX / SPDX)
  const sbomPass = input.sbomFormat === "cyclonedx_json" || input.sbomFormat === "spdx_json";
  if (sbomPass) {
    score += 10;
  } else {
    conditionalRemediations.push("REQUEST_CYCLONEDX_SBOM_DELIVERY");
  }

  // 6. Vulnerability Contact Channel
  const vulnContactPass = Boolean(input.vulnerabilityContact && input.vulnerabilityContact.trim().length > 0);
  if (vulnContactPass) {
    score += 5;
  } else {
    conditionalRemediations.push("DESIGNATE_PSIRT_POINT_OF_CONTACT");
  }

  // Status classification
  let scorecardStatus: "APPROVED" | "CONDITIONAL" | "REJECTED" = "APPROVED";
  if (rejectionReasons.length > 0) {
    scorecardStatus = "REJECTED";
  } else if (conditionalRemediations.length > 0 || score < 85) {
    scorecardStatus = "CONDITIONAL";
  }

  return {
    vendorName: input.vendorName,
    productName: input.productName,
    productClass: input.productClass,
    scorecardStatus,
    evaluationScore: score,
    rejectionReasons,
    conditionalRemediations,
    contractualClauses,
    criteriaScores: {
      ceMark: cePass,
      euDoc: docPass,
      supportLifetime: supportPass,
      vulnerabilityChannel: vulnContactPass,
      machineReadableSbom: sbomPass,
      freeSecurityPatches: freePatchesPass,
    },
  };
}
