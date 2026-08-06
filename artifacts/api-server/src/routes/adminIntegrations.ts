import { Router, type IRouter } from "express";
import {
  GetIntegrationsHealthResponse,
  GetIntegrationActivityResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import {
  getIntegrationsHealth,
  getIntegrationActivity,
} from "../lib/integrationObservability";

const router: IRouter = Router();

// Per-integration health summary: enabled/configured/connected + last-check
// timestamps + recent success/failure counts.
router.get("/admin/integrations/health", requireAdmin, async (_req, res): Promise<void> => {
  const health = await getIntegrationsHealth();
  res.json(GetIntegrationsHealthResponse.parse(health));
});

// Unified activity feed merging social_posts (as post events) and
// integration_events, reverse-chronological.
router.get("/admin/integrations/activity", requireAdmin, async (req, res): Promise<void> => {
  const rawLimit = Number(req.query["limit"]);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 200) : 50;
  const rawIntegration = req.query["integration"];
  const integration =
    rawIntegration === "email" || rawIntegration === "linkedin" || rawIntegration === "x"
      ? rawIntegration
      : undefined;
  const items = await getIntegrationActivity(limit, integration);
  res.json(GetIntegrationActivityResponse.parse(items));
});

export default router;
