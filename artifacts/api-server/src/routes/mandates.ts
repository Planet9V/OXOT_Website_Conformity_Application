import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db, conformityMandatesTable, conformityProductsTable } from "@workspace/db";
import { requireAuth, requireAdmin, getSession } from "../lib/adminAuth";
import {
  assessMandate,
  obligationsAreWithinMandate,
  MANDATORY_TASKS,
  NON_DELEGABLE,
} from "../lib/authorisedRepresentative";
import { recordAttestation } from "../lib/attestationStore";

/**
 * The custody surface — Article 18.
 *
 * A mandate that purports to delegate the non-delegable is STORED AS WRITTEN
 * and reported as ineffective, rather than rejected or silently trimmed.
 * Rejecting it loses the document; trimming it loses the fact that someone
 * tried to delegate something Art. 18(2) puts beyond any mandate — and that
 * fact is exactly what a market surveillance authority would want to see.
 */
const router: IRouter = Router();

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}

/** GET — mandates, each with its Article 18 assessment. */
router.get("/conformity/mandates", requireAuth, async (req: Request, res: Response) => {
  const productId = req.query.productId != null ? Number(req.query.productId) : null;
  const base = db.select().from(conformityMandatesTable);
  const rows = await (productId !== null
    ? base.where(eq(conformityMandatesTable.productId, productId))
    : base
  ).orderBy(desc(conformityMandatesTable.effectiveFrom));

  const products = await db.select().from(conformityProductsTable);
  const byId = new Map(products.map((p) => [p.id, p]));
  const now = new Date();

  const mandates = rows.map((row) => {
    const p = row.productId != null ? byId.get(row.productId) : undefined;
    return {
      ...row,
      assessment: assessMandate(
        {
          writtenMandateHeld: row.writtenMandateHeld,
          appointingManufacturer: row.appointingManufacturer,
          effectiveFrom: row.effectiveFrom,
          effectiveTo: row.effectiveTo,
          tasksGranted: row.tasksGranted ?? [],
          placedOnMarket: p?.placedOnMarketDate ?? null,
          supportPeriodEnd: p?.supportPeriodEnd ?? null,
        },
        now,
      ),
      /** Art. 18(3): a copy must be producible on request. */
      copyProducible: Boolean(row.objectPath && row.fileHash),
    };
  });

  res.json({
    total: mandates.length,
    inForce: mandates.filter((m) => m.assessment.state === "in_force").length,
    expired: mandates.filter((m) => m.assessment.state === "expired").length,
    /** Surfaced separately: these are mandates that do not do what Art. 18(3) requires. */
    defectiveCount: mandates.filter((m) => m.assessment.defects.length > 0).length,
    mandates,
    /** The vocabulary, so a client never invents a task key. */
    mandatoryTasks: MANDATORY_TASKS,
    nonDelegable: NON_DELEGABLE,
  });
});

/** POST — record a mandate. */
router.post(
  "/conformity/mandates",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const b = req.body ?? {};
    const productId = b.productId != null ? Number(b.productId) : null;
    let product: typeof conformityProductsTable.$inferSelect | undefined;
    if (productId !== null) {
      [product] = await db
        .select()
        .from(conformityProductsTable)
        .where(eq(conformityProductsTable.id, productId));
      if (!product) {
        res.status(404).json({ error: `Product ${productId} not found` });
        return;
      }
    }

    const [row] = await db
      .insert(conformityMandatesTable)
      .values({
        productId,
        appointingManufacturer: String(b.appointingManufacturer ?? ""),
        manufacturerAddress: String(b.manufacturerAddress ?? ""),
        representativeName: String(b.representativeName ?? ""),
        representativeAddress: String(b.representativeAddress ?? ""),
        writtenMandateHeld: b.writtenMandateHeld === true ? true : b.writtenMandateHeld === false ? false : null,
        objectPath: String(b.objectPath ?? ""),
        fileName: String(b.fileName ?? ""),
        fileHash: String(b.fileHash ?? ""),
        effectiveFrom: b.effectiveFrom ? String(b.effectiveFrom) : null,
        effectiveTo: b.effectiveTo ? String(b.effectiveTo) : null,
        tasksGranted: Array.isArray(b.tasksGranted) ? b.tasksGranted : [],
        notes: String(b.notes ?? ""),
        recordedBy: actorOf(req),
      })
      .returning();

    const assessment = assessMandate(
      {
        writtenMandateHeld: row!.writtenMandateHeld,
        appointingManufacturer: row!.appointingManufacturer,
        effectiveFrom: row!.effectiveFrom,
        effectiveTo: row!.effectiveTo,
        tasksGranted: row!.tasksGranted ?? [],
        placedOnMarket: product?.placedOnMarketDate ?? null,
        supportPeriodEnd: product?.supportPeriodEnd ?? null,
      },
      new Date(),
    );

    try {
      await recordAttestation({
        kind: "determination_recorded",
        subject: `mandate:${row!.id}`,
        actor: actorOf(req),
        content: JSON.stringify({
          manufacturer: row!.appointingManufacturer,
          tasksGranted: row!.tasksGranted,
          effectiveFrom: row!.effectiveFrom,
          effectiveTo: row!.effectiveTo,
        }),
        statement: `Recorded an Article 18 mandate from ${row!.appointingManufacturer}, granting ${(row!.tasksGranted ?? []).length} task(s).`,
      });
    } catch {
      /* the mandate is what must not be lost */
    }

    res.status(201).json({ mandate: row, assessment });
  },
);

/**
 * POST — check that a set of obligations is within a mandate.
 *
 * The acceptance criterion as an endpoint, because the failure it guards
 * against is silent: a cockpit rendering the manufacturer's obligation list for
 * a representative tells someone they are responsible for work Art. 18(2) says
 * they cannot even be given.
 */
router.post(
  "/conformity/mandates/:id/check-scope",
  requireAuth,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [row] = await db
      .select()
      .from(conformityMandatesTable)
      .where(eq(conformityMandatesTable.id, id));
    if (!row) {
      res.status(404).json({ error: "Mandate not found" });
      return;
    }
    const shown: string[] = Array.isArray(req.body?.obligations) ? req.body.obligations : [];
    res.json(obligationsAreWithinMandate(shown, row.tasksGranted ?? []));
  },
);

export default router;
