import { and, asc, desc, eq } from "drizzle-orm";
import {
  db,
  pagesTable,
  pageSectionsTable,
  pageVersionsTable,
  type PageRow,
  type PageVersionRow,
  type SectionSnapshot,
} from "@workspace/db";

export interface AdminSectionDto {
  type: string;
  order: number;
  data: Record<string, unknown>;
}

export interface AdminPageDto {
  id: number;
  slug: string;
  title: string;
  locale: string;
  seoTitle: string | null;
  seoDescription: string | null;
  status: "draft" | "published";
  hasUnpublishedChanges: boolean;
  sections: AdminSectionDto[];
  updatedAt: string;
}

export function snapshotToDto(sections: SectionSnapshot[]): AdminSectionDto[] {
  return [...sections]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => ({ type: s.type, order: s.sortOrder, data: s.data ?? {} }));
}

export function dtoToSnapshot(sections: AdminSectionDto[]): SectionSnapshot[] {
  return sections.map((s, i) => ({
    type: s.type,
    sortOrder: typeof s.order === "number" ? s.order : i,
    data: s.data ?? {},
  }));
}

export async function getDraftVersion(pageId: number): Promise<PageVersionRow | undefined> {
  const [row] = await db
    .select()
    .from(pageVersionsTable)
    .where(and(eq(pageVersionsTable.pageId, pageId), eq(pageVersionsTable.state, "draft")))
    .orderBy(desc(pageVersionsTable.versionNumber))
    .limit(1);
  return row;
}

export async function getPublishedVersion(pageId: number): Promise<PageVersionRow | undefined> {
  const [row] = await db
    .select()
    .from(pageVersionsTable)
    .where(and(eq(pageVersionsTable.pageId, pageId), eq(pageVersionsTable.state, "published")))
    .orderBy(desc(pageVersionsTable.versionNumber))
    .limit(1);
  return row;
}

async function nextVersionNumber(pageId: number): Promise<number> {
  const [row] = await db
    .select({ v: pageVersionsTable.versionNumber })
    .from(pageVersionsTable)
    .where(eq(pageVersionsTable.pageId, pageId))
    .orderBy(desc(pageVersionsTable.versionNumber))
    .limit(1);
  return (row?.v ?? 0) + 1;
}

function contentEquals(
  a: Pick<PageVersionRow, "title" | "seoTitle" | "seoDescription" | "sections">,
  b: Pick<PageVersionRow, "title" | "seoTitle" | "seoDescription" | "sections">,
): boolean {
  const norm = (v: Pick<PageVersionRow, "title" | "seoTitle" | "seoDescription" | "sections">) =>
    JSON.stringify({
      t: v.title,
      st: v.seoTitle ?? null,
      sd: v.seoDescription ?? null,
      s: [...v.sections].sort((x, y) => x.sortOrder - y.sortOrder),
    });
  return norm(a) === norm(b);
}

/**
 * Return the page's working draft, lazily creating it. For pages published
 * before versioning existed, the current live content is first captured as a
 * published version so history is never empty.
 */
export async function ensureDraftVersion(page: PageRow): Promise<PageVersionRow> {
  const existing = await getDraftVersion(page.id);
  if (existing) return existing;

  let published = await getPublishedVersion(page.id);

  if (!published && page.status === "published") {
    const liveSections = await db
      .select()
      .from(pageSectionsTable)
      .where(eq(pageSectionsTable.pageId, page.id))
      .orderBy(asc(pageSectionsTable.sortOrder));
    const snapshot: SectionSnapshot[] = liveSections.map((s) => ({
      type: s.type,
      sortOrder: s.sortOrder,
      data: s.data ?? {},
    }));
    const [row] = await db
      .insert(pageVersionsTable)
      .values({
        pageId: page.id,
        versionNumber: 1,
        state: "published",
        title: page.title,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        sections: snapshot,
        note: "Imported from live content",
      })
      .returning();
    published = row;
  }

  const versionNumber = await nextVersionNumber(page.id);
  const [draft] = await db
    .insert(pageVersionsTable)
    .values({
      pageId: page.id,
      versionNumber,
      state: "draft",
      title: published?.title ?? page.title,
      seoTitle: published?.seoTitle ?? page.seoTitle,
      seoDescription: published?.seoDescription ?? page.seoDescription,
      sections: published?.sections ?? [],
      note: null,
    })
    .returning();
  return draft as PageVersionRow;
}

export async function saveDraft(
  page: PageRow,
  input: {
    title: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    sections: AdminSectionDto[];
  },
): Promise<PageVersionRow> {
  const draft = await ensureDraftVersion(page);
  const [updated] = await db
    .update(pageVersionsTable)
    .set({
      title: input.title,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      sections: dtoToSnapshot(input.sections),
    })
    .where(eq(pageVersionsTable.id, draft.id))
    .returning();
  return updated as PageVersionRow;
}

/** Promote the working draft to published, syncing the public live tables. */
export async function publishDraft(page: PageRow): Promise<PageRow> {
  const draft = await ensureDraftVersion(page);
  return db.transaction(async (tx) => {
    await tx
      .update(pageVersionsTable)
      .set({ state: "archived" })
      .where(and(eq(pageVersionsTable.pageId, page.id), eq(pageVersionsTable.state, "published")));
    await tx
      .update(pageVersionsTable)
      .set({ state: "published" })
      .where(eq(pageVersionsTable.id, draft.id));
    const [updated] = await tx
      .update(pagesTable)
      .set({
        title: draft.title,
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        status: "published",
      })
      .where(eq(pagesTable.id, page.id))
      .returning();
    await tx.delete(pageSectionsTable).where(eq(pageSectionsTable.pageId, page.id));
    if (draft.sections.length > 0) {
      await tx.insert(pageSectionsTable).values(
        draft.sections.map((s) => ({
          pageId: page.id,
          type: s.type,
          sortOrder: s.sortOrder,
          data: s.data ?? {},
        })),
      );
    }
    return updated as PageRow;
  });
}

export async function restoreVersion(page: PageRow, versionId: number): Promise<PageVersionRow> {
  const [target] = await db
    .select()
    .from(pageVersionsTable)
    .where(and(eq(pageVersionsTable.id, versionId), eq(pageVersionsTable.pageId, page.id)));
  if (!target) {
    throw new NotFoundError("Version not found");
  }
  // Restore creates a NEW draft snapshot rather than overwriting the working
  // draft in place, so the prior draft is preserved in history (archived) and
  // the restore itself is an auditable version.
  return db.transaction(async (tx) => {
    await tx
      .update(pageVersionsTable)
      .set({ state: "archived" })
      .where(and(eq(pageVersionsTable.pageId, page.id), eq(pageVersionsTable.state, "draft")));
    const [maxRow] = await tx
      .select({ v: pageVersionsTable.versionNumber })
      .from(pageVersionsTable)
      .where(eq(pageVersionsTable.pageId, page.id))
      .orderBy(desc(pageVersionsTable.versionNumber))
      .limit(1);
    const versionNumber = (maxRow?.v ?? 0) + 1;
    const [draft] = await tx
      .insert(pageVersionsTable)
      .values({
        pageId: page.id,
        versionNumber,
        state: "draft",
        title: target.title,
        seoTitle: target.seoTitle,
        seoDescription: target.seoDescription,
        sections: target.sections,
        note: `Restored from v${target.versionNumber}`,
      })
      .returning();
    return draft as PageVersionRow;
  });
}

export class NotFoundError extends Error {}

// --- Publish validation --------------------------------------------------

/** Result of validating whether a draft version may be published. */
export interface PublishValidation {
  ok: boolean;
  /** Human-readable list of problems; empty when ok. */
  issues: string[];
}

/**
 * Recursively test whether a JSON value carries any meaningful (non-whitespace)
 * content. Numbers/booleans count as content; strings must be non-blank.
 */
function hasMeaningfulValue(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return value === true;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(hasMeaningfulValue);
  }
  return false;
}

/**
 * True when `value` is an array with at least one entry that itself carries
 * meaningful content. Array-driven renderers call `.map()` over these fields,
 * so an absent/empty array (or an array of blank objects) renders nothing —
 * and for renderers without a null-guard, an absent array throws at runtime.
 */
function hasNonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.some(hasMeaningfulValue);
}

/**
 * Pragmatic per-type check that a single section has enough content to render
 * meaningfully. Each case mirrors what the matching renderer in
 * artifacts/oxot-web/src/components/sections/*.tsx actually needs to produce
 * visible output (fields it maps over must be non-empty arrays; text-led
 * sections must have their headline/body). Unknown types fall back to the
 * sensible default of "at least one non-empty field anywhere in `data`".
 *
 * Per-type rules (derived from the renderers):
 *  - hero            → title (rendered as <h1>)
 *  - cta             → title (rendered as <h2>)
 *  - feature_grid    → non-empty `features` array (renderer maps over it)
 *  - two_column      → title OR body (both are rendered text)
 *  - comparison_table→ non-empty `columns` AND non-empty `rows` (renderer
 *                      returns null unless both are present)
 *  - steps           → non-empty `steps` array (renderer returns null otherwise)
 *  - stat_band       → non-empty `stats` array (renderer returns null otherwise)
 *  - faq             → non-empty `items` array (renderer returns null otherwise)
 *  - logo_wall       → non-empty `logos` array (renderer returns null otherwise)
 *  - quote           → `quote` text (rendered as the blockquote)
 */
function isSectionMeaningful(section: SectionSnapshot): boolean {
  const data = section.data ?? {};
  const has = (key: string) => hasMeaningfulValue(data[key]);
  const hasArray = (key: string) => hasNonEmptyArray(data[key]);
  switch (section.type) {
    // Text-led hero/cta: the headline is the minimum visible content.
    case "hero":
    case "cta":
      return has("title");
    // feature_grid renders a header plus a grid built from `features.map()`.
    // Without a non-empty `features` array the grid is blank (and the renderer
    // has no null-guard, so a missing array would throw).
    case "feature_grid":
      return hasArray("features");
    // two_column renders a title and a body paragraph side-by-side.
    case "two_column":
      return has("title") || has("body");
    // comparison_table renders nothing unless BOTH columns and rows exist.
    case "comparison_table":
      return hasArray("columns") && hasArray("rows");
    // steps renders nothing without at least one step.
    case "steps":
      return hasArray("steps");
    // stat_band renders nothing without at least one stat.
    case "stat_band":
      return hasArray("stats");
    // faq renders nothing without at least one Q&A item.
    case "faq":
      return hasArray("items");
    // logo_wall renders nothing without at least one logo.
    case "logo_wall":
      return hasArray("logos");
    // quote's blockquote is the required content.
    case "quote":
      return has("quote");
    // Default: any non-empty field is enough to treat the section as content.
    default:
      return hasMeaningfulValue(data);
  }
}

/**
 * Validate that a draft version is safe to publish: it must have a non-empty
 * title AND at least one section that carries meaningful (non-blank) content.
 * Returns the list of issues so callers can surface a clear 400 error. This is
 * the single guard for the publish path — because version restore only creates
 * a draft (it never publishes directly), validating here also covers the
 * restore→publish flow.
 */
export function validateDraftForPublish(
  draft: Pick<PageVersionRow, "title" | "sections">,
): PublishValidation {
  const issues: string[] = [];

  if (!draft.title || draft.title.trim().length === 0) {
    issues.push("Title is required.");
  }

  const sections = draft.sections ?? [];
  if (sections.length === 0) {
    issues.push("Page has no sections.");
  } else if (!sections.some(isSectionMeaningful)) {
    issues.push("All sections are empty — at least one section must have content.");
  }

  return { ok: issues.length === 0, issues };
}

export async function buildAdminPage(page: PageRow, draft: PageVersionRow): Promise<AdminPageDto> {
  const published = await getPublishedVersion(page.id);
  const hasUnpublishedChanges = !published || !contentEquals(draft, published);
  return {
    id: page.id,
    slug: page.slug,
    title: draft.title,
    locale: page.locale,
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    status: page.status === "published" ? "published" : "draft",
    hasUnpublishedChanges,
    sections: snapshotToDto(draft.sections),
    updatedAt: draft.updatedAt.toISOString(),
  };
}

export interface AdminPageSummaryDto {
  id: number;
  slug: string;
  title: string;
  locale: string;
  status: "draft" | "published";
  hasUnpublishedChanges: boolean;
  updatedAt: string;
}

/** Lightweight summary that does not create draft rows (safe for GET lists). */
export async function buildAdminPageSummary(page: PageRow): Promise<AdminPageSummaryDto> {
  const draft = await getDraftVersion(page.id);
  const published = await getPublishedVersion(page.id);
  const status: "draft" | "published" = page.status === "published" ? "published" : "draft";
  const hasUnpublishedChanges = draft
    ? !published || !contentEquals(draft, published)
    : status !== "published";
  return {
    id: page.id,
    slug: page.slug,
    title: draft?.title ?? page.title,
    locale: page.locale,
    status,
    hasUnpublishedChanges,
    updatedAt: (draft?.updatedAt ?? page.updatedAt).toISOString(),
  };
}
