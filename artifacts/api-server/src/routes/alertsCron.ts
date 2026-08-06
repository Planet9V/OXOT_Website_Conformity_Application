import { timingSafeEqual } from "node:crypto";
import { Router, type IRouter, type Request } from "express";
import { runConformityAlertScan } from "../lib/conformityAlertScan";
import {
  runLinkedinExpiryScan,
  type LinkedinExpiryScanResult,
} from "../lib/linkedinExpiryScan";
import { RateLimiter, clientKey } from "../lib/rateLimit";

const router: IRouter = Router();

/**
 * External scheduler trigger for the CRA deadline alert scan.
 *
 * The published app runs on autoscale (no always-on process), so production
 * needs an OUTSIDE trigger. Any external scheduler (a Replit Scheduled
 * Deployment in a companion app, cron-job.org, a GitHub Actions cron, an
 * uptime monitor, ...) can POST here on a 15–60 min cadence.
 *
 * Auth: `Authorization: Bearer $CONFORMITY_ALERTS_CRON_SECRET` (env/secret).
 * - secret unset  → 503 (endpoint disabled — never runs unauthenticated)
 * - wrong token   → 401
 * Deliberately NOT in the OpenAPI spec (machine-only, like /api/go/:id).
 *
 * Safe to call as often as you like: dedupe lives in conformity_alert_state,
 * so overlapping/repeated runs never double-send (same guarantee as the
 * standalone `alerts:run` script and the admin "Run check now" button).
 */

// Generous budget — a legitimate scheduler fires ~4x/hour; this only blunts
// token brute-forcing and accidental hammering.
const limiter = new RateLimiter({ windowMs: 60_000, max: 10 });

function bearerToken(req: Request): string | null {
  const header = req.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual requires equal lengths; length mismatch is a mismatch.
  return a.length === b.length && timingSafeEqual(a, b);
}

router.post("/cron/conformity-alerts", async (req, res): Promise<void> => {
  const { allowed, retryAfterSeconds } = limiter.hit(clientKey(req));
  if (!allowed) {
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({ error: "Too many requests" });
    return;
  }
  const secret = process.env.CONFORMITY_ALERTS_CRON_SECRET;
  if (!secret) {
    res.status(503).json({
      error: "Cron trigger disabled: CONFORMITY_ALERTS_CRON_SECRET is not configured",
    });
    return;
  }
  const provided = bearerToken(req);
  if (!provided || !tokenMatches(provided, secret)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const result = await runConformityAlertScan();
    // Piggyback the daily LinkedIn token expiry check on the same trigger —
    // production has no always-on process, so this is its only scheduler.
    // Its own persisted dedupe key means frequent cron cadence never spams.
    let linkedinExpiry: LinkedinExpiryScanResult | { error: string };
    try {
      linkedinExpiry = await runLinkedinExpiryScan();
    } catch (err) {
      req.log.error({ err }, "Cron-triggered LinkedIn expiry scan crashed");
      linkedinExpiry = { error: "LinkedIn expiry scan failed" };
    }
    const linkedinFailed = "error" in linkedinExpiry && Boolean(linkedinExpiry.error);
    // Non-2xx on failed sends so external schedulers/monitors surface the
    // failure (mirrors the standalone script's non-zero exit code).
    res
      .status(result.alertsFailed > 0 || linkedinFailed ? 500 : 200)
      .json({ ...result, linkedinExpiry });
  } catch (err) {
    req.log.error({ err }, "Cron-triggered conformity alert scan crashed");
    res.status(500).json({ error: "Alert scan failed" });
  }
});

export default router;
