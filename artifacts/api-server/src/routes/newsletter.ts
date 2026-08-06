import { Router, type IRouter } from "express";
import {
  SubscribeNewsletterBody,
  SubscribeNewsletterResponse,
  ConfirmNewsletterBody,
  ConfirmNewsletterResponse,
  UnsubscribeNewsletterBody,
  UnsubscribeNewsletterResponse,
} from "@workspace/api-zod";
import {
  subscribe,
  confirmSubscription,
  unsubscribe,
  isValidEmail,
  recordOpen,
} from "../lib/newsletter";
import { rateLimit } from "../middlewares/rateLimit";

const router: IRouter = Router();

// Abuse protection for the public subscribe endpoint. Without it, an attacker
// could "email bomb" arbitrary inboxes and run up email spend, since every
// request triggers a confirmation email. Limits are generous enough that a
// real person signing up (even correcting a typo a few times) is unaffected.
const subscribeIpLimiter = rateLimit({
  keyPrefix: "newsletter-subscribe-ip",
  windowMs: 15 * 60_000, // 15 minutes
  max: 10,
  message: "Too many signup attempts. Please try again in a little while.",
});
const subscribeEmailLimiter = rateLimit({
  keyPrefix: "newsletter-subscribe-email",
  windowMs: 60 * 60_000, // 1 hour
  max: 5,
  keyGenerator: (req) => {
    const email = (req.body as { email?: unknown } | undefined)?.email;
    return typeof email === "string" ? email.trim().toLowerCase() : null;
  },
  message: "Too many signup attempts. Please try again in a little while.",
});

// 1x1 transparent GIF for open tracking.
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

router.post(
  "/newsletter/subscribe",
  subscribeIpLimiter,
  subscribeEmailLimiter,
  async (req, res): Promise<void> => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success || !isValidEmail(parsed.data.email)) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }
  // Honeypot: the `website` field is hidden from real users, so any value in it
  // means a bot filled the form. Drop it silently (no email sent) but return the
  // usual success so the bot can't tell it was detected.
  if (typeof parsed.data.website === "string" && parsed.data.website.trim() !== "") {
    req.log.warn({ source: parsed.data.source ?? null }, "Newsletter honeypot triggered");
    res.json(
      SubscribeNewsletterResponse.parse({
        ok: true,
        message: "Almost there! Check your inbox to confirm your subscription.",
      }),
    );
    return;
  }
  await subscribe({
    email: parsed.data.email,
    locale: parsed.data.locale ?? null,
    source: parsed.data.source ?? null,
  });
  // Generic response — never reveal whether the address already existed.
  res.json(
    SubscribeNewsletterResponse.parse({
      ok: true,
      message: "Almost there! Check your inbox to confirm your subscription.",
    }),
  );
});

router.post("/newsletter/confirm", async (req, res): Promise<void> => {
  const parsed = ConfirmNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A confirmation token is required." });
    return;
  }
  const ip = req.ip ?? null;
  const ok = await confirmSubscription(parsed.data.token, ip);
  res.json(
    ConfirmNewsletterResponse.parse({
      ok,
      message: ok
        ? "Your subscription is confirmed. Thank you!"
        : "This confirmation link is invalid or has expired.",
    }),
  );
});

router.post("/newsletter/unsubscribe", async (req, res): Promise<void> => {
  const parsed = UnsubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "An unsubscribe token is required." });
    return;
  }
  const ok = await unsubscribe(parsed.data.token);
  res.json(
    UnsubscribeNewsletterResponse.parse({
      ok,
      message: ok
        ? "You have been unsubscribed. Sorry to see you go."
        : "This unsubscribe link is invalid.",
    }),
  );
});

router.get("/newsletter/track/open/:sendId", async (req, res): Promise<void> => {
  const sendId = Number(req.params.sendId);
  if (Number.isInteger(sendId) && sendId > 0) {
    try {
      await recordOpen(sendId);
    } catch (err) {
      req.log.warn({ err, sendId }, "Failed to record newsletter open");
    }
  }
  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.end(TRACKING_PIXEL);
});

export default router;
