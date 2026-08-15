import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, isNull } from "drizzle-orm";
import {
  db,
  conformityStewardPoliciesTable,
  conformityStewardRequestsTable,
} from "@workspace/db";
import { requireAuth, requireAdmin, getSession } from "../lib/adminAuth";
import {
  assessStewardPolicy,
  assessStewardCooperation,
  assessStewardReporting,
  stewardLegalPosition,
  POLICY_ASPECTS,
  type PolicyAspect,
} from "../lib/openSourceSteward";
import { recordAttestation } from "../lib/attestationStore";

/**
 * The stewardship surface — Article 24.
 *
 * Project-centric. There is no product file here, because a steward has no CE
 * marking, no declaration of conformity and no conformity assessment.
 */
const router: IRouter = Router();

function actorOf(req: Request): string {
  const s = getSession(req);
  return s ? `${s.role}:${s.username}` : "";
}
const tri = (v: unknown) => (v === true || v === false ? v : null);

/** GET — the steward's position for a project: policy, requests, reporting, law. */
router.get("/conformity/steward/:project", requireAuth, async (req: Request, res: Response) => {
  const projectName = String(req.params.project);

  const [current] = await db
    .select()
    .from(conformityStewardPoliciesTable)
    .where(
      and(
        eq(conformityStewardPoliciesTable.projectName, projectName),
        isNull(conformityStewardPoliciesTable.supersededAt),
      ),
    )
    .orderBy(desc(conformityStewardPoliciesTable.version));

  const history = await db
    .select()
    .from(conformityStewardPoliciesTable)
    .where(eq(conformityStewardPoliciesTable.projectName, projectName))
    .orderBy(desc(conformityStewardPoliciesTable.version));

  const requests = await db
    .select()
    .from(conformityStewardRequestsTable)
    .where(eq(conformityStewardRequestsTable.projectName, projectName))
    .orderBy(desc(conformityStewardRequestsTable.receivedAt));

  const policy = assessStewardPolicy({
    policyDocumented: current ? Boolean(current.policyText?.trim()) : false,
    policyUrl: current?.policyUrl ?? null,
    policyVersion: current ? String(current.version) : null,
    aspectsCovered: (current?.aspectsCovered ?? []) as PolicyAspect[],
  });

  /** The oldest request with nothing provided is the one that matters. */
  const openRequest = requests.find((r) => r.receivedAt && !r.documentationProvidedAt);
  const cooperation = assessStewardCooperation({
    reasonedRequestReceivedAt: openRequest?.receivedAt?.toISOString() ?? null,
    documentationProvidedAt: openRequest?.documentationProvidedAt?.toISOString() ?? null,
    languageUnderstoodByAuthority: openRequest?.languageUnderstoodByAuthority ?? null,
  });

  const reporting = assessStewardReporting({
    involvedInDevelopment: current?.involvedInDevelopment ?? null,
    // Answered per incident, not per project — unknown until one occurs.
    incidentAffectsStewardProvidedSystems: null,
  });

  const gaps = [...policy.gaps, ...cooperation.gaps];
  if (current && current.supportsSoftwareIntendedForCommercialActivities !== true) {
    gaps.push(
      "Article 3(14): a steward supports free and open-source software intended for commercial activities. If that is not so, you may not be an open-source software steward under this Regulation at all, and Article 24 may not apply to you.",
    );
  }

  res.json({
    project: projectName,
    policy: { current: current ?? null, history, assessment: policy },
    cooperation: { requests, assessment: cooperation },
    reporting,
    /** The law, stated in one place so no surface can drift. */
    legalPosition: stewardLegalPosition(),
    policyAspects: POLICY_ASPECTS,
    gaps,
    gapCount: gaps.length,
  });
});

/**
 * POST — write a new version of the policy.
 *
 * Never an update. Art. 24(2) can require the steward to produce this
 * documentation to an authority, and the question will be which text was in
 * force at the time. Superseding preserves that answer; overwriting destroys it.
 */
router.post(
  "/conformity/steward/:project/policy",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const projectName = String(req.params.project);
    const b = req.body ?? {};
    const policyText = String(b.policyText ?? "");
    if (!policyText.trim()) {
      res.status(400).json({
        error:
          "A policy text is required. Article 24(1) requires the policy to be documented in a verifiable manner; an empty document does not document anything.",
        citation: "Article 24(1)",
      });
      return;
    }

    const existing = await db
      .select()
      .from(conformityStewardPoliciesTable)
      .where(eq(conformityStewardPoliciesTable.projectName, projectName))
      .orderBy(desc(conformityStewardPoliciesTable.version));
    const nextVersion = (existing[0]?.version ?? 0) + 1;

    // Supersede rather than delete.
    if (existing.length) {
      await db
        .update(conformityStewardPoliciesTable)
        .set({ supersededAt: new Date() })
        .where(
          and(
            eq(conformityStewardPoliciesTable.projectName, projectName),
            isNull(conformityStewardPoliciesTable.supersededAt),
          ),
        );
    }

    const [row] = await db
      .insert(conformityStewardPoliciesTable)
      .values({
        projectName,
        stewardLegalEntity: String(b.stewardLegalEntity ?? ""),
        repositoryUrl: String(b.repositoryUrl ?? ""),
        version: nextVersion,
        policyUrl: String(b.policyUrl ?? ""),
        policyText,
        aspectsCovered: Array.isArray(b.aspectsCovered) ? b.aspectsCovered : [],
        supportsSoftwareIntendedForCommercialActivities: tri(
          b.supportsSoftwareIntendedForCommercialActivities,
        ),
        involvedInDevelopment: tri(b.involvedInDevelopment),
        authoredBy: actorOf(req),
      })
      .returning();

    /** The policy text is documentation an authority may ask for. Attest to it. */
    try {
      await recordAttestation({
        kind: "artifact_generated",
        subject: `steward_policy:${projectName}:${nextVersion}`,
        actor: actorOf(req),
        content: policyText,
        statement: `Article 24(1) cybersecurity policy for "${projectName}", version ${nextVersion}, attested over the policy text as written.`,
      });
    } catch {
      /* the policy is what must not be lost */
    }

    const assessment = assessStewardPolicy({
      policyDocumented: true,
      policyUrl: row!.policyUrl,
      policyVersion: String(row!.version),
      aspectsCovered: (row!.aspectsCovered ?? []) as PolicyAspect[],
    });

    res.status(201).json({ policy: row, assessment, supersededPrevious: existing.length > 0 });
  },
);

/** POST — record a reasoned request from a market surveillance authority. */
router.post(
  "/conformity/steward/:project/requests",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const projectName = String(req.params.project);
    const b = req.body ?? {};
    const [row] = await db
      .insert(conformityStewardRequestsTable)
      .values({
        projectName,
        authorityName: String(b.authorityName ?? ""),
        memberState: String(b.memberState ?? ""),
        receivedAt: b.receivedAt ? new Date(String(b.receivedAt)) : new Date(),
        policyVersionProvided:
          b.policyVersionProvided != null ? Number(b.policyVersionProvided) : null,
        documentationProvidedAt: b.documentationProvidedAt
          ? new Date(String(b.documentationProvidedAt))
          : null,
        languageUnderstoodByAuthority: tri(b.languageUnderstoodByAuthority),
        languageUsed: String(b.languageUsed ?? ""),
        notes: String(b.notes ?? ""),
        recordedBy: actorOf(req),
      })
      .returning();

    const assessment = assessStewardCooperation({
      reasonedRequestReceivedAt: row!.receivedAt?.toISOString() ?? null,
      documentationProvidedAt: row!.documentationProvidedAt?.toISOString() ?? null,
      languageUnderstoodByAuthority: row!.languageUnderstoodByAuthority,
    });

    res.status(201).json({ request: row, assessment });
  },
);

export default router;
