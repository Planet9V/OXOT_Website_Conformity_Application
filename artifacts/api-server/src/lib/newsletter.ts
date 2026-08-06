import crypto from "node:crypto";
import { and, desc, eq, ilike, or, sql, inArray } from "drizzle-orm";
import { marked } from "marked";
import {
  db,
  newslettersTable,
  newsletterSubscribersTable,
  newsletterSendsTable,
  contentChunksTable,
  type NewsletterRow,
  type NewsletterSubscriberRow,
} from "@workspace/db";
import { logger } from "./logger";
import { sendEmail, isMailConfigured } from "./mailer";
import { getEmailConfig } from "./integrationSettings";
import { getLlmConfig, resolveGenerationModel } from "./models";
import { generateJson, BRAND_CONTEXT } from "./aiContent";
import { webBaseUrl } from "./urls";

// --- URL helpers -----------------------------------------------------------

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/** API origin (this server), used for the open-tracking pixel. */
function apiBaseUrl(): string {
  const explicit = process.env["PUBLIC_API_URL"];
  if (explicit) return trimSlash(explicit);
  const domain = process.env["REPLIT_DEV_DOMAIN"];
  return domain ? `https://${domain}/api` : "/api";
}

function confirmUrl(token: string): string {
  return `${webBaseUrl()}/newsletter/confirm?token=${encodeURIComponent(token)}`;
}

function unsubscribeUrl(token: string): string {
  return `${webBaseUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

function openPixelUrl(sendId: number): string {
  return `${apiBaseUrl()}/newsletter/track/open/${sendId}`;
}

function newToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

// --- DTO mappers -----------------------------------------------------------

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function toSubscriberDto(row: NewsletterSubscriberRow) {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    locale: row.locale,
    source: row.source ?? null,
    confirmedAt: iso(row.confirmedAt),
    unsubscribedAt: iso(row.unsubscribedAt),
    createdAt: row.createdAt.toISOString(),
  };
}

export function toNewsletterDto(row: NewsletterRow, openedCount = 0) {
  return {
    id: row.id,
    subject: row.subject,
    preheader: row.preheader ?? null,
    contentMarkdown: row.contentMarkdown,
    topic: row.topic ?? null,
    locale: row.locale,
    status: row.status,
    scheduledAt: iso(row.scheduledAt),
    sentAt: iso(row.sentAt),
    recipientCount: row.recipientCount,
    sentCount: row.sentCount,
    failedCount: row.failedCount,
    openedCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// --- Subscribers -----------------------------------------------------------

export async function listSubscribers(opts: { status?: string; q?: string }) {
  const conditions = [];
  if (opts.status) conditions.push(eq(newsletterSubscribersTable.status, opts.status));
  if (opts.q) conditions.push(ilike(newsletterSubscribersTable.email, `%${opts.q}%`));
  const rows = await db
    .select()
    .from(newsletterSubscribersTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(newsletterSubscribersTable.createdAt));
  return rows.map(toSubscriberDto);
}

export async function deleteSubscriber(id: number): Promise<boolean> {
  const [deleted] = await db
    .delete(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.id, id))
    .returning({ id: newsletterSubscribersTable.id });
  return Boolean(deleted);
}

const CONFIRM_SUBJECT = "Please confirm your OXOT newsletter subscription";

function confirmEmailHtml(link: string): string {
  return `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6">
  <h2 style="margin:0 0 12px">Confirm your subscription</h2>
  <p>Thanks for signing up for OXOT updates on the EU Cyber Resilience Act, AI Act, Machinery Regulation, NIS2 and more.</p>
  <p>Please confirm your email address to complete your subscription:</p>
  <p><a href="${link}" style="display:inline-block;background:#0b5;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">Confirm subscription</a></p>
  <p style="color:#666;font-size:13px">If the button doesn't work, paste this link into your browser:<br>${link}</p>
  <p style="color:#999;font-size:12px">You received this because someone entered this address on our site. If it wasn't you, just ignore this email — no subscription is created without confirmation.</p>
  </body></html>`;
}

/**
 * Start (or restart) a double opt-in subscription. Always resolves without
 * revealing whether the address already existed, to avoid enumeration. Sends a
 * confirmation email for pending/new/re-subscribing addresses.
 */
export async function subscribe(input: {
  email: string;
  locale?: string | null;
  source?: string | null;
}): Promise<{ status: string }> {
  const email = normalizeEmail(input.email);
  const locale = input.locale === "nl" ? "nl" : "en";
  const [existing] = await db
    .select()
    .from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.email, email));

  if (existing && existing.status === "confirmed") {
    return { status: "confirmed" };
  }

  const confirmToken = newToken();
  if (!existing) {
    await db.insert(newsletterSubscribersTable).values({
      email,
      status: "pending",
      locale,
      source: input.source ?? null,
      confirmToken,
      unsubscribeToken: newToken(),
    });
  } else {
    // pending or previously unsubscribed -> reset to pending with a fresh token
    await db
      .update(newsletterSubscribersTable)
      .set({
        status: "pending",
        locale,
        source: input.source ?? existing.source,
        confirmToken,
        unsubscribedAt: null,
      })
      .where(eq(newsletterSubscribersTable.id, existing.id));
  }

  const result = await sendEmail({
    to: email,
    subject: CONFIRM_SUBJECT,
    html: confirmEmailHtml(confirmUrl(confirmToken)),
  });
  if (!result.delivered) {
    // Never log the email address or confirmation token (PII + a live opt-in
    // credential) in production. In development, surface the link so the
    // double opt-in flow is testable without a configured email provider.
    if (process.env["NODE_ENV"] !== "production") {
      logger.warn(
        { confirmLink: confirmUrl(confirmToken) },
        "Confirmation email not delivered (dev) — open this link to confirm",
      );
    } else {
      logger.warn({ error: result.error }, "Confirmation email not delivered");
    }
  }
  return { status: "pending" };
}

export async function confirmSubscription(token: string, ip?: string | null): Promise<boolean> {
  const [row] = await db
    .select()
    .from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.confirmToken, token));
  if (!row) return false;
  if (row.status === "confirmed") return true;
  await db
    .update(newsletterSubscribersTable)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
      consentIp: ip ?? null,
      confirmToken: null,
    })
    .where(eq(newsletterSubscribersTable.id, row.id));
  return true;
}

export async function unsubscribe(token: string): Promise<boolean> {
  const [row] = await db
    .select()
    .from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.unsubscribeToken, token));
  if (!row) return false;
  if (row.status !== "unsubscribed") {
    await db
      .update(newsletterSubscribersTable)
      .set({ status: "unsubscribed", unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribersTable.id, row.id));
  }
  return true;
}

// --- Newsletters (campaigns) ----------------------------------------------

async function openedCountsFor(newsletterIds: number[]): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  if (newsletterIds.length === 0) return map;
  const rows = await db
    .select({
      newsletterId: newsletterSendsTable.newsletterId,
      opened: sql<number>`count(*) filter (where ${newsletterSendsTable.openedAt} is not null)`,
    })
    .from(newsletterSendsTable)
    .where(inArray(newsletterSendsTable.newsletterId, newsletterIds))
    .groupBy(newsletterSendsTable.newsletterId);
  for (const r of rows) map.set(r.newsletterId, Number(r.opened));
  return map;
}

export async function listNewsletters() {
  const rows = await db.select().from(newslettersTable).orderBy(desc(newslettersTable.createdAt));
  const opened = await openedCountsFor(rows.map((r) => r.id));
  return rows.map((r) => toNewsletterDto(r, opened.get(r.id) ?? 0));
}

export async function getNewsletter(id: number) {
  const [row] = await db.select().from(newslettersTable).where(eq(newslettersTable.id, id));
  if (!row) return null;
  const opened = await openedCountsFor([id]);
  return toNewsletterDto(row, opened.get(id) ?? 0);
}

export async function createNewsletter(input: {
  subject: string;
  preheader?: string | null;
  contentMarkdown: string;
  topic?: string | null;
  locale: string;
}) {
  const [row] = await db
    .insert(newslettersTable)
    .values({
      subject: input.subject,
      preheader: input.preheader ?? null,
      contentMarkdown: input.contentMarkdown,
      topic: input.topic ?? null,
      locale: input.locale === "nl" ? "nl" : "en",
      status: "draft",
    })
    .returning();
  return toNewsletterDto(row);
}

/** Statuses in which a newsletter may still be edited/scheduled/deleted. */
const EDITABLE = new Set(["draft", "scheduled", "failed"]);

export class NewsletterStateError extends Error {}

export async function updateNewsletter(
  id: number,
  input: { subject: string; preheader?: string | null; contentMarkdown: string; topic?: string | null; locale: string },
) {
  const [existing] = await db.select().from(newslettersTable).where(eq(newslettersTable.id, id));
  if (!existing) return null;
  const [row] = await db
    .update(newslettersTable)
    .set({
      subject: input.subject,
      preheader: input.preheader ?? null,
      contentMarkdown: input.contentMarkdown,
      topic: input.topic ?? null,
      locale: input.locale === "nl" ? "nl" : "en",
    })
    .where(and(eq(newslettersTable.id, id), inArray(newslettersTable.status, [...EDITABLE])))
    .returning();
  if (!row) {
    throw new NewsletterStateError("A newsletter that is sending or already sent cannot be edited.");
  }
  return toNewsletterDto(row);
}

export async function deleteNewsletter(id: number): Promise<boolean> {
  const [deleted] = await db
    .delete(newslettersTable)
    .where(eq(newslettersTable.id, id))
    .returning({ id: newslettersTable.id });
  return Boolean(deleted);
}

export async function scheduleNewsletter(id: number, scheduledAt: Date) {
  const [existing] = await db.select().from(newslettersTable).where(eq(newslettersTable.id, id));
  if (!existing) return null;
  const [row] = await db
    .update(newslettersTable)
    .set({ status: "scheduled", scheduledAt })
    .where(and(eq(newslettersTable.id, id), inArray(newslettersTable.status, [...EDITABLE])))
    .returning();
  if (!row) {
    throw new NewsletterStateError("Only draft newsletters can be scheduled.");
  }
  const opened = await openedCountsFor([id]);
  return toNewsletterDto(row, opened.get(id) ?? 0);
}

export async function unscheduleNewsletter(id: number) {
  const [existing] = await db.select().from(newslettersTable).where(eq(newslettersTable.id, id));
  if (!existing) return null;
  const [row] = await db
    .update(newslettersTable)
    .set({ status: "draft", scheduledAt: null })
    .where(and(eq(newslettersTable.id, id), eq(newslettersTable.status, "scheduled")))
    .returning();
  if (!row) {
    throw new NewsletterStateError("This newsletter is not scheduled.");
  }
  return toNewsletterDto(row);
}

// --- Sending ---------------------------------------------------------------

function renderNewsletterHtml(opts: {
  contentHtml: string;
  preheader?: string | null;
  unsubscribeLink: string;
  pixelSrc: string;
}): string {
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${opts.preheader}</div>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;padding:24px 0">
  ${preheader}
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6">
    ${opts.contentHtml}
    <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px">
    <p style="color:#999;font-size:12px;margin:0">
      You are receiving this because you confirmed a subscription to OXOT updates.
      <a href="${opts.unsubscribeLink}" style="color:#666">Unsubscribe</a>.
    </p>
  </div>
  <img src="${opts.pixelSrc}" width="1" height="1" alt="" style="display:block">
  </body></html>`;
}

/**
 * Send a newsletter to all confirmed subscribers matching its locale. Runs in
 * the background: flips the row to `sending`, then processes recipients and
 * writes final counts + status. Idempotent per (newsletter, subscriber).
 */
export async function sendNewsletterNow(id: number) {
  const [existing] = await db.select().from(newslettersTable).where(eq(newslettersTable.id, id));
  if (!existing) return null;
  // Atomically claim the campaign for sending. The status guard is inside the
  // UPDATE, so a concurrent send/scheduler poll cannot start a second run.
  const [claimed] = await db
    .update(newslettersTable)
    .set({ status: "sending" })
    .where(and(eq(newslettersTable.id, id), inArray(newslettersTable.status, [...EDITABLE])))
    .returning();
  if (!claimed) {
    throw new NewsletterStateError("This newsletter has already been sent or is sending.");
  }

  // Fire and forget — the admin UI polls for status/counts.
  void processSend(id, claimed).catch((err) => {
    logger.error({ err, newsletterId: id }, "Newsletter send failed");
    void db
      .update(newslettersTable)
      .set({ status: "failed" })
      .where(eq(newslettersTable.id, id));
  });

  const opened = await openedCountsFor([id]);
  return toNewsletterDto(claimed, opened.get(id) ?? 0);
}

async function processSend(id: number, newsletter: NewsletterRow): Promise<void> {
  const recipients = await db
    .select()
    .from(newsletterSubscribersTable)
    .where(
      and(
        eq(newsletterSubscribersTable.status, "confirmed"),
        eq(newsletterSubscribersTable.locale, newsletter.locale),
      ),
    );

  const contentHtml = await marked.parse(newsletter.contentMarkdown || "");

  for (const sub of recipients) {
    // Claim a per-recipient row. New recipients insert; previously FAILED rows
    // are re-claimed (so a retry re-attempts them); already-SENT rows conflict
    // with the setWhere guard and return nothing -> skipped (idempotent).
    const [reserved] = await db
      .insert(newsletterSendsTable)
      .values({ newsletterId: id, subscriberId: sub.id, status: "sent" })
      .onConflictDoUpdate({
        target: [newsletterSendsTable.newsletterId, newsletterSendsTable.subscriberId],
        set: { status: "sent", error: null, sentAt: new Date() },
        setWhere: eq(newsletterSendsTable.status, "failed"),
      })
      .returning();
    if (!reserved) continue;

    const html = renderNewsletterHtml({
      contentHtml,
      preheader: newsletter.preheader,
      unsubscribeLink: unsubscribeUrl(sub.unsubscribeToken),
      pixelSrc: openPixelUrl(reserved.id),
    });
    const result = await sendEmail({
      to: sub.email,
      subject: newsletter.subject,
      html,
      headers: { "List-Unsubscribe": `<${unsubscribeUrl(sub.unsubscribeToken)}>` },
    });
    if (!result.delivered) {
      await db
        .update(newsletterSendsTable)
        .set({ status: "failed", error: result.error ?? "unknown" })
        .where(eq(newsletterSendsTable.id, reserved.id));
    }
  }

  // Derive final counts from persisted per-recipient rows (DB truth), not from
  // this run's in-memory counters — so a partial/retried send reports correctly.
  const [counts] = await db
    .select({
      sent: sql<number>`count(*) filter (where ${newsletterSendsTable.status} = 'sent')`,
      failed: sql<number>`count(*) filter (where ${newsletterSendsTable.status} = 'failed')`,
    })
    .from(newsletterSendsTable)
    .where(eq(newsletterSendsTable.newsletterId, id));
  const sent = Number(counts?.sent ?? 0);
  const failed = Number(counts?.failed ?? 0);
  const status = sent === 0 && failed > 0 ? "failed" : "sent";
  await db
    .update(newslettersTable)
    .set({
      status,
      sentAt: new Date(),
      recipientCount: recipients.length,
      sentCount: sent,
      failedCount: failed,
    })
    .where(eq(newslettersTable.id, id));
  logger.info({ newsletterId: id, sent, failed, recipients: recipients.length }, "Newsletter send complete");
}

export async function recordOpen(sendId: number): Promise<void> {
  await db
    .update(newsletterSendsTable)
    .set({ openedAt: new Date() })
    .where(and(eq(newsletterSendsTable.id, sendId), sql`${newsletterSendsTable.openedAt} is null`));
}

// --- AI generation ---------------------------------------------------------

interface GeneratedNewsletter {
  subject: string;
  preheader: string;
  contentMarkdown: string;
}

export async function generateNewsletterDraft(input: {
  topic: string;
  locale?: string | null;
  tone?: string | null;
  audience?: string | null;
}): Promise<GeneratedNewsletter> {
  const locale = input.locale === "nl" ? "nl" : "en";
  const cfg = await getLlmConfig();
  const model = resolveGenerationModel(cfg.briefModel);

  // Ground the draft in real published content matching the topic.
  const chunks = await db
    .select({ title: contentChunksTable.title, content: contentChunksTable.content })
    .from(contentChunksTable)
    .where(
      and(
        eq(contentChunksTable.locale, locale),
        // Newsletters go to the public list — never ground them in gated
        // (members/admin) content.
        eq(contentChunksTable.visibility, "public"),
        or(
          ilike(contentChunksTable.content, `%${input.topic}%`),
          ilike(contentChunksTable.title, `%${input.topic}%`),
        ),
      ),
    )
    .limit(6);
  const grounding = chunks.map((c) => `- ${c.title}: ${c.content.slice(0, 280)}`).join("\n");

  const lang = locale === "nl" ? "Dutch" : "English";
  const system = `${BRAND_CONTEXT}
You write concise, professional B2B email newsletters for compliance and engineering leaders. Never invent facts, regulations, deadlines, or statistics. Output valid JSON only.`;
  const user = `Write a newsletter in ${lang} about: "${input.topic}".${input.tone ? ` Tone: ${input.tone}.` : ""}${input.audience ? ` Audience: ${input.audience}.` : ""}
${grounding ? `Relevant OXOT content you may draw on (do not copy verbatim):\n${grounding}\n` : ""}
Return JSON with exactly these keys:
{
  "subject": string (max 80 chars, no emoji),
  "preheader": string (max 120 chars, a one-line preview),
  "contentMarkdown": string (Markdown body: 2-4 short sections with ## headings, at least one bullet list, and a closing call-to-action to talk to OXOT. No HTML, no front matter, no title heading duplicating the subject.)
}`;

  const raw = (await generateJson(model, system, user, 1800)) as Record<string, unknown>;
  const subject = typeof raw.subject === "string" ? raw.subject.trim() : "";
  const preheader = typeof raw.preheader === "string" ? raw.preheader.trim() : "";
  const contentMarkdown = typeof raw.contentMarkdown === "string" ? raw.contentMarkdown.trim() : "";
  if (!subject || !contentMarkdown) {
    throw new Error("The model did not return a usable newsletter draft.");
  }
  return { subject, preheader, contentMarkdown };
}

export async function getMailStatus(): Promise<{ configured: boolean; fromAddress: string | null }> {
  const configured = await isMailConfigured();
  const cfg = await getEmailConfig();
  const fromAddress = cfg.fromEmail
    ? cfg.fromName
      ? `${cfg.fromName} <${cfg.fromEmail}>`
      : cfg.fromEmail
    : null;
  return { configured, fromAddress };
}

// --- Scheduler -------------------------------------------------------------

/** Send any scheduled newsletters whose time has arrived. */
export async function runDueScheduledSends(): Promise<void> {
  // Recover campaigns stuck in `sending` (e.g. a crash mid-send): flip them to
  // `failed` so they become editable/retryable. `updatedAt` was stamped when
  // the send was claimed, so a long-idle `sending` row is a stuck one.
  const recovered = await db
    .update(newslettersTable)
    .set({ status: "failed" })
    .where(and(eq(newslettersTable.status, "sending"), sql`${newslettersTable.updatedAt} < now() - interval '15 minutes'`))
    .returning({ id: newslettersTable.id });
  if (recovered.length > 0) {
    logger.warn({ ids: recovered.map((r) => r.id) }, "Recovered stuck 'sending' newsletters -> failed");
  }

  const due = await db
    .select({ id: newslettersTable.id })
    .from(newslettersTable)
    .where(and(eq(newslettersTable.status, "scheduled"), sql`${newslettersTable.scheduledAt} <= now()`));
  for (const row of due) {
    try {
      await sendNewsletterNow(row.id);
    } catch (err) {
      logger.error({ err, newsletterId: row.id }, "Scheduled send failed to start");
    }
  }
}
