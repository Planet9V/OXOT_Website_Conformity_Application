import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * The shared-responsibility matrix — the component/IP-supplier shape (B2).
 *
 * A supplier of security IP or a component does NOT make a customer's finished
 * product compliant; final conformity depends on the whole product (Art 13).
 * This matrix is the authored, unambiguous split of who owns what: for each
 * responsibility area, what the supplier provides vs. what the integrating
 * customer retains. It is AUTHORED data (not derived from an assessment, so it
 * is deliberately not a conformity_artifact), one current row per product, edited
 * in place with a version bump on save — the same discipline as the artifact
 * table, but for hand-written allocation rather than a generated document.
 *
 * A row here is a responsibility statement, never a legal conclusion: nothing
 * in it declares the customer's product conforming.
 */
export type SharedResponsibilityRow = {
  /** The responsibility area, e.g. "Provisioning & key ownership". */
  area: string;
  /** What the supplier provides for this area. */
  supplier: string;
  /** What the integrating customer retains for this area. */
  customer: string;
  /** Optional clarifying note. */
  note: string;
};

export const conformitySharedResponsibilityTable = pgTable(
  "conformity_shared_responsibility_matrix",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    rows: jsonb("rows")
      .$type<SharedResponsibilityRow[]>()
      .notNull()
      .default([]),
    version: integer("version").notNull().default(1),
    updatedBy: text("updated_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("conformity_shared_responsibility_product_unique").on(t.productId),
  ],
);

export const insertConformitySharedResponsibilitySchema = createInsertSchema(
  conformitySharedResponsibilityTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConformitySharedResponsibility = z.infer<
  typeof insertConformitySharedResponsibilitySchema
>;
export type ConformitySharedResponsibilityRow =
  typeof conformitySharedResponsibilityTable.$inferSelect;
