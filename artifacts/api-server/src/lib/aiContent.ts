import { openai } from "./llm";
import { getLlmConfig, resolveGenerationModel } from "./models";
import type { AdminSectionDto } from "./cms";

export const ALLOWED_SECTION_TYPES = [
  "hero",
  "stat_band",
  "feature_grid",
  "two_column",
  "comparison_table",
  "steps",
  "logo_wall",
  "faq",
  "quote",
  "cta",
] as const;

const SECTION_SCHEMA = `Section "data" shapes (use ONLY these; keep hrefs as "#" unless a real path is known; icon = a lucide-react icon name):
- hero: { eyebrow?, title, subtitle, primaryCta:{label,href}, secondaryCta?:{label,href}, bullets?:string[] }
- stat_band: { stats:[{value,label,sublabel?}] }
- feature_grid: { eyebrow?, title, subtitle?, features:[{title,description,icon?}] }
- two_column: { eyebrow?, title, body, bullets?:string[], cta?:{label,href}, reverse?:boolean }
- comparison_table: { eyebrow?, title, subtitle?, columns:string[], rows:[{label,values:(string|boolean)[]}] }
- steps: { eyebrow?, title, steps:[{number,title,description}] }
- logo_wall: { title?, logos:[{name}] }
- faq: { eyebrow?, title, items:[{question,answer}] }
- quote: { quote, author, role? }
- cta: { title, subtitle, primaryCta:{label,href}, secondaryCta?:{label,href} }`;

export const BRAND_CONTEXT = `OXOT is a European consulting firm that helps manufacturers achieve compliance with the EU Cyber Resilience Act (CRA), the AI Act, the Machinery Regulation, and IEC 62443. Tone: authoritative, precise, reassuring to engineering and compliance leaders. Avoid hype and generic filler.`;

export function parseJsonLoose(text: string): unknown {
  const cleaned = text
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("The model did not return valid JSON.");
  }
}

export async function generateJson(model: string, system: string, user: string, maxTokens: number): Promise<unknown> {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_completion_tokens: maxTokens,
  });
  const text = response.choices[0]?.message?.content ?? "";
  return parseJsonLoose(text);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "page";
}

function normalizeSections(raw: unknown): AdminSectionDto[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set<string>(ALLOWED_SECTION_TYPES);
  return raw
    .filter((s): s is { type: string; data?: unknown } => Boolean(s) && typeof s === "object" && allowed.has((s as { type?: string }).type ?? ""))
    .map((s, i) => ({
      type: s.type,
      order: i,
      data: (s.data && typeof s.data === "object" ? (s.data as Record<string, unknown>) : {}),
    }));
}

export interface WizardInput {
  topic: string;
  persona?: string | null;
  cta?: string | null;
  tone?: string | null;
  locale: "en" | "nl";
  sections?: string[];
  blueprintConfig?: Record<string, unknown> | null;
}

export interface WizardOutput {
  title: string;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: AdminSectionDto[];
}

const DEFAULT_BLUEPRINT = ["hero", "feature_grid", "two_column", "comparison_table", "faq", "cta"];

export async function generatePageDraft(input: WizardInput): Promise<WizardOutput> {
  const config = await getLlmConfig();
  const model = resolveGenerationModel(config.briefModel);
  const blueprint = input.sections && input.sections.length > 0 ? input.sections : DEFAULT_BLUEPRINT;
  const language = input.locale === "nl" ? "Dutch (nl)" : "English (en)";

  const system = `You are a senior B2B copywriter and landing-page strategist for OXOT. ${BRAND_CONTEXT}
Write all copy in ${language}. ${SECTION_SCHEMA}
Return ONLY a JSON object: { "title": string, "slug": string, "seoTitle": string, "seoDescription": string, "sections": [{ "type": string, "data": object }] }.
Use the requested section order. Make copy specific, credible, and conversion-focused.`;

  const user = `Create a landing page.
Topic/offer: ${input.topic}
Target persona: ${input.persona || "compliance and engineering decision-makers at manufacturers"}
Primary call to action: ${input.cta || "Book a compliance consultation"}
Tone: ${input.tone || "authoritative and reassuring"}
Section order to produce: ${blueprint.join(", ")}`;

  const result = (await generateJson(model, system, user, 6000)) as {
    title?: string;
    slug?: string;
    seoTitle?: string;
    seoDescription?: string;
    sections?: unknown;
  };

  const title = (result.title || input.topic).trim();
  return {
    title,
    slug: result.slug ? slugify(result.slug) : slugify(title),
    seoTitle: result.seoTitle?.trim() || null,
    seoDescription: result.seoDescription?.trim() || null,
    sections: normalizeSections(result.sections),
  };
}

export interface TranslateInput {
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: AdminSectionDto[];
  sourceLocale: "en" | "nl";
  targetLocale: "en" | "nl";
}

export interface TranslateOutput {
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: AdminSectionDto[];
}

export async function translatePageContent(input: TranslateInput): Promise<TranslateOutput> {
  const config = await getLlmConfig();
  const model = resolveGenerationModel(config.translationModel);
  const targetLanguage = input.targetLocale === "nl" ? "Dutch (nl)" : "English (en)";

  const system = `You are a professional translator localizing marketing content for OXOT. ${BRAND_CONTEXT}
Translate all human-readable text into ${targetLanguage}. Preserve the exact JSON structure and all keys.
DO NOT translate: URLs/hrefs, lucide icon names (the "icon" field), numeric values, or boolean values.
Keep tone and meaning; adapt idioms naturally. Return ONLY the JSON object with the same shape as the input.`;

  const payload = {
    title: input.title,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    sections: input.sections.map((s) => ({ type: s.type, data: s.data })),
  };

  const user = `Translate this content from ${input.sourceLocale} to ${input.targetLocale}:\n${JSON.stringify(payload)}`;

  const result = (await generateJson(model, system, user, 8000)) as {
    title?: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    sections?: unknown;
  };

  // Preserve original ordering/types; only text within data is translated.
  const translatedSections = normalizeSections(result.sections);
  return {
    title: result.title?.trim() || input.title,
    seoTitle: result.seoTitle?.trim() || null,
    seoDescription: result.seoDescription?.trim() || null,
    sections: translatedSections.length > 0 ? translatedSections : input.sections,
  };
}
