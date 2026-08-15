import { pgTable, serial, text, boolean, timestamp, jsonb, integer, index, unique } from "drizzle-orm/pg-core";

/**
 * An open-source steward's cybersecurity policy — Article 24(1).
 *
 * "Open-source software stewards shall put in place and DOCUMENT IN A VERIFIABLE
 *  MANNER a cybersecurity policy..."
 *
 * Versioned, and versions are never overwritten. Art. 24(2) can require the
 * steward to hand this documentation to a market surveillance authority on a
 * reasoned request, and the question will be which text was in force at the
 * relevant time. A policy table that only holds the current text cannot answer
 * that, which is the same reason the attestation ledger is append-only.
 *
 * Project-centric, not product-centric: the stewardship shape has no product
 * file. A steward supports a project, and Art. 24(1) attaches to the steward's
 * policy for the products it supports.
 */
export const conformityStewardPoliciesTable = pgTable(
  "conformity_steward_policies",
  {
    id: serial("id").primaryKey(),

    /** The project this policy governs. */
    projectName: text("project_name").notNull(),
    /** The steward itself — Art. 3(14) requires a legal person. */
    stewardLegalEntity: text("steward_legal_entity").notNull().default(""),
    repositoryUrl: text("repository_url").notNull().default(""),

    /** Monotonic per project. A new text is a new row. */
    version: integer("version").notNull().default(1),

    /** Where it is published — what makes it verifiable by someone else. */
    policyUrl: text("policy_url").notNull().default(""),
    /** The policy text itself, so the record survives the URL rotting. */
    policyText: text("policy_text").notNull().default(""),

    /**
     * Which aspects of Art. 24(1) this text covers. Stored rather than derived,
     * because it is the steward's own assertion about their document.
     */
    aspectsCovered: jsonb("aspects_covered").$type<string[]>().notNull().default([]),

    /**
     * Art. 3(14): a steward supports FOSS "intended for commercial activities".
     * Nullable — an unanswered question about whether you are a steward at all
     * must not default to yes.
     */
    supportsSoftwareIntendedForCommercialActivities: boolean(
      "supports_software_intended_for_commercial",
    ),

    /** Art. 24(3), limb 1: involved in the development of the product? */
    involvedInDevelopment: boolean("involved_in_development"),

    /** Superseded when a later version is written; never deleted. */
    supersededAt: timestamp("superseded_at", { withTimezone: true }),

    authoredBy: text("authored_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("conformity_steward_policies_project_idx").on(t.projectName, t.version),
    unique("conformity_steward_policies_version_key").on(t.projectName, t.version),
  ],
);

export type ConformityStewardPolicyRow = typeof conformityStewardPoliciesTable.$inferSelect;
export type InsertConformityStewardPolicy = typeof conformityStewardPoliciesTable.$inferInsert;

/**
 * A market surveillance authority's reasoned request to a steward, and the
 * response — Article 24(2).
 *
 * Separate from the manufacturer's Chapter V engagements table because the duty
 * is different: a steward cooperates and hands over the Art. 24(1)
 * documentation. There is no corrective-action period to prescribe, because
 * Art. 54(1) directs its requirements at economic operators, and a steward is
 * not one.
 */
export const conformityStewardRequestsTable = pgTable(
  "conformity_steward_requests",
  {
    id: serial("id").primaryKey(),
    projectName: text("project_name").notNull(),
    authorityName: text("authority_name").notNull().default(""),
    memberState: text("member_state").notNull().default(""),

    receivedAt: timestamp("received_at", { withTimezone: true }),
    /** Which policy version was handed over. */
    policyVersionProvided: integer("policy_version_provided"),
    documentationProvidedAt: timestamp("documentation_provided_at", { withTimezone: true }),
    /** Art. 24(2): in a language easily understood by that authority. */
    languageUnderstoodByAuthority: boolean("language_understood_by_authority"),
    languageUsed: text("language_used").notNull().default(""),

    notes: text("notes").notNull().default(""),
    recordedBy: text("recorded_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("conformity_steward_requests_project_idx").on(t.projectName, t.receivedAt)],
);

export type ConformityStewardRequestRow = typeof conformityStewardRequestsTable.$inferSelect;
export type InsertConformityStewardRequest = typeof conformityStewardRequestsTable.$inferInsert;
