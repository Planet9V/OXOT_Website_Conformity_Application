import { pgTable, serial, text, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityBomsTable } from "./conformityBoms";
import { conformityBomComponentsTable } from "./conformityBomComponents";

/**
 * One license observation on one component, normalized so license posture is
 * a plain SQL query (GROUP BY license, copyleft screens, "which components
 * carry GPL-3.0"). The JSONB `licenses` array on the component row remains for
 * display back-compat; THIS table is the queryable source.
 *
 * `source` records where the observation came from:
 *   declared | concluded | expression  (SPDX declared/concluded; CycloneDX
 *   license id/name vs. SPDX expression string).
 */
export const conformityBomLicensesTable = pgTable(
  "conformity_bom_licenses",
  {
    id: serial("id").primaryKey(),
    bomId: integer("bom_id")
      .notNull()
      .references(() => conformityBomsTable.id, { onDelete: "cascade" }),
    componentId: integer("component_id")
      .notNull()
      .references(() => conformityBomComponentsTable.id, { onDelete: "cascade" }),
    // SPDX id when known (e.g. "Apache-2.0"), else the raw name/expression.
    license: text("license").notNull(),
    source: text("source").notNull().default("declared"),
  },
  (t) => [
    index("conformity_bom_licenses_bom_idx").on(t.bomId, t.license),
    index("conformity_bom_licenses_component_idx").on(t.componentId),
  ],
);

export const insertConformityBomLicenseSchema = createInsertSchema(
  conformityBomLicensesTable,
).omit({ id: true });
export type InsertConformityBomLicense = z.infer<typeof insertConformityBomLicenseSchema>;
export type ConformityBomLicenseRow = typeof conformityBomLicensesTable.$inferSelect;
