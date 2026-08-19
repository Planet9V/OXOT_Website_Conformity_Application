import { Router, type IRouter, type Request } from "express";
import { asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  conformitySuppliersTable,
  conformityProductsTable,
  conformityProcurementChecksTable,
  conformitySupplierDocumentsTable,
  conformitySupplierRequestsTable,
  conformitySharedResponsibilityTable,
  conformityActivityTable,
  type ConformitySupplierRow,
  type ConformityProcurementCheckRow,
  type ConformitySupplierDocumentRow,
  type ConformitySupplierRequestRow,
  type ConformitySharedResponsibilityRow,
} from "@workspace/db";
import {
  ListConformitySuppliersResponse,
  CreateConformitySupplierBody,
  CreateConformitySupplierResponse,
  UpdateConformitySupplierParams,
  UpdateConformitySupplierBody,
  UpdateConformitySupplierResponse,
  DeleteConformitySupplierParams,
  DeleteConformitySupplierResponse,
  GetSupplierPostureResponse,
  GetSharedResponsibilityMatrixParams,
  GetSharedResponsibilityMatrixResponse,
  PutSharedResponsibilityMatrixParams,
  PutSharedResponsibilityMatrixBody,
  PutSharedResponsibilityMatrixResponse,
  ListSupplierDocumentsParams,
  ListSupplierDocumentsResponse,
  AddSupplierDocumentParams,
  AddSupplierDocumentBody,
  AddSupplierDocumentResponse,
  DeleteSupplierDocumentParams,
  DeleteSupplierDocumentResponse,
  ListSupplierRequestsParams,
  ListSupplierRequestsResponse,
  CreateSupplierRequestParams,
  CreateSupplierRequestBody,
  CreateSupplierRequestResponse,
  WithdrawSupplierRequestParams,
  WithdrawSupplierRequestResponse,
  GetSupplierPortalWorkspaceResponse,
  SubmitSupplierPortalBody,
  SubmitSupplierPortalResponse,
  SupplierPortalUploadUrlBody,
  SupplierPortalUploadUrlResponse,
  GetProcurementCheckParams,
  GetProcurementCheckResponse,
  PutProcurementCheckParams,
  PutProcurementCheckBody,
  PutProcurementCheckResponse,
} from "@workspace/api-zod";
import { requireAuth, getSession } from "../lib/adminAuth";
import { RateLimiter } from "../lib/rateLimit";
import { objectStorage, localBackend } from "../lib/storageBackend";
import { ObjectNotFoundError } from "../lib/objectStorage";
import { validateUpload, MAX_UPLOAD_BYTES } from "./storage";
import { createHash, randomBytes } from "crypto";
import { Readable } from "stream";
import {
  deriveProcurementPosture,
  rollupSupplierPosture,
  type ProcurementFacts,
  type SupplierProductInput,
} from "../lib/procurementPosture";

/**
 * The supplier register (Phase 21) — the operator/asset-owner shape.
 *
 * A supplier row is a business-relationship record for pivoting the
 * equipment register and the evidence collected per product. It never
 * states, stores or derives a legal status about the supplier: the CRA
 * binds the supplier toward the market, and what this register holds is
 * what has (and has not) been provided to THIS organisation.
 */
const router: IRouter = Router();

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}

/**
 * A recorded document link must be a real web URL — never a `javascript:`,
 * `data:` or other scheme that executes when a later reader clicks it
 * (door-upload review SR1). Empty is allowed (no link supplied).
 */
function isSafeHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * The DOOR's file-type rule — STRICTER than the shared admin allow-list
 * (door-upload review SR2). No blanket `image/*` pass and no SVG: an
 * untrusted supplier upload is rendered by nobody inline, but the bytes
 * still must not be a scriptable document masquerading as an image.
 * `validateUpload` covers size + the admin allow-list; this adds the door
 * restrictions on top. Returns an error string, or null when acceptable.
 */
const DOOR_BLOCKED_EXTENSIONS = new Set(["svg", "svgz"]);
// The door does NOT honour the shared flow's blanket "any image/*" pass:
// only these concrete raster image types (SVG carries script; it is out).
const DOOR_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/avif",
]);

/** The door's stricter content-type rule (SR2), reused at mint and at PUT. */
function doorContentTypeAllowed(contentType: string): boolean {
  const type = contentType.split(";")[0].trim().toLowerCase();
  if (type === "image/svg+xml") return false;
  if (type.startsWith("image/")) return DOOR_IMAGE_TYPES.has(type);
  // Non-image types: defer to the shared allow-list (validateUpload checks it).
  return true;
}

function validateDoorUpload(name: string, size: number, contentType: string): string | null {
  const shared = validateUpload(name, size, contentType);
  if (shared) return shared;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (DOOR_BLOCKED_EXTENSIONS.has(ext)) {
    return "That file type is not accepted here. Send a PDF, Office document, photo (PNG/JPG) or data file.";
  }
  if (!doorContentTypeAllowed(contentType)) {
    return "That content type is not accepted here.";
  }
  return null;
}

function toDto(row: ConformitySupplierRow, productCount: number) {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    website: row.website,
    notes: row.notes,
    productCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/conformity/suppliers", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      supplier: conformitySuppliersTable,
      productCount: sql<number>`count(${conformityProductsTable.id})::int`,
    })
    .from(conformitySuppliersTable)
    .leftJoin(
      conformityProductsTable,
      eq(conformityProductsTable.supplierId, conformitySuppliersTable.id),
    )
    .groupBy(conformitySuppliersTable.id)
    .orderBy(asc(conformitySuppliersTable.name));
  res.json(
    ListConformitySuppliersResponse.parse({
      suppliers: rows.map((r) => toDto(r.supplier, r.productCount)),
    }),
  );
});

router.post("/conformity/suppliers", requireAuth, async (req, res): Promise<void> => {
  const body = CreateConformitySupplierBody.parse(req.body);
  const name = body.name.trim();
  if (!name) {
    res.status(400).json({ error: "Supplier name is required" });
    return;
  }
  const [existing] = await db
    .select({ id: conformitySuppliersTable.id })
    .from(conformitySuppliersTable)
    .where(eq(conformitySuppliersTable.name, name));
  if (existing) {
    res.status(400).json({ error: `A supplier named "${name}" already exists` });
    return;
  }
  const row = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(conformitySuppliersTable)
      .values({
        name,
        contact: body.contact ?? "",
        website: body.website ?? "",
        notes: body.notes ?? "",
      })
      .returning();
    await tx.insert(conformityActivityTable).values({
      entityType: "supplier",
      entityId: inserted!.id,
      action: "created",
      actor: actorOf(req),
      source: "ui",
      summary: `Supplier "${inserted!.name}" registered`,
    });
    return inserted!;
  });
  res.json(CreateConformitySupplierResponse.parse(toDto(row, 0)));
});

// NOTE: registered before the /:id routes match nothing here — different
// methods — but keep this path literal ahead of any future GET /:id.
router.get("/conformity/suppliers/posture", requireAuth, async (_req, res): Promise<void> => {
  const [suppliers, products, checks] = await Promise.all([
    db.select().from(conformitySuppliersTable).orderBy(asc(conformitySuppliersTable.name)),
    db.select().from(conformityProductsTable),
    db.select().from(conformityProcurementChecksTable),
  ]);
  const checkByProduct = new Map(checks.map((c) => [c.productId, c]));
  const toInput = (p: (typeof products)[number]): SupplierProductInput => {
    const c = checkByProduct.get(p.id);
    return {
      id: p.id,
      name: p.name,
      productType: p.productType,
      supportPeriodEnd: p.supportPeriodEnd ?? null,
      redInScope: p.redInScope ?? null,
      facts: {
        ceMarkingSighted: c?.ceMarkingSighted ?? null,
        docOnFile: c?.docOnFile ?? null,
        userInformationReceived: c?.userInformationReceived ?? null,
        supportPeriodStated: c?.supportPeriodStated ?? null,
        securityContactKnown: c?.securityContactKnown ?? null,
        manufacturerIdentified: c?.manufacturerIdentified ?? null,
        sbomReceived: c?.sbomReceived ?? null,
      },
    };
  };
  const rows = suppliers.map((s) => {
    const rollup = rollupSupplierPosture(
      products.filter((p) => p.supplierId === s.id).map(toInput),
    );
    return { id: s.id, name: s.name, contact: s.contact, ...rollup };
  });
  // Operator-filed products with no supplier recorded are NAMED, not omitted:
  // an unlinked estate reading as "no exposure" would be the quiet lie.
  const unlinkedProductCount = products.filter(
    (p) => p.orgRole === "operator" && p.supplierId == null,
  ).length;
  res.json(GetSupplierPostureResponse.parse({ suppliers: rows, unlinkedProductCount }));
});

router.put("/conformity/suppliers/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = UpdateConformitySupplierParams.parse(req.params);
  const body = UpdateConformitySupplierBody.parse(req.body);
  const [existing] = await db
    .select()
    .from(conformitySuppliersTable)
    .where(eq(conformitySuppliersTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Supplier not found" });
    return;
  }
  const name = body.name.trim();
  if (!name) {
    res.status(400).json({ error: "Supplier name is required" });
    return;
  }
  const row = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(conformitySuppliersTable)
      .set({
        name,
        ...(body.contact !== undefined ? { contact: body.contact } : {}),
        ...(body.website !== undefined ? { website: body.website } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      })
      .where(eq(conformitySuppliersTable.id, id))
      .returning();
    await tx.insert(conformityActivityTable).values({
      entityType: "supplier",
      entityId: id,
      action: "updated",
      actor: actorOf(req),
      source: "ui",
      summary: `Supplier "${updated!.name}" updated`,
    });
    return updated!;
  });
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(conformityProductsTable)
    .where(eq(conformityProductsTable.supplierId, id));
  res.json(UpdateConformitySupplierResponse.parse(toDto(row, count)));
});

router.delete("/conformity/suppliers/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = DeleteConformitySupplierParams.parse(req.params);
  const [existing] = await db
    .select()
    .from(conformitySuppliersTable)
    .where(eq(conformitySuppliersTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Supplier not found" });
    return;
  }
  await db.transaction(async (tx) => {
    // Products survive their supplier: the register is about the equipment,
    // and losing a business relationship never deletes an asset record.
    await tx
      .update(conformityProductsTable)
      .set({ supplierId: null })
      .where(eq(conformityProductsTable.supplierId, id));
    await tx.delete(conformitySuppliersTable).where(eq(conformitySuppliersTable.id, id));
    await tx.insert(conformityActivityTable).values({
      entityType: "supplier",
      entityId: id,
      action: "deleted",
      actor: actorOf(req),
      source: "ui",
      summary: `Supplier "${existing.name}" deleted; its products were unlinked, not removed`,
    });
  });
  res.json(DeleteConformitySupplierResponse.parse({ success: true }));
});

// ---------------------------------------------------------------------------
// The procurement check (21.2) — tri-state facts about what the supplier's
// manufacturer provided, per product, with the derived posture. GET creates
// nothing; PUT upserts. Facts never default (L40): an omitted field on PUT
// leaves the stored answer alone, and an explicit null withdraws it.
// ---------------------------------------------------------------------------

const FACT_KEYS = [
  "ceMarkingSighted",
  "docOnFile",
  "userInformationReceived",
  "supportPeriodStated",
  "securityContactKnown",
  "manufacturerIdentified",
  "sbomReceived",
] as const;

function toCheckDto(productId: number, row: ConformityProcurementCheckRow | undefined) {
  const facts: ProcurementFacts = Object.fromEntries(
    FACT_KEYS.map((k) => [k, row?.[k] ?? null]),
  );
  return {
    productId,
    facts,
    note: row?.note ?? "",
    updatedBy: row?.updatedBy ?? "",
    updatedAt: row?.updatedAt ? row.updatedAt.toISOString() : null,
    posture: deriveProcurementPosture(facts),
  };
}

async function productExists(productId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: conformityProductsTable.id })
    .from(conformityProductsTable)
    .where(eq(conformityProductsTable.id, productId));
  return !!row;
}

router.get(
  "/conformity/products/:id/procurement-check",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = GetProcurementCheckParams.parse(req.params);
    if (!(await productExists(id))) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const [row] = await db
      .select()
      .from(conformityProcurementChecksTable)
      .where(eq(conformityProcurementChecksTable.productId, id));
    res.json(GetProcurementCheckResponse.parse(toCheckDto(id, row)));
  },
);

router.put(
  "/conformity/products/:id/procurement-check",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = PutProcurementCheckParams.parse(req.params);
    const body = PutProcurementCheckBody.parse(req.body);
    if (!(await productExists(id))) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const set: Record<string, unknown> = { updatedBy: actorOf(req) };
    for (const k of FACT_KEYS) {
      if (body[k] !== undefined) set[k] = body[k];
    }
    if (body.note !== undefined) set.note = body.note;

    const row = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(conformityProcurementChecksTable)
        .where(eq(conformityProcurementChecksTable.productId, id));
      const [saved] = existing
        ? await tx
            .update(conformityProcurementChecksTable)
            .set(set)
            .where(eq(conformityProcurementChecksTable.productId, id))
            .returning()
        : await tx
            .insert(conformityProcurementChecksTable)
            .values({ productId: id, ...set })
            .returning();
      await tx.insert(conformityActivityTable).values({
        entityType: "product",
        entityId: id,
        action: "updated",
        actor: actorOf(req),
        source: "ui",
        summary: "Procurement check updated",
      });
      return saved!;
    });
    res.json(PutProcurementCheckResponse.parse(toCheckDto(id, row)));
  },
);

// ---------------------------------------------------------------------------
// Shared-responsibility matrix (B2) — the component/IP-supplier shape.
// The authored split of who owns what: per responsibility area, what the
// supplier provides vs. what the integrating customer retains. Authored data
// (not derived from an assessment), one row per product, upserted in place
// with a version bump — never a conformity verdict about the customer.
// ---------------------------------------------------------------------------

function toMatrixDto(
  productId: number,
  row: ConformitySharedResponsibilityRow | undefined,
) {
  return {
    id: row?.id ?? 0,
    productId,
    rows: row?.rows ?? [],
    version: row?.version ?? 0,
    updatedBy: row?.updatedBy ?? "",
    createdAt: row?.createdAt ? row.createdAt.toISOString() : "",
    updatedAt: row?.updatedAt ? row.updatedAt.toISOString() : "",
  };
}

router.get(
  "/conformity/products/:id/shared-responsibility",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = GetSharedResponsibilityMatrixParams.parse(req.params);
    if (!(await productExists(id))) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const [row] = await db
      .select()
      .from(conformitySharedResponsibilityTable)
      .where(eq(conformitySharedResponsibilityTable.productId, id));
    res.json(GetSharedResponsibilityMatrixResponse.parse(toMatrixDto(id, row)));
  },
);

router.put(
  "/conformity/products/:id/shared-responsibility",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = PutSharedResponsibilityMatrixParams.parse(req.params);
    const body = PutSharedResponsibilityMatrixBody.parse(req.body);
    if (!(await productExists(id))) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const rows = body.rows.map((r) => ({
      area: r.area,
      supplier: r.supplier,
      customer: r.customer,
      note: r.note,
    }));
    const row = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(conformitySharedResponsibilityTable)
        .where(eq(conformitySharedResponsibilityTable.productId, id));
      const [saved] = existing
        ? await tx
            .update(conformitySharedResponsibilityTable)
            .set({ rows, version: existing.version + 1, updatedBy: actorOf(req) })
            .where(eq(conformitySharedResponsibilityTable.productId, id))
            .returning()
        : await tx
            .insert(conformitySharedResponsibilityTable)
            .values({ productId: id, rows, version: 1, updatedBy: actorOf(req) })
            .returning();
      await tx.insert(conformityActivityTable).values({
        entityType: "product",
        entityId: id,
        action: "updated",
        actor: actorOf(req),
        source: "ui",
        summary: "Shared-responsibility matrix updated",
      });
      return saved!;
    });
    res.json(PutSharedResponsibilityMatrixResponse.parse(toMatrixDto(id, row)));
  },
);

// ---------------------------------------------------------------------------
// Supplier documents (21.4) — what the supplier has provided, per product.
// Internal uploads ride the normal storage flow (auth'd request-url + PUT);
// rows are fingerprinted like evidence and their files GC'd on deletion.
// ---------------------------------------------------------------------------

function toDocumentDto(row: ConformitySupplierDocumentRow) {
  return {
    id: row.id,
    productId: row.productId,
    docType: row.docType,
    title: row.title,
    objectPath: row.objectPath,
    fileName: row.fileName,
    fileHash: row.fileHash,
    url: row.url,
    note: row.note,
    submittedVia: row.submittedVia,
    submittedBy: row.submittedBy,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get(
  "/conformity/products/:id/supplier-documents",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = ListSupplierDocumentsParams.parse(req.params);
    if (!(await productExists(id))) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const rows = await db
      .select()
      .from(conformitySupplierDocumentsTable)
      .where(eq(conformitySupplierDocumentsTable.productId, id))
      .orderBy(desc(conformitySupplierDocumentsTable.createdAt));
    res.json(ListSupplierDocumentsResponse.parse({ documents: rows.map(toDocumentDto) }));
  },
);

router.post(
  "/conformity/products/:id/supplier-documents",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = AddSupplierDocumentParams.parse(req.params);
    const body = AddSupplierDocumentBody.parse(req.body);
    if (!(await productExists(id))) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    if (!isSafeHttpUrl((body.url ?? "").trim())) {
      res.status(400).json({ error: "A document link must be an http(s) URL." });
      return;
    }
    // Fingerprint stored bytes exactly like evidence (14.1 discipline).
    const objectPath = body.objectPath ?? "";
    // Only paths our own upload flow mints — never an arbitrary storage path (SR8).
    if (objectPath && !objectPath.startsWith("/objects/")) {
      res.status(400).json({ error: "Invalid file reference." });
      return;
    }
    let fileHash = "";
    if (objectPath) {
      const MAX_HASH_BYTES = 25 * 1024 * 1024;
      try {
        const bytes = await objectStorage.downloadToBufferIfWithin(objectPath, MAX_HASH_BYTES);
        if (bytes) fileHash = createHash("sha256").update(bytes).digest("hex");
      } catch (err) {
        req.log.warn({ err, objectPath }, "Could not fingerprint supplier document");
      }
    }
    const [row] = await db
      .insert(conformitySupplierDocumentsTable)
      .values({
        productId: id,
        docType: body.docType,
        title: body.title,
        objectPath,
        fileName: body.fileName ?? "",
        fileHash,
        url: body.url ?? "",
        note: body.note ?? "",
        submittedVia: "internal_upload",
        submittedBy: actorOf(req),
      })
      .returning();
    res.json(AddSupplierDocumentResponse.parse(toDocumentDto(row!)));
  },
);

// Stream a supplier-uploaded document to an authenticated internal user
// (SR3). ATTACHMENT, never inline (SR2/SR9): the bytes come from an untrusted
// supplier, so the browser must save them, not render them — a hostile
// SVG/HTML then cannot execute in the app origin. X-Content-Type-Options is
// re-asserted alongside helmet's global one.
router.get(
  "/conformity/supplier-documents/:id/download",
  requireAuth,
  async (req, res): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid document id" });
      return;
    }
    const [row] = await db
      .select()
      .from(conformitySupplierDocumentsTable)
      .where(eq(conformitySupplierDocumentsTable.id, id));
    if (!row || !row.objectPath) {
      res.status(404).json({ error: "Supplier document file not found" });
      return;
    }
    try {
      const objectFile = await objectStorage.getObjectEntityFile(row.objectPath);
      const response = await objectStorage.downloadObject(objectFile);
      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.setHeader("X-Content-Type-Options", "nosniff");
      const filename = row.fileName || `supplier-document-${row.id}`;
      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      );
      if (response.body) {
        Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        res.status(404).json({ error: "Supplier document file not found" });
        return;
      }
      req.log.error({ err: error }, "Error serving supplier document file");
      res.status(500).json({ error: "Failed to serve supplier document file" });
    }
  },
);

router.delete(
  "/conformity/supplier-documents/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = DeleteSupplierDocumentParams.parse(req.params);
    const [existing] = await db
      .select()
      .from(conformitySupplierDocumentsTable)
      .where(eq(conformitySupplierDocumentsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Supplier document not found" });
      return;
    }
    await db
      .delete(conformitySupplierDocumentsTable)
      .where(eq(conformitySupplierDocumentsTable.id, id));
    if (existing.objectPath) {
      try {
        await objectStorage.deleteObjectEntity(existing.objectPath);
      } catch (err) {
        req.log.warn(
          { err, objectPath: existing.objectPath },
          "stored supplier document removal failed; the row is already deleted",
        );
      }
    }
    res.json(DeleteSupplierDocumentResponse.parse({ success: true }));
  },
);

// ---------------------------------------------------------------------------
// Supplier asks + the door (21.4). The token is the auditor-portal pattern:
// random, expiring, revocable. The door accepts a LINK or NOTE — no public
// file-write path exists until it has had a security review. Both public
// endpoints are rate-limited per IP, and an invalid token answers exactly
// like an expired one (no enumeration signal).
// ---------------------------------------------------------------------------

function toRequestDto(row: ConformitySupplierRequestRow) {
  return {
    id: row.id,
    supplierId: row.supplierId,
    productId: row.productId,
    docType: row.docType,
    message: row.message,
    accessToken: row.accessToken,
    expiresAt: row.expiresAt.toISOString(),
    status: row.status,
    fulfilledAt: row.fulfilledAt ? row.fulfilledAt.toISOString() : null,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get(
  "/conformity/products/:id/supplier-requests",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = ListSupplierRequestsParams.parse(req.params);
    if (!(await productExists(id))) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const rows = await db
      .select()
      .from(conformitySupplierRequestsTable)
      .where(eq(conformitySupplierRequestsTable.productId, id))
      .orderBy(desc(conformitySupplierRequestsTable.createdAt));
    res.json(ListSupplierRequestsResponse.parse({ requests: rows.map(toRequestDto) }));
  },
);

router.post(
  "/conformity/products/:id/supplier-requests",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = CreateSupplierRequestParams.parse(req.params);
    const body = CreateSupplierRequestBody.parse(req.body);
    const [product] = await db
      .select()
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.id, id));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    if (product.supplierId == null) {
      res.status(400).json({
        error: "This product has no supplier recorded — set 'Procured From' first, so the ask lands with someone.",
      });
      return;
    }
    const days = body.expiresInDays ?? 14;
    const [row] = await db
      .insert(conformitySupplierRequestsTable)
      .values({
        supplierId: product.supplierId,
        productId: id,
        docType: body.docType,
        message: body.message ?? "",
        accessToken: randomBytes(32).toString("hex"),
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        createdBy: actorOf(req),
      })
      .returning();
    res.json(CreateSupplierRequestResponse.parse(toRequestDto(row!)));
  },
);

router.post(
  "/conformity/supplier-requests/:id/withdraw",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = WithdrawSupplierRequestParams.parse(req.params);
    const [existing] = await db
      .select()
      .from(conformitySupplierRequestsTable)
      .where(eq(conformitySupplierRequestsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    const [row] = await db
      .update(conformitySupplierRequestsTable)
      .set({ status: "withdrawn" })
      .where(eq(conformitySupplierRequestsTable.id, id))
      .returning();
    res.json(WithdrawSupplierRequestResponse.parse(toRequestDto(row!)));
  },
);

/** One answer for every bad-token shape: no enumeration signal. */
const DOOR_401 = { error: "This link is not valid or has expired. Ask your contact for a fresh one." };

async function loadOpenRequestByToken(token: string) {
  const [row] = await db
    .select()
    .from(conformitySupplierRequestsTable)
    .where(eq(conformitySupplierRequestsTable.accessToken, token));
  if (!row) return null;
  if (row.status === "withdrawn") return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  return row;
}

// 60/min per IP: the burst ceiling. A legitimate supplier answering one
// request makes ~8 calls (workspace + a few mint/PUT pairs + submit), and
// several suppliers can share one corporate NAT IP, so 20 was too tight. The
// EXPENSIVE operation (a 50 MB upload) is bounded far more tightly by the
// per-ask mint cap of 10 (SR5), which this limiter now backs up rather than
// carries alone. See docs/security/door-upload-review-2026-08.md.
const doorLimiter = new RateLimiter({ windowMs: 60_000, max: 60 });
function doorLimited(req: Request): boolean {
  return !doorLimiter.hit(`supplier-door:${req.ip ?? "unknown"}`).allowed;
}

router.get("/conformity/supplier-portal/workspace", async (req, res): Promise<void> => {
  if (doorLimited(req)) {
    res.status(429).json({ error: "Too many requests — try again in a minute." });
    return;
  }
  const token = String(req.query.token ?? "");
  const request = token ? await loadOpenRequestByToken(token) : null;
  if (!request) {
    res.status(401).json(DOOR_401);
    return;
  }
  const [supplier] = await db
    .select()
    .from(conformitySuppliersTable)
    .where(eq(conformitySuppliersTable.id, request.supplierId));
  const [product] = await db
    .select()
    .from(conformityProductsTable)
    .where(eq(conformityProductsTable.id, request.productId));
  res.json(
    GetSupplierPortalWorkspaceResponse.parse({
      organisationAsking: "OXOT Conformance", // single-tenant: the deployment IS the org
      supplierName: supplier?.name ?? "",
      productName: product?.name ?? "",
      docType: request.docType,
      message: request.message,
      status: request.status,
      expiresAt: request.expiresAt.toISOString(),
    }),
  );
});

/**
 * The door's file upload (22.1) — a PUBLIC WRITE SURFACE, shipped by explicit
 * decision with the formal SECURITY REVIEW PENDING (tracked open item in
 * task_plan.md). Hardening applied at birth:
 *   - the token must be an OPEN, unexpired, unwithdrawn ask;
 *   - same size cap and extension/content-type allow-list as the admin flow;
 *   - the door rate limiter covers both endpoints;
 *   - upload ids are one-time with a 15-minute TTL (the storage seam's own
 *     semantics), and the stored bytes are sha256-fingerprinted at link time.
 */
router.post("/conformity/supplier-portal/upload-url", async (req, res): Promise<void> => {
  if (doorLimited(req)) {
    res.status(429).json({ error: "Too many requests — try again in a minute." });
    return;
  }
  const body = SupplierPortalUploadUrlBody.parse(req.body);
  const request = await loadOpenRequestByToken(body.token);
  if (!request || request.status === "fulfilled") {
    res.status(401).json(DOOR_401);
    return;
  }
  const rejection = validateDoorUpload(body.name, body.size, body.contentType);
  if (rejection) {
    res.status(400).json({ error: rejection });
    return;
  }
  // Bound orphan bytes per ask (SR5): a handful of mints answers one document
  // request; anything past the cap is abuse, not a supplier fumbling.
  const MAX_MINTS_PER_ASK = 10;
  if (request.uploadsMinted >= MAX_MINTS_PER_ASK) {
    res.status(400).json({
      error: "Too many upload attempts for this request. Ask your contact for a fresh link.",
    });
    return;
  }
  await db
    .update(conformitySupplierRequestsTable)
    .set({ uploadsMinted: request.uploadsMinted + 1 })
    .where(eq(conformitySupplierRequestsTable.id, request.id));
  const mintedURL = await objectStorage.getObjectEntityUploadURL();
  const objectPath = objectStorage.normalizeObjectEntityPath(mintedURL);
  // The local backend's PUT is admin-gated by design; the door gets its own
  // token-scoped PUT over the same one-time id. Presigned (GCS) URLs pass
  // through untouched — they are already bearer-capable by construction.
  const uploadURL = mintedURL.startsWith("/api/storage/uploads/local/")
    ? mintedURL.replace(
        "/api/storage/uploads/local/",
        "/api/conformity/supplier-portal/upload/",
      ) + `?token=${encodeURIComponent(body.token)}`
    : mintedURL;
  res.json(SupplierPortalUploadUrlResponse.parse({ uploadURL, objectPath }));
});

router.put("/conformity/supplier-portal/upload/:id", async (req, res): Promise<void> => {
  if (doorLimited(req)) {
    res.status(429).json({ error: "Too many requests — try again in a minute." });
    return;
  }
  const token = String(req.query.token ?? "");
  const request = token ? await loadOpenRequestByToken(token) : null;
  if (!request || request.status === "fulfilled") {
    res.status(401).json(DOOR_401);
    return;
  }
  const local = localBackend();
  if (!local) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const body = req.body as unknown;
  if (!Buffer.isBuffer(body) || body.length === 0) {
    res.status(400).json({ error: "Missing file body" });
    return;
  }
  if (body.length > MAX_UPLOAD_BYTES) {
    res.status(400).json({ error: "File is too large." });
    return;
  }
  const contentType =
    (req.headers["content-type"] as string | undefined)?.split(";")[0].trim() ||
    "application/octet-stream";
  // Re-validate the ACTUAL Content-Type header at write time (SR2): the mint
  // step checked a client-declared value, and this is the byte-carrying
  // request. A door PUT must not store a type the door would refuse.
  if (!doorContentTypeAllowed(contentType)) {
    res.status(400).json({ error: "That content type is not accepted here." });
    return;
  }
  const objectPath = local.acceptLocalUpload(String(req.params.id), body, contentType);
  if (!objectPath) {
    res.status(404).json({ error: "Upload id unknown or expired" });
    return;
  }
  res.json({ ok: true, objectPath });
});

router.post("/conformity/supplier-portal/submit", async (req, res): Promise<void> => {
  if (doorLimited(req)) {
    res.status(429).json({ error: "Too many requests — try again in a minute." });
    return;
  }
  const body = SubmitSupplierPortalBody.parse(req.body);
  const request = await loadOpenRequestByToken(body.token);
  if (!request) {
    res.status(401).json(DOOR_401);
    return;
  }
  if (request.status === "fulfilled") {
    res.status(400).json({ error: "This ask has already been answered." });
    return;
  }
  const url = (body.url ?? "").trim();
  const note = (body.note ?? "").trim();
  const objectPath = (body.objectPath ?? "").trim();
  if (!url && !note && !objectPath) {
    res.status(400).json({ error: "Attach the document, provide a link, or answer in text." });
    return;
  }
  // A supplied link must be an http(s) URL — never a scheme that executes
  // when a later reader clicks it (SR1).
  if (!isSafeHttpUrl(url)) {
    res.status(400).json({ error: "A document link must be an http(s) URL." });
    return;
  }
  // Only paths our own upload flow mints — never an arbitrary storage path.
  if (objectPath && !objectPath.startsWith("/objects/uploads/")) {
    res.status(400).json({ error: "Invalid file reference." });
    return;
  }
  // Fingerprint the door-uploaded bytes exactly like every other stored file.
  let fileHash = "";
  if (objectPath) {
    const MAX_HASH_BYTES = 25 * 1024 * 1024;
    try {
      const bytes = await objectStorage.downloadToBufferIfWithin(objectPath, MAX_HASH_BYTES);
      if (bytes) fileHash = createHash("sha256").update(bytes).digest("hex");
    } catch (err) {
      req.log.warn({ err, objectPath }, "Could not fingerprint door-submitted file");
    }
  }
  await db.transaction(async (tx) => {
    await tx.insert(conformitySupplierDocumentsTable).values({
      productId: request.productId,
      docType: request.docType,
      title: `Supplier submission — ${request.docType.replace(/_/g, " ")}`,
      url,
      note,
      objectPath,
      fileName: (body.fileName ?? "").trim(),
      fileHash,
      submittedVia: "supplier_token",
      submittedBy: (body.submitterEmail ?? "").trim(),
    });
    await tx
      .update(conformitySupplierRequestsTable)
      .set({ status: "fulfilled", fulfilledAt: new Date() })
      .where(eq(conformitySupplierRequestsTable.id, request.id));
    await tx.insert(conformityActivityTable).values({
      entityType: "product",
      entityId: request.productId,
      action: "updated",
      actor: "supplier-door",
      source: "supplier_portal",
      summary: `Supplier submitted ${request.docType.replace(/_/g, " ")} via the door`,
    });
  });
  res.json(SubmitSupplierPortalResponse.parse({ success: true }));
});

export { router as conformitySuppliersRouter };
