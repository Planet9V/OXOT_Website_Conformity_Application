import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityBomComponentsTable } from "./conformityBomComponents";

/**
 * Artificial Intelligence Model Bill of Materials (AI-BOM) asset inventory.
 * Captures model weights, hyperparameters, training provenance, and EU AI Act (2024/1689) risk category.
 */
export const conformityAiModelsTable = pgTable("conformity_ai_models", {
  id: serial("id").primaryKey(),
  componentId: integer("component_id")
    .notNull()
    .references(() => conformityBomComponentsTable.id, { onDelete: "cascade" }),
  modelName: text("model_name").notNull(), // e.g. "Llama-3-8B-Instruct", "Mistral-7B", "Custom-CNN"
  parameterCount: text("parameter_count").notNull().default("8B"),
  quantizationFormat: text("quantization_format").notNull().default("FP16"), // FP16 | INT8 | GGUF
  trainingDatasetProvenance: text("training_dataset_provenance").notNull().default("OpenWebText + FineTune"),
  // Minimal_Risk | Limited_Risk | High_Risk | Unacceptable_Risk
  aiActRiskCategory: text("ai_act_risk_category").notNull().default("High_Risk"),
  hasSafetyAlignment: boolean("has_safety_alignment").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformityAiModelSchema = createInsertSchema(
  conformityAiModelsTable,
).omit({ id: true, createdAt: true });

export type InsertConformityAiModel = z.infer<typeof insertConformityAiModelSchema>;
export type ConformityAiModelRow = typeof conformityAiModelsTable.$inferSelect;
