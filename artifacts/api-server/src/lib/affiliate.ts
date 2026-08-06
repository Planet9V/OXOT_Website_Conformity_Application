import { asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  affiliateLinksTable,
  affiliateKeywordsTable,
  linkClicksTable,
  pagesTable,
  pageSectionsTable,
  type AffiliateLinkRow,
  type AffiliateKeywordRow,
} from "@workspace/db";
import {
  getDraftVersion,
  getPublishedVersion,
  ensureDraftVersion,
  buildAdminPage,
  saveDraft,
  snapshotToDto,
  NotFoundError,
  type AdminSectionDto,
  type AdminPageDto,
} from "./cms";
import { getLlmConfig, resolveGenerationModel } from "./models";
import { generateJson, BRAND_CONTEXT } from "./aiContent";

/** The public tracking-redirect href an affiliate anchor points at. */
export function affiliateHref(linkId: number): string {
  return `/api/go/${linkId}`;
}

export interface AffiliateKeywordDto {
  id: number;
  keyword: string;
  locale: string;
  active: boolean;
}

export interface AffiliateLinkDto {
  id: number;
  name: string;
  targetUrl: string;
  description: string | null;
  sponsored: boolean;
  active: boolean;
  clickCount: number;
  keywords: AffiliateKeywordDto[];
  createdAt: string;
  updatedAt: string;
}

function toKeywordDto(row: AffiliateKeywordRow): AffiliateKeywordDto {
  return { id: row.id, keyword: row.keyword, locale: row.locale, active: row.active };
}

function toLinkDto(
  row: AffiliateLinkRow,
  keywords: AffiliateKeywordRow[],
  clickCount: number,
): AffiliateLinkDto {
  return {
    id: row.id,
    name: row.name,
    targetUrl: row.targetUrl,
    description: row.description,
    sponsored: row.sponsored,
    active: row.active,
    clickCount,
    keywords: keywords.map(toKeywordDto),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface AffiliateKeywordInput {
  keyword: string;
  locale?: string;
  active?: boolean;
}

export interface AffiliateLinkInput {
  name: string;
  targetUrl: string;
  description?: string | null;
  sponsored?: boolean;
  active?: boolean;
  keywords: AffiliateKeywordInput[];
}

function normalizeKeywords(keywords: AffiliateKeywordInput[]): AffiliateKeywordInput[] {
  const seen = new Set<string>();
  const out: AffiliateKeywordInput[] = [];
  for (const k of keywords) {
    const keyword = (k.keyword ?? "").trim();
    if (!keyword) continue;
    const locale = k.locale === "nl" ? "nl" : "en";
    const dedupeKey = `${locale}:${keyword.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push({ keyword, locale, active: k.active !== false });
  }
  return out;
}

export async function listAffiliateLinks(): Promise<AffiliateLinkDto[]> {
  const links = await db
    .select()
    .from(affiliateLinksTable)
    .orderBy(desc(affiliateLinksTable.createdAt));
  const keywords = await db.select().from(affiliateKeywordsTable);
  const counts = await db
    .select({
      linkId: linkClicksTable.affiliateLinkId,
      c: sql<number>`count(*)::int`,
    })
    .from(linkClicksTable)
    .groupBy(linkClicksTable.affiliateLinkId);

  const countMap = new Map(counts.map((r) => [r.linkId, Number(r.c)]));
  const kwByLink = new Map<number, AffiliateKeywordRow[]>();
  for (const k of keywords) {
    const list = kwByLink.get(k.affiliateLinkId) ?? [];
    list.push(k);
    kwByLink.set(k.affiliateLinkId, list);
  }
  return links.map((l) => toLinkDto(l, kwByLink.get(l.id) ?? [], countMap.get(l.id) ?? 0));
}

async function getLinkDto(id: number): Promise<AffiliateLinkDto | undefined> {
  const [link] = await db.select().from(affiliateLinksTable).where(eq(affiliateLinksTable.id, id));
  if (!link) return undefined;
  const keywords = await db
    .select()
    .from(affiliateKeywordsTable)
    .where(eq(affiliateKeywordsTable.affiliateLinkId, id));
  const [countRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(linkClicksTable)
    .where(eq(linkClicksTable.affiliateLinkId, id));
  return toLinkDto(link, keywords, Number(countRow?.c ?? 0));
}

export async function createAffiliateLink(input: AffiliateLinkInput): Promise<AffiliateLinkDto> {
  const keywords = normalizeKeywords(input.keywords ?? []);
  const created = await db.transaction(async (tx) => {
    const [link] = await tx
      .insert(affiliateLinksTable)
      .values({
        name: input.name.trim(),
        targetUrl: input.targetUrl.trim(),
        description: input.description?.trim() || null,
        sponsored: input.sponsored !== false,
        active: input.active !== false,
      })
      .returning();
    if (keywords.length > 0) {
      await tx.insert(affiliateKeywordsTable).values(
        keywords.map((k) => ({
          affiliateLinkId: link!.id,
          keyword: k.keyword,
          locale: k.locale ?? "en",
          active: k.active !== false,
        })),
      );
    }
    return link!;
  });
  return (await getLinkDto(created.id))!;
}

export async function updateAffiliateLink(
  id: number,
  input: AffiliateLinkInput,
): Promise<AffiliateLinkDto> {
  const [existing] = await db
    .select()
    .from(affiliateLinksTable)
    .where(eq(affiliateLinksTable.id, id));
  if (!existing) throw new NotFoundError("Affiliate link not found");
  const keywords = normalizeKeywords(input.keywords ?? []);
  await db.transaction(async (tx) => {
    await tx
      .update(affiliateLinksTable)
      .set({
        name: input.name.trim(),
        targetUrl: input.targetUrl.trim(),
        description: input.description?.trim() || null,
        sponsored: input.sponsored !== false,
        active: input.active !== false,
      })
      .where(eq(affiliateLinksTable.id, id));
    await tx.delete(affiliateKeywordsTable).where(eq(affiliateKeywordsTable.affiliateLinkId, id));
    if (keywords.length > 0) {
      await tx.insert(affiliateKeywordsTable).values(
        keywords.map((k) => ({
          affiliateLinkId: id,
          keyword: k.keyword,
          locale: k.locale ?? "en",
          active: k.active !== false,
        })),
      );
    }
  });
  return (await getLinkDto(id))!;
}

export async function deleteAffiliateLink(id: number): Promise<boolean> {
  const [deleted] = await db
    .delete(affiliateLinksTable)
    .where(eq(affiliateLinksTable.id, id))
    .returning();
  return Boolean(deleted);
}

/**
 * Resolves an affiliate link's destination URL and (by default) records the
 * click. Pass `{ record: false }` to resolve the target without counting the
 * click — used for bot/crawler traffic that must still be redirected but must
 * not inflate human click analytics. Returns null if the link is missing or
 * inactive.
 */
export async function recordClick(
  linkId: number,
  meta: { path?: string | null; locale?: string | null; sessionId?: string | null; referrer?: string | null },
  options: { record?: boolean } = {},
): Promise<string | null> {
  const [link] = await db
    .select()
    .from(affiliateLinksTable)
    .where(eq(affiliateLinksTable.id, linkId));
  if (!link || !link.active) return null;
  if (options.record !== false) {
    await db.insert(linkClicksTable).values({
      affiliateLinkId: linkId,
      path: meta.path ?? null,
      locale: meta.locale ?? null,
      sessionId: meta.sessionId ?? null,
      referrer: meta.referrer ?? null,
    });
  }
  return link.targetUrl;
}

// --- AI-assisted link insertion ------------------------------------------

// Only section types whose text is markdown-rendered on the public site can
// carry inline affiliate links, so suggestion/insertion is limited to these.
const LINKABLE_TYPES = new Set(["two_column", "faq"]);

/** Markdown-rendered text fields for a linkable section, in document order. */
function linkableTexts(type: string, data: Record<string, unknown>): string[] {
  if (type === "two_column") {
    return typeof data["body"] === "string" ? [data["body"] as string] : [];
  }
  if (type === "faq") {
    const items = Array.isArray(data["items"]) ? data["items"] : [];
    return items
      .map((it) =>
        it && typeof it === "object" && typeof (it as { answer?: unknown }).answer === "string"
          ? ((it as { answer: string }).answer)
          : "",
      )
      .filter((s): s is string => s.length > 0);
  }
  return [];
}

function keywordRegex(keyword: string): RegExp {
  const esc = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${esc}\\b`, "i");
}

function snippetAround(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + length + 50);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

export interface LinkSuggestionDto {
  sectionIndex: number;
  sectionType: string;
  linkId: number;
  linkName: string;
  keyword: string;
  snippet: string;
}

export async function suggestAffiliateLinks(pageId: number): Promise<LinkSuggestionDto[]> {
  const [page] = await db.select().from(pagesTable).where(eq(pagesTable.id, pageId));
  if (!page) throw new NotFoundError("Page not found");
  const version = (await getDraftVersion(pageId)) ?? (await getPublishedVersion(pageId));
  let sections: AdminSectionDto[];
  if (version) {
    sections = snapshotToDto(version.sections);
  } else {
    // Pages published before versioning existed keep content only in the live
    // sections table; read it directly for a side-effect-free suggestion.
    const live = await db
      .select()
      .from(pageSectionsTable)
      .where(eq(pageSectionsTable.pageId, pageId))
      .orderBy(asc(pageSectionsTable.sortOrder));
    if (live.length === 0) throw new NotFoundError("Page has no content");
    sections = live.map((s) => ({ type: s.type, order: s.sortOrder, data: s.data ?? {} }));
  }

  const links = await db
    .select()
    .from(affiliateLinksTable)
    .where(eq(affiliateLinksTable.active, true));
  if (links.length === 0) return [];
  const linkById = new Map(links.map((l) => [l.id, l]));
  const keywords = await db.select().from(affiliateKeywordsTable);
  const activeKeywords = keywords.filter(
    (k) => k.active && k.locale === page.locale && linkById.has(k.affiliateLinkId),
  );
  if (activeKeywords.length === 0) return [];

  // Deterministic candidate matches (guarantees apply can find the text).
  const candidates: LinkSuggestionDto[] = [];
  const perSection = new Map<number, Set<string>>();
  sections.forEach((section, sectionIndex) => {
    if (!LINKABLE_TYPES.has(section.type)) return;
    const texts = linkableTexts(section.type, section.data);
    for (const text of texts) {
      if (text.includes("](/api/go/")) continue; // already has affiliate links
      for (const kw of activeKeywords) {
        const m = keywordRegex(kw.keyword).exec(text);
        if (!m) continue;
        const used = perSection.get(sectionIndex) ?? new Set<string>();
        if (used.has(kw.keyword.toLowerCase())) continue;
        used.add(kw.keyword.toLowerCase());
        perSection.set(sectionIndex, used);
        candidates.push({
          sectionIndex,
          sectionType: section.type,
          linkId: kw.affiliateLinkId,
          linkName: linkById.get(kw.affiliateLinkId)!.name,
          keyword: m[0],
          snippet: snippetAround(text, m.index, m[0].length),
        });
      }
    }
  });
  if (candidates.length === 0) return [];

  // Ask the model to keep only the placements that read naturally and are not
  // over-linked. Falls back to the deterministic candidates if the call fails.
  try {
    const config = await getLlmConfig();
    const model = resolveGenerationModel(config.briefModel);
    const indexed = candidates.map((c, i) => ({
      i,
      link: c.linkName,
      keyword: c.keyword,
      context: c.snippet,
    }));
    const system = `You are an editor placing sponsored partner links in B2B web copy for OXOT. ${BRAND_CONTEXT}
Keep only placements where the linked keyword is genuinely relevant to the partner and reads naturally, never spammy. Prefer at most one link per paragraph. Return ONLY JSON: { "keep": number[] } listing the indices to keep.`;
    const user = `Candidate placements:\n${JSON.stringify(indexed)}`;
    const result = (await generateJson(model, system, user, 1000)) as { keep?: unknown };
    if (Array.isArray(result.keep)) {
      const keep = new Set(result.keep.filter((n): n is number => typeof n === "number"));
      const filtered = candidates.filter((_, i) => keep.has(i));
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // fall through to deterministic candidates
  }
  return candidates;
}

export interface ApplyLinkInsertion {
  sectionIndex: number;
  linkId: number;
  keyword: string;
}

function insertMarkdownLink(text: string, keyword: string, href: string): string | null {
  if (text.includes(`](${href})`)) return null;
  const m = keywordRegex(keyword).exec(text);
  if (!m) return null;
  const matched = m[0];
  return `${text.slice(0, m.index)}[${matched}](${href})${text.slice(m.index + matched.length)}`;
}

function applyToSection(
  section: AdminSectionDto,
  keyword: string,
  href: string,
): boolean {
  if (section.type === "two_column") {
    const body = section.data["body"];
    if (typeof body === "string") {
      const next = insertMarkdownLink(body, keyword, href);
      if (next) {
        section.data["body"] = next;
        return true;
      }
    }
    return false;
  }
  if (section.type === "faq") {
    const items = Array.isArray(section.data["items"]) ? section.data["items"] : [];
    for (const item of items) {
      if (item && typeof item === "object" && typeof (item as { answer?: unknown }).answer === "string") {
        const rec = item as { answer: string };
        const next = insertMarkdownLink(rec.answer, keyword, href);
        if (next) {
          rec.answer = next;
          return true;
        }
      }
    }
  }
  return false;
}

export async function applyAffiliateLinks(
  pageId: number,
  insertions: ApplyLinkInsertion[],
): Promise<AdminPageDto> {
  const [page] = await db.select().from(pagesTable).where(eq(pagesTable.id, pageId));
  if (!page) throw new NotFoundError("Page not found");
  // ensureDraftVersion seeds a working draft from the published content if none
  // exists yet, so inserted links land in a draft the admin can review/publish.
  const draft = await ensureDraftVersion(page);
  const sections = snapshotToDto(draft.sections);

  for (const ins of insertions) {
    const section = sections[ins.sectionIndex];
    if (!section) continue;
    applyToSection(section, ins.keyword, affiliateHref(ins.linkId));
  }

  const saved = await saveDraft(page, {
    title: draft.title,
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    sections,
  });
  return buildAdminPage(page, saved);
}
