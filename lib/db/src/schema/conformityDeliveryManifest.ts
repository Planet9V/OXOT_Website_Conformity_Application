import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  boolean,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * The versioned delivery manifest — the component/IP-supplier shape (B3).
 *
 * A supplier's customer-facing take-home: exactly what was delivered, at which
 * release, with which options and configuration baseline, and what changed since
 * the last release. Each release is an append-only version row (the change
 * history is the collection of rows, each carrying its own change note) — the
 * same per-version discipline as conformity_product_versions. Authored data,
 * never a conformity verdict.
 */
export const conformityDeliveryManifestsTable = pgTable(
  "conformity_delivery_manifests",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    /** Auto-incremented per product (max + 1) — the manifest's own version. */
    version: integer("version").notNull(),
    /** The IP/component release identifier, e.g. "SE-2.4.1". */
    ipRelease: text("ip_release").notNull().default(""),
    /** Technology node / platform variant, e.g. "22nm". */
    node: text("node").notNull().default(""),
    /** Supported options for this release. */
    options: jsonb("options").$type<string[]>().notNull().default([]),
    /** The configuration baseline as delivered. */
    configBaseline: text("config_baseline").notNull().default(""),
    /** This release's entry in the change history. */
    changeNote: text("change_note").notNull().default(""),
    createdBy: text("created_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("conformity_delivery_manifests_product_idx").on(t.productId),
    unique("conformity_delivery_manifests_product_version").on(t.productId, t.version),
  ],
);

/**
 * A single revocable customer-facing token per product's manifest — the
 * supply-side mirror of the auditor door (conformity_auditor_access). Issuing
 * rotates the token; revoking flips isActive. The public view resolves the
 * token to the product's manifest history.
 */
export const conformityDeliveryManifestAccessTable = pgTable(
  "conformity_delivery_manifest_access",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull().unique(),
    accessToken: text("access_token").notNull().unique(),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: text("created_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);

export const insertConformityDeliveryManifestSchema = createInsertSchema(
  conformityDeliveryManifestsTable,
).omit({ id: true, createdAt: true });
export type InsertConformityDeliveryManifest = z.infer<
  typeof insertConformityDeliveryManifestSchema
>;
export type ConformityDeliveryManifestRow =
  typeof conformityDeliveryManifestsTable.$inferSelect;
export type ConformityDeliveryManifestAccessRow =
  typeof conformityDeliveryManifestAccessTable.$inferSelect;
