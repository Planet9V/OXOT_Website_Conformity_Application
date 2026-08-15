import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  conformityAttestationsTable,
  conformityArtifactsTable,
} from "@workspace/db";
import { requireAuth, requireAdmin, getSession } from "../lib/adminAuth";
import { signDeclaration } from "../lib/provenance";
import { attestationsFor, recordAttestation, subjectFor, verifyStored } from "../lib/attestationStore";
import { ARTIFACT_LABELS, type ArtifactType } from "../lib/conformityEngine";

/**
 * The provenance surface — P6, plus the Annex V signature.
 *
 * Everything here is about being able to answer, years later and to someone who
 * was not in the room: who stood behind this, when, over exactly what, and has
 * it changed since.
 */
const router: IRouter = Router();

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}

/** GET — the attestation history for a subject, newest first. */
router.get("/conformity/attestations", requireAuth, async (req: Request, res: Response) => {
  const subject = String(req.query.subject ?? "");
  if (!subject) {
    res.status(400).json({ error: "A subject is required, e.g. artifact:eu_doc:12" });
    return;
  }
  const rows = await attestationsFor(subject);
  res.json({ subject, total: rows.length, attestations: rows });
});

/**
 * POST — verify an artifact against its attestations.
 *
 * Re-renders the artifact's current content and checks it against what was
 * attested. Reports the two failure modes separately, because they mean
 * different things: the document was edited after someone stood behind it, or
 * the attestation record itself was altered.
 */
router.post(
  "/conformity/attestations/verify",
  requireAuth,
  async (req: Request, res: Response) => {
    const assessmentId = Number(req.body?.assessmentId);
    const artifactType = String(req.body?.artifactType ?? "");
    if (!assessmentId || !artifactType) {
      res.status(400).json({ error: "assessmentId and artifactType are required" });
      return;
    }

    const [artifact] = await db
      .select()
      .from(conformityArtifactsTable)
      .where(
        and(
          eq(conformityArtifactsTable.assessmentId, assessmentId),
          eq(conformityArtifactsTable.artifactType, artifactType),
        ),
      );
    if (!artifact) {
      res.status(404).json({ error: "Artifact not found" });
      return;
    }

    const subject = subjectFor.artifact(assessmentId, artifactType);
    const rows = await attestationsFor(subject);
    if (!rows.length) {
      res.json({
        subject,
        verified: false,
        message:
          "No attestation exists for this artifact, so there is nothing to verify it against. Regenerate it to create one.",
        results: [],
      });
      return;
    }

    const current = JSON.stringify(artifact.content?.sections ?? []);
    const results = rows.map((row) => ({
      attestationId: row.id,
      kind: row.kind,
      actor: row.actor,
      attestedAt: row.attestedAt,
      ...verifyStored(row, current),
    }));

    // The newest attestation is the one that should match the current content.
    const newest = results[0]!;
    res.json({
      subject,
      verified: newest.state === "intact",
      message: newest.message,
      results,
    });
  },
);

/**
 * POST — sign the EU declaration of conformity (Article 28, Annex V).
 *
 * This is the one attestation that carries legal weight beyond record-keeping:
 * it is made ON BEHALF OF THE MANUFACTURER, and Article 64 liability follows
 * it. So it refuses more than it accepts — an incomplete declaration or an
 * unrecorded authority to bind is a refusal, not a warning.
 */
router.post(
  "/conformity/assessments/:id/declaration/sign",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const assessmentId = Number(req.params.id);
    const b = req.body ?? {};

    const [artifact] = await db
      .select()
      .from(conformityArtifactsTable)
      .where(
        and(
          eq(conformityArtifactsTable.assessmentId, assessmentId),
          eq(conformityArtifactsTable.artifactType, "eu_doc"),
        ),
      );
    if (!artifact) {
      res.status(404).json({
        error:
          "No EU declaration of conformity has been generated for this assessment. Generate it before signing.",
        citation: "Article 28",
      });
      return;
    }

    const sections = artifact.content?.sections ?? [];
    /**
     * Completeness is read from the artifact itself, never taken from the
     * request. A caller asserting "it's complete" is exactly the input this
     * refusal exists to resist.
     */
    const incomplete = sections.filter((s) => !s.complete);
    const declarationContent = JSON.stringify(sections);

    const result = signDeclaration({
      actor: actorOf(req),
      actorRoleInOrganisation: String(b.actorRoleInOrganisation ?? ""),
      signedAt: new Date().toISOString(),
      declarationContent,
      declarationComplete: incomplete.length === 0,
      authorisedToBind: b.authorisedToBind === true ? true : b.authorisedToBind === false ? false : null,
    });

    if (!result.signed) {
      res.status(422).json({
        signed: false,
        refusals: result.refusals,
        citations: result.citations,
        message: result.message,
        incompleteSections: incomplete.map((s) => s.label),
      });
      return;
    }

    const row = await recordAttestation({
      kind: "declaration_signed",
      subject: subjectFor.declaration(assessmentId),
      actor: result.attestation!.actor,
      content: declarationContent,
      statement: result.attestation!.statement,
    });

    res.status(201).json({
      signed: true,
      attestation: row,
      citations: result.citations,
      message: result.message,
      artifactLabel: ARTIFACT_LABELS["eu_doc" as ArtifactType],
    });
  },
);

export default router;
