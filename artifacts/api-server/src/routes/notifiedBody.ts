import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  conformityNotifiedBodyEngagementsTable,
  conformityProductsTable,
} from "@workspace/db";
import { requireAuth, requireAdmin, getSession } from "../lib/adminAuth";
import {
  assessSubmissionPack,
  assessCertificate,
  ceMarkingCarriesNotifiedBodyNumber,
  routeInvolvesNotifiedBody,
  type ConformityModule,
} from "../lib/notifiedBody";

/**
 * Notified body engagement — Art. 32, Annex VIII, Art. 30(4).
 *
 * Every judgement here is derived, never typed: whether the route needs a body
 * at all, whether the application is complete against Annex VIII II.3, whether
 * the certificate clears the product for placing on the market, and whether the
 * notified body's number belongs on the CE marking.
 */
const router: IRouter = Router();

const MODULES = ["module_b_c", "module_h"];
const STATUSES = [
  "draft",
  "lodged",
  "under_examination",
  "certificate_issued",
  "refused",
  "withdrawn",
];

function triState(v: unknown): boolean | null {
  if (v === true || v === false) return v;
  return null;
}

/** Assess one stored engagement against the statute. */
function evaluate(row: typeof conformityNotifiedBodyEngagementsTable.$inferSelect, product: {
  placedOnMarketDate: string | null;
  supportPeriodEnd: string | null;
  manufacturerName: string;
  manufacturerAddress: string;
}) {
  const module = row.module as ConformityModule;
  const submission = assessSubmissionPack({
    module,
    manufacturerName: product.manufacturerName,
    manufacturerAddress: product.manufacturerAddress,
    lodgedByAuthorisedRepresentative: row.lodgedByAuthorisedRepresentative,
    soleApplicationDeclared: row.soleApplicationDeclared,
    technicalDocumentationComplete: row.technicalDocumentationComplete,
    supportingEvidenceProvided: row.supportingEvidenceProvided,
    standardsApplicationDocumented: row.standardsApplicationDocumented,
    notifiedBodyName: row.notifiedBodyName,
    notifiedBodyNumber: row.notifiedBodyNumber,
  });
  const certificate = assessCertificate({
    module,
    status: row.status as never,
    certificateNumber: row.certificateNumber,
    issuedAt: row.certificateIssuedAt?.toISOString() ?? null,
    conditions: row.certificateConditions,
    placedOnMarket: product.placedOnMarketDate,
    supportPeriodEnd: product.supportPeriodEnd,
  });
  return {
    submission,
    certificate,
    /**
     * Art. 30(4) — Module H only. Surfaced next to the engagement so the CE
     * marking surface never has to infer it from "a body was involved".
     */
    ceMarking: {
      carriesNotifiedBodyNumber: ceMarkingCarriesNotifiedBodyNumber(module),
      citation: "Article 30(4)",
      note: ceMarkingCarriesNotifiedBodyNumber(module)
        ? "The CE marking must be followed by this notified body's identification number."
        : "The CE marking must NOT carry a notified body number on this route. Article 30(4) attaches it only to conformity assessment based on full quality assurance (Module H), even though a notified body performs the EU-type examination here.",
    },
  };
}

/** GET — engagements, each with its statutory assessment. */
router.get(
  "/conformity/notified-body/engagements",
  requireAuth,
  async (req: Request, res: Response) => {
    const productId = req.query.productId != null ? Number(req.query.productId) : null;
    const base = db.select().from(conformityNotifiedBodyEngagementsTable);
    const rows = await (productId !== null
      ? base.where(eq(conformityNotifiedBodyEngagementsTable.productId, productId))
      : base
    ).orderBy(desc(conformityNotifiedBodyEngagementsTable.updatedAt));

    const products = await db.select().from(conformityProductsTable);
    const byId = new Map(products.map((p) => [p.id, p]));

    const engagements = rows.map((row) => {
      const p = byId.get(row.productId);
      return {
        ...row,
        assessment: evaluate(row, {
          placedOnMarketDate: p?.placedOnMarketDate ?? null,
          supportPeriodEnd: p?.supportPeriodEnd ?? null,
          manufacturerName: p?.manufacturerName ?? "",
          manufacturerAddress: p?.manufacturerAddress ?? "",
        }),
      };
    });

    res.json({
      total: engagements.length,
      // Surfaced separately: these block placing on the market.
      blockedCount: engagements.filter((e) => !e.assessment.certificate.clearedToPlaceOnMarket)
        .length,
      engagements,
    });
  },
);

/** POST — open an engagement with a single notified body. */
router.post(
  "/conformity/notified-body/engagements",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const b = req.body ?? {};
    const productId = Number(b.productId);
    const module = String(b.module ?? "");

    if (!MODULES.includes(module)) {
      res.status(400).json({
        error: `"${module}" does not involve a notified body`,
        allowed: MODULES,
        citation: "Article 32",
      });
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

    /**
     * Annex VIII II.3 — one application, one body. Refusing a second open
     * engagement is the schema-level expression of the single-body rule; the
     * declaration in II.3.2 would otherwise be one the manufacturer cannot
     * truthfully make.
     */
    const existing = await db
      .select()
      .from(conformityNotifiedBodyEngagementsTable)
      .where(eq(conformityNotifiedBodyEngagementsTable.productId, productId));
    const open = existing.filter((e) => !["withdrawn", "refused"].includes(e.status));
    if (open.length) {
      res.status(409).json({
        error:
          "An open engagement already exists for this product. Annex VIII, Part II, point 3 requires the application to be lodged with a single notified body, accompanied by a declaration that it has not been lodged with any other.",
        citation: "Annex VIII, Part II, point 3",
        existingEngagementId: open[0]!.id,
      });
      return;
    }

    const session = getSession(req);
    const [row] = await db
      .insert(conformityNotifiedBodyEngagementsTable)
      .values({
        productId,
        assessmentId: b.assessmentId != null ? Number(b.assessmentId) : null,
        module,
        notifiedBodyName: String(b.notifiedBodyName ?? ""),
        notifiedBodyNumber: String(b.notifiedBodyNumber ?? ""),
        notifiedBodyCountry: String(b.notifiedBodyCountry ?? ""),
        soleApplicationDeclared: triState(b.soleApplicationDeclared),
        lodgedByAuthorisedRepresentative: triState(b.lodgedByAuthorisedRepresentative),
        technicalDocumentationComplete: triState(b.technicalDocumentationComplete),
        supportingEvidenceProvided: triState(b.supportingEvidenceProvided),
        standardsApplicationDocumented: triState(b.standardsApplicationDocumented),
        status: "draft",
        notes: String(b.notes ?? ""),
        recordedBy: session ? `${session.role}:${session.username}` : "",
      })
      .returning();

    res.status(201).json({
      ...row,
      assessment: evaluate(row!, {
        placedOnMarketDate: product.placedOnMarketDate,
        supportPeriodEnd: product.supportPeriodEnd,
        manufacturerName: product.manufacturerName,
        manufacturerAddress: product.manufacturerAddress,
      }),
    });
  },
);

/** PUT — record progress: lodging, findings, the certificate, a refusal. */
router.put(
  "/conformity/notified-body/engagements/:id",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const b = req.body ?? {};
    if (b.status !== undefined && !STATUSES.includes(String(b.status))) {
      res.status(400).json({ error: `Unknown status "${b.status}"`, allowed: STATUSES });
      return;
    }

    const patch: Record<string, unknown> = {};
    const str = ["notifiedBodyName", "notifiedBodyNumber", "notifiedBodyCountry",
      "certificateNumber", "certificateConditions", "refusalReasons", "notes", "status"];
    for (const k of str) if (b[k] !== undefined) patch[k] = String(b[k]);
    const tri = ["soleApplicationDeclared", "lodgedByAuthorisedRepresentative",
      "technicalDocumentationComplete", "supportingEvidenceProvided", "standardsApplicationDocumented"];
    for (const k of tri) if (b[k] !== undefined) patch[k] = triState(b[k]);
    if (b.lodgedAt !== undefined) patch.lodgedAt = b.lodgedAt ? new Date(String(b.lodgedAt)) : null;
    if (b.certificateIssuedAt !== undefined) {
      patch.certificateIssuedAt = b.certificateIssuedAt ? new Date(String(b.certificateIssuedAt)) : null;
    }
    if (Array.isArray(b.findings)) patch.findings = b.findings;
    if (Array.isArray(b.certificateAdditions)) patch.certificateAdditions = b.certificateAdditions;

    if (!Object.keys(patch).length) {
      res.status(400).json({ error: "No recognised fields to update" });
      return;
    }

    const [row] = await db
      .update(conformityNotifiedBodyEngagementsTable)
      .set(patch)
      .where(eq(conformityNotifiedBodyEngagementsTable.id, id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Engagement not found" });
      return;
    }

    const [product] = await db
      .select()
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.id, row.productId));

    res.json({
      ...row,
      assessment: evaluate(row, {
        placedOnMarketDate: product?.placedOnMarketDate ?? null,
        supportPeriodEnd: product?.supportPeriodEnd ?? null,
        manufacturerName: product?.manufacturerName ?? "",
        manufacturerAddress: product?.manufacturerAddress ?? "",
      }),
    });
  },
);

export default router;
