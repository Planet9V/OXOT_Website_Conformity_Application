import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityFlowsTable, type FlowStep } from "./conformityFlows";
import { conformityAssessmentsTable } from "./conformityAssessments";

/**
 * A live instance of a flow bound to one assessment. `stepStates` is keyed by
 * the flow step id and records progress (status + captured answer/note + any
 * generated artifact) so the flow definition can evolve without losing runs.
 */
export type FlowRunStepState = {
  status: "pending" | "in_progress" | "done" | "skipped";
  answer?: string;
  note?: string;
  artifactId?: number;
  // Investigation steps: the analyzed BOM this step's work was performed on.
  bomId?: number;
  completedAt?: string;
};

export const conformityFlowRunsTable = pgTable("conformity_flow_runs", {
  id: serial("id").primaryKey(),
  // The originating flow. Nullable + ON DELETE SET NULL: a run is a frozen
  // record of history, so deleting the flow definition must NOT delete the run
  // (its `steps`/`flowName` snapshot below keeps it fully renderable).
  flowId: integer("flow_id").references(() => conformityFlowsTable.id, {
    onDelete: "set null",
  }),
  assessmentId: integer("assessment_id")
    .notNull()
    .references(() => conformityAssessmentsTable.id, { onDelete: "cascade" }),
  // Frozen copy of the flow's display name at run-creation time, so renaming or
  // deleting the flow never changes what the run shows.
  flowName: text("flow_name").notNull().default(""),
  // Frozen copy of the flow's step definitions at run-creation time. The run
  // renders and maps `stepStates` against THIS snapshot, never the live flow, so
  // reordering/renaming/retyping/deleting steps never rewrites run history.
  steps: jsonb("steps").$type<FlowStep[]>().notNull().default([]),
  // active | complete | archived
  status: text("status").notNull().default("active"),
  assignee: text("assignee").notNull().default(""),
  stepStates: jsonb("step_states")
    .$type<Record<string, FlowRunStepState>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertConformityFlowRunSchema = createInsertSchema(conformityFlowRunsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertConformityFlowRun = z.infer<typeof insertConformityFlowRunSchema>;
export type ConformityFlowRunRow = typeof conformityFlowRunsTable.$inferSelect;
