import { Router } from "express";
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
} from "@workspace/db";

export const auditorRouter = Router();

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
        name: assessment.name,
        classification: assessment.classification,
        module: assessment.module,
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
