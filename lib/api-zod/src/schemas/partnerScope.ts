import { z } from "zod/v4";

export const CategoryEnum = z.enum(["switch", "firewall", "router", "gateway", "plc", "other"]);
export const CraAnnexClassEnum = z.enum(["CLASS_I", "CLASS_II", "DEFAULT", "OUT_OF_SCOPE"]);
export const ActionEnum = z.enum(["PULL_FORWARD_SPARE", "MODERNIZE_CRA_HW", "IEC_62443_CONDUIT", "RETAIN"]);

export const SanitizedAssetInputSchema = z.object({
  id: z.string(),
  vendor: z.string().min(1),
  model: z.string().min(1),
  firmwareVersion: z.string().optional(),
  category: CategoryEnum.default("switch"),
  criticality: z.enum(["STANDARD", "CRITICAL", "SAFETY_INSTRUMENTED"]).default("STANDARD"),
  installYear: z.number().int().optional(),
});

export const BOMUploadRequestSchema = z.object({
  partnerId: z.string().default("axians"),
  clientCompanyName: z.string().min(1),
  clientIndustry: z.string().default("Industrial Manufacturing / OT"),
  clientAnnualTurnoverEur: z.number().positive().optional(),
  accountManagerName: z.string().optional(),
  accountManagerEmail: z.string().email().optional(),
  assets: z.array(SanitizedAssetInputSchema).min(1),
  locale: z.enum(["en", "nl"]).default("en"),
});

export const StockMatchResultItemSchema = z.object({
  assetId: z.string(),
  vendor: z.string(),
  model: z.string(),
  craAnnexClass: CraAnnexClassEnum,
  isGrandfatheredPre2027: z.boolean(),
  isArt14Exposed: z.boolean(),
  hasSpareMatch: z.boolean(),
  matchedSpareSku: z.string().optional(),
  matchedSpareModel: z.string().optional(),
  matchedSpareLeadHours: z.number().optional(),
  dispatchLocation: z.string().optional(),
  recommendedAction: ActionEnum,
  actionRationale: z.string(),
});

export const CopilotTalkTrackRequestSchema = z.object({
  partnerId: z.string().default("axians"),
  clientCompanyName: z.string(),
  clientIndustry: z.string(),
  clientTurnoverEur: z.number().optional(),
  totalAssets: z.number().int(),
  art14ExposedCount: z.number().int(),
  classIiCount: z.number().int(),
  matchedSparesCount: z.number().int(),
  locale: z.enum(["en", "nl"]).default("en"),
});

export const CopilotTalkTrackResponseSchema = z.object({
  meetingAgenda: z.array(z.string()),
  urgencyTalkingPoint: z.string(),
  installedBaseTalkingPoint: z.string(),
  capexPullForwardPitch: z.string(),
  partnerSolutionValueProp: z.string(),
  objectionHandlers: z.array(
    z.object({
      objection: z.string(),
      response: z.string(),
    })
  ),
});

export const CRMExportLeadSchema = z.object({
  partnerId: z.string(),
  leadSource: z.literal("oxot_cra_modernization_engine"),
  clientCompanyName: z.string(),
  accountManagerEmail: z.string().optional(),
  dealStage: z.literal("Discovery_Completed"),
  estimatedOpportunityEur: z.number(),
  hardwareCount: z.number().int(),
  urgencyLevel: z.enum(["HIGH_ART_14_EXPOSURE", "MEDIUM_GRANDFATHERED_BUFFER", "PLANNED_MODERNIZATION"]),
  summaryNotes: z.string(),
  tags: z.array(z.string()),
});

export type SanitizedAssetInput = z.infer<typeof SanitizedAssetInputSchema>;
export type BOMUploadRequest = z.infer<typeof BOMUploadRequestSchema>;
export type StockMatchResultItem = z.infer<typeof StockMatchResultItemSchema>;
export type CopilotTalkTrackRequest = z.infer<typeof CopilotTalkTrackRequestSchema>;
export type CopilotTalkTrackResponse = z.infer<typeof CopilotTalkTrackResponseSchema>;
export type CRMExportLead = z.infer<typeof CRMExportLeadSchema>;
