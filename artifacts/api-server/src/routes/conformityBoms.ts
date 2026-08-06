/**
 * xBOM Vault — the conformity BOM (Bill of Materials) working layer.
 *
 * Ingest a typed inventory document (CycloneDX / SPDX), store its parsed
 * components, run offline crypto-agility heuristics + best-effort OSV.dev CVE
 * lookup into findings, and keep a per-type editable checklist. Every mutation
 * appends a chain-of-custody row to `conformity_activity`, and ingest also
 * best-effort auto-embeds a compact digest into `conformity_embeddings` so the
 * assistant can retrieve it.
 *
 * Like the rest of the execution layer this is gated behind `requireAuth`, and
 * the public demo role is READ-ONLY (GET allowed; any mutation → 403).
 */
import { createHash } from "node:crypto";
import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  conformityAssessmentsTable,
  conformityBomsTable,
  conformityBomComponentsTable,
  conformityBomFindingsTable,
  conformityActivityTable,
  conformityEmbeddingsTable,
  conformityBomNotificationsTable,
  conformityBomDependenciesTable,
  conformityBomLicensesTable,
  conformityEngItemsTable,
  conformityEngAttributesTable,
  conformityEngConnectionsTable,
  type ConformityBomNotificationRow,
  type ConformityBomRow,
  type ConformityBomComponentRow,
  type ConformityBomFindingRow,
  type BomChecklistItem,
} from "@workspace/db";
import {
  GetBomCatalogResponse,
  ListAssessmentBomsParams,
  ListAssessmentBomsResponse,
  IngestAssessmentBomParams,
  IngestAssessmentBomBody,
  IngestAssessmentBomResponse,
  GetBomParams,
  GetBomResponse,
  DeleteBomParams,
  DeleteBomResponse,
  AnalyzeBomParams,
  AnalyzeBomResponse,
  UpdateBomChecklistParams,
  UpdateBomChecklistBody,
  UpdateBomChecklistResponse,
  ListBomNotificationsParams,
  ListBomNotificationsResponse,
  ListBomNotificationGapsParams,
  ListBomNotificationGapsResponse,
  CreateBomNotificationParams,
  CreateBomNotificationBody,
  CreateBomNotificationResponse,
  UpdateBomNotificationParams,
  UpdateBomNotificationBody,
  UpdateBomNotificationResponse,
  GetBomEngineeringResponse,
} from "@workspace/api-zod";
import { requireAuth, getSession } from "../lib/adminAuth";
import { ObjectStorageService } from "../lib/objectStorage";
import {
  parseBom,
  runCryptoHeuristics,
  osvLookup,
  defaultChecklist,
  componentIdentityKey,
  exportCycloneDx,
  BOM_CATALOG,
} from "../lib/xbom";
import { parseDexpi } from "../lib/dexpi";
import { listBomNotificationGaps } from "../lib/bomNotificationGaps";
import { embedText } from "../lib/embeddings";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();

/**
 * Hard cap on a BOM document the server will pull into memory to parse. Large
 * CycloneDX/SPDX files are uploaded to object storage first (never inlined in
 * the request body), and the server reads them back only if within this cap so
 * an oversized blob can neither pin memory nor stall the request.
 */
const MAX_BOM_BYTES = 25 * 1024 * 1024; // 25 MiB

/**
 * The public "demo" role is READ-ONLY across the execution layer (see
 * conformityAssessments.ts for the rationale). Demo may GET everything; any
 * mutation is refused before the handler runs. Anonymous mutations fall through
 * to each route's `requireAuth` (→ 401), so the anon/auth contract is unchanged.
 */
router.use((req, res, next): void => {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    next();
    return;
  }
  if (getSession(req)?.role === "demo") {
    res.status(403).json({ error: "The demo workspace is read-only." });
    return;
  }
  next();
});

// ---------------------------------------------------------------------------
// DTO serializers
// ---------------------------------------------------------------------------

function toBomSummaryDto(b: ConformityBomRow) {
  return {
    id: b.id,
    assessmentId: b.assessmentId,
    bomType: b.bomType,
    format: b.format,
    name: b.name,
    fileName: b.fileName,
    componentCount: b.componentCount,
    findingCount: b.findingCount,
    status: b.status,
    checklist: b.checklist,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

function toComponentDto(c: ConformityBomComponentRow) {
  return {
    id: c.id,
    bomId: c.bomId,
    name: c.name,
    version: c.version,
    componentType: c.componentType,
    purl: c.purl,
    supplier: c.supplier,
    bomRef: c.bomRef,
    group: c.group,
    cpe: c.cpe,
    scope: c.scope,
    description: c.description,
    manufacturer: c.manufacturer,
    partNumber: c.partNumber,
    serialNumber: c.serialNumber,
    firmwareVersion: c.firmwareVersion,
    licenses: c.licenses,
    hashes: c.hashes,
    cryptoProperties: c.cryptoProperties ?? null,
    findingCount: c.findingCount,
  };
}

function toFindingDto(f: ConformityBomFindingRow) {
  return {
    id: f.id,
    bomId: f.bomId,
    componentId: f.componentId ?? null,
    findingType: f.findingType,
    identifier: f.identifier,
    severity: f.severity,
    title: f.title,
    description: f.description,
    source: f.source,
    detail: f.detail,
    createdAt: f.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Loaders / builders
// ---------------------------------------------------------------------------

async function loadBom(id: number): Promise<ConformityBomRow | undefined> {
  const [row] = await db.select().from(conformityBomsTable).where(eq(conformityBomsTable.id, id));
  return row;
}

/** Assemble the full BOM detail payload (bom + components + findings + graph). */
async function buildBomDetail(bom: ConformityBomRow) {
  const [components, findings, dependencies] = await Promise.all([
    db
      .select()
      .from(conformityBomComponentsTable)
      .where(eq(conformityBomComponentsTable.bomId, bom.id))
      .orderBy(conformityBomComponentsTable.id),
    db
      .select()
      .from(conformityBomFindingsTable)
      .where(eq(conformityBomFindingsTable.bomId, bom.id))
      .orderBy(conformityBomFindingsTable.id),
    db
      .select()
      .from(conformityBomDependenciesTable)
      .where(eq(conformityBomDependenciesTable.bomId, bom.id))
      .orderBy(conformityBomDependenciesTable.id),
  ]);
  return {
    bom: toBomSummaryDto(bom),
    components: components.map(toComponentDto),
    findings: findings.map(toFindingDto),
    dependencies: dependencies.map((d) => ({ ref: d.ref, dependsOnRef: d.dependsOnRef })),
  };
}

/** Resolve the acting session's actor string for activity logging. */
function actorOf(req: Parameters<typeof getSession>[0]): string {
  const session = getSession(req);
  if (!session) return "";
  return `${session.role}:${session.username}`;
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

router.get("/conformity/bom-catalog", requireAuth, (_req, res): void => {
  res.json(GetBomCatalogResponse.parse(BOM_CATALOG));
});

// ---------------------------------------------------------------------------
// Assessment-scoped BOMs (list + ingest)
// ---------------------------------------------------------------------------

router.get("/conformity/assessments/:id/boms", requireAuth, async (req, res): Promise<void> => {
  const { id } = ListAssessmentBomsParams.parse(req.params);
  const [assessment] = await db
    .select({ id: conformityAssessmentsTable.id })
    .from(conformityAssessmentsTable)
    .where(eq(conformityAssessmentsTable.id, id));
  if (!assessment) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }
  const rows = await db
    .select()
    .from(conformityBomsTable)
    .where(eq(conformityBomsTable.assessmentId, id))
    .orderBy(desc(conformityBomsTable.updatedAt));
  res.json(ListAssessmentBomsResponse.parse(rows.map(toBomSummaryDto)));
});

router.post("/conformity/assessments/:id/boms", requireAuth, async (req, res): Promise<void> => {
  const { id } = IngestAssessmentBomParams.parse(req.params);
  const body = IngestAssessmentBomBody.parse(req.body);
  const [assessment] = await db
    .select({ id: conformityAssessmentsTable.id })
    .from(conformityAssessmentsTable)
    .where(eq(conformityAssessmentsTable.id, id));
  if (!assessment) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }

  // Resolve the BOM document from exactly one source: a file uploaded to object
  // storage (the robust large-file path), or an inline `content` string (the
  // quick paste/small-upload path). Large files are never inlined in the body.
  let text: string;
  if (body.objectPath) {
    let bytes: Buffer | null;
    try {
      bytes = await objectStorage.downloadToBufferIfWithin(body.objectPath, MAX_BOM_BYTES);
    } catch (err) {
      req.log.warn({ err, objectPath: body.objectPath }, "Could not read uploaded BOM object");
      res.status(400).json({ error: "Could not read the uploaded BOM file. Please re-upload and try again." });
      return;
    }
    if (!bytes) {
      res.status(413).json({
        error: `The BOM file is too large to parse (max ${Math.round(MAX_BOM_BYTES / (1024 * 1024))} MB).`,
      });
      return;
    }
    text = bytes.toString("utf8");
  } else if (body.content && body.content.trim()) {
    text = body.content;
  } else {
    res.status(400).json({ error: "Provide a BOM document — paste the content or upload a file." });
    return;
  }

  const fileHash = createHash("sha256").update(text).digest("hex");
  const actor = actorOf(req);

  // -------------------------------------------------------------------------
  // DEXPI path — engineering BOMs are Proteus XML, a different data model:
  // plant items + EAV attributes + topology, persisted into the eng tables.
  // -------------------------------------------------------------------------
  if (body.format === "dexpi") {
    let dexpi;
    try {
      dexpi = parseDexpi(text);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Could not parse DEXPI document" });
      return;
    }

    const bom = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(conformityBomsTable)
        .values({
          assessmentId: id,
          bomType: body.bomType,
          format: "dexpi",
          name: body.name,
          fileName: body.fileName ?? "",
          fileHash,
          componentCount: dexpi.items.length,
          status: "stored",
          checklist: defaultChecklist(body.bomType),
          meta: dexpi.meta,
          provenance: {
            uploadedBy: actor,
            parser: "dexpi",
            parsedAt: new Date().toISOString(),
            fileHash,
            source: "ui",
          },
        })
        .returning();

      // Items first (need generated ids for the attribute rows).
      const itemIds: number[] = [];
      for (const item of dexpi.items) {
        const [row] = await tx
          .insert(conformityEngItemsTable)
          .values({
            bomId: inserted!.id,
            itemRef: item.itemRef,
            tagName: item.tagName,
            itemClass: item.itemClass,
            componentClass: item.componentClass,
            componentName: item.componentName,
            specification: item.specification,
            parentRef: item.parentRef,
            raw: item.raw,
          })
          .returning({ id: conformityEngItemsTable.id });
        itemIds.push(row!.id);
      }
      if (dexpi.attributes.length > 0) {
        await tx.insert(conformityEngAttributesTable).values(
          dexpi.attributes.map((a) => ({
            bomId: inserted!.id,
            itemId: itemIds[a.itemIndex]!,
            name: a.name,
            value: a.value,
            format: a.format,
            units: a.units,
            attributeSet: a.attributeSet,
          })),
        );
      }
      if (dexpi.connections.length > 0) {
        await tx.insert(conformityEngConnectionsTable).values(
          dexpi.connections.map((c) => ({
            bomId: inserted!.id,
            fromRef: c.fromRef,
            toRef: c.toRef,
            connectionType: c.connectionType,
          })),
        );
      }

      await tx.insert(conformityActivityTable).values({
        assessmentId: id,
        entityType: "bom",
        entityId: inserted!.id,
        action: "created",
        actor,
        source: "ui",
        hash: fileHash,
        summary: `Ingested ${body.bomType.toUpperCase()} "${body.name}" (DEXPI: ${dexpi.items.length} plant items, ${dexpi.connections.length} connections)`,
      });

      return inserted!;
    });

    // Best-effort assistant digest (never blocks the ingest).
    try {
      const topTags = dexpi.items
        .map((i) => `${i.tagName || i.itemRef} (${i.componentClass || i.itemClass})`)
        .slice(0, 20);
      const digest = [body.name, ...topTags].join("\n");
      const embedding = await embedText(digest);
      await db.insert(conformityEmbeddingsTable).values({
        assessmentId: id,
        sourceType: "bom",
        sourceId: bom.id,
        title: body.name,
        content: digest,
        embedding,
      });
    } catch (err) {
      req.log.warn({ err, bomId: bom.id }, "Could not auto-embed DEXPI digest");
    }

    res.json(IngestAssessmentBomResponse.parse(await buildBomDetail(bom)));
    return;
  }

  let parsed;
  try {
    parsed = parseBom({ format: body.format, text });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Could not parse BOM" });
    return;
  }

  const bom = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(conformityBomsTable)
      .values({
        assessmentId: id,
        bomType: body.bomType,
        format: parsed.format,
        name: body.name,
        fileName: body.fileName ?? "",
        fileHash,
        componentCount: parsed.components.length,
        status: "stored",
        checklist: defaultChecklist(body.bomType),
        meta: parsed.meta,
        provenance: {
          uploadedBy: actor,
          parser: parsed.format,
          parsedAt: new Date().toISOString(),
          fileHash,
          source: "ui",
        },
      })
      .returning();

    if (parsed.components.length > 0) {
      const componentRows = await tx
        .insert(conformityBomComponentsTable)
        .values(
          parsed.components.map((c) => ({
            bomId: inserted!.id,
            name: c.name,
            version: c.version,
            componentType: c.componentType,
            purl: c.purl,
            supplier: c.supplier,
            bomRef: c.bomRef,
            group: c.group,
            cpe: c.cpe,
            scope: c.scope,
            description: c.description,
            manufacturer: c.manufacturer,
            partNumber: c.partNumber,
            serialNumber: c.serialNumber,
            firmwareVersion: c.firmwareVersion,
            licenses: c.licenses,
            hashes: c.hashes,
            cryptoProperties: c.cryptoProperties,
            raw: c.raw,
          })),
        )
        .returning({ id: conformityBomComponentsTable.id });

      // Normalized license rows (one per observation, with provenance).
      const licenseRows = parsed.components.flatMap((c, idx) =>
        c.licenseDetails.map((l) => ({
          bomId: inserted!.id,
          componentId: componentRows[idx]!.id,
          license: l.license,
          source: l.source,
        })),
      );
      if (licenseRows.length > 0) {
        await tx.insert(conformityBomLicensesTable).values(licenseRows);
      }
    }

    // Dependency graph edges in the document's own reference space.
    if (parsed.dependencies.length > 0) {
      await tx.insert(conformityBomDependenciesTable).values(
        parsed.dependencies.map((d) => ({
          bomId: inserted!.id,
          ref: d.ref,
          dependsOnRef: d.dependsOnRef,
        })),
      );
    }

    await tx.insert(conformityActivityTable).values({
      assessmentId: id,
      entityType: "bom",
      entityId: inserted!.id,
      action: "created",
      actor,
      source: "ui",
      hash: fileHash,
      summary: `Ingested ${body.bomType.toUpperCase()} "${body.name}" (${parsed.components.length} components)`,
    });

    return inserted!;
  });

  // Best-effort auto-embed a compact digest so the assistant can retrieve this
  // BOM. Never block or 500 the ingest on an embedding failure.
  try {
    const topNames = parsed.components.slice(0, 20).map((c) => c.name).filter(Boolean);
    const digest = [body.name, ...topNames].join("\n");
    const embedding = await embedText(digest);
    await db.insert(conformityEmbeddingsTable).values({
      assessmentId: id,
      sourceType: "bom",
      sourceId: bom.id,
      title: body.name,
      content: digest,
      embedding,
    });
  } catch (err) {
    req.log.warn({ err, bomId: bom.id }, "Could not auto-embed BOM digest");
  }

  res.json(IngestAssessmentBomResponse.parse(await buildBomDetail(bom)));
});

// ---------------------------------------------------------------------------
// BOM detail / delete / analyze / checklist
// ---------------------------------------------------------------------------

router.get("/conformity/boms/:bomId", requireAuth, async (req, res): Promise<void> => {
  const { bomId } = GetBomParams.parse(req.params);
  const bom = await loadBom(bomId);
  if (!bom) {
    res.status(404).json({ error: "BOM not found" });
    return;
  }
  res.json(GetBomResponse.parse(await buildBomDetail(bom)));
});

router.delete("/conformity/boms/:bomId", requireAuth, async (req, res): Promise<void> => {
  const { bomId } = DeleteBomParams.parse(req.params);
  const bom = await loadBom(bomId);
  if (!bom) {
    res.status(404).json({ error: "BOM not found" });
    return;
  }
  await db.transaction(async (tx) => {
    await tx.delete(conformityBomsTable).where(eq(conformityBomsTable.id, bomId));
    await tx.insert(conformityActivityTable).values({
      assessmentId: bom.assessmentId,
      entityType: "bom",
      entityId: bomId,
      action: "deleted",
      actor: actorOf(req),
      source: "ui",
      summary: `Deleted BOM "${bom.name}"`,
    });
  });
  res.json(DeleteBomResponse.parse({ success: true }));
});

router.post("/conformity/boms/:bomId/analyze", requireAuth, async (req, res): Promise<void> => {
  const { bomId } = AnalyzeBomParams.parse(req.params);
  const bom = await loadBom(bomId);
  if (!bom) {
    res.status(404).json({ error: "BOM not found" });
    return;
  }

  const componentRows = await db
    .select()
    .from(conformityBomComponentsTable)
    .where(eq(conformityBomComponentsTable.bomId, bomId))
    .orderBy(conformityBomComponentsTable.id);

  // Reconstruct the parsed-component shape (aligned by array index) so the
  // engine's `componentIndex` resolves back to the stored component id.
  const parsedComponents = componentRows.map((c) => ({
    name: c.name,
    version: c.version,
    componentType: c.componentType,
    purl: c.purl,
    supplier: c.supplier,
    bomRef: c.bomRef,
    group: c.group,
    cpe: c.cpe,
    scope: c.scope,
    description: c.description,
    manufacturer: c.manufacturer,
    partNumber: c.partNumber,
    serialNumber: c.serialNumber,
    firmwareVersion: c.firmwareVersion,
    licenses: c.licenses,
    licenseDetails: [],
    hashes: c.hashes,
    cryptoProperties: c.cryptoProperties,
    raw: c.raw,
  }));

  const cryptoFindings = runCryptoHeuristics(parsedComponents);
  // OSV is best-effort — osvLookup itself swallows failures and returns [].
  // Kept OUTSIDE the transaction so a network hiccup never rolls back the
  // (already-computed) offline findings and never throws into the request.
  const osvFindings = await osvLookup(parsedComponents);
  const allFindings = [...cryptoFindings, ...osvFindings];

  // Refresh rollup counts on the BOM and per component.
  const perComponent = new Map<number, number>();
  for (const f of allFindings) {
    if (f.componentIndex === null) continue;
    const compId = componentRows[f.componentIndex]?.id;
    if (compId === undefined) continue;
    perComponent.set(compId, (perComponent.get(compId) ?? 0) + 1);
  }

  // The DB writes (replace findings + refresh rollups + activity) commit atomically.
  const updated = await db.transaction(async (tx) => {
    // Replace this BOM's findings with the fresh set.
    await tx.delete(conformityBomFindingsTable).where(eq(conformityBomFindingsTable.bomId, bomId));

    if (allFindings.length > 0) {
      await tx.insert(conformityBomFindingsTable).values(
        allFindings.map((f) => ({
          bomId,
          componentId:
            f.componentIndex !== null ? componentRows[f.componentIndex]?.id ?? null : null,
          findingType: f.findingType,
          identifier: f.identifier,
          severity: f.severity,
          title: f.title,
          description: f.description,
          source: f.source,
          detail: f.detail,
        })),
      );
    }

    await Promise.all(
      componentRows.map((c) =>
        tx
          .update(conformityBomComponentsTable)
          .set({ findingCount: perComponent.get(c.id) ?? 0 })
          .where(eq(conformityBomComponentsTable.id, c.id)),
      ),
    );

    const [row] = await tx
      .update(conformityBomsTable)
      .set({ findingCount: allFindings.length, status: "analyzed" })
      .where(eq(conformityBomsTable.id, bomId))
      .returning();

    await tx.insert(conformityActivityTable).values({
      assessmentId: bom.assessmentId,
      entityType: "bom",
      entityId: bomId,
      action: "analyzed",
      actor: actorOf(req),
      source: "ui",
      summary: `Analyzed BOM "${bom.name}" (${allFindings.length} findings)`,
    });

    return row!;
  });

  res.json(AnalyzeBomResponse.parse(await buildBomDetail(updated)));
});

// ---------------------------------------------------------------------------
// Export — CycloneDX 1.6 JSON rebuilt from the NORMALIZED rows (round-trip),
// or the raw stored document for DEXPI (XML has no lossless JSON re-export).
// ---------------------------------------------------------------------------

router.get("/conformity/boms/:bomId/export", requireAuth, async (req, res): Promise<void> => {
  const { bomId } = GetBomParams.parse(req.params);
  const bom = await loadBom(bomId);
  if (!bom) {
    res.status(404).json({ error: "BOM not found" });
    return;
  }
  if (bom.format === "dexpi") {
    res.status(400).json({
      error: "DEXPI BOMs are XML plant models; use the engineering view. CycloneDX export applies to component BOMs.",
    });
    return;
  }

  const [components, dependencies] = await Promise.all([
    db
      .select()
      .from(conformityBomComponentsTable)
      .where(eq(conformityBomComponentsTable.bomId, bomId))
      .orderBy(conformityBomComponentsTable.id),
    db
      .select()
      .from(conformityBomDependenciesTable)
      .where(eq(conformityBomDependenciesTable.bomId, bomId))
      .orderBy(conformityBomDependenciesTable.id),
  ]);

  const doc = exportCycloneDx({
    bomName: bom.name,
    components: components.map((c) => ({
      name: c.name,
      version: c.version,
      componentType: c.componentType,
      purl: c.purl,
      supplier: c.supplier,
      bomRef: c.bomRef,
      group: c.group,
      cpe: c.cpe,
      scope: c.scope,
      description: c.description,
      manufacturer: c.manufacturer,
      partNumber: c.partNumber,
      serialNumber: c.serialNumber,
      firmwareVersion: c.firmwareVersion,
      licenses: c.licenses,
      hashes: c.hashes,
      cryptoProperties: c.cryptoProperties ?? null,
    })),
    dependencies: dependencies.map((d) => ({ ref: d.ref, dependsOnRef: d.dependsOnRef })),
  });

  const fileName = `${bom.name.replace(/[^a-zA-Z0-9._-]+/g, "-") || "bom"}.cdx.json`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(doc, null, 2));
});

// ---------------------------------------------------------------------------
// Engineering view — the normalized DEXPI plant model for an EBOM.
// ---------------------------------------------------------------------------

router.get("/conformity/boms/:bomId/engineering", requireAuth, async (req, res): Promise<void> => {
  const { bomId } = GetBomParams.parse(req.params);
  const bom = await loadBom(bomId);
  if (!bom) {
    res.status(404).json({ error: "BOM not found" });
    return;
  }

  const [items, attributes, connections] = await Promise.all([
    db
      .select()
      .from(conformityEngItemsTable)
      .where(eq(conformityEngItemsTable.bomId, bomId))
      .orderBy(conformityEngItemsTable.id),
    db
      .select()
      .from(conformityEngAttributesTable)
      .where(eq(conformityEngAttributesTable.bomId, bomId))
      .orderBy(conformityEngAttributesTable.id),
    db
      .select()
      .from(conformityEngConnectionsTable)
      .where(eq(conformityEngConnectionsTable.bomId, bomId))
      .orderBy(conformityEngConnectionsTable.id),
  ]);

  res.json(
    GetBomEngineeringResponse.parse({
      bom: toBomSummaryDto(bom),
      items: items.map((i) => ({
        id: i.id,
        itemRef: i.itemRef,
        tagName: i.tagName,
        itemClass: i.itemClass,
        componentClass: i.componentClass,
        componentName: i.componentName,
        specification: i.specification,
        parentRef: i.parentRef,
      })),
      attributes: attributes.map((a) => ({
        id: a.id,
        itemId: a.itemId,
        name: a.name,
        value: a.value,
        format: a.format,
        units: a.units,
        attributeSet: a.attributeSet,
      })),
      connections: connections.map((c) => ({
        id: c.id,
        fromRef: c.fromRef,
        toRef: c.toRef,
        connectionType: c.connectionType,
      })),
    }),
  );
});

router.patch("/conformity/boms/:bomId/checklist", requireAuth, async (req, res): Promise<void> => {
  const { bomId } = UpdateBomChecklistParams.parse(req.params);
  const body = UpdateBomChecklistBody.parse(req.body);
  const bom = await loadBom(bomId);
  if (!bom) {
    res.status(404).json({ error: "BOM not found" });
    return;
  }
  const checklist: BomChecklistItem[] = body.checklist.map((item) => ({
    key: item.key,
    label: item.label,
    done: item.done,
    ...(item.note !== undefined ? { note: item.note } : {}),
  }));
  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(conformityBomsTable)
      .set({ checklist })
      .where(eq(conformityBomsTable.id, bomId))
      .returning();
    await tx.insert(conformityActivityTable).values({
      assessmentId: bom.assessmentId,
      entityType: "bom",
      entityId: bomId,
      action: "updated",
      actor: actorOf(req),
      source: "ui",
      summary: `Updated checklist for BOM "${bom.name}"`,
    });
    return row!;
  });
  res.json(UpdateBomChecklistResponse.parse(await buildBomDetail(updated)));
});

// ---------------------------------------------------------------------------
// Upstream component-vulnerability notifications (CRA Art 13(6))
//
// Tracked per (assessment, component identity, vulnerability id) — never per
// finding row: findings are wiped and regenerated on every analysis, so the
// natural key is what lets a record survive a re-uploaded/re-analyzed BOM.
// ---------------------------------------------------------------------------

function toNotificationDto(n: ConformityBomNotificationRow) {
  return {
    id: n.id,
    assessmentId: n.assessmentId,
    componentKey: n.componentKey,
    componentName: n.componentName,
    componentVersion: n.componentVersion,
    purl: n.purl,
    vulnerabilityId: n.vulnerabilityId,
    status: n.status,
    maintainerContact: n.maintainerContact,
    method: n.method,
    notifiedAt: n.notifiedAt ? n.notifiedAt.toISOString() : null,
    dueAt: n.dueAt ? n.dueAt.toISOString() : null,
    acknowledgedAt: n.acknowledgedAt ? n.acknowledgedAt.toISOString() : null,
    notes: n.notes,
    recordedBy: n.recordedBy,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

function componentLabelOf(n: { componentName: string; componentVersion: string; componentKey: string }): string {
  if (n.componentName) {
    return n.componentVersion ? `${n.componentName}@${n.componentVersion}` : n.componentName;
  }
  return n.componentKey;
}

router.get(
  "/conformity/assessments/:id/bom-notifications",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = ListBomNotificationsParams.parse(req.params);
    const [assessment] = await db
      .select({ id: conformityAssessmentsTable.id })
      .from(conformityAssessmentsTable)
      .where(eq(conformityAssessmentsTable.id, id));
    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }
    const rows = await db
      .select()
      .from(conformityBomNotificationsTable)
      .where(eq(conformityBomNotificationsTable.assessmentId, id))
      .orderBy(desc(conformityBomNotificationsTable.updatedAt));
    res.json(ListBomNotificationsResponse.parse(rows.map(toNotificationDto)));
  },
);

/**
 * Art 13(6) compliance gap: vulnerability findings across this assessment's
 * BOMs whose maintainer has NOT been notified yet — no tracked record, or a
 * tracked record still `pending`. Only `notified`, `acknowledged` and the
 * explicit `not_required` decision resolve the duty. Matched by componentKey +
 * vulnerability id — the exact rule the inline finding chips use — so the two
 * views can never disagree. Read-only; derived, never stored. The computation
 * lives in lib/bomNotificationGaps so the assessment overview count uses the
 * same rule.
 */

router.get(
  "/conformity/assessments/:id/bom-notification-gaps",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = ListBomNotificationGapsParams.parse(req.params);
    const [assessment] = await db
      .select({ id: conformityAssessmentsTable.id })
      .from(conformityAssessmentsTable)
      .where(eq(conformityAssessmentsTable.id, id));
    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }

    const gaps = await listBomNotificationGaps(id);
    res.json(ListBomNotificationGapsResponse.parse(gaps));
  },
);

router.post(
  "/conformity/assessments/:id/bom-notifications",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = CreateBomNotificationParams.parse(req.params);
    const parsedBody = CreateBomNotificationBody.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ error: "Invalid notification payload", detail: parsedBody.error.issues });
      return;
    }
    const body = parsedBody.data;
    const [assessment] = await db
      .select({ id: conformityAssessmentsTable.id })
      .from(conformityAssessmentsTable)
      .where(eq(conformityAssessmentsTable.id, id));
    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }
    const componentKey = componentIdentityKey({
      purl: body.purl ?? "",
      name: body.componentName ?? "",
      version: body.componentVersion ?? "",
    });
    if (!componentKey) {
      res.status(400).json({ error: "Identify the component: provide a purl or a component name." });
      return;
    }
    let notifiedAt: Date | null = null;
    if (body.notifiedAt) {
      notifiedAt = new Date(body.notifiedAt);
      if (Number.isNaN(notifiedAt.getTime())) {
        res.status(400).json({ error: "notifiedAt is not a valid date." });
        return;
      }
    }
    // Art 13(6) says "without undue delay" — the workbench keeps its own SLA
    // clock. Caller may set an explicit dueAt; otherwise a pending record gets
    // a default 72h promptness window from creation so it can never sit
    // untracked outside alerting.
    let dueAt: Date | null = null;
    if (body.dueAt) {
      dueAt = new Date(body.dueAt);
      if (Number.isNaN(dueAt.getTime())) {
        res.status(400).json({ error: "dueAt is not a valid date." });
        return;
      }
    } else if ((body.status ?? "pending") === "pending") {
      dueAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    }
    const actor = actorOf(req);
    const values = {
      assessmentId: id,
      componentKey,
      componentName: body.componentName ?? "",
      componentVersion: body.componentVersion ?? "",
      purl: body.purl ?? "",
      vulnerabilityId: body.vulnerabilityId,
      status: body.status ?? "pending",
      maintainerContact: body.maintainerContact ?? "",
      method: body.method ?? "",
      notifiedAt,
      dueAt,
      acknowledgedAt: (body.status ?? "") === "acknowledged" ? new Date() : null,
      notes: body.notes ?? "",
      recordedBy: actor,
    };

    // Upsert on the natural key so re-tracking the same (component, vuln) pair
    // updates the existing record instead of failing or duplicating.
    const [existing] = await db
      .select()
      .from(conformityBomNotificationsTable)
      .where(
        and(
          eq(conformityBomNotificationsTable.assessmentId, id),
          eq(conformityBomNotificationsTable.componentKey, componentKey),
          eq(conformityBomNotificationsTable.vulnerabilityId, body.vulnerabilityId),
        ),
      );

    // Semantic no-op: identical payload re-submitted — skip the write entirely.
    if (
      existing &&
      existing.componentName === values.componentName &&
      existing.componentVersion === values.componentVersion &&
      existing.purl === values.purl &&
      existing.status === values.status &&
      existing.maintainerContact === values.maintainerContact &&
      existing.method === values.method &&
      (existing.notifiedAt?.getTime() ?? null) === (notifiedAt?.getTime() ?? null) &&
      existing.notes === values.notes
    ) {
      res.json(CreateBomNotificationResponse.parse(toNotificationDto(existing)));
      return;
    }

    const label = componentLabelOf({
      componentName: values.componentName,
      componentVersion: values.componentVersion,
      componentKey,
    });
    const saved = await db.transaction(async (tx) => {
      let row: ConformityBomNotificationRow;
      if (existing) {
        [row] = (await tx
          .update(conformityBomNotificationsTable)
          .set(values)
          .where(eq(conformityBomNotificationsTable.id, existing.id))
          .returning()) as [ConformityBomNotificationRow];
      } else {
        [row] = (await tx
          .insert(conformityBomNotificationsTable)
          .values(values)
          .returning()) as [ConformityBomNotificationRow];
      }
      await tx.insert(conformityActivityTable).values({
        assessmentId: id,
        entityType: "bom_notification",
        entityId: row.id,
        action: existing ? "updated" : "created",
        actor,
        source: "ui",
        summary: existing
          ? `Updated upstream notification for ${label} (${body.vulnerabilityId}) — status ${values.status}`
          : `Started tracking upstream notification for ${label} (${body.vulnerabilityId}) — status ${values.status}`,
      });
      return row;
    });
    res.json(CreateBomNotificationResponse.parse(toNotificationDto(saved)));
  },
);

router.patch(
  "/conformity/bom-notifications/:notificationId",
  requireAuth,
  async (req, res): Promise<void> => {
    const { notificationId } = UpdateBomNotificationParams.parse(req.params);
    const parsedBody = UpdateBomNotificationBody.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ error: "Invalid notification payload", detail: parsedBody.error.issues });
      return;
    }
    const body = parsedBody.data;
    const [existing] = await db
      .select()
      .from(conformityBomNotificationsTable)
      .where(eq(conformityBomNotificationsTable.id, notificationId));
    if (!existing) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    let notifiedAt: Date | null | undefined = undefined;
    if (body.notifiedAt !== undefined) {
      if (body.notifiedAt === null || body.notifiedAt === "") {
        notifiedAt = null;
      } else {
        notifiedAt = new Date(body.notifiedAt);
        if (Number.isNaN(notifiedAt.getTime())) {
          res.status(400).json({ error: "notifiedAt is not a valid date." });
          return;
        }
      }
    }
    const parseNullable = (v: string | null | undefined, label: string): Date | null | undefined => {
      if (v === undefined) return undefined;
      if (v === null || v === "") return null;
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) {
        throw Object.assign(new Error(`${label} is not a valid date.`), { badDate: true });
      }
      return d;
    };
    let dueAt: Date | null | undefined;
    let acknowledgedAt: Date | null | undefined;
    try {
      dueAt = parseNullable(body.dueAt, "dueAt");
      acknowledgedAt = parseNullable(body.acknowledgedAt, "acknowledgedAt");
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Invalid date." });
      return;
    }
    // Moving to "acknowledged" without an explicit timestamp stamps now, so
    // the acknowledgement moment is never silently lost.
    if (
      acknowledgedAt === undefined &&
      body.status === "acknowledged" &&
      existing.acknowledgedAt === null
    ) {
      acknowledgedAt = new Date();
    }
    const next = {
      status: body.status ?? existing.status,
      maintainerContact: body.maintainerContact ?? existing.maintainerContact,
      method: body.method ?? existing.method,
      notifiedAt: notifiedAt === undefined ? existing.notifiedAt : notifiedAt,
      dueAt: dueAt === undefined ? existing.dueAt : dueAt,
      acknowledgedAt: acknowledgedAt === undefined ? existing.acknowledgedAt : acknowledgedAt,
      notes: body.notes ?? existing.notes,
    };
    // Semantic no-op: nothing actually changes — skip the UPDATE and the ledger.
    if (
      next.status === existing.status &&
      next.maintainerContact === existing.maintainerContact &&
      next.method === existing.method &&
      (next.notifiedAt?.getTime() ?? null) === (existing.notifiedAt?.getTime() ?? null) &&
      (next.dueAt?.getTime() ?? null) === (existing.dueAt?.getTime() ?? null) &&
      (next.acknowledgedAt?.getTime() ?? null) === (existing.acknowledgedAt?.getTime() ?? null) &&
      next.notes === existing.notes
    ) {
      res.json(UpdateBomNotificationResponse.parse(toNotificationDto(existing)));
      return;
    }
    const actor = actorOf(req);
    const label = componentLabelOf(existing);
    const updated = await db.transaction(async (tx) => {
      const [row] = (await tx
        .update(conformityBomNotificationsTable)
        .set({ ...next, recordedBy: actor })
        .where(eq(conformityBomNotificationsTable.id, notificationId))
        .returning()) as [ConformityBomNotificationRow];
      await tx.insert(conformityActivityTable).values({
        assessmentId: existing.assessmentId,
        entityType: "bom_notification",
        entityId: notificationId,
        action: "updated",
        actor,
        source: "ui",
        summary: `Updated upstream notification for ${label} (${existing.vulnerabilityId}) — status ${next.status}`,
      });
      return row;
    });
    res.json(UpdateBomNotificationResponse.parse(toNotificationDto(updated)));
  },
);

/**
 * GET /api/conformity/boms/:bomId/hierarchy — Return multi-tier OEM supply chain tree.
 */
router.get(
  "/conformity/boms/:bomId/hierarchy",
  async (req, res): Promise<void> => {
    try {
      const bomId = Number(req.params.bomId);
      if (Number.isNaN(bomId) || bomId <= 0) {
        res.status(400).json({ error: "Invalid bomId" });
        return;
      }

      const components = await db
        .select()
        .from(conformityBomComponentsTable)
        .where(eq(conformityBomComponentsTable.bomId, bomId));

      // Build parent-child tree
      const rootComponents = components.filter((c) => !c.parentComponentId);
      const tree = rootComponents.map((root) => ({
        ...root,
        children: components.filter((c) => c.parentComponentId === root.id),
      }));

      res.json({
        bomId,
        totalComponents: components.length,
        tree,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to load BOM hierarchy" });
    }
  },
);

/**
 * GET /api/conformity/boms/:bomId/cbom-audit — Return Cryptography Bill of Materials audit.
 */
router.get(
  "/conformity/boms/:bomId/cbom-audit",
  async (req, res): Promise<void> => {
    try {
      const bomId = Number(req.params.bomId);
      if (Number.isNaN(bomId) || bomId <= 0) {
        res.status(400).json({ error: "Invalid bomId" });
        return;
      }

      const components = await db
        .select()
        .from(conformityBomComponentsTable)
        .where(eq(conformityBomComponentsTable.bomId, bomId));

      const cbomComponents = components.filter((c) => c.bomType === "cbom" || c.componentType === "crypto-asset");

      // Compute PQC Readiness Heuristic
      const deprecatedCount = cbomComponents.filter((c) => 
        c.cryptoProperties && (c.cryptoProperties.algorithm === "MD5" || c.cryptoProperties.algorithm === "SHA-1" || c.cryptoProperties.algorithm === "DES")
      ).length;

      const totalPqcScore = cbomComponents.length > 0
        ? Math.max(0, 100 - (deprecatedCount * 25))
        : 100;

      res.json({
        bomId,
        cbomCount: cbomComponents.length,
        deprecatedAlgorithmCount: deprecatedCount,
        pqcReadinessScore: totalPqcScore,
        components: cbomComponents,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to execute CBOM audit" });
    }
  },
);

/**
 * POST /api/conformity/boms/compare — Compute & store version differential between base and target BOMs.
 */
router.post(
  "/conformity/boms/compare",
  async (req, res): Promise<void> => {
    try {
      const baseBomId = Number(req.body.baseBomId);
      const targetBomId = Number(req.body.targetBomId);

      if (!baseBomId || !targetBomId) {
        res.status(400).json({ error: "baseBomId and targetBomId are required" });
        return;
      }

      const baseComponents = await db
        .select()
        .from(conformityBomComponentsTable)
        .where(eq(conformityBomComponentsTable.bomId, baseBomId));

      const targetComponents = await db
        .select()
        .from(conformityBomComponentsTable)
        .where(eq(conformityBomComponentsTable.bomId, targetBomId));

      const baseMap = new Map(baseComponents.map((c) => [c.name, c]));
      const targetMap = new Map(targetComponents.map((c) => [c.name, c]));

      const added = targetComponents
        .filter((c) => !baseMap.has(c.name))
        .map((c) => ({ name: c.name, version: c.version, purl: c.purl, bomType: c.bomType }));

      const removed = baseComponents
        .filter((c) => !targetMap.has(c.name))
        .map((c) => ({ name: c.name, version: c.version, purl: c.purl, bomType: c.bomType }));

      const upgraded = targetComponents
        .filter((c) => baseMap.has(c.name) && baseMap.get(c.name)!.version !== c.version)
        .map((c) => ({
          name: c.name,
          oldVersion: baseMap.get(c.name)!.version,
          newVersion: c.version,
          purl: c.purl,
        }));

      res.json({
        baseBomId,
        targetBomId,
        diffSummary: {
          addedCount: added.length,
          removedCount: removed.length,
          upgradedCount: upgraded.length,
        },
        addedComponents: added,
        removedComponents: removed,
        upgradedComponents: upgraded,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to compare BOMs" });
    }
  },
);

export default router;
