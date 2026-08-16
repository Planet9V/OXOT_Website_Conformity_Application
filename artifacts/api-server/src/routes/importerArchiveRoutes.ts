import { Router, type IRouter, type Request, type Response } from "express";
import { createHash } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import {
  db,
  conformityImporterDossiersTable,
  conformityProductsTable,
} from "@workspace/db";
import { requireAuth, requireAdmin, getSession } from "../lib/adminAuth";
import { importerRecordRetention } from "../lib/retention";
import { recordAttestation } from "../lib/attestationStore";
import { objectStorage } from "../lib/storageBackend";

/**
 * The importer's Article 19(6) dossier archive.
 *
 * What this replaces, and why each part had to go:
 *
 *   - `mockArchiveLedger`, a module-scope array wiped on every restart. A
 *     ten-year retention duty cannot live in memory.
 *   - Seeded rows whose "cryptographic seal" was the SHA-256 of the EMPTY
 *     STRING.
 *   - A deposit endpoint that hashed a colon-joined metadata string. That
 *     proves the metadata has not changed and says nothing about the document,
 *     which is the only thing a market surveillance authority will ask for.
 *   - "10 years minimum pursuant to Article 17" — Article 17 is Other
 *     provisions related to reporting. The duty is Article 19(6). (Corrected
 *     earlier, in Phase 1.2.)
 *
 * The hash is now over the stored bytes, and is EMPTY when nothing was stored.
 * An empty hash is information; a hash of nothing is a lie that looks like one.
 */
export const importerArchiveRouter: IRouter = Router();

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}

/**
 * Fingerprint the stored object. Returns null when there are no bytes to hash —
 * which the caller reports rather than papering over.
 *
 * The read is capped, as evidence uploads are, so an oversized deposit cannot
 * pin memory purely to be hashed. An over-cap file is recorded WITHOUT a hash
 * rather than with a partial one: a hash over the first 25 MiB of a document is
 * not a hash of that document.
 */
const MAX_HASH_BYTES = 25 * 1024 * 1024; // 25 MiB

async function fingerprint(objectPath: string): Promise<{ hash: string; bytes: number } | null> {
  if (!objectPath) return null;
  try {
    const storage = objectStorage;
    const buf = await storage.downloadToBufferIfWithin(objectPath, MAX_HASH_BYTES);
    if (!buf?.length) return null;
    return { hash: createHash("sha256").update(buf).digest("hex"), bytes: buf.length };
  } catch {
    return null;
  }
}

/** GET — the archive, each entry with its Article 19(6) retention date. */
importerArchiveRouter.get("/dossiers", requireAuth, async (_req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(conformityImporterDossiersTable)
    .orderBy(desc(conformityImporterDossiersTable.depositedAt));

  const products = await db.select().from(conformityProductsTable);
  const byId = new Map(products.map((p) => [p.id, p]));

  const dossiers = rows.map((row) => {
    const p = row.productId != null ? byId.get(row.productId) : undefined;
    const retention = importerRecordRetention({
      placedOnMarket: p?.placedOnMarketDate ?? null,
      supportPeriodEnd: p?.supportPeriodEnd ?? null,
    });
    return {
      ...row,
      retention,
      /** Stated rather than implied, because an empty hash is meaningful. */
      bytesFingerprinted: Boolean(row.fileHash),
    };
  });

  res.json({
    totalDossiers: dossiers.length,
    statutoryBasis:
      "Regulation (EU) 2024/2847 Article 19(6) — importers keep a copy of the EU declaration of conformity at the disposal of the market surveillance authorities, and ensure the technical documentation can be made available on request, for at least 10 years after the product has been placed on the market or for the support period, whichever is longer.",
    withoutFingerprint: dossiers.filter((d) => !d.bytesFingerprinted).length,
    dossiers,
  });
});

/** POST — deposit a dossier. */
importerArchiveRouter.post(
  "/deposit",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const b = req.body ?? {};
    const productId = b.productId != null ? Number(b.productId) : null;

    let product: typeof conformityProductsTable.$inferSelect | undefined;
    if (productId !== null) {
      [product] = await db
        .select()
        .from(conformityProductsTable)
        .where(eq(conformityProductsTable.id, productId));
      if (!product) {
        res.status(404).json({ error: `Product ${productId} not found` });
        return;
      }
    }

    const objectPath = String(b.objectPath ?? "");
    const fp = await fingerprint(objectPath);

    const [row] = await db
      .insert(conformityImporterDossiersTable)
      .values({
        productId,
        productName: String(b.productName ?? ""),
        oemManufacturer: String(b.oemManufacturer ?? ""),
        importerEntity: String(b.importerEntity ?? ""),
        docReferenceNumber: String(b.docReferenceNumber ?? ""),
        objectPath,
        fileName: String(b.fileName ?? ""),
        fileHash: fp?.hash ?? "",
        fileBytes: fp?.bytes ?? 0,
        depositedBy: actorOf(req),
        notes: String(b.notes ?? ""),
      })
      .returning();

    /**
     * P6 — put the deposit on the provenance ledger, attesting over the bytes
     * where we have them and saying so where we do not.
     */
    try {
      await recordAttestation({
        kind: "evidence_upload",
        subject: `importer_dossier:${row!.id}`,
        actor: actorOf(req),
        content: fp?.hash ?? JSON.stringify({ ref: row!.docReferenceNumber, file: row!.fileName }),
        statement: fp
          ? `Deposited the Article 19(6) dossier for "${row!.productName}", attested over the SHA-256 of the stored document (${fp.bytes} bytes).`
          : `Recorded an Article 19(6) dossier entry for "${row!.productName}". NO DOCUMENT BYTES WERE STORED, so this attests to the record only. The obligation is to keep the EU declaration of conformity at the authorities' disposal — a record without the document does not discharge it.`,
      });
    } catch {
      /* the deposit is the thing that must not be lost */
    }

    const retention = importerRecordRetention({
      placedOnMarket: product?.placedOnMarketDate ?? null,
      supportPeriodEnd: product?.supportPeriodEnd ?? null,
    });

    res.status(201).json({
      dossier: { ...row, bytesFingerprinted: Boolean(fp) },
      retention,
      citation: "Article 19(6)",
      message: fp
        ? `Dossier deposited and fingerprinted over ${fp.bytes} bytes. ${retention.message}`
        : `Dossier RECORDED WITHOUT A DOCUMENT. Article 19(6) requires a copy of the EU declaration of conformity to be kept at the disposal of the market surveillance authorities; an index entry does not satisfy it. ${retention.message}`,
    });
  },
);
