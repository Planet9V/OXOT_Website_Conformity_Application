import { Router, type Request } from "express";
import crypto from "crypto";
import { eq, desc } from "drizzle-orm";
import {
  db,
  conformityAuditorAccessTable,
  conformityAuditorRfisTable,
  conformityAssessmentsTable,
  conformityProductsTable,
  conformityEvidenceTable,
  conformityArtifactsTable,
  conformityActivityTable,
  type ConformityAuditorAccessRow,
  type ConformityAuditorRfiRow,
} from "@workspace/db";
import {
  ListAuditorAccessParams,
  ListAuditorAccessResponse,
  IssueAuditorAccessParams,
  IssueAuditorAccessBody,
  IssueAuditorAccessResponse,
  RevokeAuditorAccessParams,
  RevokeAuditorAccessResponse,
  ListAuditorRfisParams,
  ListAuditorRfisResponse,
  RespondAuditorRfiParams,
  RespondAuditorRfiBody,
  RespondAuditorRfiResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin, getSession } from "../lib/adminAuth";

export const auditorRouter = Router();

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}

function toAccessDto(row: ConformityAuditorAccessRow) {
  return {
    id: row.id,
    assessmentId: row.assessmentId,
    auditorEmail: row.auditorEmail,
    notifiedBodyName: row.notifiedBodyName,
    notifiedBodyNumber: row.notifiedBodyNumber,
    accessToken: row.accessToken,
    expiresAt: row.expiresAt.toISOString(),
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}

function toRfiDto(row: ConformityAuditorRfiRow) {
  return {
    id: row.id,
    assessmentId: row.assessmentId,
    requirementRefCode: row.requirementRefCode ?? null,
    auditorEmail: row.auditorEmail,
    question: row.question,
    severity: row.severity,
    status: row.status,
    manufacturerResponse: row.manufacturerResponse,
    respondedAt: row.respondedAt ? row.respondedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Public/Token-authenticated Notified Body auditor workspace route.
 */
auditorRouter.get("/conformity/auditor/workspace", async (req, res): Promise<void> => {
  try {
    const token = (req.query.token as string) || (req.headers["x-auditor-token"] as string);
    if (!token) {
      res.status(401).json({ error: "Missing auditor access token" });
      return;
    }

    const [access] = await db
      .select()
      .from(conformityAuditorAccessTable)
      .where(eq(conformityAuditorAccessTable.accessToken, token));

    if (!access || !access.isActive || access.expiresAt < new Date()) {
      res.status(403).json({ error: "Invalid or expired auditor access token" });
      return;
    }

    const [assessment] = await db
      .select()
      .from(conformityAssessmentsTable)
      .where(eq(conformityAssessmentsTable.id, access.assessmentId));

    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }

    const [product] = await db
      .select()
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.id, assessment.productId));

    const evidence = await db
      .select()
      .from(conformityEvidenceTable)
      .where(eq(conformityEvidenceTable.assessmentId, assessment.id));

    const artifacts = await db
      .select()
      .from(conformityArtifactsTable)
      .where(eq(conformityArtifactsTable.assessmentId, assessment.id));

    const rfis = await db
      .select()
      .from(conformityAuditorRfisTable)
      .where(eq(conformityAuditorRfisTable.assessmentId, assessment.id))
      .orderBy(desc(conformityAuditorRfisTable.createdAt));

    res.json({
      auditor: {
        email: access.auditorEmail,
        notifiedBody: access.notifiedBodyName,
        number: access.notifiedBodyNumber,
      },
      assessment: {
        id: assessment.id,
        regulationKey: assessment.regulationKey,
        classKey: assessment.classKey,
        routeKey: assessment.routeKey,
        status: assessment.status,
      },
      product,
      evidence: evidence.map((e) => ({
        id: e.id,
        title: e.title,
        evidenceType: e.evidenceType,
        requirementRefCode: e.requirementRefCode,
        fileHash: e.fileHash, // Tamper-proof SHA-256
        createdAt: e.createdAt,
      })),
      artifacts,
      rfis,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load auditor workspace" });
  }
});

/**
 * Submit an RFI or Non-Conformity finding from a Notified Body auditor.
 */
auditorRouter.post("/conformity/auditor/rfis", async (req, res): Promise<void> => {
  try {
    const token = (req.headers["x-auditor-token"] as string) || (req.body.token as string);
    if (!token) {
      res.status(401).json({ error: "Missing auditor access token" });
      return;
    }

    const [access] = await db
      .select()
      .from(conformityAuditorAccessTable)
      .where(eq(conformityAuditorAccessTable.accessToken, token));

    if (!access || !access.isActive) {
      res.status(403).json({ error: "Invalid auditor token" });
      return;
    }

    const question = req.body.question as string;
    if (!question || !question.trim()) {
      res.status(400).json({ error: "RFI question is required" });
      return;
    }

    const [rfi] = await db
      .insert(conformityAuditorRfisTable)
      .values({
        assessmentId: access.assessmentId,
        auditorEmail: access.auditorEmail,
        requirementRefCode: req.body.requirementRefCode || null,
        question: question.trim(),
        severity: req.body.severity || "rfi",
        status: "open",
      })
      .returning();

    await db.insert(conformityActivityTable).values({
      entityType: "assessment",
      entityId: access.assessmentId,
      assessmentId: access.assessmentId,
      action: "updated",
      actor: `auditor:${access.auditorEmail}`,
      source: "ui",
      summary: `Notified Body RFI submitted by ${access.notifiedBodyName}`,
    });

    res.json({ success: true, rfi });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create auditor RFI" });
  }
});

// ---------------------------------------------------------------------------
// The organisation's side of the auditor track (9.3b). Until these routes
// existed the external door had no key: nothing anywhere inserted into
// conformity_auditor_access, and submitted RFIs landed in a table no internal
// surface read. Issue/revoke are admin acts; reading the inbox and answering
// an RFI are member work.
// ---------------------------------------------------------------------------

auditorRouter.get("/conformity/assessments/:id/auditor-access", requireAuth, async (req, res): Promise<void> => {
  const { id } = ListAuditorAccessParams.parse(req.params);
  const [assessment] = await db
    .select({ id: conformityAssessmentsTable.id })
    .from(conformityAssessmentsTable)
    .where(eq(conformityAssessmentsTable.id, id));
  if (!assessment) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }
  const rows = await db
    .select()
    .from(conformityAuditorAccessTable)
    .where(eq(conformityAuditorAccessTable.assessmentId, id))
    .orderBy(desc(conformityAuditorAccessTable.createdAt));
  res.json(ListAuditorAccessResponse.parse({ access: rows.map(toAccessDto) }));
});

auditorRouter.post("/conformity/assessments/:id/auditor-access", requireAdmin, async (req, res): Promise<void> => {
  const { id } = IssueAuditorAccessParams.parse(req.params);
  const body = IssueAuditorAccessBody.parse(req.body);
  const [assessment] = await db
    .select({ id: conformityAssessmentsTable.id })
    .from(conformityAssessmentsTable)
    .where(eq(conformityAssessmentsTable.id, id));
  if (!assessment) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }
  const expiresAt = new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000);
  const row = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(conformityAuditorAccessTable)
      .values({
        assessmentId: id,
        auditorEmail: body.auditorEmail,
        notifiedBodyName: body.notifiedBodyName,
        notifiedBodyNumber: body.notifiedBodyNumber,
        accessToken: crypto.randomUUID(),
        expiresAt,
      })
      .returning();
    await tx.insert(conformityActivityTable).values({
      entityType: "assessment",
      entityId: id,
      assessmentId: id,
      action: "auditor_access_issued",
      actor: actorOf(req),
      source: "ui",
      summary: `Auditor access issued to ${body.auditorEmail} (${body.notifiedBodyName}, NB ${body.notifiedBodyNumber}), expires ${expiresAt.toISOString().slice(0, 10)}`,
    });
    return inserted!;
  });
  res.json(IssueAuditorAccessResponse.parse(toAccessDto(row)));
});

auditorRouter.post("/conformity/auditor-access/:id/revoke", requireAdmin, async (req, res): Promise<void> => {
  const { id } = RevokeAuditorAccessParams.parse(req.params);
  const row = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(conformityAuditorAccessTable)
      .set({ isActive: false })
      .where(eq(conformityAuditorAccessTable.id, id))
      .returning();
    if (!updated) return null;
    await tx.insert(conformityActivityTable).values({
      entityType: "assessment",
      entityId: updated.assessmentId,
      assessmentId: updated.assessmentId,
      action: "auditor_access_revoked",
      actor: actorOf(req),
      source: "ui",
      summary: `Auditor access for ${updated.auditorEmail} revoked`,
    });
    return updated;
  });
  if (!row) {
    res.status(404).json({ error: "Access grant not found" });
    return;
  }
  res.json(RevokeAuditorAccessResponse.parse(toAccessDto(row)));
});

auditorRouter.get("/conformity/assessments/:id/auditor-rfis", requireAuth, async (req, res): Promise<void> => {
  const { id } = ListAuditorRfisParams.parse(req.params);
  const [assessment] = await db
    .select({ id: conformityAssessmentsTable.id })
    .from(conformityAssessmentsTable)
    .where(eq(conformityAssessmentsTable.id, id));
  if (!assessment) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }
  const rows = await db
    .select()
    .from(conformityAuditorRfisTable)
    .where(eq(conformityAuditorRfisTable.assessmentId, id))
    .orderBy(desc(conformityAuditorRfisTable.createdAt));
  res.json(ListAuditorRfisResponse.parse({ rfis: rows.map(toRfiDto) }));
});

auditorRouter.post("/conformity/auditor-rfis/:id/respond", requireAuth, async (req, res): Promise<void> => {
  const { id } = RespondAuditorRfiParams.parse(req.params);
  const body = RespondAuditorRfiBody.parse(req.body);
  const row = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(conformityAuditorRfisTable)
      .set({
        manufacturerResponse: body.response,
        status: "answered",
        respondedAt: new Date(),
      })
      .where(eq(conformityAuditorRfisTable.id, id))
      .returning();
    if (!updated) return null;
    await tx.insert(conformityActivityTable).values({
      entityType: "assessment",
      entityId: updated.assessmentId,
      assessmentId: updated.assessmentId,
      action: "auditor_rfi_answered",
      actor: actorOf(req),
      source: "ui",
      summary: `Auditor ${updated.severity === "rfi" ? "RFI" : updated.severity.replaceAll("_", " ")} #${updated.id} answered`,
    });
    return updated;
  });
  if (!row) {
    res.status(404).json({ error: "RFI not found" });
    return;
  }
  res.json(RespondAuditorRfiResponse.parse(toRfiDto(row)));
});
