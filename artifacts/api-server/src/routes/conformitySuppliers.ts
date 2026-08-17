import { Router, type IRouter, type Request } from "express";
import { asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  conformitySuppliersTable,
  conformityProductsTable,
  conformityProcurementChecksTable,
  conformitySupplierDocumentsTable,
  conformitySupplierRequestsTable,
  conformityActivityTable,
  type ConformitySupplierRow,
  type ConformityProcurementCheckRow,
  type ConformitySupplierDocumentRow,
  type ConformitySupplierRequestRow,
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
  GetProcurementCheckParams,
  GetProcurementCheckResponse,
  PutProcurementCheckParams,
  PutProcurementCheckBody,
  PutProcurementCheckResponse,
} from "@workspace/api-zod";
import { requireAuth, getSession } from "../lib/adminAuth";
import { RateLimiter } from "../lib/rateLimit";
import { objectStorage } from "../lib/storageBackend";
import { createHash, randomBytes } from "crypto";
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
    // Fingerprint stored bytes exactly like evidence (14.1 discipline).
    const objectPath = body.objectPath ?? "";
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

const doorLimiter = new RateLimiter({ windowMs: 60_000, max: 20 });
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
  if (!url && !note) {
    res.status(400).json({ error: "Provide a link to the document, a note, or both." });
    return;
  }
  await db.transaction(async (tx) => {
    await tx.insert(conformitySupplierDocumentsTable).values({
      productId: request.productId,
      docType: request.docType,
      title: `Supplier submission — ${request.docType.replace(/_/g, " ")}`,
      url,
      note,
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
