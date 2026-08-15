import { pgTable, serial, text, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { conformityProductsTable } from "./conformityProducts";

/**
 * An authorised representative's mandate — Article 18.
 *
 * "A manufacturer may, BY A WRITTEN MANDATE, appoint an authorised
 *  representative." (18(1))
 *
 * The mandate is a document, not just a relationship: Art. 18(3) requires the
 * representative to "provide a COPY OF THE MANDATE to the market surveillance
 * authorities upon request". So the file itself is stored and fingerprinted,
 * the same way importer dossiers are — a record saying a mandate exists cannot
 * be handed to an authority.
 *
 * `tasksGranted` is the scope, and it is bounded from both ends by the
 * Regulation rather than by this schema:
 *   - Art. 18(3) requires it to allow at least three things.
 *   - Art. 18(2) puts three others beyond any mandate.
 * Both are evaluated in lib/authorisedRepresentative.ts, so a mandate that
 * purports to delegate the non-delegable is STORED AS WRITTEN and reported as
 * ineffective — rather than silently dropped, which would lose the fact that
 * someone tried.
 */
export const conformityMandatesTable = pgTable(
  "conformity_mandates",
  {
    id: serial("id").primaryKey(),
    /** The product the mandate covers, where it is product-specific. */
    productId: integer("product_id").references(() => conformityProductsTable.id, {
      onDelete: "set null",
    }),

    /** Art. 18(1): who appointed us. */
    appointingManufacturer: text("appointing_manufacturer").notNull().default(""),
    manufacturerAddress: text("manufacturer_address").notNull().default(""),
    representativeName: text("representative_name").notNull().default(""),
    representativeAddress: text("representative_address").notNull().default(""),

    /** Art. 18(1): the mandate is written. Nullable — unrecorded is not "yes". */
    writtenMandateHeld: boolean("written_mandate_held"),
    /** The document, so a copy can actually be produced under Art. 18(3). */
    objectPath: text("object_path").notNull().default(""),
    fileName: text("file_name").notNull().default(""),
    /** SHA-256 over the stored bytes; empty when no document was stored. */
    fileHash: text("file_hash").notNull().default(""),

    /** ISO dates. effectiveTo null means open-ended. */
    effectiveFrom: text("effective_from"),
    effectiveTo: text("effective_to"),

    /** The scope, as written — including anything Art. 18(2) makes ineffective. */
    tasksGranted: jsonb("tasks_granted").$type<string[]>().notNull().default([]),

    notes: text("notes").notNull().default(""),
    recordedBy: text("recorded_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("conformity_mandates_product_idx").on(t.productId, t.effectiveTo)],
);

export type ConformityMandateRow = typeof conformityMandatesTable.$inferSelect;
export type InsertConformityMandate = typeof conformityMandatesTable.$inferInsert;
