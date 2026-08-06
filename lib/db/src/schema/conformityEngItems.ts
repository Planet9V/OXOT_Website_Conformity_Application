import { pgTable, serial, text, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conformityBomsTable } from "./conformityBoms";

/**
 * DEXPI engineering BOM (Proteus XML) — normalized plant/P&ID model.
 *
 * Three tables so everything the source provides is SQL-queryable, not a JSON
 * blob:
 *   - conformity_eng_items:       one row per plant item (equipment, piping
 *                                 segment/component, instrumentation function,
 *                                 nozzle, …) with its DEXPI identity.
 *   - conformity_eng_attributes:  one row per GenericAttribute — name, value,
 *                                 format and units as typed columns. This is
 *                                 the EAV surface DEXPI itself is built on;
 *                                 storing it as rows (not JSONB) is what makes
 *                                 "all pumps with DesignPressure > 10 bar" a
 *                                 plain SQL query.
 *   - conformity_eng_connections: one row per topology edge (piping
 *                                 connectivity, instrumentation association),
 *                                 keyed by the items' document-local IDs.
 *
 * The raw uploaded XML stays in object storage for fidelity; `raw` on the item
 * carries only the item's own parsed node for display.
 */
export const conformityEngItemsTable = pgTable(
  "conformity_eng_items",
  {
    id: serial("id").primaryKey(),
    bomId: integer("bom_id")
      .notNull()
      .references(() => conformityBomsTable.id, { onDelete: "cascade" }),
    // Document-local ID attribute of the XML element (join key for connections).
    itemRef: text("item_ref").notNull().default(""),
    // Engineering tag (e.g. "P-1501", "T-100") — the human identity on the P&ID.
    tagName: text("tag_name").notNull().default(""),
    // Proteus element kind: Equipment | Nozzle | PipingNetworkSystem |
    // PipingNetworkSegment | PipingComponent | Pipe | ProcessInstrumentationFunction | ...
    itemClass: text("item_class").notNull(),
    // DEXPI ComponentClass (e.g. "CentrifugalPump", "GateValve", "Tank").
    componentClass: text("component_class").notNull().default(""),
    componentName: text("component_name").notNull().default(""),
    specification: text("specification").notNull().default(""),
    // Parent item's document-local ID ("" for top-level) — preserves hierarchy
    // (equipment→nozzle, system→segment→component) relationally.
    parentRef: text("parent_ref").notNull().default(""),
    raw: jsonb("raw").$type<Record<string, unknown>>().notNull().default({}),
  },
  (t) => [
    index("conformity_eng_items_bom_idx").on(t.bomId, t.itemClass),
    index("conformity_eng_items_bom_ref_idx").on(t.bomId, t.itemRef),
  ],
);

export const conformityEngAttributesTable = pgTable(
  "conformity_eng_attributes",
  {
    id: serial("id").primaryKey(),
    bomId: integer("bom_id")
      .notNull()
      .references(() => conformityBomsTable.id, { onDelete: "cascade" }),
    itemId: integer("item_id")
      .notNull()
      .references(() => conformityEngItemsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    value: text("value").notNull().default(""),
    format: text("format").notNull().default(""),
    units: text("units").notNull().default(""),
    // Which GenericAttributes Set the attribute came from (e.g. "DexpiAttributes").
    attributeSet: text("attribute_set").notNull().default(""),
  },
  (t) => [
    index("conformity_eng_attributes_item_idx").on(t.itemId),
    index("conformity_eng_attributes_bom_name_idx").on(t.bomId, t.name),
  ],
);

export const conformityEngConnectionsTable = pgTable(
  "conformity_eng_connections",
  {
    id: serial("id").primaryKey(),
    bomId: integer("bom_id")
      .notNull()
      .references(() => conformityBomsTable.id, { onDelete: "cascade" }),
    // Document-local IDs of the two endpoints (join to conformity_eng_items.item_ref).
    fromRef: text("from_ref").notNull(),
    toRef: text("to_ref").notNull(),
    // piping | instrumentation | other
    connectionType: text("connection_type").notNull().default("piping"),
  },
  (t) => [index("conformity_eng_connections_bom_idx").on(t.bomId)],
);

export const insertConformityEngItemSchema = createInsertSchema(conformityEngItemsTable).omit({
  id: true,
});
export type InsertConformityEngItem = z.infer<typeof insertConformityEngItemSchema>;
export type ConformityEngItemRow = typeof conformityEngItemsTable.$inferSelect;
export type ConformityEngAttributeRow = typeof conformityEngAttributesTable.$inferSelect;
export type ConformityEngConnectionRow = typeof conformityEngConnectionsTable.$inferSelect;
