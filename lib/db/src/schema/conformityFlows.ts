import { pgTable, serial, text, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * An admin-authored process flow: an ordered list of typed steps a user works
 * through for a class of products/regulations. Bound to an assessment via a
 * `conformity_flow_runs` row that tracks per-step state. `key` is a stable
 * natural key so a flow can be reseeded/upserted without duplicating.
 */
export type FlowStepType = "activity" | "question" | "checkpoint" | "artifact" | "investigation";

/**
 * A requirement link on a flow step: the regulation-agnostic natural key into
 * the requirements catalogue (regulationKey + refCode, e.g. cra + "Annex I
 * Part II(1)"). Steps that carry links make flow completion TRACEABLE — a run
 * proves work against specific articles, not just clicked cards.
 */
export type FlowStepRequirementRef = {
  regulationKey: string;
  refCode: string;
};

export type FlowStep = {
  id: string;
  type: FlowStepType;
  title: string;
  description?: string;
  // Catalogue requirements this step evidences. Validated against the live
  // requirements table on flow create/update.
  requirementRefs?: FlowStepRequirementRef[];
  // Type-specific hints, e.g. { artifactType } for "artifact", { options } for
  // "question" (options, when present, are ENFORCED as the allowed answers),
  // { bomTypes } for "investigation" (done requires a linked analyzed BOM).
  config?: Record<string, unknown>;
};

export type FlowAppliesTo = {
  regulationKeys?: string[];
  classKeys?: string[];
  bomTypes?: string[];
};

export const conformityFlowsTable = pgTable("conformity_flows", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  appliesTo: jsonb("applies_to").$type<FlowAppliesTo>().notNull().default({}),
  steps: jsonb("steps").$type<FlowStep[]>().notNull().default([]),
  isTemplate: boolean("is_template").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertConformityFlowSchema = createInsertSchema(conformityFlowsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertConformityFlow = z.infer<typeof insertConformityFlowSchema>;
export type ConformityFlowRow = typeof conformityFlowsTable.$inferSelect;
