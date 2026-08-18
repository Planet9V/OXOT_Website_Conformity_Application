import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * The supplier register — the operator/asset-owner shape (Phase 21).
 *
 * An operator's statutory hook is NIS2 Art 21(2)(d) (supply-chain security);
 * the CRA binds its SUPPLIERS, not it. This table records who the
 * organisation buys products with digital elements from, so the equipment
 * register (conformity_products with orgRole=operator) can be pivoted by
 * supplier and the evidence each supplier has provided can be seen in one
 * place. A supplier row is a business-relationship record, never a legal
 * status: nothing here concludes anything about the supplier's conformity.
 */
export const conformitySuppliersTable = pgTable("conformity_suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  /** Who to reach for evidence asks — a person or team address, free text. */
  contact: text("contact").notNull().default(""),
  website: text("website").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/**
 * Documents a supplier has provided for a product — the operator-side
 * counterpart of evidence. Deliberately NOT conformity_evidence: evidence
 * rides assessments, and an operator honestly has none (Art 32 belongs to
 * the manufacturer). Files live on the object-storage seam and are GC'd
 * when the row or its product goes (the 14.1 discipline).
 *
 * docType vocabulary (what an operator actually collects):
 *   declaration_of_conformity | user_information | support_period_statement |
 *   security_advisory_channel | sbom | other
 * SBOM is a CONTRACTUAL ask — the CRA puts the SBOM in the manufacturer's
 * technical documentation, not in the delivery to a buyer. The UI says so.
 */
export const conformitySupplierDocumentsTable = pgTable(
  "conformity_supplier_documents",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    docType: text("doc_type").notNull().default("other"),
    title: text("title").notNull(),
    /** Stored file (object storage seam) or an external reference. */
    objectPath: text("object_path").notNull().default(""),
    fileName: text("file_name").notNull().default(""),
    /** SHA-256 of the stored bytes, computed server-side at link time. */
    fileHash: text("file_hash").notNull().default(""),
    url: text("url").notNull().default(""),
    note: text("note").notNull().default(""),
    /** Provenance: internal_upload | supplier_token — who put it here. */
    submittedVia: text("submitted_via").notNull().default("internal_upload"),
    submittedBy: text("submitted_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("conformity_supplier_documents_product_idx").on(t.productId)],
);

/**
 * An ask to a supplier (21.4) — "send us the DoC for this product" — with an
 * expiring, revocable access token (the auditor-portal pattern). The door it
 * opens accepts a LINK or TEXT submission; direct file upload through the
 * public door is deliberately not built until it has had a security review
 * (a public write path is not something to improvise). Fulfilment creates a
 * supplier-document row with provenance submitted_via=supplier_token.
 */
export const conformitySupplierRequestsTable = pgTable(
  "conformity_supplier_requests",
  {
    id: serial("id").primaryKey(),
    supplierId: integer("supplier_id")
      .notNull()
      .references(() => conformitySuppliersTable.id, { onDelete: "cascade" }),
    productId: integer("product_id").notNull(),
    /** Same vocabulary as conformity_supplier_documents.docType. */
    docType: text("doc_type").notNull().default("other"),
    message: text("message").notNull().default(""),
    accessToken: text("access_token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    /** open | fulfilled | withdrawn */
    status: text("status").notNull().default("open"),
    /**
     * How many one-time upload URLs the door has minted for this ask. Capped
     * per ask so a single token cannot accrete unbounded orphan bytes
     * (door-upload review SR5). Never a statutory field — pure abuse control.
     */
    uploadsMinted: integer("uploads_minted").notNull().default(0),
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
    createdBy: text("created_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("conformity_supplier_requests_product_idx").on(t.productId)],
);

export type ConformitySupplierRequestRow =
  typeof conformitySupplierRequestsTable.$inferSelect;

export const insertConformitySupplierSchema = createInsertSchema(
  conformitySuppliersTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConformitySupplier = z.infer<typeof insertConformitySupplierSchema>;
export type ConformitySupplierRow = typeof conformitySuppliersTable.$inferSelect;
export type ConformitySupplierDocumentRow =
  typeof conformitySupplierDocumentsTable.$inferSelect;
