import { Router, type IRouter } from "express";
import { eq, and, or, ilike, desc, asc, type SQL } from "drizzle-orm";
import { db, leadsTable, messagesTable, type LeadRow } from "@workspace/db";
import {
  ListLeadsResponse,
  GetLeadResponse,
  UpdateLeadStatusBody,
  UpdateLeadStatusResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";

const router: IRouter = Router();

function toLeadDto(lead: LeadRow) {
  return {
    id: lead.id,
    conversationId: lead.conversationId,
    name: lead.name,
    email: lead.email,
    company: lead.company,
    message: lead.message,
    locale: lead.locale,
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
  };
}

// List captured leads, newest first, with optional search and status filters.
router.get("/admin/leads", requireAdmin, async (req, res): Promise<void> => {
  const q = typeof req.query["q"] === "string" ? req.query["q"].trim() : "";
  const status = typeof req.query["status"] === "string" ? req.query["status"].trim() : "";

  const conditions: SQL[] = [];
  if (q) {
    const like = `%${q}%`;
    const search = or(
      ilike(leadsTable.name, like),
      ilike(leadsTable.email, like),
      ilike(leadsTable.company, like),
    );
    if (search) conditions.push(search);
  }
  if (status) {
    conditions.push(eq(leadsTable.status, status));
  }

  const rows = await db
    .select()
    .from(leadsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(leadsTable.createdAt));

  res.json(ListLeadsResponse.parse(rows.map(toLeadDto)));
});

// Get a single lead with its full conversation transcript.
router.get("/admin/leads/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid lead id" });
    return;
  }

  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  let messages: { role: string; content: string; createdAt: string }[] = [];
  if (lead.conversationId !== null) {
    const rows = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, lead.conversationId))
      .orderBy(asc(messagesTable.createdAt), asc(messagesTable.id));
    messages = rows.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  res.json(GetLeadResponse.parse({ ...toLeadDto(lead), messages }));
});

// Update a lead's status. Requires an admin session.
router.patch("/admin/leads/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid lead id" });
    return;
  }

  const parsed = UpdateLeadStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [updated] = await db
    .update(leadsTable)
    .set({ status: parsed.data.status })
    .where(eq(leadsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  res.json(UpdateLeadStatusResponse.parse(toLeadDto(updated)));
});

export default router;
