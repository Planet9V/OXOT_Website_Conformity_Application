import { desc, inArray } from "drizzle-orm";
import { db, regulatoryNewsCacheTable, type InsertRegulatoryNewsCache } from "@workspace/db";
import { getLlmConfig, getDbOpenRouterApiKey, resolveGenerationModel } from "./models";
import { getRegulatoryNewsConfig, updateRegulatoryNewsConfig } from "./integrationSettings";
import { logger } from "./logger";

const SEARCH_PROMPT =
  "Search live web for the 4 most recent, factual news items on EU Cyber Resilience Act (CRA) enforcement, ENISA technical guidelines, or CISA KEV advisories. Return strictly a JSON array of objects with keys: title, summary, fullArticle, complianceImpact, source, category, url, citations. Ensure fullArticle is a comprehensive 3-paragraph statutory analysis, complianceImpact gives key takeaways for manufacturers, and url is a valid HTTPS source link.";

export interface NewsGenerationResult {
  ok: boolean;
  inserted: number;
  model: string;
  reason?: string;
}

/**
 * Runs the OpenRouter live web search for CRA regulatory news, parses the
 * result, and appends any genuinely new items (deduplicated by title) to the
 * regulatory_news_cache. Shared by the on-demand `?refresh=true` route and the
 * daily scheduler. Never throws — returns a structured result.
 */
export async function generateRegulatoryNews(): Promise<NewsGenerationResult> {
  const llmConfig = await getLlmConfig(false);
  const searchModel = resolveGenerationModel(llmConfig, "searchModel") || "perplexity/sonar-pro";
  const apiKey = await getDbOpenRouterApiKey();
  if (!apiKey) return { ok: false, inserted: 0, model: searchModel, reason: "no_api_key" };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://oxot.ai",
        "X-Title": "OXOT Conformity Application",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: searchModel.includes("/") ? searchModel : `perplexity/${searchModel}`,
        messages: [{ role: "user", content: [{ type: "text", text: SEARCH_PROMPT }] }],
        max_tokens: 1800,
        temperature: 0.2,
      }),
    });
    clearTimeout(timeoutId);
    if (!resp.ok) return { ok: false, inserted: 0, model: searchModel, reason: `status_${resp.status}` };

    const data: any = await resp.json();
    const content: string = data.choices?.[0]?.message?.content || "";
    const citations: string[] = data.citations || data.choices?.[0]?.message?.citations || [];
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();

    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1) return { ok: false, inserted: 0, model: searchModel, reason: "no_json" };

    const rawParsed = JSON.parse(cleaned.substring(start, end + 1));
    const parsed: InsertRegulatoryNewsCache[] = (rawParsed as any[]).map((item, index) => {
      const itemUrl =
        item.url && String(item.url).startsWith("http") ? item.url : citations[index] || "https://eur-lex.europa.eu";
      const citationList = Array.isArray(item.citations)
        ? item.citations
        : citations.length > 0
          ? citations
          : [itemUrl];
      return {
        title: String(item.title || "EU CRA Compliance Update").replace(/\[\d+\]/g, "").trim(),
        summary: String(item.summary || "Latest regulatory compliance update.").replace(/\[\d+\]/g, "").trim(),
        fullArticle: String(item.fullArticle || item.summary || "").replace(/\[\d+\]/g, "").trim(),
        complianceImpact: String(item.complianceImpact || "Review Annex I compliance readiness.").replace(/\[\d+\]/g, "").trim(),
        citations: JSON.stringify(citationList),
        source: String(item.source || "ENISA / OpenRouter Search").trim(),
        category: String(item.category || "EU CRA").trim(),
        url: itemUrl,
        modelUsed: searchModel,
      };
    });
    if (parsed.length === 0) return { ok: false, inserted: 0, model: searchModel, reason: "empty" };

    // Deduplicate by title against what's already cached, so scheduled runs
    // grow the corpus instead of piling up repeats.
    const titles = parsed.map((p) => p.title);
    const dupes = titles.length
      ? await db
          .select({ title: regulatoryNewsCacheTable.title })
          .from(regulatoryNewsCacheTable)
          .where(inArray(regulatoryNewsCacheTable.title, titles))
      : [];
    const seen = new Set(dupes.map((d) => d.title));
    const fresh = parsed.filter((p) => !seen.has(p.title));

    const now = new Date();
    for (const item of fresh) {
      await db.insert(regulatoryNewsCacheTable).values({ ...item, publishedAt: now });
    }
    logger.info({ fetched: parsed.length, inserted: fresh.length, model: searchModel }, "Regulatory news generated");
    return { ok: true, inserted: fresh.length, model: searchModel };
  } catch (err) {
    clearTimeout(timeoutId);
    logger.error({ err }, "Regulatory news generation failed");
    return { ok: false, inserted: 0, model: searchModel, reason: "exception" };
  }
}

/** The calendar day (YYYY-MM-DD) and hour in a given IANA timezone. */
function localDayHour(at: Date, timezone: string): { day: string; hour: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(at).map((p) => [p.type, p.value]));
  // en-CA yields hour "24" at midnight; normalise to 0.
  const hour = Number(parts.hour) % 24;
  return { day: `${parts.year}-${parts.month}-${parts.day}`, hour };
}

export interface ScheduleRunResult {
  ran: boolean;
  inserted?: number;
  reason?: string;
}

/**
 * Daily scheduler tick. Runs the news generation once per local calendar day,
 * at or after `hourLocal` (default 07:00) in `timezone` (default
 * America/Chicago), when enabled. `lastRunAt` in the config is the idempotency
 * guard so multiple ticks — or a restart — never double-run on the same day.
 */
export async function runRegulatoryNewsSchedule(now = new Date()): Promise<ScheduleRunResult> {
  const cfg = await getRegulatoryNewsConfig();
  if (!cfg.enabled) return { ran: false, reason: "disabled" };

  const timezone = cfg.timezone || "America/Chicago";
  const targetHour = Number.isInteger(cfg.hourLocal) ? (cfg.hourLocal as number) : 7;
  const { day, hour } = localDayHour(now, timezone);
  if (hour < targetHour) return { ran: false, reason: "before_target_hour" };

  const lastDay = cfg.lastRunAt ? localDayHour(new Date(cfg.lastRunAt), timezone).day : null;
  if (lastDay === day) return { ran: false, reason: "already_ran_today" };

  const result = await generateRegulatoryNews();
  await updateRegulatoryNewsConfig({ lastRunAt: now.toISOString() });
  return { ran: true, inserted: result.inserted };
}

/** Latest N cached items, newest first. */
export async function listRegulatoryNews(limit = 6) {
  return db
    .select()
    .from(regulatoryNewsCacheTable)
    .orderBy(desc(regulatoryNewsCacheTable.publishedAt))
    .limit(Math.min(Math.max(limit, 1), 200));
}
