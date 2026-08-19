import { Router, type IRouter, type Request } from "express";
import crypto from "crypto";
import { desc, eq, inArray } from "drizzle-orm";
import {
  db,
  conformityProductsTable,
  conformitySharedResponsibilityTable,
  conformityDeliveryManifestsTable,
  conformityAssessmentsTable,
  conformityArtifactsTable,
  conformityAssuranceRecipientsTable,
  conformityActivityTable,
  type ConformityAssuranceRecipientRow,
  type ConformityDeliveryManifestRow,
} from "@workspace/db";
import {
  GetAssurancePackageParams,
  GetAssurancePackageResponse,
  ListAssuranceRecipientsParams,
  ListAssuranceRecipientsResponse,
  CreateAssuranceRecipientParams,
  CreateAssuranceRecipientBody,
  CreateAssuranceRecipientResponse,
  RevokeAssuranceRecipientParams,
  RevokeAssuranceRecipientResponse,
  GetAssurancePackagePublicResponse,
} from "@workspace/api-zod";
import { requireAuth, getSession } from "../lib/adminAuth";

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}

/** Which core evidence artifacts the product's assessments carry. */
async function evidenceTypes(productId: number): Promise<Set<string>> {
  const assessments = await db
    .select({ id: conformityAssessmentsTable.id })
    .from(conformityAssessmentsTable)
    .where(eq(conformityAssessmentsTable.productId, productId));
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
  return types;
}

function manifestVersionDto(row: ConformityDeliveryManifestRow) {
  return {
    id: row.id,
    productId: row.productId,
    version: row.version,
    ipRelease: row.ipRelease,
    node: row.node,
    options: row.options ?? [],
    configBaseline: row.configBaseline,
    changeNote: row.changeNote,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  };
}

function toRecipientDto(row: ConformityAssuranceRecipientRow) {
  return {
    id: row.id,
    productId: row.productId,
    recipientName: row.recipientName,
    accessToken: row.accessToken,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}

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
    const types = await evidenceTypes(id);

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

// ---------------------------------------------------------------------------
// The publish-to-many door (B4). A supplier issues one revocable link per named
// customer; each resolves to the FULL package on the public view. Internal CRUD
// is member work; the view is public and token-scoped.
// ---------------------------------------------------------------------------

assurancePackageRouter.get(
  "/conformity/products/:id/assurance-recipients",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = ListAssuranceRecipientsParams.parse(req.params);
    const [product] = await db
      .select({ id: conformityProductsTable.id })
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.id, id));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const rows = await db
      .select()
      .from(conformityAssuranceRecipientsTable)
      .where(eq(conformityAssuranceRecipientsTable.productId, id))
      .orderBy(desc(conformityAssuranceRecipientsTable.createdAt));
    res.json(
      ListAssuranceRecipientsResponse.parse({ recipients: rows.map(toRecipientDto) }),
    );
  },
);

assurancePackageRouter.post(
  "/conformity/products/:id/assurance-recipients",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = CreateAssuranceRecipientParams.parse(req.params);
    const body = CreateAssuranceRecipientBody.parse(req.body);
    const [product] = await db
      .select({ id: conformityProductsTable.id })
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.id, id));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const row = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(conformityAssuranceRecipientsTable)
        .values({
          productId: id,
          recipientName: body.recipientName.trim(),
          accessToken: crypto.randomUUID(),
          createdBy: actorOf(req),
        })
        .returning();
      await tx.insert(conformityActivityTable).values({
        entityType: "product",
        entityId: id,
        action: "updated",
        actor: actorOf(req),
        source: "ui",
        summary: `Assurance-package link issued to ${body.recipientName.trim()}`,
      });
      return inserted!;
    });
    res.json(CreateAssuranceRecipientResponse.parse(toRecipientDto(row)));
  },
);

assurancePackageRouter.post(
  "/conformity/assurance-recipients/:id/revoke",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = RevokeAssuranceRecipientParams.parse(req.params);
    const [updated] = await db
      .update(conformityAssuranceRecipientsTable)
      .set({ isActive: false })
      .where(eq(conformityAssuranceRecipientsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Recipient link not found" });
      return;
    }
    await db.insert(conformityActivityTable).values({
      entityType: "product",
      entityId: updated.productId,
      action: "updated",
      actor: actorOf(req),
      source: "ui",
      summary: `Assurance-package link for ${updated.recipientName} revoked`,
    });
    res.json(RevokeAssuranceRecipientResponse.parse(toRecipientDto(updated)));
  },
);

// Public, token-authenticated — the full package for one recipient. No auth.
assurancePackageRouter.get(
  "/conformity/assurance-package/view",
  async (req, res): Promise<void> => {
    const token = (req.query.token as string) || "";
    if (!token) {
      res.status(401).json({ error: "Missing package access token" });
      return;
    }
    const [grant] = await db
      .select()
      .from(conformityAssuranceRecipientsTable)
      .where(eq(conformityAssuranceRecipientsTable.accessToken, token));
    if (!grant || !grant.isActive) {
      res.status(403).json({ error: "Invalid or revoked package link" });
      return;
    }
    const productId = grant.productId;
    const [product] = await db
      .select({ name: conformityProductsTable.name })
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.id, productId));
    const [matrix] = await db
      .select()
      .from(conformitySharedResponsibilityTable)
      .where(eq(conformitySharedResponsibilityTable.productId, productId));
    const versions = await db
      .select()
      .from(conformityDeliveryManifestsTable)
      .where(eq(conformityDeliveryManifestsTable.productId, productId))
      .orderBy(desc(conformityDeliveryManifestsTable.version));
    const types = await evidenceTypes(productId);

    const matrixRows = matrix?.rows ?? [];
    const cvdPolicy = types.has("cvd_policy");
    const supportStatement = types.has("support_statement");
    const sbom = types.has("sbom_reference");
    const completeHave = [
      matrixRows.length > 0,
      versions.length > 0,
      cvdPolicy,
      supportStatement,
      sbom,
    ].filter(Boolean).length;

    res.json(
      GetAssurancePackagePublicResponse.parse({
        productName: product?.name ?? "",
        recipientName: grant.recipientName,
        matrix: matrixRows.map((r) => ({
          area: r.area,
          supplier: r.supplier,
          customer: r.customer,
          note: r.note,
        })),
        versions: versions.map(manifestVersionDto),
        cvdPolicy,
        supportStatement,
        sbom,
        completeHave,
        completeTotal: 5,
      }),
    );
  },
);
