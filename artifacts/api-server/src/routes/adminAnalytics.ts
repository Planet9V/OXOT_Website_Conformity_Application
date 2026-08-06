import { Router, type IRouter } from "express";
import { GetAnalyticsOverviewResponse, GetAnalyticsRecommendationsResponse } from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import { getAnalyticsOverview, getAnalyticsRecommendations } from "../lib/analytics";

const router: IRouter = Router();

router.get("/admin/analytics/overview", requireAdmin, async (req, res): Promise<void> => {
  const days = typeof req.query["days"] === "string" ? Number(req.query["days"]) : 30;
  const overview = await getAnalyticsOverview(days);
  res.json(GetAnalyticsOverviewResponse.parse(overview));
});

router.get("/admin/analytics/recommendations", requireAdmin, async (_req, res): Promise<void> => {
  const recommendations = await getAnalyticsRecommendations();
  res.json(GetAnalyticsRecommendationsResponse.parse(recommendations));
});

export default router;
