import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { asc, desc, eq } from "drizzle-orm";
import {
  db,
  mediaAssetsTable,
  carouselSlidesTable,
  type MediaAssetRow,
  type CarouselSlideRow,
} from "@workspace/db";
import {
  ListMediaResponse,
  RegisterMediaBody,
  RegisterMediaResponse,
  DeleteMediaResponse,
  GetPublicCarouselResponse,
  ListCarouselResponse,
  AddCarouselImageBody,
  AddCarouselImageResponse,
  AddCarouselPdfBody,
  AddCarouselPdfResponse,
  ReorderCarouselBody,
  ReorderCarouselResponse,
  UpdateCarouselSlideBody,
  UpdateCarouselSlideResponse,
  DeleteCarouselSlideResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import { renderPdfToImages } from "../lib/pdf";

const router: IRouter = Router();

/** Public URL for an uploaded object, served by the storage route. */
function mediaUrl(objectPath: string): string {
  return `/api/storage${objectPath}`;
}

function toMediaDto(row: MediaAssetRow) {
  return {
    id: row.id,
    kind: row.kind,
    objectPath: row.objectPath,
    url: mediaUrl(row.objectPath),
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    width: row.width,
    height: row.height,
    pageCount: row.pageCount,
    createdAt: row.createdAt.toISOString(),
  };
}

function toSlideDto(row: CarouselSlideRow) {
  return {
    id: row.id,
    sortOrder: row.sortOrder,
    kind: row.kind,
    imagePath: row.imagePath,
    imageUrl: mediaUrl(row.imagePath),
    groupId: row.groupId,
    pageIndex: row.pageIndex,
    captionEn: row.captionEn,
    captionNl: row.captionNl,
    linkUrl: row.linkUrl,
    active: row.active,
  };
}

async function nextSortOrder(): Promise<number> {
  const [row] = await db
    .select({ v: carouselSlidesTable.sortOrder })
    .from(carouselSlidesTable)
    .orderBy(desc(carouselSlidesTable.sortOrder))
    .limit(1);
  return (row?.v ?? -1) + 1;
}

// --- Media library -------------------------------------------------------

router.get("/admin/media", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(mediaAssetsTable).orderBy(desc(mediaAssetsTable.createdAt));
  res.json(ListMediaResponse.parse(rows.map(toMediaDto)));
});

router.post("/admin/media", requireAdmin, async (req, res) => {
  const parsed = RegisterMediaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { objectPath, fileName, mimeType, sizeBytes, width, height } = parsed.data;
  const kind = mimeType === "application/pdf" ? "pdf" : "image";
  const [row] = await db
    .insert(mediaAssetsTable)
    .values({
      kind,
      objectPath,
      fileName,
      mimeType,
      sizeBytes: sizeBytes ?? 0,
      width: width ?? null,
      height: height ?? null,
    })
    .returning();
  res.json(RegisterMediaResponse.parse(toMediaDto(row)));
});

router.delete("/admin/media/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [existing] = await db.select().from(mediaAssetsTable).where(eq(mediaAssetsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Media not found" });
    return;
  }
  await db.delete(mediaAssetsTable).where(eq(mediaAssetsTable.id, id));
  res.json(DeleteMediaResponse.parse({ success: true }));
});

// --- Carousel ------------------------------------------------------------

router.get("/site/carousel", async (_req, res) => {
  const rows = await db
    .select()
    .from(carouselSlidesTable)
    .where(eq(carouselSlidesTable.active, true))
    .orderBy(asc(carouselSlidesTable.sortOrder));
  res.json(GetPublicCarouselResponse.parse(rows.map(toSlideDto)));
});

router.get("/admin/carousel", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(carouselSlidesTable)
    .orderBy(asc(carouselSlidesTable.sortOrder));
  res.json(ListCarouselResponse.parse(rows.map(toSlideDto)));
});

router.post("/admin/carousel/image", requireAdmin, async (req, res) => {
  const parsed = AddCarouselImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { objectPath, captionEn, captionNl, linkUrl } = parsed.data;
  const sortOrder = await nextSortOrder();
  const [row] = await db
    .insert(carouselSlidesTable)
    .values({
      sortOrder,
      kind: "image",
      imagePath: objectPath,
      captionEn: captionEn ?? null,
      captionNl: captionNl ?? null,
      linkUrl: linkUrl ?? null,
    })
    .returning();
  res.json(AddCarouselImageResponse.parse(toSlideDto(row)));
});

router.post("/admin/carousel/pdf", requireAdmin, async (req, res) => {
  const parsed = AddCarouselPdfBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { objectPath, captionEn, captionNl, linkUrl } = parsed.data;

  let pages;
  try {
    pages = await renderPdfToImages(objectPath);
  } catch (error) {
    req.log.error({ err: error }, "Failed to render PDF to images");
    res.status(400).json({ error: "Could not render this PDF. Please check the file and try again." });
    return;
  }
  if (pages.length === 0) {
    res.status(400).json({ error: "The PDF produced no pages." });
    return;
  }

  const groupId = randomUUID();
  let sortOrder = await nextSortOrder();
  const created: CarouselSlideRow[] = [];
  for (const page of pages) {
    const [row] = await db
      .insert(carouselSlidesTable)
      .values({
        sortOrder: sortOrder++,
        kind: "pdf",
        imagePath: page.objectPath,
        groupId,
        pageIndex: page.pageIndex,
        captionEn: page.pageIndex === 0 ? captionEn ?? null : null,
        captionNl: page.pageIndex === 0 ? captionNl ?? null : null,
        linkUrl: linkUrl ?? null,
      })
      .returning();
    created.push(row);
  }
  res.json(AddCarouselPdfResponse.parse(created.map(toSlideDto)));
});

router.put("/admin/carousel/reorder", requireAdmin, async (req, res) => {
  const parsed = ReorderCarouselBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { ids } = parsed.data;
  // Require `ids` to be an exact permutation of the current slide ids, so a
  // partial or malformed payload cannot leave duplicate/stale sortOrder values.
  const existing = await db.select({ id: carouselSlidesTable.id }).from(carouselSlidesTable);
  const existingIds = existing.map((r) => r.id);
  const idsSet = new Set(ids);
  const isPermutation =
    existingIds.length === ids.length &&
    idsSet.size === ids.length &&
    existingIds.every((id) => idsSet.has(id));
  if (!isPermutation) {
    res.status(400).json({ error: "ids must be an exact permutation of the current carousel slide ids" });
    return;
  }
  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(carouselSlidesTable)
        .set({ sortOrder: i })
        .where(eq(carouselSlidesTable.id, ids[i]));
    }
  });
  const rows = await db
    .select()
    .from(carouselSlidesTable)
    .orderBy(asc(carouselSlidesTable.sortOrder));
  res.json(ReorderCarouselResponse.parse(rows.map(toSlideDto)));
});

router.put("/admin/carousel/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateCarouselSlideBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const [existing] = await db.select().from(carouselSlidesTable).where(eq(carouselSlidesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Slide not found" });
    return;
  }
  const patch: Partial<typeof carouselSlidesTable.$inferInsert> = {};
  if (parsed.data.captionEn !== undefined) patch.captionEn = parsed.data.captionEn;
  if (parsed.data.captionNl !== undefined) patch.captionNl = parsed.data.captionNl;
  if (parsed.data.linkUrl !== undefined) patch.linkUrl = parsed.data.linkUrl;
  if (parsed.data.active !== undefined) patch.active = parsed.data.active;
  const [row] = await db
    .update(carouselSlidesTable)
    .set(patch)
    .where(eq(carouselSlidesTable.id, id))
    .returning();
  res.json(UpdateCarouselSlideResponse.parse(toSlideDto(row)));
});

router.delete("/admin/carousel/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [existing] = await db.select().from(carouselSlidesTable).where(eq(carouselSlidesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Slide not found" });
    return;
  }
  await db.delete(carouselSlidesTable).where(eq(carouselSlidesTable.id, id));
  res.json(DeleteCarouselSlideResponse.parse({ success: true }));
});

export default router;
