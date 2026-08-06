/**
 * Workspace-aware conformity assistant ("Conformity Copilot").
 *
 * Separate from the public marketing chat (./chat.ts): this assistant is scoped
 * to ONE assessment and sees its live workspace state — product, wizard-derived
 * scope/class/route, the requirement gap worklist, evidence, generated artifacts,
 * readiness grade and open incidents — plus OXOT's regulatory knowledge base
 * (RAG over published pages). It streams a grounded reply as Server-Sent Events.
 *
 * Gated behind `requireAuth` (admin OR demo). Conversation history is supplied by
 * the client in the request body, so no conversation tables are needed here.
 */
import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq, inArray } from "drizzle-orm";
import type OpenAI from "openai";
import {
  db,
  conformityAssessmentsTable,
  conformityProductsTable,
  conformityEvaluationsTable,
  conformityEvidenceTable,
  conformityArtifactsTable,
  conformityGradesTable,
  conformityIncidentsTable,
  conformityBomsTable,
  conformityBomFindingsTable,
  requirementsTable,
} from "@workspace/db";
import { AskConformityAssistantBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/adminAuth";
import { openai, CHAT_MODEL } from "../lib/llm";
import { retrieveContext, retrieveWorkspaceContext } from "../lib/rag";
import { allowedVisibilities } from "../lib/visibility";
import { RateLimiter, clientKey } from "../lib/rateLimit";
import { ARTIFACT_LABELS, type ArtifactType } from "../lib/conformityEngine";

const router: IRouter = Router();

// Each message triggers an LLM call; limit per trusted IP (see chat.ts rationale).
const assistantLimiter = new RateLimiter({ windowMs: 60_000, max: 20 });

const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY_MESSAGES = 16;
// Cap each replayed history turn too: the client supplies history, so without a
// per-item bound a caller could inflate the prompt (token cost/latency) while
// staying under the message-count and current-message limits.
const MAX_HISTORY_ITEM_CHARS = 4000;
const MAX_OUTPUT_TOKENS = 1200;
const MAX_OPEN_GAPS = 12;

// Evaluation statuses that still need work (i.e. belong on the worklist).
const OPEN_STATUSES = new Set(["not_started", "in_progress", "partial", "not_met"]);

function parseId(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function tooMany(res: Response, retryAfterSeconds: number): void {
  res.setHeader("Retry-After", String(retryAfterSeconds));
  res.status(429).json({
    error: "You're sending messages a bit too quickly. Please wait a moment and try again.",
  });
}

/**
 * Assemble a compact, LLM-friendly snapshot of the assessment's live workspace.
 * Returns "" when the assessment does not exist.
 */
async function buildWorkspaceContext(assessmentId: number): Promise<string> {
  const [assessment] = await db
    .select()
    .from(conformityAssessmentsTable)
    .where(eq(conformityAssessmentsTable.id, assessmentId));
  if (!assessment) return "";

  const [product] = await db
    .select()
    .from(conformityProductsTable)
    .where(eq(conformityProductsTable.id, assessment.productId));

  const [evaluations, evidence, artifacts, grades, incidents, requirements] = await Promise.all([
    db.select().from(conformityEvaluationsTable).where(eq(conformityEvaluationsTable.assessmentId, assessmentId)),
    db.select().from(conformityEvidenceTable).where(eq(conformityEvidenceTable.assessmentId, assessmentId)),
    db.select().from(conformityArtifactsTable).where(eq(conformityArtifactsTable.assessmentId, assessmentId)),
    db
      .select()
      .from(conformityGradesTable)
      .where(eq(conformityGradesTable.assessmentId, assessmentId))
      .orderBy(desc(conformityGradesTable.computedAt))
      .limit(1),
    db.select().from(conformityIncidentsTable).where(eq(conformityIncidentsTable.assessmentId, assessmentId)),
    db
      .select({ refCode: requirementsTable.refCode, title: requirementsTable.title })
      .from(requirementsTable)
      .where(eq(requirementsTable.regulationKey, assessment.regulationKey)),
  ]);

  const reqTitleByRef = new Map<string, string>();
  for (const r of requirements) reqTitleByRef.set(r.refCode, r.title);

  const lines: string[] = [];
  lines.push(`Assessment #${assessment.id} — ${assessment.regulationKey.toUpperCase()}`);
  if (product) {
    lines.push(`Product: ${product.name}${product.version ? ` v${product.version}` : ""}`);
    if (product.productType) lines.push(`Product type: ${product.productType}`);
    if (product.intendedUse) lines.push(`Intended use: ${product.intendedUse}`);
    if (product.description) lines.push(`Description: ${product.description}`);
  }
  lines.push(`Stage: ${assessment.currentStage} | Status: ${assessment.status}`);
  lines.push(
    `Scope: ${assessment.scopeResult ?? "not yet determined"} | Class: ${assessment.classKey ?? "-"} | Route: ${assessment.routeKey ?? "-"}`,
  );

  const grade = grades[0];
  if (grade) {
    lines.push(
      `Readiness: grade ${grade.overallGrade} (${grade.overallScore}/100), ${grade.blockerCount} blocker(s).`,
    );
  }

  const statusCounts = new Map<string, number>();
  for (const e of evaluations) statusCounts.set(e.status, (statusCounts.get(e.status) ?? 0) + 1);
  if (evaluations.length > 0) {
    lines.push(
      `Requirements: ${evaluations.length} applicable (${Array.from(statusCounts.entries())
        .map(([s, n]) => `${n} ${s}`)
        .join(", ")}).`,
    );
    const open = evaluations.filter((e) => OPEN_STATUSES.has(e.status)).slice(0, MAX_OPEN_GAPS);
    if (open.length > 0) {
      lines.push("Open gaps (highest priority first):");
      for (const e of open) {
        const title = reqTitleByRef.get(e.requirementRefCode) ?? "";
        const risk = e.riskRating ? ` [${e.riskRating}]` : "";
        const owner = e.owner ? ` owner=${e.owner}` : "";
        const due = e.dueDate ? ` due=${e.dueDate}` : "";
        lines.push(`- ${e.requirementRefCode}${risk} ${title} — ${e.status}${owner}${due}`);
      }
    }
  } else {
    lines.push("Requirements: none instantiated yet.");
  }

  if (evidence.length > 0) {
    lines.push(`Evidence (${evidence.length}):`);
    for (const ev of evidence.slice(0, 12)) {
      const ref = ev.requirementRefCode ? ` [${ev.requirementRefCode}]` : "";
      const file = ev.fileName ? ` file=${ev.fileName}` : ev.url ? ` url=${ev.url}` : "";
      lines.push(`- ${ev.title} (${ev.evidenceType})${ref}${file}`);
    }
  } else {
    lines.push("Evidence: none attached yet.");
  }

  if (artifacts.length > 0) {
    lines.push("Artifacts:");
    for (const a of artifacts) {
      const sections = a.content?.sections ?? [];
      const complete = sections.filter((s) => s.complete).length;
      const label = ARTIFACT_LABELS[a.artifactType as ArtifactType] ?? a.artifactType;
      lines.push(`- ${label}: ${a.status} (${complete}/${sections.length} sections complete)`);
    }
  }

  const openIncidents = incidents.filter((i) => i.status === "open");
  if (openIncidents.length > 0) {
    lines.push(`Open incidents (${openIncidents.length}):`);
    for (const i of openIncidents.slice(0, 6)) {
      lines.push(`- ${i.title} [${i.severity}]`);
    }
  }

  // Compact BOM findings summary: severity counts + a few top findings across
  // all BOMs attached to this assessment (xBOM Vault results).
  const boms = await db
    .select({ id: conformityBomsTable.id })
    .from(conformityBomsTable)
    .where(eq(conformityBomsTable.assessmentId, assessmentId));
  if (boms.length > 0) {
    const findings = await db
      .select()
      .from(conformityBomFindingsTable)
      .where(inArray(conformityBomFindingsTable.bomId, boms.map((b) => b.id)))
      .limit(50);
    if (findings.length > 0) {
      const bySeverity = new Map<string, number>();
      for (const f of findings) bySeverity.set(f.severity, (bySeverity.get(f.severity) ?? 0) + 1);
      const severityOrder = ["critical", "high", "medium", "low", "info", "unknown"];
      const counts = severityOrder
        .filter((s) => bySeverity.has(s))
        .map((s) => `${bySeverity.get(s)} ${s}`)
        .join(", ");
      lines.push(`BOM findings (${findings.length} across ${boms.length} BOM(s)): ${counts}.`);
      const rank = (s: string) => {
        const i = severityOrder.indexOf(s);
        return i === -1 ? severityOrder.length : i;
      };
      const top = [...findings].sort((a, b) => rank(a.severity) - rank(b.severity)).slice(0, 6);
      for (const f of top) {
        const idf = f.identifier ? `${f.identifier} ` : "";
        lines.push(`- ${idf}${f.title} [${f.severity}]`);
      }
    }
  }

  return lines.join("\n");
}

function buildSystemPrompt(workspace: string, knowledge: string): string {
  return [
    "You are the OXOT Conformity Copilot — an expert EU product-compliance assistant embedded in a",
    "conformity workbench. You help the user drive ONE product assessment to auditor-ready across the",
    "EU Cyber Resilience Act (CRA), the EU AI Act, the Machinery Regulation and IEC 62443.",
    "",
    "You can see the live state of the user's workspace (below) plus OXOT's regulatory knowledge base.",
    "Be concise, concrete and action-oriented. When the user asks what is next or what is missing,",
    "reason from the OPEN GAPS, missing evidence and incomplete artifacts and give a short prioritised",
    "checklist (mandatory blockers and highest-risk items first). Cite requirement refCodes (e.g.",
    "CRA-ANX1-1) when relevant. Ground regulatory claims in the KNOWLEDGE section; if something is not",
    "covered there, say so plainly rather than inventing clauses, dates or penalties.",
    "",
    "=== WORKSPACE STATE ===",
    workspace || "(No workspace data available.)",
    "",
    "=== KNOWLEDGE (from OXOT's regulatory reference) ===",
    knowledge || "(No indexed knowledge retrieved for this query.)",
  ].join("\n");
}

router.post(
  "/conformity/assessments/:id/assistant",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid assessment id" });
      return;
    }

    const limit = assistantLimiter.hit(clientKey(req));
    if (!limit.allowed) {
      tooMany(res, limit.retryAfterSeconds);
      return;
    }

    const parsed = AskConformityAssistantBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const message = parsed.data.message.trim();
    if (!message) {
      res.status(400).json({ error: "Message cannot be empty" });
      return;
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      res.status(400).json({
        error: `Message is too long. Please keep it under ${MAX_MESSAGE_CHARS} characters.`,
      });
      return;
    }

    // requireAuth gates access; still confirm the assessment exists for a clean 404.
    const [assessment] = await db
      .select({ id: conformityAssessmentsTable.id })
      .from(conformityAssessmentsTable)
      .where(eq(conformityAssessmentsTable.id, id));
    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }

    const workspace = await buildWorkspaceContext(id);

    let knowledge = "";
    try {
      const ctx = await retrieveContext("en", message, 4, await allowedVisibilities(req));
      knowledge = ctx.map((c, i) => `[${i + 1}] ${c.title}: ${c.content}`).join("\n\n");
    } catch (err) {
      req.log.error({ err }, "assistant knowledge retrieval failed; answering without it");
    }

    // Per-assessment workspace retrieval (conformity_embeddings) — separate from
    // the published-site index above. Best-effort: retrieveWorkspaceContext
    // returns [] on any failure, so this never breaks the stream.
    const workspaceHits = await retrieveWorkspaceContext(id, message, 4);
    if (workspaceHits.length > 0) {
      const workspaceKnowledge = workspaceHits
        .map((c, i) => `[W${i + 1}] (${c.sourceType}) ${c.title}: ${c.content}`)
        .join("\n\n");
      knowledge = knowledge
        ? `${knowledge}\n\n=== Workspace documents ===\n${workspaceKnowledge}`
        : `=== Workspace documents ===\n${workspaceKnowledge}`;
    }

    const history = (parsed.data.history ?? [])
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m): OpenAI.Chat.Completions.ChatCompletionMessageParam => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content.slice(0, MAX_HISTORY_ITEM_CHARS),
      }));

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt(workspace, knowledge) },
      ...history,
      { role: "user", content: message },
    ];

    // Abort the upstream stream if the client disconnects mid-reply (see chat.ts).
    const controller = new AbortController();
    let aborted = false;
    const onClose = () => {
      if (!res.writableEnded) {
        aborted = true;
        controller.abort();
      }
    };
    res.on("close", onClose);
    const canWrite = (): boolean => !res.writableEnded && !res.destroyed;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    let streamError = false;
    try {
      const stream = await openai.chat.completions.create(
        {
          model: CHAT_MODEL,
          messages: chatMessages,
          stream: true,
          max_completion_tokens: MAX_OUTPUT_TOKENS,
        },
        { signal: controller.signal },
      );
      for await (const chunk of stream) {
        if (aborted) break;
        const delta = chunk.choices[0]?.delta?.content;
        if (delta && canWrite()) {
          res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
      }
    } catch (err) {
      if (!aborted) {
        streamError = true;
        req.log.error({ err }, "conformity assistant stream failed");
        if (canWrite()) {
          res.write(
            `data: ${JSON.stringify({ error: "The assistant is temporarily unavailable. Please try again." })}\n\n`,
          );
        }
      }
    } finally {
      res.off("close", onClose);
    }

    if (!aborted && !streamError && canWrite()) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    }
    if (canWrite()) res.end();
  },
);

export default router;
