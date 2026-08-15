import { Router, type IRouter, type Request, type Response } from "express";
import { eq, inArray } from "drizzle-orm";
import {
  db,
  conformityProductsTable,
  conformityProductVersionsTable,
  conformityBomsTable,
  conformityBomComponentsTable,
  conformityNotifiedBodyEngagementsTable,
} from "@workspace/db";
import { requireAuth } from "../lib/adminAuth";
import { resolveVersion } from "../lib/productVersions";
import {
  assessComponentDueDiligence,
  summariseProductDueDiligence,
  type DueDiligenceAction,
} from "../lib/supplierDueDiligence";
import { assessEndOfSupport } from "../lib/endOfSupport";
import { assessCertificate, ceMarkingCarriesNotifiedBodyNumber, type ConformityModule } from "../lib/notifiedBody";
import { technicalDocumentationRetention, userInformationRetention } from "../lib/retention";

/**
 * The product's statutory file — one view of everything the CRA asks of this
 * product, assembled from the rules rather than stored as a status.
 *
 * This is the "product file" the design doc makes the central object. It
 * deliberately reports GAPS and CITATIONS rather than a score: a percentage
 * reads as reassurance while the missing part is the part that matters.
 */
const router: IRouter = Router();

router.get(
  "/conformity/products/:id/statutory-file",
  requireAuth,
  async (req: Request, res: Response) => {
    const productId = Number(req.params.id);
    const [product] = await db
      .select()
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.id, productId));
    if (!product) {
      res.status(404).json({ error: `Product ${productId} not found` });
      return;
    }
    const now = new Date();

    // ---- Versions (1B.3) --------------------------------------------------
    const versionRows = await db
      .select()
      .from(conformityProductVersionsTable)
      .where(eq(conformityProductVersionsTable.productId, productId));
    const versions = versionRows.map((v) => resolveVersion(product, v));

    /**
     * With no versions recorded the product line itself is the only anchor we
     * have. Reported as such, and flagged, rather than presented as equivalent.
     */
    const productLevelRetention = {
      technicalDocumentation: technicalDocumentationRetention({
        placedOnMarket: product.placedOnMarketDate,
        supportPeriodEnd: product.supportPeriodEnd,
      }),
      userInformation: userInformationRetention({
        placedOnMarket: product.placedOnMarketDate,
        supportPeriodEnd: product.supportPeriodEnd,
      }),
    };

    // ---- Supplier due diligence (1B.2) ------------------------------------
    const boms = await db
      .select()
      .from(conformityBomsTable)
      .where(eq(conformityBomsTable.assessmentId, productId));
    const bomIds = boms.map((b) => b.id);
    const components = bomIds.length
      ? await db
          .select()
          .from(conformityBomComponentsTable)
          .where(inArray(conformityBomComponentsTable.bomId, bomIds))
      : [];

    const componentAssessments = components.map((c) =>
      assessComponentDueDiligence({
        componentName: c.name,
        supplier: c.supplier || c.manufacturer,
        // A component with no licence and an OSS-looking supplier is not
        // enough to call it FOSS; left null unless recorded.
        isFreeAndOpenSource: null,
        risk: (c.dueDiligenceRisk as "low" | "medium" | "high" | null) ?? null,
        actionsTaken: (c.dueDiligenceActions ?? []) as DueDiligenceAction[],
        vulnerabilityFound: c.dueDiligenceVulnerabilityFound,
        maintainerInformedAt: c.dueDiligenceMaintainerInformedAt,
        remediatedAt: c.dueDiligenceRemediatedAt,
        securityFixProvidedToMaintainer: c.dueDiligenceFixProvided,
      }),
    );
    const dueDiligence = summariseProductDueDiligence(componentAssessments);

    // ---- End of support (1B.5) --------------------------------------------
    const endOfSupport = assessEndOfSupport(
      {
        supportPeriodStart: product.supportPeriodStart,
        supportPeriodEnd: product.supportPeriodEnd,
        placedOnMarket: product.placedOnMarketDate,
        // Not yet captured anywhere; null so it reads as unrecorded.
        endDateCommunicatedToUsers: null,
        securityUpdatesIssuedOn: [],
      },
      now,
    );

    // ---- Notified body (1B.1) ---------------------------------------------
    const engagements = await db
      .select()
      .from(conformityNotifiedBodyEngagementsTable)
      .where(eq(conformityNotifiedBodyEngagementsTable.productId, productId));
    const open = engagements.find((e) => !["withdrawn", "refused"].includes(e.status));
    const notifiedBody = open
      ? {
          engagementId: open.id,
          module: open.module,
          body: open.notifiedBodyName,
          number: open.notifiedBodyNumber,
          status: open.status,
          certificate: assessCertificate({
            module: open.module as ConformityModule,
            status: open.status as never,
            certificateNumber: open.certificateNumber,
            conditions: open.certificateConditions,
            placedOnMarket: product.placedOnMarketDate,
            supportPeriodEnd: product.supportPeriodEnd,
          }),
          ceMarkingCarriesNumber: ceMarkingCarriesNotifiedBodyNumber(open.module as ConformityModule),
        }
      : null;

    // ---- What is missing, in one list -------------------------------------
    const gaps: { citation: string; gap: string }[] = [];
    for (const v of versions) for (const g of v.gaps) gaps.push({ citation: "Article 13(13)/13(18)", gap: g });
    for (const g of endOfSupport.gaps) gaps.push({ citation: "Article 13(8)", gap: g });
    if (!versionRows.length) {
      gaps.push({
        citation: "Article 3(30), Article 13(13)",
        gap: "No versions are recorded. Retention runs from when a version was placed on the market, and a substantial modification attaches to a specific version, so the product line's dates are being used as a stand-in.",
      });
    }
    if (!components.length) {
      gaps.push({
        citation: "Article 13(5)",
        gap: "No components are recorded, so due diligence over third-party components cannot be evidenced.",
      });
    }
    if (notifiedBody && !notifiedBody.certificate.clearedToPlaceOnMarket) {
      gaps.push({
        citation: "Annex VIII, Part II, point 6",
        gap: notifiedBody.certificate.message,
      });
    }

    res.json({
      product: {
        id: product.id,
        name: product.name,
        placedOnMarketDate: product.placedOnMarketDate,
        supportPeriodStart: product.supportPeriodStart,
        supportPeriodEnd: product.supportPeriodEnd,
      },
      versions,
      productLevelRetention,
      dueDiligence: { summary: dueDiligence, components: componentAssessments },
      endOfSupport,
      notifiedBody,
      gaps,
      /** Deliberately a count of what is missing, never a score. */
      gapCount: gaps.length,
    });
  },
);

export default router;
