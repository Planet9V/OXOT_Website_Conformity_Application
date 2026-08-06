import { Router, type IRouter } from "express";
import { CollectAnalyticsBody, CollectAnalyticsResponse } from "@workspace/api-zod";
import { recordPageView } from "../lib/analytics";
import { recordClick } from "../lib/affiliate";
import { isBotUserAgent } from "../lib/botDetection";

const router: IRouter = Router();

// Public visitor beacon. Fired once per public route view. No auth.
router.post("/analytics/collect", async (req, res): Promise<void> => {
  const parsed = CollectAnalyticsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid analytics payload" });
    return;
  }
  // Keep bots/crawlers out of visitor analytics: skip recording but still ack.
  // Real browsers send a human User-Agent and are counted normally.
  if (isBotUserAgent(req.get("user-agent"))) {
    res.json(CollectAnalyticsResponse.parse({ success: true }));
    return;
  }
  try {
    await recordPageView(parsed.data);
  } catch (err) {
    req.log.error({ err }, "Failed to record page view");
  }
  // Always ack so a tracking failure never surfaces to the visitor.
  res.json(CollectAnalyticsResponse.parse({ success: true }));
});

// Public affiliate click tracker: records the click, then 302s to the target.
// Referrer (the page the link was clicked from) is captured from the header.
router.get("/go/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.redirect(302, "/");
    return;
  }
  const referer = req.get("referer") ?? null;
  let path: string | null = null;
  if (referer) {
    try {
      path = new URL(referer).pathname;
    } catch {
      path = null;
    }
  }
  // Bots/crawlers (incl. social unfurlers) must still be redirected to the
  // target, but their visit must NOT count as a human click. When the UA looks
  // automated, resolve the destination without recording a click.
  const skipRecording = isBotUserAgent(req.get("user-agent"));
  try {
    const target = await recordClick(id, { path, referrer: referer }, { record: !skipRecording });
    res.redirect(302, target ?? "/");
  } catch (err) {
    req.log.error({ err }, "Failed to record affiliate click");
    res.redirect(302, "/");
  }
});

export default router;
