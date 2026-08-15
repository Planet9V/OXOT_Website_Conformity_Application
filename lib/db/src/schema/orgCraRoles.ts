import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * The CRA economic-operator roles this organisation declares it holds.
 *
 * This application is single-tenant: one deployment serves one organisation.
 * These rows are therefore *roles*, not tenants. An organisation commonly holds
 * several at once — a manufacturer that also imports, or a distributor that
 * becomes a manufacturer under Article 21 by rebranding or substantially
 * modifying a product.
 *
 * Which roles are declared here determines which requirements are in scope,
 * via `requirements.appliesTo`. Declaring a role does not assert conformity
 * with it; it only brings its obligations into view.
 */
export const orgCraRolesTable = pgTable("org_cra_roles", {
  id: serial("id").primaryKey(),
  // One row per role — see CRA_ROLE_KEYS. Unique so declaring is an upsert.
  roleKey: text("role_key").notNull().unique(),
  isDeclared: boolean("is_declared").notNull().default(false),
  /**
   * When the organisation began (and, if applicable, ceased) acting in this
   * role. Retention and support-period clocks run from real dates, and an
   * Article 21/22 transition starts at a point in time, so these are recorded
   * rather than inferred. ISO date strings, matching `conformity_evaluations`.
   */
  effectiveFrom: text("effective_from"),
  effectiveTo: text("effective_to"),
  note: text("note").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/**
 * The CRA's economic operators, by the article that defines each one.
 * These are the values `requirements.appliesTo` uses for `regulationKey: "cra"`.
 *
 * Note that "deemed manufacturer" is deliberately absent: Articles 21 and 22
 * describe a transition into `manufacturer`, not a separate standing role.
 */
export const CRA_ROLE_KEYS = [
  "manufacturer",
  "authorised_representative",
  "importer",
  "distributor",
  "oss_steward",
] as const;

export type CraRoleKey = (typeof CRA_ROLE_KEYS)[number];

/** Display metadata, kept beside the keys so the UI never hardcodes either. */
export const CRA_ROLES: ReadonlyArray<{
  key: CraRoleKey;
  label: string;
  definingArticle: number;
  summary: string;
}> = [
  {
    key: "manufacturer",
    label: "Manufacturer",
    definingArticle: 13,
    summary:
      "Places products with digital elements on the market under its own name or trademark. Carries the full obligation set, including Annex I and Article 14 reporting.",
  },
  {
    key: "authorised_representative",
    label: "Authorised representative",
    definingArticle: 18,
    summary:
      "Appointed by a manufacturer under written mandate to perform specified tasks on its behalf within the Union.",
  },
  {
    key: "importer",
    label: "Importer",
    definingArticle: 19,
    summary:
      "Places on the Union market a product with digital elements bearing the name or trademark of a person established outside the Union.",
  },
  {
    key: "distributor",
    label: "Distributor",
    definingArticle: 20,
    summary:
      "Makes a product with digital elements available on the market without being the manufacturer or the importer.",
  },
  {
    key: "oss_steward",
    label: "Open-source software steward",
    definingArticle: 24,
    summary:
      "Supports on a sustained basis the development of free and open-source software intended for commercial activities. Lighter regime than a manufacturer, and exempt from administrative fines under Article 64(10)(b).",
  },
];

export const insertOrgCraRoleSchema = createInsertSchema(orgCraRolesTable).omit({
  id: true,
  updatedAt: true,
});

export type InsertOrgCraRole = z.infer<typeof insertOrgCraRoleSchema>;
export type OrgCraRoleRow = typeof orgCraRolesTable.$inferSelect;
