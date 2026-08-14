import type { CsafIngestRequest } from "@workspace/api-zod";

export interface CsafIngestResult {
  trackingId: string;
  title: string;
  publisher: string;
  cveId: string;
  severity: string;
  cvssScore: string;
  affectedProductSkus: string[];
  csirtNotificationRequired: boolean;
  csirtNotificationDeadline: string | null;
  remediationSummary: string;
  ingestionStatus: "INGESTED_SUCCESS" | "ACTION_REQUIRED";
}

export function parseAndIngestCsafAdvisory(input: CsafIngestRequest): CsafIngestResult {
  const isHighOrCritical = input.severity === "CRITICAL" || input.severity === "HIGH" || parseFloat(input.cvssScore) >= 7.0;
  
  // Under CRA Article 14, actively exploited or critical zero-days require 24h CSIRT early warning
  const csirtNotificationRequired = isHighOrCritical;
  let csirtNotificationDeadline: string | null = null;
  if (csirtNotificationRequired) {
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
    csirtNotificationDeadline = deadline.toISOString();
  }

  return {
    trackingId: input.trackingId,
    title: input.title,
    publisher: input.publisher,
    cveId: input.cveId,
    severity: input.severity,
    cvssScore: input.cvssScore,
    affectedProductSkus: input.affectedProductSkus,
    csirtNotificationRequired,
    csirtNotificationDeadline,
    remediationSummary: input.remediationSummary || `Vendor advisory ${input.trackingId} for ${input.cveId}. Upgrade to ${input.fixedVersion || "latest signed firmware"}.`,
    ingestionStatus: isHighOrCritical ? "ACTION_REQUIRED" : "INGESTED_SUCCESS",
  };
}
