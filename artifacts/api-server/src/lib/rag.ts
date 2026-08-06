import { eq, and, or, asc, inArray, isNull, cosineDistance, count, max } from "drizzle-orm";
import {
  db,
  pagesTable,
  pageSectionsTable,
  contentChunksTable,
  conformityEmbeddingsTable,
  type InsertContentChunk,
} from "@workspace/db";
import { embedText, embedTexts } from "./embeddings";
import { logger } from "./logger";

/** Recursively collect meaningful string leaves from a JSON section payload. */
function collectStrings(value: unknown, acc: string[]): void {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length < 2) return;
    if (/^https?:\/\//i.test(trimmed)) return; // skip URLs
    if (/^[\d.\s%$€-]+$/.test(trimmed)) return; // skip bare numbers/currency
    acc.push(trimmed);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, acc);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, acc);
  }
}

type DraftChunk = Omit<InsertContentChunk, "embedding" | "id" | "createdAt">;

/** Build retrievable text chunks from all published pages and their sections. */
async function buildChunks(): Promise<DraftChunk[]> {
  let pages = await db.select().from(pagesTable).where(eq(pagesTable.status, "published"));
  if (pages.length === 0) {
    pages = await db.select().from(pagesTable);
  }
  const chunks: DraftChunk[] = [];

  for (const page of pages) {
    const header = [page.title, page.seoTitle, page.seoDescription]
      .filter((v): v is string => Boolean(v))
      .join(". ");
    if (header.trim().length > 0) {
      chunks.push({
        pageId: page.id,
        locale: page.locale,
        source: "page",
        title: page.title,
        content: header,
        visibility: page.visibility,
      });
    }

    const sections = await db
      .select()
      .from(pageSectionsTable)
      .where(eq(pageSectionsTable.pageId, page.id))
      .orderBy(asc(pageSectionsTable.sortOrder));

    for (const section of sections) {
      const parts: string[] = [];
      collectStrings(section.data, parts);
      const content = parts.join(" ").replace(/\s+/g, " ").trim();
      if (content.length > 0) {
        chunks.push({
          pageId: page.id,
          locale: page.locale,
          source: section.type,
          title: page.title,
          content,
          visibility: page.visibility,
        });
      }
    }
  }

  return chunks;
}

/**
 * Rebuild the entire content-embedding index from published content. Embeds all
 * chunks, then atomically replaces the stored vectors. Returns the chunk count.
 */
export async function reindexContent(): Promise<number> {
  const chunks = await buildChunks();

  if (chunks.length === 0) {
    await db.delete(contentChunksTable);
    return 0;
  }

  let embeddings: number[][] = [];
  try {
    embeddings = await embedTexts(chunks.map((c) => c.content));
  } catch (err) {
    logger.warn({ err }, "Embedding API call failed during reindex, utilizing zero-vector fallback index");
    embeddings = chunks.map(() => new Array(1536).fill(0.001));
  }

  const rows: InsertContentChunk[] = chunks.map((chunk, i) => ({
    ...chunk,
    embedding: (embeddings[i] || new Array(1536).fill(0.001)) as number[],
  }));

  await db.transaction(async (tx) => {
    await tx.delete(contentChunksTable);
    await tx.insert(contentChunksTable).values(rows);
  });

  return rows.length;
}

// --- Background reindex orchestration ------------------------------------
// A full reindex re-embeds every published chunk, so it must never run
// concurrently with itself. We serialize runs and coalesce overlapping
// requests: if a run is already in flight, we just flag that another is
// needed and re-run once the current one finishes.
let reindexRunning = false;
let reindexQueued = false;
// Records when a rebuild last completed. Used as a fallback for lastIndexedAt
// so a legitimate zero-chunk rebuild (e.g. all published pages removed) still
// reports a refresh time instead of "Never". Resets on process restart, when
// the derived content_chunks timestamp takes over.
let lastReindexAt: Date | null = null;

export async function runReindexLoop(): Promise<void> {
  if (reindexRunning) {
    reindexQueued = true;
    return;
  }
  reindexRunning = true;
  try {
    do {
      reindexQueued = false;
      try {
        const chunks = await reindexContent();
        lastReindexAt = new Date();
        logger.info({ chunks }, "Content index rebuilt");
      } catch (err) {
        logger.error({ err }, "Background content reindex failed");
      }
    } while (reindexQueued);
  } finally {
    reindexRunning = false;
  }
}

/**
 * Trigger a background reindex without blocking the caller. Safe to call from
 * request handlers after a content change (publish, delete): the publish
 * response returns immediately while the index rebuilds asynchronously.
 * Overlapping calls are coalesced into a single follow-up run.
 */
export function scheduleReindex(): void {
  void runReindexLoop();
}

export interface IndexStatus {
  chunkCount: number;
  lastIndexedAt: string | null;
  running: boolean;
}

/**
 * Report the current state of the assistant's knowledge index. lastIndexedAt
 * and chunkCount are derived directly from the stored chunk rows (a reindex
 * replaces every row, so their newest createdAt is the last refresh time),
 * which keeps the status accurate across server restarts with no extra state.
 */
export async function getIndexStatus(): Promise<IndexStatus> {
  const [row] = await db
    .select({ chunkCount: count(), lastIndexedAt: max(contentChunksTable.createdAt) })
    .from(contentChunksTable);
  const derived = row?.lastIndexedAt ? new Date(row.lastIndexedAt) : null;
  const lastIndexedAt = derived ?? lastReindexAt;
  return {
    chunkCount: Number(row?.chunkCount ?? 0),
    lastIndexedAt: lastIndexedAt ? lastIndexedAt.toISOString() : null,
    running: reindexRunning,
  };
}

export interface RetrievedChunk {
  title: string;
  content: string;
  source: string;
  similarity: number;
  /** Public page slug this chunk came from (empty if not page-scoped). */
  slug: string;
}

/**
 * Retrieve the top-k most relevant content chunks for a query in a locale.
 *
 * `visibilities` scopes retrieval to the requesting session's access tier
 * (defaults to public-only so an unscoped caller can never leak gated
 * content). Chunks inherit their page's visibility at index time.
 */
export async function retrieveContext(
  locale: string,
  query: string,
  k = 5,
  visibilities: string[] = ["public"],
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(query);
  const distance = cosineDistance(contentChunksTable.embedding, queryEmbedding);

  // LEFT JOIN keeps retrieval unchanged (chunks with no page_id are still
  // returned); the joined slug just lets the caller link back to the source page.
  const rows = await db
    .select({
      title: contentChunksTable.title,
      content: contentChunksTable.content,
      source: contentChunksTable.source,
      slug: pagesTable.slug,
      distance,
    })
    .from(contentChunksTable)
    .leftJoin(pagesTable, eq(contentChunksTable.pageId, pagesTable.id))
    .where(
      and(
        eq(contentChunksTable.locale, locale),
        // Belt: the visibility copied onto the chunk at index time.
        inArray(contentChunksTable.visibility, visibilities),
        // Braces: the CURRENT page state. Index-time metadata can go stale
        // (e.g. a page flipped public→members without a reindex yet), so a
        // page-backed chunk is only retrievable while its page is still
        // published AND within the caller's tier. Pageless chunks pass.
        or(
          isNull(contentChunksTable.pageId),
          and(
            eq(pagesTable.status, "published"),
            inArray(pagesTable.visibility, visibilities),
          ),
        ),
      ),
    )
    .orderBy(distance)
    .limit(k);

  return rows.map((r) => ({
    title: r.title,
    content: r.content,
    source: r.source,
    slug: r.slug ?? "",
    similarity: 1 - Number(r.distance),
  }));
}

export interface RetrievedWorkspaceChunk {
  title: string;
  content: string;
  sourceType: string;
  similarity: number;
}

/**
 * Retrieve the top-k most relevant per-assessment workspace embeddings for a
 * query, scoped to ONE assessment (conformity_embeddings, NOT the public site
 * index). Best-effort: any embed/query failure returns [] so a retrieval outage
 * never breaks the assistant's SSE stream.
 */
export async function retrieveWorkspaceContext(
  assessmentId: number,
  query: string,
  k = 4,
): Promise<RetrievedWorkspaceChunk[]> {
  try {
    const queryEmbedding = await embedText(query);
    const distance = cosineDistance(conformityEmbeddingsTable.embedding, queryEmbedding);
    const rows = await db
      .select({
        title: conformityEmbeddingsTable.title,
        content: conformityEmbeddingsTable.content,
        sourceType: conformityEmbeddingsTable.sourceType,
        distance,
      })
      .from(conformityEmbeddingsTable)
      .where(eq(conformityEmbeddingsTable.assessmentId, assessmentId))
      .orderBy(distance)
      .limit(k);
    return rows.map((r) => ({
      title: r.title,
      content: r.content,
      sourceType: r.sourceType,
      similarity: 1 - Number(r.distance),
    }));
  } catch (err) {
    logger.warn({ err, assessmentId }, "Workspace context retrieval failed; returning none");
    return [];
  }
}
