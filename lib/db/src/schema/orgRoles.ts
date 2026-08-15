import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * What this organisation DOES, and which regulations apply to it.
 *
 * The application is single-tenant: one deployment serves one organisation, so
 * these rows are declarations about that organisation, not tenants.
 *
 * Two declarations are needed, and conflating them is a mistake:
 *
 *   1. `org_roles`       — the hats the organisation wears (it manufactures,
 *                          it imports, it operates plant...).
 *   2. `org_regulations` — the acts it is actually subject to (it places
 *                          products with digital elements on the EU market, so
 *                          the CRA applies; it ships no AI systems, so the AI
 *                          Act does not).
 *
 * Obligations in scope = requirements whose `regulationKey` is a declared
 * regulation AND whose `appliesTo` intersects the declared roles. Without the
 * second declaration, an organisation that declares "manufacturer" would be
 * shown AI Act and Machinery duties it does not carry, because those acts also
 * regulate a "manufacturer".
 *
 * Declaring a role or a regulation brings obligations into view. It never
 * asserts conformity with them.
 */
export const orgRolesTable = pgTable("org_roles", {
  id: serial("id").primaryKey(),
  // One row per canonical role — see CANONICAL_ROLES. Unique so declaring is an upsert.
  roleKey: text("role_key").notNull().unique(),
  isDeclared: boolean("is_declared").notNull().default(false),
  /**
   * When the organisation began (and, if applicable, ceased) acting in this
   * role. Retention and support-period clocks run from real dates, and an
   * Article 21/22 transition into manufacturer starts at a point in time, so
   * these are recorded rather than inferred. ISO date strings, matching
   * `conformity_evaluations.dueDate`.
   */
  effectiveFrom: text("effective_from"),
  effectiveTo: text("effective_to"),
  note: text("note").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/** Which regulations the organisation is subject to. Keys match `regulations.key`. */
export const orgRegulationsTable = pgTable("org_regulations", {
  id: serial("id").primaryKey(),
  regulationKey: text("regulation_key").notNull().unique(),
  isDeclared: boolean("is_declared").notNull().default(false),
  /** Why it applies (or does not) — the reasoning a reviewer will want later. */
  note: text("note").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/**
 * One vocabulary across every regulation, because an organisation wears one hat
 * even though each act has its own word for it. The `termFor` map records what
 * each regulation calls the role, so the UI can show the regulator's own
 * language without the data model fragmenting.
 *
 * `craArticle` is null where the role carries no CRA obligations — an operator
 * of plant is a downstream user, whose duties are NIS2, not the CRA. Saying so
 * explicitly is the point: the previous persona model invented CRA duties for
 * exactly that actor.
 */
export const CANONICAL_ROLES = [
  {
    key: "manufacturer",
    label: "Manufacturer",
    craArticle: 13,
    summary:
      "Designs, develops or produces a product and places it on the market under its own name or trademark.",
    termFor: {
      cra: "manufacturer",
      ai_act: "provider",
      machinery: "manufacturer",
      red: "manufacturer",
      iec_62443: "product supplier",
    },
  },
  {
    key: "authorised_representative",
    label: "Authorised representative",
    craArticle: 18,
    summary:
      "Appointed by a manufacturer under written mandate to perform specified tasks on its behalf within the Union.",
    termFor: { cra: "authorised representative", ai_act: "authorised representative", machinery: "authorised representative" },
  },
  {
    key: "importer",
    label: "Importer",
    craArticle: 19,
    summary:
      "Places on the Union market a product bearing the name or trademark of a person established outside the Union.",
    termFor: { cra: "importer", ai_act: "importer", machinery: "importer", red: "importer" },
  },
  {
    key: "distributor",
    label: "Distributor",
    craArticle: 20,
    summary:
      "Makes a product available on the market without being the manufacturer or the importer.",
    termFor: { cra: "distributor", ai_act: "distributor", machinery: "distributor", red: "distributor" },
  },
  {
    key: "oss_steward",
    label: "Open-source software steward",
    craArticle: 24,
    summary:
      "Supports on a sustained basis the development of free and open-source software intended for commercial activities. Exempt from administrative fines under Article 64(10)(b).",
    termFor: { cra: "open-source software steward" },
  },
  {
    key: "system_integrator",
    label: "System integrator",
    // No standing CRA role. Integration work can transfer manufacturer duties
    // under Art. 22 where it amounts to a substantial modification and the
    // product is then made available on the market.
    craArticle: null,
    summary:
      "Designs, assembles and commissions systems from components made by others. Becomes a manufacturer under Article 22 if it substantially modifies a product and makes it available.",
    termFor: { iec_62443: "system integrator", machinery: "assembler" },
  },
  {
    key: "operator",
    label: "Operator / asset owner",
    // Downstream users carry no CRA obligations — their duties are NIS2.
    craArticle: null,
    summary:
      "Owns and operates the equipment in service. Carries NIS2 duties as an essential or important entity; the CRA binds its suppliers, not it.",
    termFor: { nis2: "essential or important entity", iec_62443: "asset owner" },
  },
] as const;

export type CanonicalRoleKey = (typeof CANONICAL_ROLES)[number]["key"];

export const CANONICAL_ROLE_KEYS = CANONICAL_ROLES.map((r) => r.key) as readonly CanonicalRoleKey[];

/** What `regulationKey` calls `roleKey`, falling back to the canonical label. */
export function termForRole(roleKey: string, regulationKey: string): string {
  const role = CANONICAL_ROLES.find((r) => r.key === roleKey);
  if (!role) return roleKey;
  return (role.termFor as Record<string, string>)[regulationKey] ?? role.label;
}

export const insertOrgRoleSchema = createInsertSchema(orgRolesTable).omit({ id: true, updatedAt: true });
export const insertOrgRegulationSchema = createInsertSchema(orgRegulationsTable).omit({ id: true, updatedAt: true });

export type InsertOrgRole = z.infer<typeof insertOrgRoleSchema>;
export type OrgRoleRow = typeof orgRolesTable.$inferSelect;
export type InsertOrgRegulation = z.infer<typeof insertOrgRegulationSchema>;
export type OrgRegulationRow = typeof orgRegulationsTable.$inferSelect;
