import { z } from "zod";

export const ProcurementEvaluationRequestSchema = z.object({
  vendorName: z.string().min(1),
  productName: z.string().min(1),
  productClass: z.enum(["default", "important_class_1", "important_class_2", "critical"]).default("default"),
  ceMarkVerified: z.boolean().default(false),
  docVerified: z.boolean().default(false),
  docUrl: z.string().optional(),
  supportPeriodYears: z.number().int().min(1).default(5),
  vulnerabilityContact: z.string().optional(),
  sbomFormat: z.enum(["cyclonedx_json", "spdx_json", "none"]).default("cyclonedx_json"),
  freeSecurityPatches: z.boolean().default(true),
  evaluationNotes: z.string().optional(),
  evaluatedBy: z.string().optional(),
});

export type ProcurementEvaluationRequest = z.infer<typeof ProcurementEvaluationRequestSchema>;

export const Article21AssessmentRequestSchema = z.object({
  systemIntegratorName: z.string().min(1),
  clientSiteName: z.string().min(1),
  projectName: z.string().min(1),
  targetHardwareModel: z.string().min(1),
  targetSku: z.string().optional(),
  q1IdenticalReplacement: z.boolean(),
  q2OemSignedFirmware: z.boolean(),
  q3IntendedPurposeUnchanged: z.boolean(),
  q4PerformanceEnvelopeConstant: z.boolean(),
  auditedBy: z.string().optional(),
});

export type Article21AssessmentRequest = z.infer<typeof Article21AssessmentRequestSchema>;

export const CompositeComponentInputSchema = z.object({
  componentName: z.string().min(1),
  vendor: z.string().min(1),
  componentRole: z.string().min(1),
  firmwareVersion: z.string().optional(),
  ceMarkPresent: z.boolean().default(false),
  docAvailable: z.boolean().default(false),
  docUrl: z.string().optional(),
  supportExpiryDate: z.string().optional(),
});

export const CompositeSystemRequestSchema = z.object({
  systemName: z.string().min(1),
  machineType: z.string().min(1),
  manufacturerName: z.string().min(1),
  systemVersion: z.string().default("1.0.0"),
  ieee62443ZoneSegregation: z.boolean().default(true),
  components: z.array(CompositeComponentInputSchema).min(1),
});

export type CompositeSystemRequest = z.infer<typeof CompositeSystemRequestSchema>;

export const CsafIngestRequestSchema = z.object({
  trackingId: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  cveId: z.string().min(1),
  cvssScore: z.string().default("0.0"),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  affectedProductSkus: z.array(z.string()).min(1),
  fixedVersion: z.string().optional(),
  remediationSummary: z.string().optional(),
  rawCsafJson: z.record(z.unknown()).optional(),
});

export type CsafIngestRequest = z.infer<typeof CsafIngestRequestSchema>;
