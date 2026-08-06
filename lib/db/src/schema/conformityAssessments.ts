import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityProductsTable } from "./conformityProducts";

/**
 * One harmonised standard / common specification / EU cybersecurity
 * certification scheme recorded as applied for the assessment (Art 32).
 * `coverage` is the assessor's own claim: "full" means the standard fully
 * covers the essential requirements it addresses — the claim that unlocks
 * Module A self-assessment for Class I important products.
 */
export type AppliedStandard = {
  reference: string;
  title?: string;
  coverage: "full" | "partial";
  notes?: string;
};

/**
 * One assessment run of a product against a regulation (CRA today; the engine is
 * regulation-agnostic so it can later target the AI Act / Machinery / 62443).
 * `classKey` and `routeKey` are natural-key references into the reference layer's
 * product_classes / conformity_routes for the same `regulationKey`.
 */
export const conformityAssessmentsTable = pgTable("conformity_assessments", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => conformityProductsTable.id, { onDelete: "cascade" }),
  regulationKey: text("regulation_key").notNull().default("cra"),
  // draft | in_progress | complete
  status: text("status").notNull().default("draft"),
  // scoping | classification | route | applicability | gap | artifacts | review
  currentStage: text("current_stage").notNull().default("scoping"),
  // in_scope | out_of_scope | null (not yet determined)
  scopeResult: text("scope_result"),
  classKey: text("class_key"),
  routeKey: text("route_key"),
  // Standards the manufacturer claims to apply (Art 32) — rendered verbatim
  // into the Declaration of Conformity and checked against the chosen route.
  appliedStandards: jsonb("applied_standards")
    .$type<AppliedStandard[]>()
    .notNull()
    .default([]),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertConformityAssessmentSchema = createInsertSchema(
  conformityAssessmentsTable,
).omit({ id: true, startedAt: true, updatedAt: true });
export type InsertConformityAssessment = z.infer<
  typeof insertConformityAssessmentSchema
>;
export type ConformityAssessmentRow = typeof conformityAssessmentsTable.$inferSelect;
