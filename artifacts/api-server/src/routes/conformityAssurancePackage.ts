import { Router, type IRouter } from "express";
import { desc, eq, inArray } from "drizzle-orm";
import {
  db,
  conformityProductsTable,
  conformitySharedResponsibilityTable,
  conformityDeliveryManifestsTable,
  conformityAssessmentsTable,
  conformityArtifactsTable,
} from "@workspace/db";
import {
  GetAssurancePackageParams,
  GetAssurancePackageResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/adminAuth";

/**
 * The supplier assurance package (B1) — the capstone of the component/IP-supplier
 * shape. A live composition (computed, not stored) of the customer-facing
 * evidence a supplier assembles: the shared-responsibility matrix (B2), the
 * versioned delivery manifest (B3), and the CVD policy / support-period statement
 * / SBOM drawn from the product's conformity artifacts. It reports what is
 * present and how complete the package is — never a conformity verdict.
 */
export const assurancePackageRouter: IRouter = Router();

assurancePackageRouter.get(
  "/conformity/products/:id/assurance-package",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = GetAssurancePackageParams.parse(req.params);
    const [product] = await db
      .select({ name: conformityProductsTable.name })
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.id, id));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const [matrix] = await db
      .select()
      .from(conformitySharedResponsibilityTable)
      .where(eq(conformitySharedResponsibilityTable.productId, id));
    const matrixRows = matrix?.rows?.length ?? 0;

    const manifests = await db
      .select()
      .from(conformityDeliveryManifestsTable)
      .where(eq(conformityDeliveryManifestsTable.productId, id))
      .orderBy(desc(conformityDeliveryManifestsTable.version));

    // Evidence presence is drawn from the product's assessment artifacts.
    const assessments = await db
      .select({ id: conformityAssessmentsTable.id })
      .from(conformityAssessmentsTable)
      .where(eq(conformityAssessmentsTable.productId, id));
    const types = new Set<string>();
    if (assessments.length > 0) {
      const arts = await db
        .select({ artifactType: conformityArtifactsTable.artifactType })
        .from(conformityArtifactsTable)
        .where(
          inArray(
            conformityArtifactsTable.assessmentId,
            assessments.map((a) => a.id),
          ),
        );
      for (const a of arts) types.add(a.artifactType);
    }

    const matrixPresent = matrixRows > 0;
    const manifestVersions = manifests.length;
    const cvdPolicy = types.has("cvd_policy");
    const supportStatement = types.has("support_statement");
    const sbom = types.has("sbom_reference");
    const completeHave = [
      matrixPresent,
      manifestVersions > 0,
      cvdPolicy,
      supportStatement,
      sbom,
    ].filter(Boolean).length;

    res.json(
      GetAssurancePackageResponse.parse({
        productName: product.name,
        matrixPresent,
        matrixRows,
        manifestVersions,
        manifestLatest: manifests[0]?.ipRelease ?? "",
        cvdPolicy,
        supportStatement,
        sbom,
        completeHave,
        completeTotal: 5,
      }),
    );
  },
);
