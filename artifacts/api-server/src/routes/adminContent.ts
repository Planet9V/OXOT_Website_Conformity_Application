import { Router, type IRouter } from "express";
import {
  GetContentIndexStatusResponse,
  ReindexContentResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import { getIndexStatus, scheduleReindex, runReindexLoop } from "../lib/rag";

const router: IRouter = Router();

// Current state of the assistant's knowledge index (chunk count, last refresh
// time, whether a rebuild is in progress). The admin UI polls this while a
// rebuild is running.
router.get("/admin/content/index-status", requireAdmin, async (req, res): Promise<void> => {
  try {
    const status = await getIndexStatus();
    res.json(GetContentIndexStatusResponse.parse(status));
  } catch (err) {
    req.log.error({ err }, "Failed to read content index status");
    res.status(500).json({ error: "Failed to read index status" });
  }
});

// Manually trigger a full rebuild. Runs synchronously so the response reports the newly indexed count.
router.post("/admin/content/reindex", requireAdmin, async (req, res): Promise<void> => {
  try {
    await runReindexLoop();
    const status = await getIndexStatus();
    res.json(ReindexContentResponse.parse(status));
  } catch (err) {
    req.log.error({ err }, "Content reindex failed");
    res.status(500).json({ error: "Failed to reindex content" });
  }
});

export default router;
