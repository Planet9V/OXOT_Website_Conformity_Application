import { Router, type IRouter, type Request, type Response } from "express";
import { createHash } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import {
  db,
  craDeemedManufacturerAssessments,
  conformityAssessmentsTable,
  conformityProductsTable,
} from "@workspace/db";
import { requireAuth, requireAdmin, getSession } from "../lib/adminAuth";
import {
  assessDeemedManufacturer,
  type DeemedManufacturerInput,
} from "../lib/deemedManufacturer";

/**
 * Articles 21 and 22 — the deemed-manufacturer transition.
 *
 * The endpoint this replaces computed a determination and persisted nothing,
 * so the assessment existed only in whatever the browser happened to render.
 * It also hashed a hardcoded timestamp, which meant two assessments of the same
 * facts months apart produced an identical "certificate hash".
 *
 * Here the assessment is a record: facts in, determination out, both stored
 * with a real timestamp and the identity of whoever ran it. Where the
 * transition fires, it opens a manufacturer obligation set for the product —
 * the point of the whole phase. Becoming a manufacturer is not a label; it is
 * Articles 13 and 14 landing on you.
 */
const router: IRouter = Router();

const ROLES = ["importer", "distributor", "other_person", "manufacturer"];

/** Tri-state: absent/null stays null. Never coerce unanswered into false. */
function triState(v: unknown): boolean | null {
  if (v === true || v === false) return v;
  return null;
}

router.post(
  "/conformity/deemed-manufacturer/assess",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const b = req.body ?? {};
    const actorRole = String(b.actorRole ?? "");
    if (!ROLES.includes(actorRole)) {
      res.status(400).json({ error: `Unknown actorRole "${actorRole}"`, allowed: ROLES });
      return;
    }

    const productId = b.productId != null ? Number(b.productId) : null;
    if (productId !== null) {
      const [product] = await db
        .select()
        .from(conformityProductsTable)
        .where(eq(conformityProductsTable.id, productId));
      if (!product) {
        res.status(404).json({ error: `Product ${productId} not found` });
        return;
      }
    }

    const facts: DeemedManufacturerInput = {
      actorRole: actorRole as DeemedManufacturerInput["actorRole"],
      placedUnderOwnNameOrTrademark: triState(b.placedUnderOwnNameOrTrademark),
      modificationMade: triState(b.modificationMade),
      changeFollowsPlacingOnMarket: triState(b.changeFollowsPlacingOnMarket),
      affectsAnnexIPartICompliance: triState(b.affectsAnnexIPartICompliance),
      modifiesAssessedIntendedPurpose: triState(b.modifiesAssessedIntendedPurpose),
      makesAvailableOnMarket: triState(b.makesAvailableOnMarket),
      cybersecurityImpactIsProductWide: triState(b.cybersecurityImpactIsProductWide),
    };

    const determination = assessDeemedManufacturer(facts);
    const session = getSession(req);
    const assessedBy = session ? `${session.role}:${session.username}` : "";
    const assessedAt = new Date();

    /**
     * Task 2.3 — the transition made real.
     *
     * A positive determination means Articles 13 and 14 now apply to this
     * actor, so the product gets a manufacturer obligation set it did not have
     * before. Without this the assessment is a piece of paper telling someone
     * they have obligations, in an application whose entire purpose is to
     * manage them.
     *
     * Only opened when a product was identified, and only once — re-running the
     * assessment must not spawn duplicate assessments.
     */
    let openedAssessmentId: number | null = null;
    if (determination.deemedManufacturer && productId !== null) {
      const [existing] = await db
        .select()
        .from(conformityAssessmentsTable)
        .where(eq(conformityAssessmentsTable.productId, productId));
      if (existing) {
        openedAssessmentId = existing.id;
      } else {
        const [created] = await db
          .insert(conformityAssessmentsTable)
          .values({
            productId,
            regulationKey: "cra",
            status: "active",
            currentStage: "scoping",
            scopeResult: "in_scope",
          })
          .returning();
        openedAssessmentId = created?.id ?? null;
      }
    }

    // Hash over the real record, including the real timestamp — so two
    // assessments of identical facts on different days differ.
    const recordHash = createHash("sha256")
      .update(
        JSON.stringify({
          facts,
          determination: {
            isSubstantialModification: determination.isSubstantialModification,
            deemedManufacturer: determination.deemedManufacturer,
            governingArticle: determination.governingArticle,
            obligationScope: determination.obligationScope,
          },
          assessedBy,
          assessedAt: assessedAt.toISOString(),
        }),
      )
      .digest("hex");

    const [row] = await db
      .insert(craDeemedManufacturerAssessments)
      .values({
        productId,
        subjectName: String(b.subjectName ?? ""),
        siteName: String(b.siteName ?? ""),
        projectName: String(b.projectName ?? ""),
        actorRole,
        placedUnderOwnNameOrTrademark: facts.placedUnderOwnNameOrTrademark,
        modificationMade: facts.modificationMade,
        changeFollowsPlacingOnMarket: facts.changeFollowsPlacingOnMarket,
        affectsAnnexIPartICompliance: facts.affectsAnnexIPartICompliance,
        modifiesAssessedIntendedPurpose: facts.modifiesAssessedIntendedPurpose,
        makesAvailableOnMarket: facts.makesAvailableOnMarket,
        cybersecurityImpactIsProductWide: facts.cybersecurityImpactIsProductWide,
        isSubstantialModification: determination.isSubstantialModification,
        deemedManufacturer: determination.deemedManufacturer,
        governingArticle: determination.governingArticle,
        trigger: determination.trigger,
        obligationScope: determination.obligationScope,
        unanswered: determination.unanswered,
        citations: determination.citations,
        message: determination.message,
        openedAssessmentId,
        assessedBy,
        assessedAt,
        recordHash,
      })
      .returning();

    res.status(201).json({ assessment: row, determination, openedAssessmentId });
  },
);

/** GET — the assessment history, newest first. An audit trail, not a cache. */
router.get(
  "/conformity/deemed-manufacturer/assessments",
  requireAuth,
  async (req: Request, res: Response) => {
    const productId = req.query.productId != null ? Number(req.query.productId) : null;
    const base = db.select().from(craDeemedManufacturerAssessments);
    const rows = await (productId !== null
      ? base.where(eq(craDeemedManufacturerAssessments.productId, productId))
      : base
    ).orderBy(desc(craDeemedManufacturerAssessments.assessedAt));
    res.json({ total: rows.length, assessments: rows });
  },
);

export default router;
