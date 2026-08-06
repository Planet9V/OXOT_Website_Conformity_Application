import { openai, CHAT_MODEL } from "./llm";
import { BRAND_CONTEXT } from "./aiContent";
import { CitationRegistry, validateMarkers } from "./reportCitations";
import type { ReportCitation } from "@workspace/db";

/**
 * AI narrative drafting for the executive reporting suite.
 *
 * Each AI section is drafted independently (so it can be regenerated
 * independently) from the report's FROZEN data snapshot plus the numbered
 * citation list. The model may only cite from that list; validateMarkers()
 * strips anything else, so a hallucinated reference can never reach a reader.
 */

export type AiSectionSpec = {
  key: string;
  heading: string;
  /** Section-specific instruction appended to the shared prompt. */
  brief: string;
  maxTokens: number;
};

export type ReportPromptContext = {
  scope: "assessment" | "portfolio";
  format: "briefing" | "full" | "readout";
  audience: "board" | "regulator";
  /** Serializable snapshot the section must be grounded in. */
  snapshot: Record<string, unknown>;
  citations: ReportCitation[];
};

const AUDIENCE_REGISTER: Record<ReportPromptContext["audience"], string> = {
  board:
    "Audience: the board of directors. Write in a crisp boardroom register — plain business English, risk and decision framing, no legal jargon without a one-clause translation, no filler. Surface commercial exposure, statutory deadlines and the decisions leadership must take.",
  regulator:
    "Audience: a market-surveillance authority / notified-body reviewer. Write in a formal, precise regulatory register. Reference obligations at article/annex level via the numbered sources, maintain strict traceability between claims and evidence, and avoid promotional language entirely.",
};

const FORMAT_SHAPE: Record<ReportPromptContext["format"], string> = {
  briefing:
    "This is an executive briefing: the section should be tight (roughly 120–220 words), declarative, and lead with the conclusion.",
  full:
    "This is a long-form professional report in an academic register: well-developed paragraphs (roughly 250–450 words), measured argumentation, in-text [n] citations where a claim rests on a legal obligation, standard or recorded evidence.",
  readout:
    "This is a meeting readout page: a one-line headline in bold, then 3–5 punchy bullet points (max ~15 words each). No paragraphs.",
};

export function buildSectionPrompt(ctx: ReportPromptContext, spec: AiSectionSpec): { system: string; user: string } {
  const system = [
    BRAND_CONTEXT,
    "You are OXOT's senior conformity analyst drafting one section of a client compliance report on the EU Cyber Resilience Act.",
    AUDIENCE_REGISTER[ctx.audience],
    FORMAT_SHAPE[ctx.format],
    "Hard rules:",
    "- Use ONLY facts present in DATA. Never invent figures, dates, findings or vendor names.",
    "- Cite ONLY from SOURCES, using bare in-text markers like [2] immediately after the claim they support. Do not fabricate reference numbers, do not add a references list — the report renders one.",
    "- Use British English. Do not use tables. Do not repeat the section heading — it is rendered for you.",
    "- Output plain markdown (paragraphs, bold, bullet lists only).",
  ].join("\n");
  const sourcesBlock = ctx.citations.length
    ? ctx.citations.map((c) => `[${c.n}] ${c.label}`).join("\n")
    : "(none — write without citations)";
  const user = [
    `SECTION: ${spec.heading}`,
    `BRIEF: ${spec.brief}`,
    "",
    "SOURCES:",
    sourcesBlock,
    "",
    "DATA:",
    JSON.stringify(ctx.snapshot),
  ].join("\n");
  return { system, user };
}

/** Drafts one section; returns validated markdown plus any stripped markers. */
export async function draftSection(
  ctx: ReportPromptContext,
  spec: AiSectionSpec,
): Promise<{ contentMd: string; note?: string }> {
  const { system, user } = buildSectionPrompt(ctx, spec);
  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_completion_tokens: spec.maxTokens,
  });
  const raw = (response.choices[0]?.message?.content ?? "").trim();
  if (!raw) throw new Error("The model returned an empty section draft.");
  const { text, stripped } = validateMarkers(raw, ctx.citations);
  const note =
    stripped.length > 0
      ? `Removed ${stripped.length} unverifiable citation marker(s): ${stripped.map((n) => `[${n}]`).join(", ")}.`
      : undefined;
  return { contentMd: text, ...(note ? { note } : {}) };
}
