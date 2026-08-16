import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  conformityEvidenceRequestsTable,
  conformityActivityTable,
  requirementsTable,
  TEAM_ROLES,
  type TeamRole,
} from "@workspace/db";
import { requireAuth, getSession } from "../lib/adminAuth";

/**
 * Evidence requests — the "ask" half of P2 (task 7.5c), and the role-scoped
 * inbox 6.3 promised.
 *
 * Workflow, not statute: the internal deadline is the requester's choice and
 * is never presented as a statutory clock, and fulfilling a request never
 * changes the status of the obligation it serves. The obligation reference
 * is validated against the reference layer so a request cannot cite a duty
 * that does not exist.
 */
const router: IRouter = Router();

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}

/** GET — the requests, filterable to one role's inbox or one obligation. */
router.get("/conformity/evidence-requests", requireAuth, async (req: Request, res: Response) => {
  const role = req.query.role != null ? String(req.query.role) : null;
  const status = req.query.status != null ? String(req.query.status) : null;

  const conds = [];
  if (role) conds.push(eq(conformityEvidenceRequestsTable.requestedOfRole, role as TeamRole));
  if (status) conds.push(eq(conformityEvidenceRequestsTable.status, status));
  const base = db.select().from(conformityEvidenceRequestsTable);
  const rows = await (conds.length ? base.where(and(...conds)) : base).orderBy(
    desc(conformityEvidenceRequestsTable.createdAt),
  );

  res.json({
    total: rows.length,
    openCount: rows.filter((r) => r.status === "open").length,
    requests: rows,
  });
});

/** POST — ask. The obligation must exist; the ask must land in someone's inbox. */
router.post("/conformity/evidence-requests", requireAuth, async (req: Request, res: Response) => {
  const b = req.body ?? {};
  const regulationKey = String(b.regulationKey ?? "");
  const refCode = String(b.refCode ?? "");
  const title = String(b.title ?? "").trim();
  if (!title) {
    res.status(400).json({ error: "A title is required — say what is being asked for." });
    return;
  }

  const [requirement] = await db
    .select()
    .from(requirementsTable)
    .where(
      and(
        eq(requirementsTable.regulationKey, regulationKey),
        eq(requirementsTable.refCode, refCode),
      ),
    );
  if (!requirement) {
    res.status(400).json({
      error: `No obligation ${regulationKey}::${refCode} exists in the reference layer. A request must cite a real duty.`,
    });
    return;
  }

  const role = b.requestedOfRole != null ? String(b.requestedOfRole) : null;
  if (role !== null && !(TEAM_ROLES as readonly string[]).includes(role)) {
    res.status(400).json({ error: `Unknown team role "${role}"`, allowed: TEAM_ROLES });
    return;
  }
  const username = String(b.requestedOfUsername ?? "").trim();
  if (!role && !username) {
    res.status(400).json({
      error: "A request must land in someone's inbox: give a team role, a username, or both.",
    });
    return;
  }

  const dueDate = b.dueDate ? String(b.dueDate) : null;
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    res.status(400).json({ error: `"${dueDate}" is not an ISO date (YYYY-MM-DD)` });
    return;
  }

  const [row] = await db.transaction(async (tx) => {
    const rows = await tx
      .insert(conformityEvidenceRequestsTable)
      .values({
        regulationKey,
        refCode,
        productId: b.productId != null ? Number(b.productId) : null,
        title,
        detail: String(b.detail ?? ""),
        requestedOfRole: (role as TeamRole) ?? null,
        requestedOfUsername: username,
        dueDate,
        requestedBy: actorOf(req),
      })
      .returning();
    await tx.insert(conformityActivityTable).values({
      entityType: "evidence_request",
      entityId: rows[0]!.id,
      action: "created",
      actor: actorOf(req),
      source: "ui",
      summary: `Evidence requested for ${regulationKey} ${refCode}: ${title}${
        role ? ` (routed to ${role})` : ""
      }${username ? ` (to ${username})` : ""}`,
    });
    return rows;
  });
  res.status(201).json(row);
});

/**
 * POST — close a request: fulfilled (with what was provided) or withdrawn
 * (with why). Closing NEVER touches the obligation's own status — the
 * evidence still has to be evaluated where the obligation lives.
 */
router.post(
  "/conformity/evidence-requests/:id/close",
  requireAuth,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const b = req.body ?? {};
    const outcome = String(b.outcome ?? "");
    if (!["fulfilled", "withdrawn"].includes(outcome)) {
      res.status(400).json({ error: `outcome must be "fulfilled" or "withdrawn"` });
      return;
    }
    const resolution = String(b.resolution ?? "").trim();
    if (!resolution) {
      res.status(400).json({
        error:
          outcome === "fulfilled"
            ? "Say what was provided — a bare 'fulfilled' leaves nothing to point at later."
            : "Say why the request is withdrawn.",
      });
      return;
    }

    const [existing] = await db
      .select()
      .from(conformityEvidenceRequestsTable)
      .where(eq(conformityEvidenceRequestsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: `Request ${id} not found` });
      return;
    }
    if (existing.status !== "open") {
      res.status(409).json({ error: `Request ${id} is already ${existing.status}.` });
      return;
    }

    const [row] = await db.transaction(async (tx) => {
      const rows = await tx
        .update(conformityEvidenceRequestsTable)
        .set({
          status: outcome,
          resolution,
          fulfilledAt: outcome === "fulfilled" ? new Date() : null,
          fulfilledBy: outcome === "fulfilled" ? actorOf(req) : "",
        })
        .where(eq(conformityEvidenceRequestsTable.id, id))
        .returning();
      await tx.insert(conformityActivityTable).values({
        entityType: "evidence_request",
        entityId: id,
        action: outcome,
        actor: actorOf(req),
        source: "ui",
        summary: `Evidence request "${existing.title}" ${outcome}: ${resolution.slice(0, 120)}`,
      });
      return rows;
    });
    res.json(row);
  },
);

export default router;
