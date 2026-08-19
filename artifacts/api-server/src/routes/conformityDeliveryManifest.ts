import { Router, type IRouter, type Request } from "express";
import crypto from "crypto";
import { desc, eq, sql } from "drizzle-orm";
import {
  db,
  conformityDeliveryManifestsTable,
  conformityDeliveryManifestAccessTable,
  conformityProductsTable,
  conformityActivityTable,
  type ConformityDeliveryManifestRow,
} from "@workspace/db";
import {
  GetDeliveryManifestParams,
  GetDeliveryManifestResponse,
  CreateDeliveryManifestVersionParams,
  CreateDeliveryManifestVersionBody,
  CreateDeliveryManifestVersionResponse,
  IssueDeliveryManifestAccessParams,
  IssueDeliveryManifestAccessResponse,
  RevokeDeliveryManifestAccessParams,
  RevokeDeliveryManifestAccessResponse,
  GetDeliveryManifestPublicResponse,
} from "@workspace/api-zod";
import { requireAuth, getSession } from "../lib/adminAuth";

/**
 * The versioned delivery manifest (B3) — the component/IP-supplier shape.
 *
 * Internal routes author append-only manifest versions and mint/revoke a single
 * customer-facing token; the public /delivery-manifest/view route resolves that
 * token to the product's manifest history — the supply-side mirror of the
 * auditor door. Authored data, never a conformity verdict.
 */
export const deliveryManifestRouter: IRouter = Router();

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}

async function productName(productId: number): Promise<string | null> {
  const [row] = await db
    .select({ name: conformityProductsTable.name })
    .from(conformityProductsTable)
    .where(eq(conformityProductsTable.id, productId));
  return row ? row.name : null;
}

function toVersionDto(row: ConformityDeliveryManifestRow) {
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

deliveryManifestRouter.get(
  "/conformity/products/:id/delivery-manifest",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = GetDeliveryManifestParams.parse(req.params);
    if ((await productName(id)) === null) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const versions = await db
      .select()
      .from(conformityDeliveryManifestsTable)
      .where(eq(conformityDeliveryManifestsTable.productId, id))
      .orderBy(desc(conformityDeliveryManifestsTable.version));
    const [access] = await db
      .select()
      .from(conformityDeliveryManifestAccessTable)
      .where(eq(conformityDeliveryManifestAccessTable.productId, id));
    res.json(
      GetDeliveryManifestResponse.parse({
        versions: versions.map(toVersionDto),
        accessToken: access && access.isActive ? access.accessToken : "",
        accessActive: access ? access.isActive : false,
      }),
    );
  },
);

deliveryManifestRouter.post(
  "/conformity/products/:id/delivery-manifest",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = CreateDeliveryManifestVersionParams.parse(req.params);
    const body = CreateDeliveryManifestVersionBody.parse(req.body);
    if ((await productName(id)) === null) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const row = await db.transaction(async (tx) => {
      const [{ maxV }] = await tx
        .select({
          maxV: sql<number>`coalesce(max(${conformityDeliveryManifestsTable.version}), 0)::int`,
        })
        .from(conformityDeliveryManifestsTable)
        .where(eq(conformityDeliveryManifestsTable.productId, id));
      const nextVersion = (maxV ?? 0) + 1;
      const [inserted] = await tx
        .insert(conformityDeliveryManifestsTable)
        .values({
          productId: id,
          version: nextVersion,
          ipRelease: body.ipRelease,
          node: body.node ?? "",
          options: body.options ?? [],
          configBaseline: body.configBaseline ?? "",
          changeNote: body.changeNote ?? "",
          createdBy: actorOf(req),
        })
        .returning();
      await tx.insert(conformityActivityTable).values({
        entityType: "product",
        entityId: id,
        action: "updated",
        actor: actorOf(req),
        source: "ui",
        summary: `Delivery manifest v${nextVersion} recorded (${body.ipRelease})`,
      });
      return inserted!;
    });
    res.json(CreateDeliveryManifestVersionResponse.parse(toVersionDto(row)));
  },
);

deliveryManifestRouter.post(
  "/conformity/products/:id/delivery-manifest/access",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = IssueDeliveryManifestAccessParams.parse(req.params);
    if ((await productName(id)) === null) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const token = crypto.randomUUID();
    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(conformityDeliveryManifestAccessTable)
        .where(eq(conformityDeliveryManifestAccessTable.productId, id));
      if (existing) {
        await tx
          .update(conformityDeliveryManifestAccessTable)
          .set({ accessToken: token, isActive: true })
          .where(eq(conformityDeliveryManifestAccessTable.productId, id));
      } else {
        await tx.insert(conformityDeliveryManifestAccessTable).values({
          productId: id,
          accessToken: token,
          createdBy: actorOf(req),
        });
      }
      await tx.insert(conformityActivityTable).values({
        entityType: "product",
        entityId: id,
        action: "updated",
        actor: actorOf(req),
        source: "ui",
        summary: "Delivery-manifest customer link issued",
      });
    });
    res.json(
      IssueDeliveryManifestAccessResponse.parse({ accessToken: token, accessActive: true }),
    );
  },
);

deliveryManifestRouter.post(
  "/conformity/products/:id/delivery-manifest/access/revoke",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = RevokeDeliveryManifestAccessParams.parse(req.params);
    const [updated] = await db
      .update(conformityDeliveryManifestAccessTable)
      .set({ isActive: false })
      .where(eq(conformityDeliveryManifestAccessTable.productId, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "No customer link to revoke" });
      return;
    }
    await db.insert(conformityActivityTable).values({
      entityType: "product",
      entityId: id,
      action: "updated",
      actor: actorOf(req),
      source: "ui",
      summary: "Delivery-manifest customer link revoked",
    });
    res.json(
      RevokeDeliveryManifestAccessResponse.parse({ accessToken: "", accessActive: false }),
    );
  },
);

// Public, token-authenticated customer view — no auth, full-bleed page. Mirrors
// the auditor/supplier door: the token resolves to the product's manifest.
deliveryManifestRouter.get(
  "/conformity/delivery-manifest/view",
  async (req, res): Promise<void> => {
    const token = (req.query.token as string) || "";
    if (!token) {
      res.status(401).json({ error: "Missing manifest access token" });
      return;
    }
    const [access] = await db
      .select()
      .from(conformityDeliveryManifestAccessTable)
      .where(eq(conformityDeliveryManifestAccessTable.accessToken, token));
    if (!access || !access.isActive) {
      res.status(403).json({ error: "Invalid or revoked manifest link" });
      return;
    }
    const name = (await productName(access.productId)) ?? "";
    const versions = await db
      .select()
      .from(conformityDeliveryManifestsTable)
      .where(eq(conformityDeliveryManifestsTable.productId, access.productId))
      .orderBy(desc(conformityDeliveryManifestsTable.version));
    res.json(
      GetDeliveryManifestPublicResponse.parse({
        productName: name,
        versions: versions.map(toVersionDto),
      }),
    );
  },
);
