import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { conformityProductsTable } from "./conformityProducts";

/**
 * The importer's Article 19(6) dossier.
 *
 * "Importers shall, for at least 10 years after the product with digital
 *  elements has been placed on the market or for the support period, whichever
 *  is longer, keep a copy of the EU declaration of conformity at the disposal of
 *  the market surveillance authorities and ensure that the technical
 *  documentation can be made available to those authorities, upon request."
 *
 * Replaces `mockArchiveLedger`, a module-scope array wiped on every restart,
 * whose seeded rows carried the SHA-256 of the EMPTY STRING as their
 * "cryptographic seal" and whose deposit endpoint hashed a colon-joined
 * metadata string rather than any file.
 *
 * Two things that matters for:
 *   - A ten-year retention duty cannot live in memory.
 *   - A hash over metadata proves the METADATA has not changed. It says nothing
 *     about the document, which is the only thing a market surveillance
 *     authority will ask for. `fileHash` here is over the stored bytes, and is
 *     empty when no bytes were stored — visibly empty, rather than filled with
 *     the hash of nothing.
 *
 * NOTE ON SCOPE: this is the importer's duty. Article 20 gives distributors no
 * retention obligation at all; their only clock is Article 23(2) traceability.
 */
export const conformityImporterDossiersTable = pgTable(
  "conformity_importer_dossiers",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").references(() => conformityProductsTable.id, {
      onDelete: "set null",
    }),

    /** What is held. */
    productName: text("product_name").notNull().default(""),
    oemManufacturer: text("oem_manufacturer").notNull().default(""),
    importerEntity: text("importer_entity").notNull().default(""),
    /** The EU declaration of conformity's own reference. */
    docReferenceNumber: text("doc_reference_number").notNull().default(""),

    /** Where the bytes actually live, and what they hash to. */
    objectPath: text("object_path").notNull().default(""),
    fileName: text("file_name").notNull().default(""),
    /**
     * SHA-256 over the STORED BYTES. Empty when nothing was stored — an empty
     * string here means "no document was fingerprinted", which is information.
     * It must never be populated with the hash of an empty input.
     */
    fileHash: text("file_hash").notNull().default(""),
    fileBytes: integer("file_bytes").notNull().default(0),

    depositedAt: timestamp("deposited_at", { withTimezone: true }).notNull().defaultNow(),
    depositedBy: text("deposited_by").notNull().default(""),

    /** active | superseded | released */
    status: text("status").notNull().default("active"),
    notes: text("notes").notNull().default(""),
  },
  (t) => [index("conformity_importer_dossiers_product_idx").on(t.productId, t.status)],
);

export type ConformityImporterDossierRow = typeof conformityImporterDossiersTable.$inferSelect;
export type InsertConformityImporterDossier = typeof conformityImporterDossiersTable.$inferInsert;
