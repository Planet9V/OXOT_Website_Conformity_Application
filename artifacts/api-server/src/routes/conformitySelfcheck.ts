import { Router, type IRouter } from "express";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { db, leadsTable } from "@workspace/db";
import { rateLimit } from "../middlewares/rateLimit";
import { validateReportPayload } from "../lib/selfcheckReportPayload";
import { SelfCheckReport } from "../lib/selfcheckReportPdf";

const router: IRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clamp = (v: unknown, max: number): string =>
  String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Public lead capture for the 2-minute CRA check. One row into the shared
// `leads` table — deliberately thin (no embeddings, mailer or intake pipeline).
const leadIpLimiter = rateLimit({
  keyPrefix: "cra-lead-ip",
  windowMs: 15 * 60_000,
  max: 12,
  message: "Too many submissions. Please try again in a little while.",
});
const leadEmailLimiter = rateLimit({
  keyPrefix: "cra-lead-email",
  windowMs: 60 * 60_000,
  max: 6,
  keyGenerator: (req) => {
    const email = (req.body as { email?: unknown } | undefined)?.email;
    return typeof email === "string" ? email.trim().toLowerCase() : null;
  },
  message: "Too many submissions. Please try again in a little while.",
});

router.post("/lead", leadIpLimiter, leadEmailLimiter, async (req, res): Promise<void> => {
  const b = (req.body ?? {}) as Record<string, unknown>;

  // Honeypot: any value in `website` means a bot. Report success, write nothing.
  if (clamp(b.website, 200)) {
    req.log.warn({ source: clamp(b.source, 60) || null }, "CRA lead honeypot triggered");
    res.json({ ok: true });
    return;
  }

  const name = clamp(b.name, 120);
  const email = clamp(b.email, 200);
  if (name.length < 2 || !EMAIL_RE.test(email)) {
    res.status(400).json({ ok: false, errors: { name: name.length < 2 ? "name" : undefined, email: EMAIL_RE.test(email) ? undefined : "email" } });
    return;
  }

  const blocker = clamp(b.blocker, 2000);
  const summary = clamp(b.message, 2000);
  const message = [summary, blocker && `Question: ${blocker}`].filter(Boolean).join("\n") || null;
  const role = clamp(b.role, 120);

  await db.insert(leadsTable).values({
    name,
    email,
    company: clamp(b.company, 200) || null,
    message: [message, role && `Role: ${role}`].filter(Boolean).join("\n") || null,
    segment: clamp(b.segment, 40) || null,
    source: clamp(b.source, 60) || "cra_selfcheck",
    locale: b.locale === "nl" ? "nl" : "en",
  });

  res.json({ ok: true });
});

// PDF export of the check's result. The gate is contact info: the client only
// offers the download after the lead form succeeded, and this endpoint
// re-requires an attributable name + email. Writes nothing (no duplicate leads
// on re-download); delivers the document as an immediate browser download.
const reportLimiter = rateLimit({
  keyPrefix: "cra-selfcheck-report-ip",
  windowMs: 60_000,
  max: 6,
  message: "Too many report requests. Please try again in a minute.",
});

router.post("/selfcheck/report", reportLimiter, async (req, res): Promise<void> => {
  const v = validateReportPayload(req.body);
  if (!v.ok && v.spam) {
    // Honeypot: pretend success, deliver nothing useful.
    res.json({ ok: true });
    return;
  }
  if (!v.ok) {
    res.status(400).json({ ok: false, errors: v.errors });
    return;
  }

  const generatedAt = new Date().toISOString().slice(0, 10);
  const element = React.createElement(SelfCheckReport, {
    data: v.data,
    generatedAt,
  }) as unknown as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(element);

  const filename = `OXOT-CRA-readiness-${generatedAt}.pdf`;
  res.setHeader("content-type", "application/pdf");
  res.setHeader("content-disposition", `attachment; filename="${filename}"`);
  res.setHeader("cache-control", "no-store");
  res.end(Buffer.from(buffer));
});

export default router;
