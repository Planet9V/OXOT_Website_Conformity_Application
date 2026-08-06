import { pgTable, serial, text, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityBomsTable } from "./conformityBoms";

/**
 * One edge of a BOM's dependency graph, normalized for SQL ("what depends on
 * X", impact analysis, transitive walks with a recursive CTE).
 *
 * `ref` / `dependsOnRef` are the DOCUMENT-LOCAL references the source format
 * uses (CycloneDX `bom-ref`, SPDX `SPDXID`). They join to
 * `conformity_bom_components.bom_ref` within the same `bom_id`. Kept as text
 * (not FKs to component ids) deliberately: a dependency edge may reference the
 * document root or a node that wasn't materialized as a component row, and
 * re-analysis must never orphan the graph.
 */
export const conformityBomDependenciesTable = pgTable(
  "conformity_bom_dependencies",
  {
    id: serial("id").primaryKey(),
    bomId: integer("bom_id")
      .notNull()
      .references(() => conformityBomsTable.id, { onDelete: "cascade" }),
    ref: text("ref").notNull(),
    dependsOnRef: text("depends_on_ref").notNull(),
  },
  (t) => [
    index("conformity_bom_dependencies_bom_ref_idx").on(t.bomId, t.ref),
    index("conformity_bom_dependencies_bom_dep_idx").on(t.bomId, t.dependsOnRef),
  ],
);

export const insertConformityBomDependencySchema = createInsertSchema(
  conformityBomDependenciesTable,
).omit({ id: true });
export type InsertConformityBomDependency = z.infer<typeof insertConformityBomDependencySchema>;
export type ConformityBomDependencyRow = typeof conformityBomDependenciesTable.$inferSelect;
