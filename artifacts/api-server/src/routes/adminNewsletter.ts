import { Router, type IRouter } from "express";
import {
  ListNewsletterSubscribersResponse,
  DeleteNewsletterSubscriberResponse,
  GetNewsletterMailStatusResponse,
  ListNewslettersResponse,
  CreateNewsletterBody,
  CreateNewsletterResponse,
  GenerateNewsletterBody,
  GenerateNewsletterResponse,
  GetNewsletterResponse,
  UpdateNewsletterBody,
  UpdateNewsletterResponse,
  DeleteNewsletterResponse,
  ScheduleNewsletterBody,
  ScheduleNewsletterResponse,
  UnscheduleNewsletterResponse,
  SendNewsletterResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import {
  listSubscribers,
  deleteSubscriber,
  getMailStatus,
  listNewsletters,
  getNewsletter,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  scheduleNewsletter,
  unscheduleNewsletter,
  sendNewsletterNow,
  generateNewsletterDraft,
  NewsletterStateError,
} from "../lib/newsletter";

const router: IRouter = Router();

function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// --- Subscribers -----------------------------------------------------------

router.get("/admin/newsletter/subscribers", requireAdmin, async (req, res): Promise<void> => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const rows = await listSubscribers({ status, q });
  res.json(ListNewsletterSubscribersResponse.parse(rows));
});

router.delete("/admin/newsletter/subscribers/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid subscriber id" });
    return;
  }
  const deleted = await deleteSubscriber(id);
  if (!deleted) {
    res.status(404).json({ error: "Subscriber not found" });
    return;
  }
  res.json(DeleteNewsletterSubscriberResponse.parse({ success: true }));
});

router.get("/admin/newsletter/mail-status", requireAdmin, async (_req, res): Promise<void> => {
  const status = await getMailStatus();
  res.json(GetNewsletterMailStatusResponse.parse(status));
});

// --- Newsletters -----------------------------------------------------------

router.get("/admin/newsletters", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await listNewsletters();
  res.json(ListNewslettersResponse.parse(rows));
});

router.post("/admin/newsletters", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid newsletter" });
    return;
  }
  const created = await createNewsletter(parsed.data);
  res.json(CreateNewsletterResponse.parse(created));
});

// Register before the "/:id" routes so "generate" is not treated as an id.
router.post("/admin/newsletters/generate", requireAdmin, async (req, res): Promise<void> => {
  const parsed = GenerateNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A topic is required" });
    return;
  }
  try {
    const draft = await generateNewsletterDraft(parsed.data);
    res.json(GenerateNewsletterResponse.parse(draft));
  } catch (err) {
    req.log.error({ err }, "Newsletter generation failed");
    res.status(502).json({ error: err instanceof Error ? err.message : "Generation failed" });
  }
});

router.get("/admin/newsletters/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid newsletter id" });
    return;
  }
  const row = await getNewsletter(id);
  if (!row) {
    res.status(404).json({ error: "Newsletter not found" });
    return;
  }
  res.json(GetNewsletterResponse.parse(row));
});

router.put("/admin/newsletters/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid newsletter id" });
    return;
  }
  const parsed = UpdateNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid newsletter" });
    return;
  }
  try {
    const updated = await updateNewsletter(id, parsed.data);
    if (!updated) {
      res.status(404).json({ error: "Newsletter not found" });
      return;
    }
    res.json(UpdateNewsletterResponse.parse(updated));
  } catch (err) {
    if (err instanceof NewsletterStateError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});

router.delete("/admin/newsletters/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid newsletter id" });
    return;
  }
  const deleted = await deleteNewsletter(id);
  if (!deleted) {
    res.status(404).json({ error: "Newsletter not found" });
    return;
  }
  res.json(DeleteNewsletterResponse.parse({ success: true }));
});

router.post("/admin/newsletters/:id/schedule", requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid newsletter id" });
    return;
  }
  const parsed = ScheduleNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A scheduled time is required" });
    return;
  }
  const when = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(when.getTime())) {
    res.status(400).json({ error: "Invalid scheduled time" });
    return;
  }
  if (when.getTime() <= Date.now()) {
    res.status(400).json({ error: "The scheduled time must be in the future" });
    return;
  }
  try {
    const updated = await scheduleNewsletter(id, when);
    if (!updated) {
      res.status(404).json({ error: "Newsletter not found" });
      return;
    }
    res.json(ScheduleNewsletterResponse.parse(updated));
  } catch (err) {
    if (err instanceof NewsletterStateError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});

router.post("/admin/newsletters/:id/unschedule", requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid newsletter id" });
    return;
  }
  try {
    const updated = await unscheduleNewsletter(id);
    if (!updated) {
      res.status(404).json({ error: "Newsletter not found" });
      return;
    }
    res.json(UnscheduleNewsletterResponse.parse(updated));
  } catch (err) {
    if (err instanceof NewsletterStateError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});

router.post("/admin/newsletters/:id/send", requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Invalid newsletter id" });
    return;
  }
  try {
    const updated = await sendNewsletterNow(id);
    if (!updated) {
      res.status(404).json({ error: "Newsletter not found" });
      return;
    }
    res.json(SendNewsletterResponse.parse(updated));
  } catch (err) {
    if (err instanceof NewsletterStateError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});

export default router;
