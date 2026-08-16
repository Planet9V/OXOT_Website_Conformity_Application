import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { db, productDocumentsTable } from "@workspace/db";
import { requireAuth, getSession } from "../lib/adminAuth";

// What remains of the product-portfolio donor's server half (retired 9.1):
// the document vault, whose only consumer is the product file
// (product-detail's ProductDocumentVaultModal). The donor-only endpoints —
// the parallel fleet registry, enterprise-customer CRUD, "AI" parse and bulk
// upload — were deleted with the donor page: they had no other consumer and
// fabricated what they could not parse (invented contact emails, sectors,
// quantities, "compliant" statuses) into demo tables the conformity registry
// never read. Honest bulk import now lives at POST /conformity/products/import.
export const productPortfolioRouter: IRouter = Router();

// The vault is part of the gated conformity workbench — only the /conformity/
// SPA calls /api/portfolio/*. Gate every route behind requireAuth (admin,
// member, or the read-only demo role), matching the rest of the conformity
// execution layer, and block demo writes when DEMO_READONLY=true.
productPortfolioRouter.use((req, res, next): void => {
  if (
    req.method !== "GET" &&
    req.method !== "HEAD" &&
    req.method !== "OPTIONS" &&
    getSession(req)?.role === "demo" &&
    process.env["DEMO_READONLY"] === "true"
  ) {
    res.status(403).json({ error: "The demo workspace is read-only." });
    return;
  }
  next();
});

// GET /api/portfolio/products/:id/documents - List paginated documents for a product
productPortfolioRouter.get("/products/:id/documents", requireAuth, async (req, res): Promise<void> => {
  try {
    const productId = parseInt(String(req.params.id), 10);
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit || "20"), 10) || 20);
    const category = typeof req.query.category === "string" ? req.query.category : undefined;

    // Reset sequence if needed
    try {
      await db.execute(sql`SELECT setval(pg_get_serial_sequence('cra_product_documents', 'id'), COALESCE((SELECT max(id) FROM cra_product_documents), 1));`);
    } catch (e) {
      console.warn("Sequence reset fallback for cra_product_documents:", e);
    }

    let docs: any[] = [];
    try {
      docs = await db
        .select()
        .from(productDocumentsTable)
        .where(eq(productDocumentsTable.productId, productId))
        .orderBy(desc(productDocumentsTable.id));
    } catch (e) {
      console.error("Error selecting productDocumentsTable:", e);
    }

    // Optional category filter
    if (category && category !== "ALL") {
      docs = docs.filter((d) => d.docCategory === category);
    }

    const total = docs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedDocs = docs.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      productId,
      documents: paginatedDocs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/portfolio/products/:id/documents - Upload & register product document with SHA-256 provenance
productPortfolioRouter.post("/products/:id/documents", requireAuth, async (req, res): Promise<void> => {
  try {
    const productId = parseInt(String(req.params.id), 10);
    const {
      title,
      docCategory,
      description,
      fileVersion,
      originalFileName,
      mimeType,
      fileContentText,
      uploadedBy,
    } = req.body;

    if (!title || !originalFileName) {
      res.status(400).json({ success: false, error: "title and originalFileName are required" });
      return;
    }
    // Provenance must hash the actual file and name its actual actor. The
    // previous defaults invented both (placeholder content hashed as if real;
    // a fictional "Marcus Vance" recorded as uploader) — refuse instead.
    if (!fileContentText || typeof fileContentText !== "string") {
      res.status(400).json({ success: false, error: "fileContentText is required — the hash must be of the real file content" });
      return;
    }
    if (!uploadedBy || !String(uploadedBy).trim()) {
      res.status(400).json({ success: false, error: "uploadedBy is required — provenance must name who uploaded" });
      return;
    }

    const contentStr = fileContentText;
    const fileBytes = Buffer.byteLength(contentStr, "utf-8");
    const sha256Hash = crypto.createHash("sha256").update(contentStr).digest("hex");

    // Persistent storage directory path
    const uploadDir = path.join(process.cwd(), "uploads", "products", String(productId));
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeFileName = `${Date.now()}_${originalFileName.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
    const fullStoragePath = path.join(uploadDir, safeFileName);
    fs.writeFileSync(fullStoragePath, contentStr, "utf-8");

    const storagePathRelative = `/uploads/products/${productId}/${safeFileName}`;

    try {
      await db.execute(sql`SELECT setval(pg_get_serial_sequence('cra_product_documents', 'id'), COALESCE((SELECT max(id) FROM cra_product_documents), 1));`);
    } catch (e) {
      console.warn("Sequence reset warning for documents:", e);
    }

    const [newDoc] = await db
      .insert(productDocumentsTable)
      .values({
        productId,
        title,
        docCategory: docCategory || "Product Specification",
        description: description || "",
        fileVersion: fileVersion || "v1.0",
        originalFileName,
        mimeType: mimeType || "text/markdown",
        fileSizeBytes: fileBytes,
        fileContentText: contentStr,
        storagePath: storagePathRelative,
        sha256Hash,
        uploadedBy: String(uploadedBy).trim(),
      })
      .returning();

    res.json({
      success: true,
      document: newDoc,
      message: `Successfully uploaded ${originalFileName} with SHA-256 provenance hash (${sha256Hash.slice(0, 12)}...)`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/portfolio/documents/:docId - Remove document record and file
productPortfolioRouter.delete("/documents/:docId", requireAuth, async (req, res): Promise<void> => {
  try {
    const docId = parseInt(String(req.params.docId), 10);
    const [existing] = await db
      .select()
      .from(productDocumentsTable)
      .where(eq(productDocumentsTable.id, docId));

    if (!existing) {
      res.status(404).json({ success: false, error: "Document not found" });
      return;
    }

    // Delete database record
    await db.delete(productDocumentsTable).where(eq(productDocumentsTable.id, docId));

    // Try deleting file from disk if exists
    try {
      if (existing.storagePath) {
        const diskPath = path.join(process.cwd(), existing.storagePath);
        if (fs.existsSync(diskPath)) {
          fs.unlinkSync(diskPath);
        }
      }
    } catch (e) {
      console.warn("Could not delete file from disk:", e);
    }

    res.json({ success: true, message: `Document #${docId} removed from provenance vault.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/portfolio/documents/:docId/download - Stream/download file attachment
productPortfolioRouter.get("/documents/:docId/download", requireAuth, async (req, res): Promise<void> => {
  try {
    const docId = parseInt(String(req.params.docId), 10);
    const [existing] = await db
      .select()
      .from(productDocumentsTable)
      .where(eq(productDocumentsTable.id, docId));

    if (!existing) {
      res.status(404).json({ success: false, error: "Document not found" });
      return;
    }

    res.setHeader("Content-Type", existing.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${existing.originalFileName}"`);

    if (existing.fileContentText) {
      res.send(existing.fileContentText);
      return;
    }

    const diskPath = path.join(process.cwd(), existing.storagePath);
    if (fs.existsSync(diskPath)) {
      res.sendFile(diskPath);
      return;
    }

    res.status(404).json({ success: false, error: "Physical file binary not found on disk" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
