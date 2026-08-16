import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  conformityEntityIncidentsTable,
  conformityActivityTable,
} from "@workspace/db";
import { requireAuth, getSession } from "../lib/adminAuth";
import { assessEntityIncident } from "../lib/nis2Reporting";

/**
 * NIS2 entity incidents (task 7.4b) — the organisation's own significant
 * incidents under Art. 23, with the engine's staged clocks. Which CSIRT or
 * competent authority receives each submission depends on the Member State
 * transposition (deferred, W2.4), so the recipient is CAPTURED as text from
 * what actually happened, never derived.
 */
const router: IRouter = Router();

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}

function withClocks(row: typeof conformityEntityIncidentsTable.$inferSelect, now: Date) {
  return {
    ...row,
    assessment: assessEntityIncident(
      {
        awareAt: row.awareAt.toISOString(),
        earlyWarningAt: row.earlyWarningAt?.toISOString() ?? null,
        notificationAt: row.notificationAt?.toISOString() ?? null,
        finalReportAt: row.finalReportAt?.toISOString() ?? null,
      },
      now,
    ),
  };
}

/** GET — every entity incident with its computed clocks. */
router.get("/conformity/entity-incidents", requireAuth, async (_req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(conformityEntityIncidentsTable)
    .orderBy(desc(conformityEntityIncidentsTable.awareAt));
  const now = new Date();
  const incidents = rows.map((r) => withClocks(r, now));
  res.json({
    total: incidents.length,
    overdueCount: incidents.filter((i) => i.assessment.overdueCount > 0).length,
    incidents,
  });
});

/** POST — record a significant incident. awareAt is required: every clock runs from it. */
router.post("/conformity/entity-incidents", requireAuth, async (req: Request, res: Response) => {
  const b = req.body ?? {};
  const title = String(b.title ?? "").trim();
  if (!title) {
    res.status(400).json({ error: "A title is required." });
    return;
  }
  const awareAt = b.awareAt ? new Date(String(b.awareAt)) : null;
  if (!awareAt || Number.isNaN(awareAt.getTime())) {
    res.status(400).json({
      error: "awareAt is required — NIS2 Art. 23(4) runs every deadline from when the entity became aware.",
    });
    return;
  }
  if (awareAt.getTime() > Date.now() + 5 * 60 * 1000) {
    res.status(400).json({ error: "awareAt is in the future." });
    return;
  }
  const tri = (v: unknown) => (v === true || v === false ? v : null);

  const [row] = await db.transaction(async (tx) => {
    const rows = await tx
      .insert(conformityEntityIncidentsTable)
      .values({
        title,
        description: String(b.description ?? ""),
        awareAt,
        suspectedMalicious: tri(b.suspectedMalicious),
        possibleCrossBorderImpact: tri(b.possibleCrossBorderImpact),
        recordedBy: actorOf(req),
      })
      .returning();
    await tx.insert(conformityActivityTable).values({
      entityType: "entity_incident",
      entityId: rows[0]!.id,
      action: "created",
      actor: actorOf(req),
      source: "ui",
      summary: `NIS2 entity incident recorded: ${title} (aware ${awareAt.toISOString()})`,
    });
    return rows;
  });
  res.status(201).json(withClocks(row!, new Date()));
});

/**
 * POST — record a stage submission. The statutory ordering is enforced
 * where it is statutory: a final report cannot precede the incident
 * notification, because Art. 23(4)(d) anchors its period on that
 * notification's submission.
 */
router.post(
  "/conformity/entity-incidents/:id/stages",
  requireAuth,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const b = req.body ?? {};
    const stage = String(b.stage ?? "");
    const FIELD: Record<string, "earlyWarningAt" | "notificationAt" | "finalReportAt"> = {
      early_warning: "earlyWarningAt",
      notification: "notificationAt",
      final_report: "finalReportAt",
    };
    if (!FIELD[stage]) {
      res.status(400).json({ error: `stage must be one of ${Object.keys(FIELD).join(", ")}` });
      return;
    }
    const submittedAt = b.submittedAt ? new Date(String(b.submittedAt)) : new Date();
    if (Number.isNaN(submittedAt.getTime()) || submittedAt.getTime() > Date.now() + 5 * 60 * 1000) {
      res.status(400).json({ error: "submittedAt is not a valid, non-future timestamp." });
      return;
    }

    const [existing] = await db
      .select()
      .from(conformityEntityIncidentsTable)
      .where(eq(conformityEntityIncidentsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: `Entity incident ${id} not found` });
      return;
    }
    if (submittedAt.getTime() < existing.awareAt.getTime()) {
      res.status(400).json({ error: "A submission cannot predate awareness of the incident." });
      return;
    }
    if (stage === "final_report" && !existing.notificationAt) {
      res.status(400).json({
        error:
          "The final report cannot be recorded before the incident notification: NIS2 Art. 23(4)(d) runs its one-month period from the notification's submission.",
      });
      return;
    }
    if (existing[FIELD[stage]!]) {
      res.status(409).json({ error: `The ${stage.replaceAll("_", " ")} is already recorded.` });
      return;
    }

    const submittedTo = String(b.submittedTo ?? "").trim();
    const [row] = await db.transaction(async (tx) => {
      const rows = await tx
        .update(conformityEntityIncidentsTable)
        .set({
          [FIELD[stage]!]: submittedAt,
          submittedTo: submittedTo
            ? existing.submittedTo
              ? `${existing.submittedTo}; ${stage}: ${submittedTo}`
              : `${stage}: ${submittedTo}`
            : existing.submittedTo,
        })
        .where(eq(conformityEntityIncidentsTable.id, id))
        .returning();
      await tx.insert(conformityActivityTable).values({
        entityType: "entity_incident",
        entityId: id,
        action: `stage_${stage}`,
        actor: actorOf(req),
        source: "ui",
        summary: `NIS2 ${stage.replaceAll("_", " ")} recorded for "${existing.title}"${
          submittedTo ? ` (to ${submittedTo})` : ""
        }`,
      });
      return rows;
    });
    res.json(withClocks(row!, new Date()));
  },
);

export default router;
