import { Router, type IRouter } from "express";
import { createHash } from "node:crypto";
import { importerRecordRetention } from "../lib/retention";

export const importerArchiveRouter: IRouter = Router();

export interface StatutoryDossierArchiveItem {
  id: string;
  depositDate: string;
  /** Null where the placing-on-the-market date is unknown — see Art. 19(6). */
  retentionUntil: string | null;
  productName: string;
  oemManufacturer: string;
  importerEntity: string;
  docReferenceNumber: string;
  sha256Digest: string;
  archiveStatus: "ACTIVE_VALID" | "RETENTION_EXPIRING_SOON" | "ARCHIVED_EXPIRED";
  marketSurveillanceAccessGranted: boolean;
  fileCount: number;
}

const mockArchiveLedger: StatutoryDossierArchiveItem[] = [
  {
    id: "DOSSIER-2026-001",
    depositDate: "2026-04-10",
    retentionUntil: "2036-04-10",
    productName: "Scalance XC-208 Industrial Managed Switch",
    oemManufacturer: "Siemens AG (Germany)",
    importerEntity: "Axians Logistics Europe B.V.",
    docReferenceNumber: "DOC-EU-CRA-2026-SIE-0098",
    sha256Digest: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    archiveStatus: "ACTIVE_VALID",
    marketSurveillanceAccessGranted: true,
    fileCount: 4,
  },
  {
    id: "DOSSIER-2026-002",
    depositDate: "2026-06-15",
    retentionUntil: "2036-06-15",
    productName: "FortiGate 60F Industrial Next-Gen Firewall",
    oemManufacturer: "Fortinet Inc. (USA / EU Rep)",
    importerEntity: "Arrow ECS Netherlands B.V.",
    docReferenceNumber: "DOC-EU-CRA-2026-FTNT-4412",
    sha256Digest: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    archiveStatus: "ACTIVE_VALID",
    marketSurveillanceAccessGranted: true,
    fileCount: 6,
  },
  {
    id: "DOSSIER-2026-003",
    depositDate: "2026-08-01",
    retentionUntil: "2036-08-01",
    productName: "Hirschmann RS20 Industrial Ethernet Switch",
    oemManufacturer: "Belden Hirschmann GmbH",
    importerEntity: "Axians Industrial Solutions B.V.",
    docReferenceNumber: "DOC-EU-CRA-2026-BLDN-1102",
    sha256Digest: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    archiveStatus: "ACTIVE_VALID",
    marketSurveillanceAccessGranted: true,
    fileCount: 5,
  },
];

/**
 * GET /api/archive/dossiers
 * Returns the active 10-year statutory compliance archive ledger.
 */
importerArchiveRouter.get("/dossiers", (_req, res) => {
  res.json({
    totalDossiers: mockArchiveLedger.length,
    statutoryBasis:
      "Regulation (EU) 2024/2847 Article 19(6) — importers keep a copy of the EU declaration of conformity at the disposal of the market surveillance authorities, and ensure the technical documentation can be made available on request, for at least 10 years after the product has been placed on the market or for the support period, whichever is longer.",
    dossiers: mockArchiveLedger,
  });
});

/**
 * POST /api/archive/deposit
 * Deposits an Annex VII technical file and EU DoC package into the 10-year statutory archive ledger.
 */
importerArchiveRouter.post("/deposit", (req, res) => {
  const b = req.body || {};
  const productName = String(b.productName || "Industrial Asset");
  const oemManufacturer = String(b.oemManufacturer || "OEM Manufacturer");
  const importerEntity = String(b.importerEntity || "EU Importer Entity");
  const docReferenceNumber = String(b.docReferenceNumber || "DOC-EU-CRA-2026-0000");
  const technicalFileZipName = String(b.technicalFileZipName || "technical_file.zip");

  const depositDate = new Date().toISOString().split("T")[0];

  /**
   * Art. 19(6) runs from the date the product was PLACED ON THE MARKET, not from
   * the date the importer happened to deposit the file, and it takes the longer
   * of ten years and the support period. Depositing late does not extend the
   * duty; depositing early does not shorten it. Where the importer has not told
   * us when the product was placed on the market, the date is unknown — the
   * archive says so rather than asserting a date it cannot derive.
   */
  const retention = importerRecordRetention({
    placedOnMarket: b.placedOnMarket ? String(b.placedOnMarket) : null,
    supportPeriodEnd: b.supportPeriodEnd ? String(b.supportPeriodEnd) : null,
  });
  const retentionUntil = retention.until;

  const rawHashPayload = `${productName}:${oemManufacturer}:${importerEntity}:${docReferenceNumber}:${technicalFileZipName}:${depositDate}`;
  const sha256Digest = createHash("sha256").update(rawHashPayload).digest("hex");
  const newId = `DOSSIER-2026-${String(mockArchiveLedger.length + 1).padStart(3, "0")}`;

  const newItem: StatutoryDossierArchiveItem = {
    id: newId,
    depositDate,
    retentionUntil,
    productName,
    oemManufacturer,
    importerEntity,
    docReferenceNumber,
    sha256Digest,
    archiveStatus: "ACTIVE_VALID",
    marketSurveillanceAccessGranted: true,
    fileCount: 4,
  };

  mockArchiveLedger.push(newItem);

  res.json({
    success: true,
    message: "Annex VII Technical Dossier deposited in 10-Year Statutory Compliance Archive.",
    dossier: newItem,
    statutoryRetentionGuarantee: retention.message,
    statutoryBasis: retention.citation,
  });
});
