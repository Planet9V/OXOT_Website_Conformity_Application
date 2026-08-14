import { createHash } from "crypto";
import type { Article21AssessmentRequest } from "@workspace/api-zod";

export interface Article21AssessmentResult {
  systemIntegratorName: string;
  clientSiteName: string;
  projectName: string;
  targetHardwareModel: string;
  classification: "INTEGRATOR_EXEMPT" | "MANUFACTURER_TRIGGERED";
  isManufacturerLiabilityTriggered: boolean;
  statutoryBasis: string;
  certificateHash: string;
  fineExposureArticle61?: string;
  warningAlert?: string;
  recommendationText: string;
  auditChecklistSummary: {
    q1IdenticalReplacement: boolean;
    q2OemSignedFirmware: boolean;
    q3IntendedPurposeUnchanged: boolean;
    q4PerformanceEnvelopeConstant: boolean;
  };
}

export function assessArticle21SubstantialModification(input: Article21AssessmentRequest): Article21AssessmentResult {
  const isIntegrator =
    input.q1IdenticalReplacement &&
    input.q2OemSignedFirmware &&
    input.q3IntendedPurposeUnchanged &&
    input.q4PerformanceEnvelopeConstant;

  const rawPayload = JSON.stringify({
    si: input.systemIntegratorName,
    site: input.clientSiteName,
    project: input.projectName,
    model: input.targetHardwareModel,
    q1: input.q1IdenticalReplacement,
    q2: input.q2OemSignedFirmware,
    q3: input.q3IntendedPurposeUnchanged,
    q4: input.q4PerformanceEnvelopeConstant,
    auditedBy: input.auditedBy || "SystemIntegratorAutomatedAudit",
    timestamp: "2026-08-14T12:00:00Z",
  });

  const certificateHash = createHash("sha256").update(rawPayload).digest("hex");

  if (isIntegrator) {
    return {
      systemIntegratorName: input.systemIntegratorName,
      clientSiteName: input.clientSiteName,
      projectName: input.projectName,
      targetHardwareModel: input.targetHardwareModel,
      classification: "INTEGRATOR_EXEMPT",
      isManufacturerLiabilityTriggered: false,
      statutoryBasis: "CRA Recital 34 & Article 21(1): Identical replacement and OEM-signed update maintain Integrator / Distributor status under Article 19.",
      certificateHash,
      recommendationText: "Integrator Due Diligence Certificate generated. System Integrator is exempt from Article 20 Manufacturer obligations and Annex I technical file requirements.",
      auditChecklistSummary: {
        q1IdenticalReplacement: input.q1IdenticalReplacement,
        q2OemSignedFirmware: input.q2OemSignedFirmware,
        q3IntendedPurposeUnchanged: input.q3IntendedPurposeUnchanged,
        q4PerformanceEnvelopeConstant: input.q4PerformanceEnvelopeConstant,
      },
    };
  }

  return {
    systemIntegratorName: input.systemIntegratorName,
    clientSiteName: input.clientSiteName,
    projectName: input.projectName,
    targetHardwareModel: input.targetHardwareModel,
    classification: "MANUFACTURER_TRIGGERED",
    isManufacturerLiabilityTriggered: true,
    statutoryBasis: "CRA Article 21(2) & Article 20: Substantial modification or repurposing legally transfers full Manufacturer status to the System Integrator.",
    certificateHash,
    fineExposureArticle61: "UP_TO_15M_OR_2_5_PERCENT",
    warningAlert: "ARTICLE_20_FULL_MANUFACTURER_DUTIES_APPLY: You must compile an Annex VII technical documentation file and draw up an EU Declaration of Conformity.",
    recommendationText: "ACTION REQUIRED: Revert custom firmware modifications or restrict replacement to identical vendor-certified SKUs under Recital 34 to avoid manufacturer liability.",
    auditChecklistSummary: {
      q1IdenticalReplacement: input.q1IdenticalReplacement,
      q2OemSignedFirmware: input.q2OemSignedFirmware,
      q3IntendedPurposeUnchanged: input.q3IntendedPurposeUnchanged,
      q4PerformanceEnvelopeConstant: input.q4PerformanceEnvelopeConstant,
    },
  };
}
