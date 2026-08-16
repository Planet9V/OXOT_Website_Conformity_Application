import { Router, type IRouter, type Request } from "express";
import { eq, desc } from "drizzle-orm";
import {
  db,
  conformityProductsTable,
  conformityProductUsersTable,
  conformityUserNotificationsTable,
  conformityAdvisoriesTable,
  conformityActivityTable,
  type ConformityProductUserRow,
  type ConformityUserNotificationRow,
} from "@workspace/db";
import {
  ListProductUsersParams,
  ListProductUsersResponse,
  CreateProductUserParams,
  CreateProductUserBody,
  CreateProductUserResponse,
  DeleteProductUserParams,
  DeleteProductUserResponse,
  GetAdvisoryImpactedUsersParams,
  GetAdvisoryImpactedUsersResponse,
  ListUserNotificationsParams,
  ListUserNotificationsResponse,
  RecordUserNotificationParams,
  RecordUserNotificationBody,
  RecordUserNotificationResponse,
} from "@workspace/api-zod";
import { requireAuth, getSession } from "../lib/adminAuth";

/**
 * The product-user register and user-notification record (task 10.2 —
 * CRA Art. 14(8); NIS2 Art. 23(2) is the sibling duty).
 *
 * This application transmits nothing to users and never claims to: the
 * notification endpoints record the ORGANISATION'S OWN stated act with its
 * provenance. The impacted-users derivation states its own rule because the
 * advisory's affected-versions field is free text — an exact recorded-
 * version match is the only claim the data supports.
 */
const router: IRouter = Router();

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}

async function productExists(id: number): Promise<boolean> {
  const [row] = await db
    .select({ id: conformityProductsTable.id })
    .from(conformityProductsTable)
    .where(eq(conformityProductsTable.id, id));
  return Boolean(row);
}

function toUserDto(row: ConformityProductUserRow) {
  return {
    id: row.id,
    productId: row.productId,
    name: row.name,
    contact: row.contact,
    deployedVersion: row.deployedVersion,
    notes: row.notes,
    registeredBy: row.registeredBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toNotificationDto(row: ConformityUserNotificationRow) {
  return {
    id: row.id,
    productId: row.productId,
    advisoryId: row.advisoryId ?? null,
    scope: row.scope,
    statedAt: row.statedAt.toISOString(),
    method: row.method,
    measuresSummary: row.measuresSummary,
    machineReadableFormat: row.machineReadableFormat,
    recordedBy: row.recordedBy,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/conformity/products/:id/users", requireAuth, async (req, res): Promise<void> => {
  const { id } = ListProductUsersParams.parse(req.params);
  if (!(await productExists(id))) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const rows = await db
    .select()
    .from(conformityProductUsersTable)
    .where(eq(conformityProductUsersTable.productId, id))
    .orderBy(desc(conformityProductUsersTable.createdAt));
  res.json(ListProductUsersResponse.parse({ users: rows.map(toUserDto) }));
});

router.post("/conformity/products/:id/users", requireAuth, async (req, res): Promise<void> => {
  const { id } = CreateProductUserParams.parse(req.params);
  const body = CreateProductUserBody.parse(req.body);
  if (!body.name.trim()) {
    res.status(400).json({ error: "A user needs a name" });
    return;
  }
  if (!(await productExists(id))) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const row = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(conformityProductUsersTable)
      .values({
        productId: id,
        name: body.name.trim(),
        contact: body.contact ?? "",
        deployedVersion: body.deployedVersion ?? "",
        notes: body.notes ?? "",
        registeredBy: actorOf(req),
      })
      .returning();
    await tx.insert(conformityActivityTable).values({
      entityType: "product",
      entityId: id,
      action: "product_user_registered",
      actor: actorOf(req),
      source: "ui",
      summary: `Product user "${inserted!.name}" registered (Art. 14(8) register)`,
    });
    return inserted!;
  });
  res.json(CreateProductUserResponse.parse(toUserDto(row)));
});

router.delete("/conformity/product-users/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = DeleteProductUserParams.parse(req.params);
  const [deleted] = await db
    .delete(conformityProductUsersTable)
    .where(eq(conformityProductUsersTable.id, id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Product user not found" });
    return;
  }
  await db.insert(conformityActivityTable).values({
    entityType: "product",
    entityId: deleted.productId,
    action: "product_user_removed",
    actor: actorOf(req),
    source: "ui",
    summary: `Product user "${deleted.name}" removed from the register`,
  });
  res.json(DeleteProductUserResponse.parse({ success: true }));
});

/**
 * The rule, stated once and returned with every response so no caller can
 * present the split as more certain than the data supports.
 */
const IMPACT_RULE =
  "Exact match on the RECORDED version only: the advisory's affected-versions field is free text, so users whose recorded version appears verbatim are 'impacted'; users with no recorded version cannot be ruled out; all others need manual verification against the advisory.";

router.get(
  "/conformity/advisories/:id/impacted-users",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = GetAdvisoryImpactedUsersParams.parse(req.params);
    const [advisory] = await db
      .select()
      .from(conformityAdvisoriesTable)
      .where(eq(conformityAdvisoriesTable.id, id));
    if (!advisory) {
      res.status(404).json({ error: "Advisory not found" });
      return;
    }
    if (!advisory.productId) {
      // The advisory survives product deletion with a frozen name; with no
      // product there is no register to derive against.
      res.json(
        GetAdvisoryImpactedUsersResponse.parse({
          rule: IMPACT_RULE,
          affectedVersionTokens: [],
          impacted: [],
          versionNotRecorded: [],
          noRecordedMatch: [],
        }),
      );
      return;
    }
    const tokens = advisory.affectedVersions
      .split(/[,;\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const users = await db
      .select()
      .from(conformityProductUsersTable)
      .where(eq(conformityProductUsersTable.productId, advisory.productId));

    const impacted = users.filter((u) => u.deployedVersion && tokens.includes(u.deployedVersion));
    const versionNotRecorded = users.filter((u) => !u.deployedVersion);
    const noRecordedMatch = users.filter(
      (u) => u.deployedVersion && !tokens.includes(u.deployedVersion),
    );
    res.json(
      GetAdvisoryImpactedUsersResponse.parse({
        rule: IMPACT_RULE,
        affectedVersionTokens: tokens,
        impacted: impacted.map(toUserDto),
        versionNotRecorded: versionNotRecorded.map(toUserDto),
        noRecordedMatch: noRecordedMatch.map(toUserDto),
      }),
    );
  },
);

router.get(
  "/conformity/products/:id/user-notifications",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = ListUserNotificationsParams.parse(req.params);
    if (!(await productExists(id))) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const rows = await db
      .select()
      .from(conformityUserNotificationsTable)
      .where(eq(conformityUserNotificationsTable.productId, id))
      .orderBy(desc(conformityUserNotificationsTable.createdAt));
    res.json(
      ListUserNotificationsResponse.parse({ notifications: rows.map(toNotificationDto) }),
    );
  },
);

router.post(
  "/conformity/products/:id/user-notifications",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = RecordUserNotificationParams.parse(req.params);
    const body = RecordUserNotificationBody.parse(req.body);
    if (!(await productExists(id))) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const statedAt = new Date(body.statedAt);
    if (Number.isNaN(statedAt.getTime())) {
      res.status(400).json({ error: "statedAt must be a valid date-time — it is the recorder's explicit statement of when users were informed" });
      return;
    }
    if (body.advisoryId != null) {
      const [advisory] = await db
        .select({ id: conformityAdvisoriesTable.id })
        .from(conformityAdvisoriesTable)
        .where(eq(conformityAdvisoriesTable.id, body.advisoryId));
      if (!advisory) {
        res.status(400).json({ error: "advisoryId does not exist" });
        return;
      }
    }
    const row = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(conformityUserNotificationsTable)
        .values({
          productId: id,
          advisoryId: body.advisoryId ?? null,
          scope: body.scope,
          statedAt,
          method: body.method,
          measuresSummary: body.measuresSummary ?? "",
          machineReadableFormat: body.machineReadableFormat ?? "",
          recordedBy: actorOf(req),
        })
        .returning();
      await tx.insert(conformityActivityTable).values({
        entityType: "product",
        entityId: id,
        action: "user_notification_recorded",
        actor: actorOf(req),
        source: "ui",
        summary: `User notification recorded (${body.scope === "all_users" ? "all users" : "impacted users"}, stated ${statedAt.toISOString().slice(0, 10)}) — Art. 14(8)`,
      });
      return inserted!;
    });
    res.json(RecordUserNotificationResponse.parse(toNotificationDto(row)));
  },
);

export default router;
