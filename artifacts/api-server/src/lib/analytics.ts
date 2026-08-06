import { and, desc, eq, gte, sql } from "drizzle-orm";
import {
  db,
  pageViewsTable,
  linkClicksTable,
  affiliateLinksTable,
  pagesTable,
} from "@workspace/db";
import { getLlmConfig, resolveGenerationModel } from "./models";
import { generateJson, BRAND_CONTEXT } from "./aiContent";

export interface RecordPageViewInput {
  path: string;
  locale?: string | null;
  sessionId?: string | null;
  referrer?: string | null;
  device?: string | null;
}

export async function recordPageView(input: RecordPageViewInput): Promise<void> {
  await db.insert(pageViewsTable).values({
    path: input.path,
    locale: input.locale === "nl" ? "nl" : "en",
    sessionId: input.sessionId ?? null,
    referrer: input.referrer ?? null,
    device: input.device ?? null,
  });
}

export interface AnalyticsOverview {
  rangeDays: number;
  totalViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  viewsByDay: { date: string; views: number }[];
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  linkPerformance: { linkId: number; name: string; clicks: number }[];
}

export async function getAnalyticsOverview(days: number): Promise<AnalyticsOverview> {
  const rangeDays = Number.isFinite(days) && days > 0 ? Math.min(Math.floor(days), 365) : 30;
  const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);

  const [totals] = await db
    .select({
      views: sql<number>`count(*)::int`,
      uniques: sql<number>`count(distinct ${pageViewsTable.sessionId})::int`,
    })
    .from(pageViewsTable)
    .where(gte(pageViewsTable.createdAt, since));

  const [clickTotals] = await db
    .select({ clicks: sql<number>`count(*)::int` })
    .from(linkClicksTable)
    .where(gte(linkClicksTable.createdAt, since));

  const dayExpr = sql`date_trunc('day', ${pageViewsTable.createdAt})`;
  const viewsByDay = await db
    .select({
      date: sql<string>`to_char(${dayExpr}, 'YYYY-MM-DD')`,
      views: sql<number>`count(*)::int`,
    })
    .from(pageViewsTable)
    .where(gte(pageViewsTable.createdAt, since))
    .groupBy(dayExpr)
    .orderBy(dayExpr);

  const topPages = await db
    .select({
      path: pageViewsTable.path,
      views: sql<number>`count(*)::int`,
    })
    .from(pageViewsTable)
    .where(gte(pageViewsTable.createdAt, since))
    .groupBy(pageViewsTable.path)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const referrerExpr = sql<string>`coalesce(nullif(${pageViewsTable.referrer}, ''), 'Direct')`;
  const topReferrers = await db
    .select({
      referrer: referrerExpr,
      count: sql<number>`count(*)::int`,
    })
    .from(pageViewsTable)
    .where(gte(pageViewsTable.createdAt, since))
    .groupBy(referrerExpr)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const deviceExpr = sql<string>`coalesce(nullif(${pageViewsTable.device}, ''), 'unknown')`;
  const deviceBreakdown = await db
    .select({
      device: deviceExpr,
      count: sql<number>`count(*)::int`,
    })
    .from(pageViewsTable)
    .where(gte(pageViewsTable.createdAt, since))
    .groupBy(deviceExpr)
    .orderBy(desc(sql`count(*)`));

  const linkPerformance = await db
    .select({
      linkId: affiliateLinksTable.id,
      name: affiliateLinksTable.name,
      clicks: sql<number>`count(${linkClicksTable.id})::int`,
    })
    .from(affiliateLinksTable)
    .leftJoin(
      linkClicksTable,
      and(
        eq(linkClicksTable.affiliateLinkId, affiliateLinksTable.id),
        gte(linkClicksTable.createdAt, since),
      ),
    )
    .groupBy(affiliateLinksTable.id, affiliateLinksTable.name)
    .orderBy(desc(sql`count(${linkClicksTable.id})`));

  return {
    rangeDays,
    totalViews: Number(totals?.views ?? 0),
    uniqueVisitors: Number(totals?.uniques ?? 0),
    totalClicks: Number(clickTotals?.clicks ?? 0),
    viewsByDay: viewsByDay.map((r) => ({ date: r.date, views: Number(r.views) })),
    topPages: topPages.map((r) => ({ path: r.path, views: Number(r.views) })),
    topReferrers: topReferrers.map((r) => ({ referrer: r.referrer, count: Number(r.count) })),
    deviceBreakdown: deviceBreakdown.map((r) => ({ device: r.device, count: Number(r.count) })),
    linkPerformance: linkPerformance.map((r) => ({
      linkId: r.linkId,
      name: r.name,
      clicks: Number(r.clicks),
    })),
  };
}

export interface AnalyticsRecommendations {
  contentIdeas: { title: string; rationale: string }[];
  placementIdeas: { linkName: string; keyword: string; suggestion: string }[];
  generatedAt: string;
}

export async function getAnalyticsRecommendations(): Promise<AnalyticsRecommendations> {
  const overview = await getAnalyticsOverview(30);
  const pages = await db
    .select({ slug: pagesTable.slug, title: pagesTable.title, locale: pagesTable.locale, status: pagesTable.status })
    .from(pagesTable)
    .where(eq(pagesTable.status, "published"));
  const links = await db
    .select({ name: affiliateLinksTable.name, description: affiliateLinksTable.description })
    .from(affiliateLinksTable)
    .where(eq(affiliateLinksTable.active, true));

  const generatedAt = new Date().toISOString();

  try {
    const config = await getLlmConfig();
    const model = resolveGenerationModel(config.briefModel);
    const system = `You are a growth strategist for OXOT. ${BRAND_CONTEXT}
Given traffic analytics, the existing published pages, and the available partner links, propose:
1. New content topics that would attract and convert OXOT's audience (fill gaps, expand on popular pages).
2. Where to place partner links for relevance and revenue.
Return ONLY JSON: { "contentIdeas": [{"title": string, "rationale": string}], "placementIdeas": [{"linkName": string, "keyword": string, "suggestion": string}] }.
Give 3-5 content ideas and up to 5 placement ideas. Base "linkName" on the provided partner links only.`;
    const user = JSON.stringify({
      topPages: overview.topPages,
      totalViews: overview.totalViews,
      uniqueVisitors: overview.uniqueVisitors,
      publishedPages: pages,
      partnerLinks: links,
    });
    const result = (await generateJson(model, system, user, 2000)) as {
      contentIdeas?: unknown;
      placementIdeas?: unknown;
    };
    const contentIdeas = Array.isArray(result.contentIdeas)
      ? result.contentIdeas
          .filter((c): c is { title: string; rationale: string } =>
            Boolean(c) && typeof c === "object" && typeof (c as { title?: unknown }).title === "string",
          )
          .map((c) => ({ title: String(c.title), rationale: String(c.rationale ?? "") }))
      : [];
    const placementIdeas = Array.isArray(result.placementIdeas)
      ? result.placementIdeas
          .filter((p): p is { linkName: string; keyword: string; suggestion: string } =>
            Boolean(p) && typeof p === "object" && typeof (p as { linkName?: unknown }).linkName === "string",
          )
          .map((p) => ({
            linkName: String(p.linkName),
            keyword: String(p.keyword ?? ""),
            suggestion: String(p.suggestion ?? ""),
          }))
      : [];
    return { contentIdeas, placementIdeas, generatedAt };
  } catch {
    return { contentIdeas: [], placementIdeas: [], generatedAt };
  }
}
