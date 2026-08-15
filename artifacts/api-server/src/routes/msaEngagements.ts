import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db, conformityMsaEngagementsTable } from "@workspace/db";
import { requireAuth, getSession } from "../lib/adminAuth";
import { assessMsaEngagement, type MsaEngagementInput } from "../lib/marketSurveillance";

/**
 * Chapter V — the market surveillance authority workflow.
 *
 * Records what an authority has asked for under Art. 53 or required under
 * Art. 54(1), and assesses each engagement against the Regulation. It does not
 * compute deadlines: Art. 54(1) leaves the period to the authority, so the
 * period is captured from the authority's communication and its absence is
 * reported as a gap.
 */
const router: IRouter = Router();

const KINDS = ["data_access_request", "corrective_action_requirement"];
const SCOPES = ["national", "union_wide"];

function toInput(row: typeof conformityMsaEngagementsTable.$inferSelect): MsaEngagementInput {
  return {
    kind: row.kind as MsaEngagementInput["kind"],
    receivedAt: row.receivedAt?.toISOString() ?? null,
    prescribedDeadline: row.prescribedDeadline?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    scope: (row.scope as MsaEngagementInput["scope"]) ?? null,
    languageConfirmed: row.languageConfirmed,
  };
}

/** GET /conformity/msa/engagements — every engagement, each with its assessment. */
router.get("/conformity/msa/engagements", requireAuth, async (_req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(conformityMsaEngagementsTable)
    .orderBy(desc(conformityMsaEngagementsTable.receivedAt));
  const now = new Date();

  const engagements = rows.map((row) => ({
    ...row,
    assessment: assessMsaEngagement(toInput(row), now),
  }));

  res.json({
    total: engagements.length,
    // Surfaced separately because Art. 54(5) is the point at which the authority
    // may prohibit, withdraw or recall — it should never be buried in a list.
    escalationExposureCount: engagements.filter((e) => e.assessment.escalationExposure).length,
    engagements,
  });
});

/** POST /conformity/msa/engagements — record a request or requirement. */
router.post("/conformity/msa/engagements", requireAuth, async (req: Request, res: Response) => {
  const body = req.body ?? {};
  const kind = String(body.kind ?? "data_access_request");
  if (!KINDS.includes(kind)) {
    res.status(400).json({ error: `Unknown kind "${kind}"`, allowed: KINDS });
    return;
  }
  if (body.scope != null && !SCOPES.includes(String(body.scope))) {
    res.status(400).json({ error: `Unknown scope "${body.scope}"`, allowed: SCOPES });
    return;
  }

  const session = getSession(req);
  const [row] = await db
    .insert(conformityMsaEngagementsTable)
    .values({
      productId: body.productId != null ? Number(body.productId) : null,
      kind,
      authorityName: String(body.authorityName ?? ""),
      memberState: String(body.memberState ?? ""),
      reference: String(body.reference ?? ""),
      receivedAt: body.receivedAt ? new Date(String(body.receivedAt)) : null,
      // Copied from the authority's communication. Never defaulted — see the
      // schema comment and Art. 54(1).
      prescribedDeadline: body.prescribedDeadline
        ? new Date(String(body.prescribedDeadline))
        : null,
      scope: body.scope != null ? String(body.scope) : null,
      requiredMeasure: String(body.requiredMeasure ?? ""),
      languageConfirmed: Boolean(body.languageConfirmed),
      completedAt: body.completedAt ? new Date(String(body.completedAt)) : null,
      notifiedBodyInformedAt: body.notifiedBodyInformedAt
        ? new Date(String(body.notifiedBodyInformedAt))
        : null,
      notes: String(body.notes ?? ""),
      recordedBy: session ? `${session.role}:${session.username}` : "",
    })
    .returning();

  res.status(201).json({ ...row, assessment: assessMsaEngagement(toInput(row), new Date()) });
});

/** PUT /conformity/msa/engagements/:id — record progress on an engagement. */
router.put("/conformity/msa/engagements/:id", requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body ?? {};
  if (body.scope != null && !SCOPES.includes(String(body.scope))) {
    res.status(400).json({ error: `Unknown scope "${body.scope}"`, allowed: SCOPES });
    return;
  }

  const patch: Record<string, unknown> = {};
  if (body.prescribedDeadline !== undefined) {
    patch.prescribedDeadline = body.prescribedDeadline
      ? new Date(String(body.prescribedDeadline))
      : null;
  }
  if (body.scope !== undefined) patch.scope = body.scope != null ? String(body.scope) : null;
  if (body.completedAt !== undefined) {
    patch.completedAt = body.completedAt ? new Date(String(body.completedAt)) : null;
  }
  if (body.notifiedBodyInformedAt !== undefined) {
    patch.notifiedBodyInformedAt = body.notifiedBodyInformedAt
      ? new Date(String(body.notifiedBodyInformedAt))
      : null;
  }
  if (body.languageConfirmed !== undefined) {
    patch.languageConfirmed = Boolean(body.languageConfirmed);
  }
  if (body.requiredMeasure !== undefined) patch.requiredMeasure = String(body.requiredMeasure);
  if (body.notes !== undefined) patch.notes = String(body.notes);

  if (!Object.keys(patch).length) {
    res.status(400).json({ error: "No recognised fields to update" });
    return;
  }

  const [row] = await db
    .update(conformityMsaEngagementsTable)
    .set(patch)
    .where(eq(conformityMsaEngagementsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Engagement not found" });
    return;
  }
  res.json({ ...row, assessment: assessMsaEngagement(toInput(row), new Date()) });
});

export default router;
