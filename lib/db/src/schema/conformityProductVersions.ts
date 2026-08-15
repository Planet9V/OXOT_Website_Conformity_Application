import { pgTable, serial, text, integer, timestamp, index, unique } from "drizzle-orm/pg-core";
import { conformityProductsTable } from "./conformityProducts";

/**
 * A specific version of a product, placed on the market on a specific date.
 *
 * One product row was one of everything, and almost every clock in the CRA is
 * anchored on something version-specific:
 *
 *   - Art. 13(13)/13(18) retention runs from when THAT version was placed on
 *     the market, not from when the product line first shipped.
 *   - Art. 13(8) support periods can differ between versions.
 *   - Art. 3(30) substantial modification is "a change to the product FOLLOWING
 *     ITS PLACING ON THE MARKET" — so it applies to a specific version, and a
 *     modification recorded against v2.1 must not silently change v1.0's
 *     obligations.
 *   - A vulnerability affects some versions and not others; Art. 14 reporting
 *     has to say which.
 *   - The SBOM and the EU declaration of conformity are per version.
 *
 * `placedOnMarketDate` on the product row remains as the line's first placing —
 * Art. 3(21) defines placing on the market as the FIRST making available — and
 * this table carries each version's own date.
 */
export const conformityProductVersionsTable = pgTable(
  "conformity_product_versions",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => conformityProductsTable.id, { onDelete: "cascade" }),

    /** e.g. "2.1.0", or a hardware revision. */
    version: text("version").notNull(),
    /** Optional variant within a version, e.g. a regional or SKU variant. */
    variant: text("variant").notNull().default(""),

    /** ISO date this VERSION was placed on the market, or null before it was. */
    placedOnMarketDate: text("placed_on_market_date"),

    /**
     * Art. 13(8) per version. Null falls back to the product-level period,
     * because most lines run one period across versions and duplicating it
     * invites the two drifting apart.
     */
    supportPeriodStart: text("support_period_start"),
    supportPeriodEnd: text("support_period_end"),

    /**
     * Which version this one supersedes, so a substantial modification can be
     * traced to the version it produced.
     */
    supersedesVersionId: integer("supersedes_version_id"),

    /** active | superseded | withdrawn | recalled */
    status: text("status").notNull().default("active"),

    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("conformity_product_versions_product_idx").on(t.productId, t.status),
    // One row per product/version/variant — the natural key.
    unique("conformity_product_versions_natural_key").on(t.productId, t.version, t.variant),
  ],
);

export type ConformityProductVersionRow = typeof conformityProductVersionsTable.$inferSelect;
export type InsertConformityProductVersion = typeof conformityProductVersionsTable.$inferInsert;
