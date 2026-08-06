import crypto from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { eq, asc } from "drizzle-orm";
import type OpenAI from "openai";
import { db, conversationsTable, messagesTable, leadsTable } from "@workspace/db";
import {
  CreateChatConversationBody,
  CreateChatConversationResponse,
  GetChatConversationResponse,
  SendChatMessageBody,
  CaptureLeadBody,
  CaptureLeadResponse,
} from "@workspace/api-zod";
import { parseLocale } from "../lib/locale";
import { openai, CHAT_MODEL } from "../lib/llm";
import { retrieveContext } from "../lib/rag";
import { allowedVisibilities } from "../lib/visibility";
import { RateLimiter, clientKey } from "../lib/rateLimit";

const router: IRouter = Router();

// --- Abuse / cost safeguards ------------------------------------------------
// These protect the public assistant from spam and runaway LLM spend. The
// limiters below are IN-MEMORY (see rateLimit.ts): counters reset on every
// process restart and are not shared across instances. That is acceptable for
// basic protection; durable persistence is tracked separately (task #17).

// Rate limits keyed per session (falls back to IP). Sending messages triggers
// an LLM call, so it is limited more tightly than cheap conversation creates.
const sendMessageLimiter = new RateLimiter({ windowMs: 60_000, max: 15 });
const createConversationLimiter = new RateLimiter({ windowMs: 60_000, max: 10 });

// Reject abusive input before it ever reaches the model.
const MAX_MESSAGE_CHARS = 4000; // cap a single user message
const MAX_HISTORY_MESSAGES = 20; // cap how much transcript we replay to the LLM
const MAX_OUTPUT_TOKENS = 1024; // cap the model's reply length (was 8192)
const MAX_SOURCES = 3; // cap the "related pages" chips surfaced with a reply
const SOURCE_MIN_SIMILARITY = 0.2; // hide weakly-related pages from the chips

// Emits a friendly 429 with a Retry-After header when a limiter trips.
function tooMany(res: Response, retryAfterSeconds: number): void {
  res.setHeader("Retry-After", String(retryAfterSeconds));
  res.status(429).json({
    error:
      "You're sending messages a bit too quickly. Please wait a moment and try again.",
  });
}

function parseId(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getSessionId(req: Request): string | null {
  const header = req.header("x-session-id");
  return header && header.length > 0 ? header : null;
}

// Loads a conversation only if the caller proves ownership via a matching
// session id. Serial ids are enumerable, so ownership is enforced here to
// prevent one visitor from reading or writing another visitor's transcript.
async function loadOwnedConversation(req: Request, id: number) {
  const sessionId = getSessionId(req);
  if (!sessionId) return null;
  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, id));
  if (!conversation || conversation.sessionId !== sessionId) return null;
  return conversation;
}

function toIso(value: Date): string {
  return value.toISOString();
}

function buildSystemPrompt(locale: string, contextText: string): string {
  const langName = locale === "nl" ? "Dutch (Nederlands)" : "English";
  return [
    "You are the OXOT assistant, a helpful representative for OXOT — a consultancy specialising in",
    "Operational eXcellence in Operational Technology: multi-regulation compliance for the EU Cyber",
    "Resilience Act (CRA), the EU AI Act, the Machinery Regulation, and IEC 62443.",
    "",
    `Always reply in ${langName}, in a concise, professional and approachable tone.`,
    "Ground every answer strictly in the CONTEXT below, which is drawn from OXOT's own website.",
    "If the CONTEXT does not contain the answer, say you don't have that detail yet and invite the",
    "visitor to leave their name and email so the OXOT team can follow up. Never invent facts,",
    "prices, or regulatory claims that are not supported by the CONTEXT.",
    "",
    "CONTEXT:",
    contextText,
  ].join("\n");
}

// Start a new conversation for a locale.
router.post("/chat/:locale/conversations", async (req, res): Promise<void> => {
  const locale = parseLocale(req.params.locale);
  if (!locale) {
    res.status(400).json({ error: "Unsupported locale" });
    return;
  }

  // Anti-abuse limits are keyed by trusted IP only. The X-Session-Id header is
  // client-controlled (not server-signed), so including it would let an
  // attacker rotate the header to escape the limit.
  const createLimit = createConversationLimiter.hit(clientKey(req));
  if (!createLimit.allowed) {
    tooMany(res, createLimit.retryAfterSeconds);
    return;
  }

  const parsed = CreateChatConversationBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sessionId =
    parsed.data.sessionId && parsed.data.sessionId.length > 0
      ? parsed.data.sessionId
      : crypto.randomUUID();

  const [row] = await db
    .insert(conversationsTable)
    .values({ sessionId, locale })
    .returning();

  res.json(
    CreateChatConversationResponse.parse({
      id: row!.id,
      sessionId: row!.sessionId,
      locale: row!.locale,
    }),
  );
});

// Fetch a conversation with its message history (session restore).
router.get("/chat/conversations/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }

  const conversation = await loadOwnedConversation(req, id);
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(asc(messagesTable.createdAt), asc(messagesTable.id));

  res.json(
    GetChatConversationResponse.parse({
      id: conversation.id,
      sessionId: conversation.sessionId,
      locale: conversation.locale,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: toIso(m.createdAt),
      })),
    }),
  );
});

// Send a message and stream the grounded reply as Server-Sent Events.
router.post("/chat/conversations/:id/messages", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }

  // Rate limit before doing any work: each accepted message costs an LLM call.
  const sendLimit = sendMessageLimiter.hit(clientKey(req));
  if (!sendLimit.allowed) {
    tooMany(res, sendLimit.retryAfterSeconds);
    return;
  }

  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userContent = parsed.data.content.trim();
  if (!userContent) {
    res.status(400).json({ error: "Message cannot be empty" });
    return;
  }
  // Reject abusive input: the schema only enforces a minimum length, so cap
  // the maximum here to stop oversized payloads from inflating token spend.
  if (userContent.length > MAX_MESSAGE_CHARS) {
    res.status(400).json({
      error: `Message is too long. Please keep it under ${MAX_MESSAGE_CHARS} characters.`,
    });
    return;
  }

  const conversation = await loadOwnedConversation(req, id);
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db
    .insert(messagesTable)
    .values({ conversationId: id, role: "user", content: userContent });

  let contextText = "(No indexed content is available yet.)";
  // Pages behind the answer, surfaced to the client as clickable chips so an
  // informational question has a one-click path to the relevant service page.
  const sources: { title: string; slug: string }[] = [];
  try {
    const context = await retrieveContext(
      conversation.locale,
      userContent,
      5,
      await allowedVisibilities(req),
    );
    if (context.length > 0) {
      contextText = context
        .map((c, i) => `[${i + 1}] ${c.title}: ${c.content}`)
        .join("\n\n");
      const seen = new Set<string>();
      for (const c of context) {
        if (!c.slug || c.similarity < SOURCE_MIN_SIMILARITY || seen.has(c.slug)) {
          continue;
        }
        seen.add(c.slug);
        sources.push({ title: c.title, slug: c.slug });
        if (sources.length >= MAX_SOURCES) break;
      }
    }
  } catch (err) {
    req.log.error({ err }, "RAG retrieval failed; answering without context");
  }

  const history = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(asc(messagesTable.createdAt), asc(messagesTable.id));

  // Bound the context sent to the model: replay only the most recent turns so
  // a long-running conversation can't grow the prompt (and cost) without limit.
  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt(conversation.locale, contextText) },
    ...recentHistory.map(
      (m): OpenAI.Chat.Completions.ChatCompletionMessageParam => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }),
    ),
  ];

  // Tie the OpenAI request to the client connection: if the browser goes
  // away mid-stream, abort the upstream stream so we stop consuming tokens.
  // The response "close" event fires both on normal completion and on a real
  // disconnect, so guard on `writableEnded`: if the response has not finished
  // yet, the client went away. (Do NOT use req "close" — on Express 5 it fires
  // when the request body stream closes on a normal POST, aborting every call.)
  const controller = new AbortController();
  let aborted = false;
  const onClose = () => {
    if (!res.writableEnded) {
      aborted = true;
      controller.abort();
      req.log.info({ conversationId: id }, "chat client disconnected; aborting stream");
    }
  };
  res.on("close", onClose);

  const canWrite = (): boolean => !res.writableEnded && !res.destroyed;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let full = "";
  let streamError = false;
  try {
    const stream = await openai.chat.completions.create(
      {
        model: CHAT_MODEL,
        messages: chatMessages,
        stream: true,
        // Cap reply length to bound worst-case cost per message.
        max_completion_tokens: MAX_OUTPUT_TOKENS,
      },
      { signal: controller.signal },
    );
    for await (const chunk of stream) {
      if (aborted) break;
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        full += delta;
        if (canWrite()) res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }
  } catch (err) {
    if (!aborted) {
      streamError = true;
      req.log.error({ err }, "Chat completion stream failed");
      if (canWrite()) {
        res.write(
          `data: ${JSON.stringify({ error: "The assistant is temporarily unavailable. Please try again." })}\n\n`,
        );
      }
    }
  } finally {
    res.off("close", onClose);
  }

  // Persist whatever the assistant produced (even a partial reply on a
  // client disconnect) so the transcript stays complete for admins.
  if (full.trim().length > 0) {
    await db
      .insert(messagesTable)
      .values({ conversationId: id, role: "assistant", content: full });
    await db
      .update(conversationsTable)
      .set({ updatedAt: new Date() })
      .where(eq(conversationsTable.id, id));
  }

  if (!aborted && !streamError && canWrite()) {
    res.write(
      `data: ${JSON.stringify({ done: true, conversationId: id, sources })}\n\n`,
    );
  }
  if (canWrite()) res.end();
});

// Capture a contact lead inline within a conversation.
router.post("/chat/conversations/:id/lead", async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }

  const parsed = CaptureLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const conversation = await loadOwnedConversation(req, id);
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const { name, email, company, message } = parsed.data;
  const [row] = await db
    .insert(leadsTable)
    .values({
      conversationId: id,
      name: name.trim(),
      email: email.trim(),
      company: company?.trim() || null,
      message: message?.trim() || null,
      locale: conversation.locale,
    })
    .returning();

  res.json(
    CaptureLeadResponse.parse({
      id: row!.id,
      conversationId: row!.conversationId,
      name: row!.name,
      email: row!.email,
      company: row!.company,
      message: row!.message,
      locale: row!.locale,
      status: row!.status,
      createdAt: toIso(row!.createdAt),
    }),
  );
});

export default router;
