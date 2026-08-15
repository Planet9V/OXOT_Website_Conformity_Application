import { Router, type IRouter, type Request, type Response } from "express";
import { and, eq } from "drizzle-orm";
import {
  db,
  conformityOperatorChecksTable,
  conformityProductsTable,
} from "@workspace/db";
import { requireAuth, requireAdmin, getSession } from "../lib/adminAuth";
import {
  assessImporterVerification,
  assessDistributorVerification,
  assessDutyToRefrain,
  type OperatorRole,
} from "../lib/economicOperatorVerification";
import { recordAttestation } from "../lib/attestationStore";

/**
 * The verification shape's surface — Arts. 19 and 20.
 *
 * The point of this route is that a hold is not advice. Art. 19(3) and 20(3)
 * say the operator "shall not place" / "shall not make available" the product
 * until it has been brought into conformity. So a held product is refused here,
 * with the article, rather than warned about and allowed through.
 */
const router: IRouter = Router();

const ROLES = ["importer", "distributor"];

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}
function tri(v: unknown): boolean | null {
  return v === true || v === false ? v : null;
}

function evaluate(row: typeof conformityOperatorChecksTable.$inferSelect) {
  const role = row.role as OperatorRole;
  const verification =
    role === "importer"
      ? assessImporterVerification({
          conformityAssessmentCarriedOut: row.conformityAssessmentCarriedOut,
          technicalDocumentationDrawnUp: row.technicalDocumentationDrawnUp,
          ceMarkingPresent: row.ceMarkingPresent,
          euDeclarationAccompanies: row.euDeclarationAccompanies,
          userInformationPresent: row.userInformationPresent,
          userInformationLanguageUnderstood: row.userInformationLanguageUnderstood,
          manufacturerIdentificationComplied: row.manufacturerIdentificationComplied,
          canProvideProvingDocuments: row.canProvideProvingDocuments,
          ownContactDetailsAffixed: row.ownContactDetailsAffixed,
        })
      : assessDistributorVerification({
          ceMarkingPresent: row.ceMarkingPresent,
          upstreamObligationsComplied: row.upstreamObligationsComplied,
          necessaryDocumentsProvided: row.necessaryDocumentsProvided,
        });

  const refrain = assessDutyToRefrain({
    role,
    believesNonConforming: row.believesNonConforming,
    basedOnInformationInPossession: row.basedOnInformationInPossession,
    significantCybersecurityRisk: row.significantCybersecurityRisk,
    significantRiskFromNonTechnicalFactors: row.significantRiskFromNonTechnicalFactors,
    manufacturerInformedAt: row.manufacturerInformedAt?.toISOString() ?? null,
    marketSurveillanceInformedAt: row.marketSurveillanceInformedAt?.toISOString() ?? null,
    broughtIntoConformityAt: row.broughtIntoConformityAt?.toISOString() ?? null,
  });

  return {
    verification,
    dutyToRefrain: refrain,
    /** The single question the rest of the app asks: may this be supplied? */
    maySupply: verification.cleared && !refrain.held,
  };
}

/** GET — the checks for a product, or all of them. */
router.get("/conformity/operator-checks", requireAuth, async (req: Request, res: Response) => {
  const productId = req.query.productId != null ? Number(req.query.productId) : null;
  const base = db.select().from(conformityOperatorChecksTable);
  const rows = await (productId !== null
    ? base.where(eq(conformityOperatorChecksTable.productId, productId))
    : base);

  const checks = rows.map((r) => ({ ...r, assessment: evaluate(r) }));
  res.json({
    total: checks.length,
    heldCount: checks.filter((c) => c.assessment.dutyToRefrain.held).length,
    checks,
  });
});

/** PUT — record or update the checks for one product and role. */
router.put(
  "/conformity/products/:id/operator-check/:role",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const productId = Number(req.params.id);
    const role = String(req.params.role);
    if (!ROLES.includes(role)) {
      res.status(400).json({ error: `Unknown role "${role}"`, allowed: ROLES });
      return;
    }
    const [product] = await db
      .select()
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.id, productId));
    if (!product) {
      res.status(404).json({ error: `Product ${productId} not found` });
      return;
    }

    const b = req.body ?? {};
    const values = {
      productId,
      role,
      conformityAssessmentCarriedOut: tri(b.conformityAssessmentCarriedOut),
      technicalDocumentationDrawnUp: tri(b.technicalDocumentationDrawnUp),
      euDeclarationAccompanies: tri(b.euDeclarationAccompanies),
      userInformationPresent: tri(b.userInformationPresent),
      userInformationLanguageUnderstood: tri(b.userInformationLanguageUnderstood),
      manufacturerIdentificationComplied: tri(b.manufacturerIdentificationComplied),
      canProvideProvingDocuments: tri(b.canProvideProvingDocuments),
      ownContactDetailsAffixed: tri(b.ownContactDetailsAffixed),
      ceMarkingPresent: tri(b.ceMarkingPresent),
      upstreamObligationsComplied: tri(b.upstreamObligationsComplied),
      necessaryDocumentsProvided: tri(b.necessaryDocumentsProvided),
      believesNonConforming: tri(b.believesNonConforming),
      basedOnInformationInPossession: tri(b.basedOnInformationInPossession),
      informationHeld: String(b.informationHeld ?? ""),
      significantCybersecurityRisk: tri(b.significantCybersecurityRisk),
      significantRiskFromNonTechnicalFactors: tri(b.significantRiskFromNonTechnicalFactors),
      manufacturerInformedAt: b.manufacturerInformedAt ? new Date(String(b.manufacturerInformedAt)) : null,
      marketSurveillanceInformedAt: b.marketSurveillanceInformedAt
        ? new Date(String(b.marketSurveillanceInformedAt))
        : null,
      broughtIntoConformityAt: b.broughtIntoConformityAt
        ? new Date(String(b.broughtIntoConformityAt))
        : null,
      notes: String(b.notes ?? ""),
      recordedBy: actorOf(req),
    };

    const [existing] = await db
      .select()
      .from(conformityOperatorChecksTable)
      .where(
        and(
          eq(conformityOperatorChecksTable.productId, productId),
          eq(conformityOperatorChecksTable.role, role),
        ),
      );

    const [row] = existing
      ? await db
          .update(conformityOperatorChecksTable)
          .set(values)
          .where(eq(conformityOperatorChecksTable.id, existing.id))
          .returning()
      : await db.insert(conformityOperatorChecksTable).values(values).returning();

    const assessment = evaluate(row!);

    /**
     * A hold is a determination about a product's legal status, so it goes on
     * the provenance ledger. Who decided the product must not be supplied, and
     * when, is exactly the kind of thing that gets argued about later.
     */
    if (assessment.dutyToRefrain.held) {
      try {
        await recordAttestation({
          kind: "determination_recorded",
          subject: `operator_hold:${productId}:${role}`,
          actor: actorOf(req),
          content: JSON.stringify({
            believesNonConforming: row!.believesNonConforming,
            informationHeld: row!.informationHeld,
            significantCybersecurityRisk: row!.significantCybersecurityRisk,
          }),
          statement: assessment.dutyToRefrain.message,
        });
      } catch {
        /* the hold itself is what must not be lost */
      }
    }

    res.json({ ...row, assessment });
  },
);

/**
 * POST — record that the product has been supplied.
 *
 * This is the acceptance criterion in force: a held product cannot be marked
 * available, and the refusal cites the article. Warning and allowing it through
 * would make the hold advisory, which is not what Arts. 19(3) and 20(3) say.
 */
router.post(
  "/conformity/products/:id/operator-check/:role/supply",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const productId = Number(req.params.id);
    const role = String(req.params.role);
    if (!ROLES.includes(role)) {
      res.status(400).json({ error: `Unknown role "${role}"`, allowed: ROLES });
      return;
    }

    const [row] = await db
      .select()
      .from(conformityOperatorChecksTable)
      .where(
        and(
          eq(conformityOperatorChecksTable.productId, productId),
          eq(conformityOperatorChecksTable.role, role),
        ),
      );

    if (!row) {
      res.status(409).json({
        supplied: false,
        error:
          role === "importer"
            ? "No Article 19(2) verification is recorded for this product. Importers shall ensure those checks BEFORE placing the product on the market."
            : "No Article 20(2) verification is recorded for this product. Distributors shall verify those before making the product available.",
        citation: role === "importer" ? "Article 19(2)" : "Article 20(2)",
      });
      return;
    }

    const assessment = evaluate(row);
    if (!assessment.maySupply) {
      res.status(409).json({
        supplied: false,
        blockedAction: assessment.dutyToRefrain.blockedAction,
        held: assessment.dutyToRefrain.held,
        citation: assessment.dutyToRefrain.held
          ? assessment.dutyToRefrain.citations[0]
          : assessment.verification.citations[0],
        error: assessment.dutyToRefrain.held
          ? assessment.dutyToRefrain.message
          : assessment.verification.message,
        outstanding: assessment.dutyToRefrain.held
          ? assessment.dutyToRefrain.gaps
          : assessment.verification.gaps,
      });
      return;
    }

    await recordAttestation({
      kind: "determination_recorded",
      subject: `operator_supply:${productId}:${role}`,
      actor: actorOf(req),
      content: JSON.stringify({ productId, role, at: new Date().toISOString() }),
      statement:
        role === "importer"
          ? "Placed on the market, with the Article 19(2) checks verified and no Article 19(3) hold in force."
          : "Made available on the market, with the Article 20(2) checks verified and no Article 20(3) hold in force.",
    });

    res.json({
      supplied: true,
      citation: role === "importer" ? "Article 19(2)" : "Article 20(2)",
      message:
        role === "importer"
          ? "Recorded as placed on the market. Article 19(6) retention now runs."
          : "Recorded as made available on the market. Article 23(2) traceability now runs from this supply.",
    });
  },
);

export default router;
