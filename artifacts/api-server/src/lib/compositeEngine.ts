import { createHash } from "crypto";
import type { CompositeSystemRequest } from "@workspace/api-zod";

export interface CompositeSystemResult {
  systemName: string;
  machineType: string;
  manufacturerName: string;
  systemVersion: string;
  totalComponentsCount: number;
  compliantComponentsCount: number;
  compositeComplianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "IN_REVIEW";
  integrationRiskScore: number; // 0 - 100
  ieee62443ZoneSegregation: boolean;
  docSealedHash: string;
  flaggedComponents: Array<{
    componentName: string;
    vendor: string;
    componentRole: string;
    riskFlag: string;
    reason: string;
  }>;
}

export function assembleCompositeSystem(input: CompositeSystemRequest): CompositeSystemResult {
  const flaggedComponents: CompositeSystemResult["flaggedComponents"] = [];
  let compliantCount = 0;
  let riskScore = 0;

  for (const comp of input.components) {
    const isCompliant = comp.ceMarkPresent && comp.docAvailable;
    if (isCompliant) {
      compliantCount++;
    } else {
      let riskFlag = "NON_CE_OR_MISSING_DOC";
      let reason = "Component lacks verified CE mark or accessible EU Declaration of Conformity.";
      if (comp.ceMarkPresent && !comp.docAvailable) {
        riskFlag = "MISSING_DOC";
        reason = "CE mark is declared, but EU Declaration of Conformity is unavailable.";
      }
      riskScore += 25;
      flaggedComponents.push({
        componentName: comp.componentName,
        vendor: comp.vendor,
        componentRole: comp.componentRole,
        riskFlag,
        reason,
      });
    }
  }

  if (!input.ieee62443ZoneSegregation) {
    riskScore += 20;
  }

  riskScore = Math.min(100, riskScore);

  let compositeComplianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "IN_REVIEW" = "COMPLIANT";
  if (flaggedComponents.length > 0 || riskScore > 30) {
    compositeComplianceStatus = "NON_COMPLIANT";
  }

  const rawPayload = JSON.stringify({
    system: input.systemName,
    manufacturer: input.manufacturerName,
    componentsCount: input.components.length,
    status: compositeComplianceStatus,
    timestamp: "2026-08-14T12:00:00Z",
  });
  const docSealedHash = createHash("sha256").update(rawPayload).digest("hex");

  return {
    systemName: input.systemName,
    machineType: input.machineType,
    manufacturerName: input.manufacturerName,
    systemVersion: input.systemVersion,
    totalComponentsCount: input.components.length,
    compliantComponentsCount: compliantCount,
    compositeComplianceStatus,
    integrationRiskScore: riskScore,
    ieee62443ZoneSegregation: input.ieee62443ZoneSegregation,
    docSealedHash,
    flaggedComponents,
  };
}
