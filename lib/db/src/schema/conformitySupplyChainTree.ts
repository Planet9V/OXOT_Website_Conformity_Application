import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityProductsTable } from "./conformityProducts";

/**
 * Hierarchical OEM Supply Chain Lineage Tree mapping Root Products
 * to sub-assemblies, Tier 1/2/3 hardware chipsets, and third-party modules.
 */
export const conformitySupplyChainTreeTable = pgTable("conformity_supply_chain_tree", {
  id: serial("id").primaryKey(),
  rootProductId: integer("root_product_id")
    .notNull()
    .references(() => conformityProductsTable.id, { onDelete: "cascade" }),
  parentAssemblyId: integer("parent_assembly_id"),
  childAssemblyId: integer("child_assembly_id").notNull(),
  supplierName: text("supplier_name").notNull(),
  supplierCountry: text("supplier_country").notNull().default("EU"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConformitySupplyChainTreeSchema = createInsertSchema(
  conformitySupplyChainTreeTable,
).omit({ id: true, createdAt: true });

export type InsertConformitySupplyChainTree = z.infer<typeof insertConformitySupplyChainTreeSchema>;
export type ConformitySupplyChainTreeRow = typeof conformitySupplyChainTreeTable.$inferSelect;
