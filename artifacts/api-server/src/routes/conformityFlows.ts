/**
 * Conformity Flow Engine — admin-authored process flows and their per-assessment
 * runs.
 *
 * A "flow" is an ordered list of typed steps (activity/question/checkpoint/
 * artifact/investigation) an admin authors once. A "flow run" binds a flow to a
 * single assessment and tracks per-step progress in a `stepStates` jsonb map.
 * Every run mutation appends a chain-of-custody row to `conformity_activity`.
 *
 * Like the rest of the execution layer this is gated behind `requireAuth`, and
 * the public demo role is READ-ONLY (GET allowed; any mutation → 403).
 */
import { Router, type IRouter } from "express";
import { asc, desc, eq, inArray } from "drizzle-orm";
import {
  db,
  conformityAssessmentsTable,
  conformityFlowsTable,
  conformityFlowRunsTable,
  conformityActivityTable,
  conformityBomsTable,
  requirementsTable,
  type ConformityFlowRow,
  type ConformityFlowRunRow,
  type FlowStep,
  type FlowStepRequirementRef,
  type FlowAppliesTo,
  type FlowRunStepState,
} from "@workspace/db";
import { and, or } from "drizzle-orm";
import {
  ListConformityFlowsResponse,
  CreateConformityFlowBody,
  CreateConformityFlowResponse,
  GetConformityFlowByIdParams,
  GetConformityFlowByIdResponse,
  UpdateConformityFlowParams,
  UpdateConformityFlowBody,
  UpdateConformityFlowResponse,
  DeleteConformityFlowParams,
  DeleteConformityFlowResponse,
  ListAssessmentFlowRunsParams,
  ListAssessmentFlowRunsResponse,
  CreateAssessmentFlowRunParams,
  CreateAssessmentFlowRunBody,
  CreateAssessmentFlowRunResponse,
  GetConformityFlowRunParams,
  GetConformityFlowRunResponse,
  UpdateConformityFlowRunStepParams,
  UpdateConformityFlowRunStepBody,
  UpdateConformityFlowRunStepResponse,
  AdoptConformityFlowRunStepsParams,
  AdoptConformityFlowRunStepsResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin, getSession } from "../lib/adminAuth";
import { ARTIFACT_TYPES } from "../lib/conformityEngine";

const router: IRouter = Router();

const GENERATABLE_ARTIFACT_TYPES = new Set<string>(ARTIFACT_TYPES);

/**
 * The public "demo" role is READ-ONLY across the execution layer (see
 * conformityAssessments.ts for the rationale). Demo may GET everything; any
 * mutation is refused before the handler runs. Anonymous mutations fall through
 * to each route's `requireAuth` (→ 401), so the anon/auth contract is unchanged.
 */
router.use((req, res, next): void => {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    next();
    return;
  }
  if (getSession(req)?.role === "demo" && process.env["DEMO_READONLY"] === "true") {
    res.status(403).json({ error: "The demo workspace is read-only." });
    return;
  }
  next();
});

// ---------------------------------------------------------------------------
// DTO serializers
// ---------------------------------------------------------------------------

function toFlowDto(f: ConformityFlowRow) {
  return {
    id: f.id,
    key: f.key,
    name: f.name,
    description: f.description,
    appliesTo: f.appliesTo,
    steps: f.steps,
    isTemplate: f.isTemplate,
    sortOrder: f.sortOrder,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}

/**
 * `flowUpdated` mirrors the detail endpoint's drift flag: true only when the
 * originating flow still exists AND its current steps differ from the run's
 * frozen snapshot. Callers pass the live flow row (or undefined when the flow
 * has been deleted / flowId is null).
 */
function toRunSummaryDto(r: ConformityFlowRunRow, liveFlow: ConformityFlowRow | undefined) {
  return {
    id: r.id,
    flowId: r.flowId,
    assessmentId: r.assessmentId,
    // Frozen at creation — independent of the (possibly renamed/deleted) flow.
    flowName: r.flowName,
    status: r.status,
    assignee: r.assignee,
    stepStates: r.stepStates,
    flowUpdated: liveFlow ? !stepsEqual(r.steps, liveFlow.steps) : false,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/** Resolve the acting session's actor string for activity logging. */
function actorOf(req: Parameters<typeof getSession>[0]): string {
  const session = getSession(req);
  if (!session) return "";
  return `${session.role}:${session.username}`;
}

// ---------------------------------------------------------------------------
// Loaders / builders
// ---------------------------------------------------------------------------

async function loadFlow(id: number): Promise<ConformityFlowRow | undefined> {
  const [row] = await db.select().from(conformityFlowsTable).where(eq(conformityFlowsTable.id, id));
  return row;
}

async function loadRun(id: number): Promise<ConformityFlowRunRow | undefined> {
  const [row] = await db
    .select()
    .from(conformityFlowRunsTable)
    .where(eq(conformityFlowRunsTable.id, id));
  return row;
}

/**
 * Assemble the full run detail. Steps come from the run's OWN frozen snapshot
 * (captured at creation), never the live flow — so editing or deleting the flow
 * definition never changes what an already-started run displays.
 *
 * `flowUpdated` signals when the run's frozen snapshot has drifted from the
 * live flow definition: it is true only when the originating flow still exists
 * (`flowId` non-null) AND its current steps differ from the snapshot. A deleted
 * flow yields false — there is nothing current to drift from.
 */
async function buildRunDetail(run: ConformityFlowRunRow) {
  const flow = run.flowId !== null ? await loadFlow(run.flowId) : undefined;
  const summary = toRunSummaryDto(run, flow);
  return {
    run: summary,
    steps: run.steps,
    flowUpdated: summary.flowUpdated,
  };
}

/**
 * Structural equality of two step lists. Steps are plain JSON authored in a
 * fixed key order by `normaliseSteps`, so serialised comparison is stable for
 * rows written through the API; any residual key-order mismatch only risks a
 * false "updated" notice, never a missed one.
 */
function stepsEqual(a: FlowStep[], b: FlowStep[]): boolean {
  if (a.length !== b.length) return false;
  return JSON.stringify(a.map(stepKeyShape)) === JSON.stringify(b.map(stepKeyShape));
}

/** Project a step onto a canonical key order so serialisation is deterministic. */
function stepKeyShape(s: FlowStep) {
  return {
    id: s.id,
    type: s.type,
    title: s.title,
    description: s.description ?? "",
    requirementRefs: s.requirementRefs ?? [],
    config: s.config ?? {},
  };
}

/** Recompute a run's overall status from its step states. */
function computeRunStatus(steps: FlowStep[], stepStates: Record<string, FlowRunStepState>): string {
  if (steps.length === 0) return "active";
  const allDone = steps.every((s) => {
    const state = stepStates[s.id]?.status;
    return state === "done" || state === "skipped";
  });
  return allDone ? "complete" : "active";
}

type IncomingStep = {
  id: string;
  type: string;
  title: string;
  description?: string;
  requirementRefs?: { regulationKey: string; refCode: string }[];
  config?: Record<string, unknown>;
};

/** Normalise an incoming FlowStep[] (drop undefined optional fields). */
function normaliseSteps(steps: IncomingStep[]): FlowStep[] {
  return steps.map((s) => ({
    id: s.id,
    type: s.type as FlowStep["type"],
    title: s.title,
    ...(s.description !== undefined ? { description: s.description } : {}),
    ...(s.requirementRefs !== undefined && s.requirementRefs.length > 0
      ? {
          requirementRefs: s.requirementRefs.map((r) => ({
            regulationKey: r.regulationKey,
            refCode: r.refCode,
          })),
        }
      : {}),
    ...(s.config !== undefined ? { config: s.config } : {}),
  }));
}

/**
 * Every requirementRef on every step must resolve to a LIVE row in the
 * requirements catalogue by natural key (regulationKey + refCode). This is what
 * makes flow completion auditable: a run can only claim coverage of citations
 * that actually exist. Returns an error message, or null when all refs resolve.
 */
async function validateRequirementRefs(steps: FlowStep[]): Promise<string | null> {
  const refs = new Map<string, FlowStepRequirementRef>();
  for (const step of steps) {
    for (const ref of step.requirementRefs ?? []) {
      refs.set(`${ref.regulationKey}\u0000${ref.refCode}`, ref);
    }
  }
  if (refs.size === 0) return null;
  const conditions = [...refs.values()].map((r) =>
    and(eq(requirementsTable.regulationKey, r.regulationKey), eq(requirementsTable.refCode, r.refCode)),
  );
  const rows = await db
    .select({ regulationKey: requirementsTable.regulationKey, refCode: requirementsTable.refCode })
    .from(requirementsTable)
    .where(or(...conditions));
  const found = new Set(rows.map((r) => `${r.regulationKey}\u0000${r.refCode}`));
  const missing = [...refs.values()].filter(
    (r) => !found.has(`${r.regulationKey}\u0000${r.refCode}`),
  );
  if (missing.length > 0) {
    return `Unknown requirement reference(s): ${missing
      .map((r) => `${r.regulationKey} ${r.refCode}`)
      .join(", ")}. Requirement links must match the catalogue exactly.`;
  }
  return null;
}

/**
 * Reject any artifact-type step whose `config.artifactType` is not one of the
 * canonical, generatable artifact types. The flow builder already constrains its
 * dropdown to the shared `GeneratableArtifactType` enum, but a flow authored
 * directly against the API can still persist a non-generatable type — that step
 * would never auto-link at run time. This closes that gap at the API boundary by
 * reusing the server's single source of truth (conformityEngine.ARTIFACT_TYPES).
 *
 * An artifact step with no `artifactType` yet is allowed (mirrors the builder,
 * which lets an author leave it unset). Only an explicitly bad value is refused.
 * Returns an error message when invalid, or `null` when all steps are fine.
 */
function validateArtifactSteps(steps: FlowStep[]): string | null {
  for (const step of steps) {
    if (step.type !== "artifact") continue;
    const artifactType = step.config?.artifactType;
    if (artifactType === undefined || artifactType === null || artifactType === "") continue;
    if (typeof artifactType !== "string" || !GENERATABLE_ARTIFACT_TYPES.has(artifactType)) {
      return `Artifact step "${step.title || step.id}" has a non-generatable artifactType "${String(
        artifactType,
      )}". Allowed types: ${ARTIFACT_TYPES.join(", ")}.`;
    }
  }
  return null;
}

function normaliseAppliesTo(appliesTo: FlowAppliesTo | undefined): FlowAppliesTo {
  if (!appliesTo) return {};
  const out: FlowAppliesTo = {};
  if (appliesTo.regulationKeys !== undefined) out.regulationKeys = appliesTo.regulationKeys;
  if (appliesTo.classKeys !== undefined) out.classKeys = appliesTo.classKeys;
  if (appliesTo.bomTypes !== undefined) out.bomTypes = appliesTo.bomTypes;
  return out;
}

// ---------------------------------------------------------------------------
// Flow definitions (admin-authored)
// ---------------------------------------------------------------------------

router.get("/conformity/flows", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(conformityFlowsTable)
    .orderBy(asc(conformityFlowsTable.sortOrder), asc(conformityFlowsTable.id));
  res.json(ListConformityFlowsResponse.parse(rows.map(toFlowDto)));
});

router.post("/conformity/flows", requireAdmin, async (req, res): Promise<void> => {
  const body = CreateConformityFlowBody.parse(req.body);
  const steps = normaliseSteps(body.steps);
  const artifactErr = validateArtifactSteps(steps);
  if (artifactErr) {
    res.status(400).json({ error: artifactErr });
    return;
  }
  const refErr = await validateRequirementRefs(steps);
  if (refErr) {
    res.status(400).json({ error: refErr });
    return;
  }
  const [row] = await db
    .insert(conformityFlowsTable)
    .values({
      key: body.key,
      name: body.name,
      description: body.description ?? "",
      appliesTo: normaliseAppliesTo(body.appliesTo),
      steps,
    })
    .onConflictDoNothing()
    .returning();
  if (!row) {
    res.status(409).json({ error: `A flow with key "${body.key}" already exists.` });
    return;
  }
  res.json(CreateConformityFlowResponse.parse(toFlowDto(row)));
});

router.get("/conformity/flows/:flowId", requireAuth, async (req, res): Promise<void> => {
  const { flowId } = GetConformityFlowByIdParams.parse(req.params);
  const flow = await loadFlow(flowId);
  if (!flow) {
    res.status(404).json({ error: "Flow not found" });
    return;
  }
  res.json(GetConformityFlowByIdResponse.parse(toFlowDto(flow)));
});

router.put("/conformity/flows/:flowId", requireAdmin, async (req, res): Promise<void> => {
  const { flowId } = UpdateConformityFlowParams.parse(req.params);
  const body = UpdateConformityFlowBody.parse(req.body);
  const existing = await loadFlow(flowId);
  if (!existing) {
    res.status(404).json({ error: "Flow not found" });
    return;
  }
  const set: Partial<typeof conformityFlowsTable.$inferInsert> = {};
  if (body.name !== undefined) set.name = body.name;
  if (body.description !== undefined) set.description = body.description;
  if (body.appliesTo !== undefined) set.appliesTo = normaliseAppliesTo(body.appliesTo);
  if (body.steps !== undefined) {
    const steps = normaliseSteps(body.steps);
    const artifactErr = validateArtifactSteps(steps);
    if (artifactErr) {
      res.status(400).json({ error: artifactErr });
      return;
    }
    const refErr = await validateRequirementRefs(steps);
    if (refErr) {
      res.status(400).json({ error: refErr });
      return;
    }
    set.steps = steps;
  }
  const [row] = await db
    .update(conformityFlowsTable)
    .set(set)
    .where(eq(conformityFlowsTable.id, flowId))
    .returning();
  res.json(UpdateConformityFlowResponse.parse(toFlowDto(row!)));
});

router.delete("/conformity/flows/:flowId", requireAdmin, async (req, res): Promise<void> => {
  const { flowId } = DeleteConformityFlowParams.parse(req.params);
  const deleted = await db
    .delete(conformityFlowsTable)
    .where(eq(conformityFlowsTable.id, flowId))
    .returning({ id: conformityFlowsTable.id });
  if (deleted.length === 0) {
    res.status(404).json({ error: "Flow not found" });
    return;
  }
  res.json(DeleteConformityFlowResponse.parse({ success: true }));
});

// ---------------------------------------------------------------------------
// Flow runs (per-assessment execution)
// ---------------------------------------------------------------------------

router.get(
  "/conformity/assessments/:id/flow-runs",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = ListAssessmentFlowRunsParams.parse(req.params);
    const [assessment] = await db
      .select({ id: conformityAssessmentsTable.id })
      .from(conformityAssessmentsTable)
      .where(eq(conformityAssessmentsTable.id, id));
    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }
    const runs = await db
      .select()
      .from(conformityFlowRunsTable)
      .where(eq(conformityFlowRunsTable.assessmentId, id))
      .orderBy(desc(conformityFlowRunsTable.updatedAt));
    // Batch-load the distinct live flows once so drift detection stays O(1)
    // queries regardless of how many runs the assessment has.
    const flowIds = [...new Set(runs.map((r) => r.flowId).filter((f): f is number => f !== null))];
    const liveFlows =
      flowIds.length > 0
        ? await db.select().from(conformityFlowsTable).where(inArray(conformityFlowsTable.id, flowIds))
        : [];
    const flowsById = new Map(liveFlows.map((f) => [f.id, f]));
    res.json(
      ListAssessmentFlowRunsResponse.parse(
        runs.map((r) => toRunSummaryDto(r, r.flowId !== null ? flowsById.get(r.flowId) : undefined)),
      ),
    );
  },
);

router.post(
  "/conformity/assessments/:id/flow-runs",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = CreateAssessmentFlowRunParams.parse(req.params);
    const body = CreateAssessmentFlowRunBody.parse(req.body);
    const [assessment] = await db
      .select({ id: conformityAssessmentsTable.id })
      .from(conformityAssessmentsTable)
      .where(eq(conformityAssessmentsTable.id, id));
    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }
    const flow = await loadFlow(body.flowId);
    if (!flow) {
      res.status(404).json({ error: "Flow not found" });
      return;
    }

    // Initialise one step-state entry per flow step (default "pending").
    const stepStates: Record<string, FlowRunStepState> = {};
    for (const step of flow.steps) {
      stepStates[step.id] = { status: "pending" };
    }
    const status = computeRunStatus(flow.steps, stepStates);

    const run = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(conformityFlowRunsTable)
        .values({
          flowId: flow.id,
          assessmentId: id,
          // Freeze the flow's name + step definitions into the run so later
          // edits/deletes to the flow never rewrite this run's history.
          flowName: flow.name,
          steps: flow.steps,
          status,
          stepStates,
        })
        .returning();

      await tx.insert(conformityActivityTable).values({
        assessmentId: id,
        entityType: "flow_run",
        entityId: inserted!.id,
        action: "created",
        actor: actorOf(req),
        source: "ui",
        summary: `Started flow "${flow.name}" (${flow.steps.length} steps)`,
      });

      return inserted!;
    });

    res.json(CreateAssessmentFlowRunResponse.parse(await buildRunDetail(run)));
  },
);

router.get("/conformity/flow-runs/:runId", requireAuth, async (req, res): Promise<void> => {
  const { runId } = GetConformityFlowRunParams.parse(req.params);
  const run = await loadRun(runId);
  if (!run) {
    res.status(404).json({ error: "Flow run not found" });
    return;
  }
  res.json(GetConformityFlowRunResponse.parse(await buildRunDetail(run)));
});

/**
 * Admin-only: re-snapshot the CURRENT flow definition into an existing run
 * ("adopt latest steps"). Progress is preserved for steps whose `id` is
 * unchanged; states for removed steps are dropped, and newly added steps start
 * "pending". Refused (409) when the originating flow no longer exists — there
 * is nothing current to adopt.
 */
router.post(
  "/conformity/flow-runs/:runId/adopt-steps",
  requireAdmin,
  async (req, res): Promise<void> => {
    const { runId } = AdoptConformityFlowRunStepsParams.parse(req.params);

    const result = await db.transaction(async (tx) => {
      // Lock the run so a concurrent step PATCH can't interleave between our
      // read of stepStates and the re-snapshot write.
      const [run] = await tx
        .select()
        .from(conformityFlowRunsTable)
        .where(eq(conformityFlowRunsTable.id, runId))
        .for("update");
      if (!run) {
        return { status: 404 as const, error: "Flow run not found" };
      }
      if (run.flowId === null) {
        return {
          status: 409 as const,
          error: "The originating flow was deleted; there are no current steps to adopt.",
        };
      }
      const [flow] = await tx
        .select()
        .from(conformityFlowsTable)
        .where(eq(conformityFlowsTable.id, run.flowId));
      if (!flow) {
        return {
          status: 409 as const,
          error: "The originating flow was deleted; there are no current steps to adopt.",
        };
      }
      if (stepsEqual(run.steps, flow.steps)) {
        // Semantic no-op: snapshot already matches — skip the UPDATE + ledger row.
        return { status: 200 as const, updated: run };
      }

      // Carry progress forward for steps that survived by id; new steps pending.
      const stepStates: Record<string, FlowRunStepState> = {};
      for (const step of flow.steps) {
        stepStates[step.id] = run.stepStates[step.id] ?? { status: "pending" };
      }
      const status = computeRunStatus(flow.steps, stepStates);

      const [updated] = await tx
        .update(conformityFlowRunsTable)
        .set({ steps: flow.steps, flowName: flow.name, stepStates, status })
        .where(eq(conformityFlowRunsTable.id, runId))
        .returning();

      await tx.insert(conformityActivityTable).values({
        assessmentId: run.assessmentId,
        entityType: "flow_run",
        entityId: runId,
        action: "updated",
        actor: actorOf(req),
        source: "ui",
        summary: `Adopted the latest steps of flow "${flow.name}" (${flow.steps.length} steps)`,
      });

      return { status: 200 as const, updated: updated! };
    });

    if (result.status !== 200) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.json(AdoptConformityFlowRunStepsResponse.parse(await buildRunDetail(result.updated)));
  },
);

router.patch(
  "/conformity/flow-runs/:runId/steps/:stepKey",
  requireAuth,
  async (req, res): Promise<void> => {
    const { runId, stepKey } = UpdateConformityFlowRunStepParams.parse(req.params);
    const body = UpdateConformityFlowRunStepBody.parse(req.body);

    const result = await db.transaction(async (tx) => {
      // Lock the run row so concurrent step PATCHes serialise: each reads the
      // latest stepStates under the lock, merges its own step, and writes back
      // (no lost updates / ledger gaps).
      const [run] = await tx
        .select()
        .from(conformityFlowRunsTable)
        .where(eq(conformityFlowRunsTable.id, runId))
        .for("update");
      if (!run) {
        return { status: 404 as const, error: "Flow run not found" };
      }
      // Validate against the run's OWN snapshotted steps, not the live flow, so
      // progress always maps to what the run actually displays.
      const step = run.steps.find((s) => s.id === stepKey);
      if (!step) {
        return { status: 404 as const, error: "Flow step not found" };
      }

      // Question steps with AUTHORED options only accept those answers — a
      // free-text answer on a constrained question would break auditability.
      if (step.type === "question" && body.answer !== undefined && body.answer !== "") {
        const options = Array.isArray(step.config?.options)
          ? step.config.options.filter((o): o is string => typeof o === "string")
          : [];
        if (options.length > 0 && !options.includes(body.answer)) {
          return {
            status: 400 as const,
            error: `Answer must be one of: ${options.join(", ")}.`,
          };
        }
      }

      // Investigation steps: completion means the analysis was actually done —
      // require a linked BOM on this run's assessment that has been analyzed.
      let linkedBomId = run.stepStates[stepKey]?.bomId;
      if (body.bomId !== undefined) linkedBomId = body.bomId;
      if (step.type === "investigation" && body.status === "done") {
        if (linkedBomId === undefined) {
          return {
            status: 400 as const,
            error: "Link an analyzed BOM to complete this investigation step.",
          };
        }
        const [bom] = await tx
          .select({ assessmentId: conformityBomsTable.assessmentId, status: conformityBomsTable.status })
          .from(conformityBomsTable)
          .where(eq(conformityBomsTable.id, linkedBomId));
        if (!bom || bom.assessmentId !== run.assessmentId) {
          return { status: 400 as const, error: "The linked BOM does not belong to this assessment." };
        }
        if (bom.status !== "analyzed") {
          return {
            status: 400 as const,
            error: "The linked BOM has not been analyzed yet. Run the analysis first.",
          };
        }
      }

      const nextState: FlowRunStepState = { status: body.status };
      if (body.answer !== undefined) nextState.answer = body.answer;
      if (body.note !== undefined) nextState.note = body.note;
      if (body.artifactId !== undefined) nextState.artifactId = body.artifactId;
      if (linkedBomId !== undefined) nextState.bomId = linkedBomId;
      if (body.status === "done") nextState.completedAt = new Date().toISOString();

      const stepStates: Record<string, FlowRunStepState> = {
        ...run.stepStates,
        [stepKey]: nextState,
      };
      const status = computeRunStatus(run.steps, stepStates);

      const [updated] = await tx
        .update(conformityFlowRunsTable)
        .set({ stepStates, status })
        .where(eq(conformityFlowRunsTable.id, runId))
        .returning();

      await tx.insert(conformityActivityTable).values({
        assessmentId: run.assessmentId,
        entityType: "flow_run",
        entityId: runId,
        action: "updated",
        actor: actorOf(req),
        source: "ui",
        summary: `Updated step "${step.title}" → ${body.status}`,
      });

      return { status: 200 as const, updated: updated! };
    });

    if (result.status !== 200) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    res.json(UpdateConformityFlowRunStepResponse.parse(await buildRunDetail(result.updated)));
  },
);

export default router;
