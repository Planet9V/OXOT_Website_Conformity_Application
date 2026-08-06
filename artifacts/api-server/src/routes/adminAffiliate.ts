import { Router, type IRouter } from "express";
import {
  ListAffiliateLinksResponse,
  CreateAffiliateLinkBody,
  CreateAffiliateLinkResponse,
  UpdateAffiliateLinkBody,
  UpdateAffiliateLinkResponse,
  DeleteAffiliateLinkResponse,
  SuggestAffiliateLinksBody,
  SuggestAffiliateLinksResponse,
  ApplyAffiliateLinksBody,
  ApplyAffiliateLinksResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import { NotFoundError } from "../lib/cms";
import {
  listAffiliateLinks,
  createAffiliateLink,
  updateAffiliateLink,
  deleteAffiliateLink,
  suggestAffiliateLinks,
  applyAffiliateLinks,
} from "../lib/affiliate";

const router: IRouter = Router();

// Affiliate targets are used verbatim in an HTTP redirect, so reject anything
// that is not an absolute http/https URL (e.g. javascript:, relative paths).
function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

router.get("/admin/affiliate/links", requireAdmin, async (_req, res): Promise<void> => {
  const links = await listAffiliateLinks();
  res.json(ListAffiliateLinksResponse.parse(links));
});

router.post("/admin/affiliate/links", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAffiliateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid affiliate link" });
    return;
  }
  if (!isValidHttpUrl(parsed.data.targetUrl)) {
    res.status(400).json({ error: "Target URL must be an absolute http(s) URL" });
    return;
  }
  const created = await createAffiliateLink(parsed.data);
  res.json(CreateAffiliateLinkResponse.parse(created));
});

router.put("/admin/affiliate/links/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid link id" });
    return;
  }
  const parsed = UpdateAffiliateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid affiliate link" });
    return;
  }
  if (!isValidHttpUrl(parsed.data.targetUrl)) {
    res.status(400).json({ error: "Target URL must be an absolute http(s) URL" });
    return;
  }
  try {
    const updated = await updateAffiliateLink(id, parsed.data);
    res.json(UpdateAffiliateLinkResponse.parse(updated));
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: "Affiliate link not found" });
      return;
    }
    throw err;
  }
});

router.delete("/admin/affiliate/links/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid link id" });
    return;
  }
  const deleted = await deleteAffiliateLink(id);
  if (!deleted) {
    res.status(404).json({ error: "Affiliate link not found" });
    return;
  }
  res.json(DeleteAffiliateLinkResponse.parse({ success: true }));
});

router.post("/admin/affiliate/suggest", requireAdmin, async (req, res): Promise<void> => {
  const parsed = SuggestAffiliateLinksBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A pageId is required" });
    return;
  }
  try {
    const suggestions = await suggestAffiliateLinks(parsed.data.pageId);
    res.json(SuggestAffiliateLinksResponse.parse({ suggestions }));
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
});

router.post("/admin/affiliate/apply", requireAdmin, async (req, res): Promise<void> => {
  const parsed = ApplyAffiliateLinksBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid insertions" });
    return;
  }
  try {
    const page = await applyAffiliateLinks(parsed.data.pageId, parsed.data.insertions);
    res.json(ApplyAffiliateLinksResponse.parse(page));
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
});

export default router;
