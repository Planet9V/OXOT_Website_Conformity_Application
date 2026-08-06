/**
 * Conformity Flow Engine integration walk + demo read-only contract.
 *
 * Boots the real Express app against the real dev DB on an ephemeral port and
 * drives the flow endpoints over HTTP:
 *  - admin happy path: create a flow (3 steps) → create product + assessment →
 *    start a flow-run → PATCH a step (assert status recomputes) → complete every
 *    step (assert "complete") → GET run detail → DELETE flow. Also asserts the
 *    unique-key conflict returns 409.
 *  - demo contract: demo can READ flows/flow-runs (not 401/403); demo
 *    POST/PUT/PATCH/DELETE are refused with 403; an admin mutation is not 403.
 *
 * The real network is never hit.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";

let server: Server;
let baseUrl: string;
let adminCookie: string;
let demoCookie: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("flow-admin")}`;
  demoCookie = `${ADMIN_COOKIE}=${createSessionToken("oxotdemo", "demo")}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

type Json = Record<string, unknown>;

async function api(
  method: string,
  path: string,
  body?: unknown,
  cookie: string = adminCookie,
): Promise<{ status: number; json: Json }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      cookie,
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let json: Json = {};
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text) as Json;
    } catch {
      json = { __raw: text };
    }
  }
  return { status: res.status, json };
}

const STEPS = [
  { id: "step-a", type: "activity", title: "Kickoff activity" },
  { id: "step-b", type: "question", title: "Scoping question", config: { options: ["yes", "no"] } },
  { id: "step-c", type: "artifact", title: "Generate report", description: "Final artifact" },
];

describe("Conformity Flow Engine — admin happy path", () => {
  it("creates a flow → starts a run → patches steps → completes → deletes", async () => {
    const flowKey = `flow-test-${Date.now()}`;

    // ---- create flow definition ------------------------------------------
    const created = await api("POST", "/conformity/flows", {
      key: flowKey,
      name: "Test Flow",
      description: "A test flow",
      appliesTo: { regulationKeys: ["cra"] },
      steps: STEPS,
    });
    expect(created.status, JSON.stringify(created.json)).toBe(200);
    const flowId = (created.json as { id: number; steps: unknown[] }).id;
    expect((created.json as { steps: unknown[] }).steps).toHaveLength(3);

    // unique-key conflict -> 409
    const conflict = await api("POST", "/conformity/flows", {
      key: flowKey,
      name: "Duplicate",
      steps: [],
    });
    expect(conflict.status).toBe(409);

    // list includes the new flow
    const list = await api("GET", "/conformity/flows");
    expect(list.status).toBe(200);
    expect((list.json as unknown as { id: number }[]).some((f) => f.id === flowId)).toBe(true);

    // ---- create product + assessment -------------------------------------
    const product = await api("POST", "/conformity/products", {
      name: `Flow Test Product ${Date.now()}`,
      productType: "software",
    });
    expect(product.status, JSON.stringify(product.json)).toBe(200);
    const productId = (product.json as { id: number }).id;

    const assessment = await api("POST", "/conformity/assessments", {
      productId,
      regulationKey: "cra",
    });
    expect(assessment.status, JSON.stringify(assessment.json)).toBe(200);
    const assessmentId = (assessment.json as { assessment: { id: number } }).assessment.id;

    try {
      // ---- start a flow-run ----------------------------------------------
      const started = await api("POST", `/conformity/assessments/${assessmentId}/flow-runs`, {
        flowId,
      });
      expect(started.status, JSON.stringify(started.json)).toBe(200);
      const runDetail = started.json as {
        run: { id: number; status: string; stepStates: Record<string, { status: string }> };
        steps: unknown[];
      };
      const runId = runDetail.run.id;
      expect(runDetail.steps).toHaveLength(3);
      expect(runDetail.run.status).toBe("active");
      // one step-state per step, all "pending"
      expect(Object.keys(runDetail.run.stepStates)).toHaveLength(3);
      expect(runDetail.run.stepStates["step-a"]!.status).toBe("pending");

      // run appears in the assessment's list with the flow name
      const runsList = await api("GET", `/conformity/assessments/${assessmentId}/flow-runs`);
      expect(runsList.status).toBe(200);
      const runsArr = runsList.json as unknown as { id: number; flowName: string }[];
      expect(runsArr.some((r) => r.id === runId && r.flowName === "Test Flow")).toBe(true);

      // ---- PATCH one step: partial progress, status stays "active" -------
      const patch1 = await api("PATCH", `/conformity/flow-runs/${runId}/steps/step-a`, {
        status: "done",
        note: "done it",
      });
      expect(patch1.status, JSON.stringify(patch1.json)).toBe(200);
      const p1 = patch1.json as {
        run: { status: string; stepStates: Record<string, { status: string; completedAt?: string }> };
      };
      expect(p1.run.stepStates["step-a"]!.status).toBe("done");
      expect(p1.run.stepStates["step-a"]!.completedAt).toBeTruthy();
      expect(p1.run.status).toBe("active");

      // PATCH an unknown step -> 404
      const patchMissing = await api("PATCH", `/conformity/flow-runs/${runId}/steps/nope`, {
        status: "done",
      });
      expect(patchMissing.status).toBe(404);

      // ---- complete the remaining steps -> status recomputes to complete -
      await api("PATCH", `/conformity/flow-runs/${runId}/steps/step-b`, { status: "skipped" });
      const patchLast = await api("PATCH", `/conformity/flow-runs/${runId}/steps/step-c`, {
        status: "done",
      });
      expect(patchLast.status).toBe(200);
      expect((patchLast.json as { run: { status: string } }).run.status).toBe("complete");

      // ---- GET run detail -------------------------------------------------
      const got = await api("GET", `/conformity/flow-runs/${runId}`);
      expect(got.status).toBe(200);
      const gotJson = got.json as { run: { status: string }; steps: unknown[] };
      expect(gotJson.run.status).toBe("complete");
      expect(gotJson.steps).toHaveLength(3);

      // missing run -> 404
      const goneRun = await api("GET", `/conformity/flow-runs/99999999`);
      expect(goneRun.status).toBe(404);
    } finally {
      await api("DELETE", `/conformity/products/${productId}`);
    }

    // ---- update + get + DELETE flow --------------------------------------
    const updated = await api("PUT", `/conformity/flows/${flowId}`, {
      name: "Renamed Flow",
    });
    expect(updated.status).toBe(200);
    expect((updated.json as { name: string }).name).toBe("Renamed Flow");

    const getFlow = await api("GET", `/conformity/flows/${flowId}`);
    expect(getFlow.status).toBe(200);

    const deleted = await api("DELETE", `/conformity/flows/${flowId}`);
    expect(deleted.status).toBe(200);
    expect((deleted.json as { success: boolean }).success).toBe(true);
    const gone = await api("GET", `/conformity/flows/${flowId}`);
    expect(gone.status).toBe(404);
  }, 30_000);
});

describe("Conformity Flow Engine — runs snapshot their steps", () => {
  it("editing or deleting a flow never rewrites an already-started run", async () => {
    const flowKey = `flow-snapshot-${Date.now()}`;

    const created = await api("POST", "/conformity/flows", {
      key: flowKey,
      name: "Snapshot Flow",
      steps: STEPS,
    });
    expect(created.status, JSON.stringify(created.json)).toBe(200);
    const flowId = (created.json as { id: number }).id;

    const product = await api("POST", "/conformity/products", {
      name: `Snapshot Test Product ${Date.now()}`,
      productType: "software",
    });
    expect(product.status, JSON.stringify(product.json)).toBe(200);
    const productId = (product.json as { id: number }).id;

    const assessment = await api("POST", "/conformity/assessments", {
      productId,
      regulationKey: "cra",
    });
    expect(assessment.status, JSON.stringify(assessment.json)).toBe(200);
    const assessmentId = (assessment.json as { assessment: { id: number } }).assessment.id;

    try {
      const started = await api("POST", `/conformity/assessments/${assessmentId}/flow-runs`, {
        flowId,
      });
      expect(started.status, JSON.stringify(started.json)).toBe(200);
      const runId = (started.json as { run: { id: number } }).run.id;

      // Record progress on the first step.
      const patch = await api("PATCH", `/conformity/flow-runs/${runId}/steps/step-a`, {
        status: "done",
        note: "done before the flow changed",
      });
      expect(patch.status, JSON.stringify(patch.json)).toBe(200);

      // Now MUTATE the flow definition: rename it, and completely replace its
      // steps (new ids, new titles, fewer steps). A live-read run would break;
      // a snapshotted run must be untouched.
      const edited = await api("PUT", `/conformity/flows/${flowId}`, {
        name: "Totally Different Name",
        steps: [{ id: "brand-new", type: "activity", title: "A different step entirely" }],
      });
      expect(edited.status, JSON.stringify(edited.json)).toBe(200);

      // The run still shows its OWN frozen name + steps and its recorded progress.
      const afterEdit = await api("GET", `/conformity/flow-runs/${runId}`);
      expect(afterEdit.status).toBe(200);
      const ae = afterEdit.json as {
        run: { flowName: string; stepStates: Record<string, { status: string; note?: string }> };
        steps: { id: string; title: string }[];
      };
      expect(ae.run.flowName).toBe("Snapshot Flow");
      expect(ae.steps.map((s) => s.id)).toEqual(["step-a", "step-b", "step-c"]);
      expect(ae.run.stepStates["step-a"]!.status).toBe("done");
      expect(ae.run.stepStates["step-a"]!.note).toBe("done before the flow changed");

      // The runs LIST also surfaces the drift flag, so assessors can spot
      // behind-the-flow runs without opening each one.
      const listAfterEdit = await api("GET", `/conformity/assessments/${assessmentId}/flow-runs`);
      expect(listAfterEdit.status).toBe(200);
      const summaries = listAfterEdit.json as unknown as { id: number; flowUpdated: boolean }[];
      expect(summaries.find((r) => r.id === runId)?.flowUpdated).toBe(true);

      // Steps can still be patched against the snapshot after the flow changed.
      const patchAfter = await api("PATCH", `/conformity/flow-runs/${runId}/steps/step-b`, {
        status: "skipped",
      });
      expect(patchAfter.status, JSON.stringify(patchAfter.json)).toBe(200);

      // Deleting the whole flow leaves the run intact and renderable.
      const deleted = await api("DELETE", `/conformity/flows/${flowId}`);
      expect(deleted.status).toBe(200);

      const afterDelete = await api("GET", `/conformity/flow-runs/${runId}`);
      expect(afterDelete.status).toBe(200);
      const ad = afterDelete.json as {
        run: { flowId: number | null; flowName: string };
        steps: { id: string }[];
      };
      expect(ad.run.flowId).toBeNull();
      expect(ad.run.flowName).toBe("Snapshot Flow");
      expect(ad.steps.map((s) => s.id)).toEqual(["step-a", "step-b", "step-c"]);

      // Deleted flow ⇒ nothing current to drift from ⇒ list flag is false.
      const listAfterDelete = await api("GET", `/conformity/assessments/${assessmentId}/flow-runs`);
      expect(listAfterDelete.status).toBe(200);
      const summariesAfterDelete = listAfterDelete.json as unknown as { id: number; flowUpdated: boolean }[];
      expect(summariesAfterDelete.find((r) => r.id === runId)?.flowUpdated).toBe(false);
    } finally {
      await api("DELETE", `/conformity/products/${productId}`);
    }
  }, 30_000);
});

describe("Conformity Flow Engine — concurrent step PATCHes", () => {
  it("two concurrent PATCHes to different steps both persist (no lost update)", async () => {
    const flowKey = `flow-concurrent-${Date.now()}`;

    const created = await api("POST", "/conformity/flows", {
      key: flowKey,
      name: "Concurrent Flow",
      steps: STEPS,
    });
    expect(created.status, JSON.stringify(created.json)).toBe(200);
    const flowId = (created.json as { id: number }).id;

    const product = await api("POST", "/conformity/products", {
      name: `Concurrent Test Product ${Date.now()}`,
      productType: "software",
    });
    expect(product.status, JSON.stringify(product.json)).toBe(200);
    const productId = (product.json as { id: number }).id;

    const assessment = await api("POST", "/conformity/assessments", {
      productId,
      regulationKey: "cra",
    });
    expect(assessment.status, JSON.stringify(assessment.json)).toBe(200);
    const assessmentId = (assessment.json as { assessment: { id: number } }).assessment.id;

    try {
      const started = await api("POST", `/conformity/assessments/${assessmentId}/flow-runs`, {
        flowId,
      });
      expect(started.status, JSON.stringify(started.json)).toBe(200);
      const runId = (started.json as { run: { id: number } }).run.id;

      // Fire two PATCHes to DIFFERENT steps concurrently. Under a row lock each
      // read-modify-write serialises, so neither clobbers the other's step.
      const [a, b] = await Promise.all([
        api("PATCH", `/conformity/flow-runs/${runId}/steps/step-a`, {
          status: "done",
          note: "a",
        }),
        api("PATCH", `/conformity/flow-runs/${runId}/steps/step-b`, {
          status: "done",
          note: "b",
        }),
      ]);
      expect(a.status, JSON.stringify(a.json)).toBe(200);
      expect(b.status, JSON.stringify(b.json)).toBe(200);

      const got = await api("GET", `/conformity/flow-runs/${runId}`);
      expect(got.status).toBe(200);
      const states = (got.json as {
        run: { stepStates: Record<string, { status: string; note?: string }> };
      }).run.stepStates;
      // Both updates must be reflected — neither was clobbered by the other.
      expect(states["step-a"]!.status).toBe("done");
      expect(states["step-b"]!.status).toBe("done");
    } finally {
      await api("DELETE", `/conformity/products/${productId}`);
      await api("DELETE", `/conformity/flows/${flowId}`);
    }
  }, 30_000);
});

describe("Conformity Flow Engine — artifact-step type validation", () => {
  it("rejects an artifact step with a non-generatable artifactType on create and update", async () => {
    // ---- create with a bogus artifactType is refused (400) ----------------
    const bogus = await api("POST", "/conformity/flows", {
      key: `flow-bogus-${Date.now()}`,
      name: "Bogus Artifact Flow",
      steps: [
        { id: "step-a", type: "activity", title: "Kickoff" },
        {
          id: "step-bad",
          type: "artifact",
          title: "Generate mystery doc",
          config: { artifactType: "not_a_real_artifact" },
        },
      ],
    });
    expect(bogus.status, JSON.stringify(bogus.json)).toBe(400);
    expect(String(bogus.json.error)).toContain("not_a_real_artifact");

    // ---- a canonical artifactType is accepted ----------------------------
    const flowKey = `flow-artifact-${Date.now()}`;
    const ok = await api("POST", "/conformity/flows", {
      key: flowKey,
      name: "Valid Artifact Flow",
      steps: [
        {
          id: "step-doc",
          type: "artifact",
          title: "Generate DoC",
          config: { artifactType: "eu_doc" },
        },
      ],
    });
    expect(ok.status, JSON.stringify(ok.json)).toBe(200);
    const flowId = (ok.json as { id: number }).id;

    try {
      // ---- updating to a bogus artifactType is refused (400) -------------
      const badUpdate = await api("PUT", `/conformity/flows/${flowId}`, {
        steps: [
          {
            id: "step-doc",
            type: "artifact",
            title: "Generate DoC",
            config: { artifactType: "totally_bogus" },
          },
        ],
      });
      expect(badUpdate.status, JSON.stringify(badUpdate.json)).toBe(400);
      expect(String(badUpdate.json.error)).toContain("totally_bogus");

      // ---- updating to a valid artifactType still works -----------------
      const goodUpdate = await api("PUT", `/conformity/flows/${flowId}`, {
        steps: [
          {
            id: "step-doc",
            type: "artifact",
            title: "Generate SBOM",
            config: { artifactType: "sbom_reference" },
          },
        ],
      });
      expect(goodUpdate.status, JSON.stringify(goodUpdate.json)).toBe(200);
    } finally {
      await api("DELETE", `/conformity/flows/${flowId}`);
    }
  }, 30_000);
});

describe("Conformity Flow Engine — demo role is read-only", () => {
  it("demo can read flows/flow-runs, but mutations are 403 and an admin mutation is not", async () => {
    // reads reachable
    const flows = await api("GET", "/conformity/flows", undefined, demoCookie);
    expect(flows.status).not.toBe(401);
    expect(flows.status).not.toBe(403);

    const runs = await api("GET", "/conformity/assessments/1/flow-runs", undefined, demoCookie);
    expect(runs.status).not.toBe(401);
    expect(runs.status).not.toBe(403);

    // mutations refused
    const demoCreate = await api("POST", "/conformity/flows", {}, demoCookie);
    expect(demoCreate.status).toBe(403);
    const demoUpdate = await api("PUT", "/conformity/flows/1", {}, demoCookie);
    expect(demoUpdate.status).toBe(403);
    const demoStart = await api("POST", "/conformity/assessments/1/flow-runs", {}, demoCookie);
    expect(demoStart.status).toBe(403);
    const demoPatch = await api("PATCH", "/conformity/flow-runs/1/steps/step-a", {}, demoCookie);
    expect(demoPatch.status).toBe(403);
    const demoDelete = await api("DELETE", "/conformity/flows/1", undefined, demoCookie);
    expect(demoDelete.status).toBe(403);

    // an admin mutation gets past the demo guard (may 400/404, never 403)
    const adminCreate = await api("POST", "/conformity/flows", {}, adminCookie);
    expect(adminCreate.status).not.toBe(403);
    expect(adminCreate.status).not.toBe(401);
  });
});

describe("Conformity Flow Engine — adopt latest steps", () => {
  it("preserves progress for surviving steps, adds new steps as pending, 409s after flow delete, rejects non-admins", async () => {
    const flowKey = `flow-adopt-${Date.now()}`;

    const created = await api("POST", "/conformity/flows", {
      key: flowKey,
      name: "Adopt Flow",
      steps: STEPS,
    });
    expect(created.status, JSON.stringify(created.json)).toBe(200);
    const flowId = (created.json as { id: number }).id;

    const product = await api("POST", "/conformity/products", {
      name: `Adopt Test Product ${Date.now()}`,
      productType: "software",
    });
    expect(product.status, JSON.stringify(product.json)).toBe(200);
    const productId = (product.json as { id: number }).id;

    const assessment = await api("POST", "/conformity/assessments", {
      productId,
      regulationKey: "cra",
    });
    expect(assessment.status, JSON.stringify(assessment.json)).toBe(200);
    const assessmentId = (assessment.json as { assessment: { id: number } }).assessment.id;

    let flowDeleted = false;
    try {
      const started = await api("POST", `/conformity/assessments/${assessmentId}/flow-runs`, {
        flowId,
      });
      expect(started.status, JSON.stringify(started.json)).toBe(200);
      const runId = (started.json as { run: { id: number } }).run.id;

      // Progress on a step that will SURVIVE the flow edit.
      const patch = await api("PATCH", `/conformity/flow-runs/${runId}/steps/step-a`, {
        status: "done",
        note: "finished before the flow changed",
      });
      expect(patch.status, JSON.stringify(patch.json)).toBe(200);

      // Edit the flow: keep step-a, drop step-b/step-c, add a brand new step.
      const edited = await api("PUT", `/conformity/flows/${flowId}`, {
        steps: [
          STEPS[0],
          { id: "step-new", type: "activity", title: "A newly added step" },
        ],
      });
      expect(edited.status, JSON.stringify(edited.json)).toBe(200);

      // The run now reports drift.
      const drifted = await api("GET", `/conformity/flow-runs/${runId}`);
      expect(drifted.status).toBe(200);
      expect((drifted.json as { flowUpdated: boolean }).flowUpdated).toBe(true);

      // Non-admin sessions may not adopt.
      const demoAdopt = await api(
        "POST",
        `/conformity/flow-runs/${runId}/adopt-steps`,
        undefined,
        demoCookie,
      );
      expect(demoAdopt.status).toBe(403);

      // Admin adopt re-snapshots: step-a keeps its progress, step-new is pending,
      // dropped steps are gone, and drift is cleared.
      const adopted = await api("POST", `/conformity/flow-runs/${runId}/adopt-steps`);
      expect(adopted.status, JSON.stringify(adopted.json)).toBe(200);
      const adoptedJson = adopted.json as {
        flowUpdated: boolean;
        steps: { id: string }[];
        run: { stepStates: Record<string, { status: string; note?: string }> };
      };
      expect(adoptedJson.flowUpdated).toBe(false);
      expect(adoptedJson.steps.map((s) => s.id)).toEqual(["step-a", "step-new"]);
      expect(adoptedJson.run.stepStates["step-a"]?.status).toBe("done");
      expect(adoptedJson.run.stepStates["step-a"]?.note).toBe("finished before the flow changed");
      expect(adoptedJson.run.stepStates["step-new"]?.status).toBe("pending");
      expect(adoptedJson.run.stepStates["step-b"]).toBeUndefined();
      expect(adoptedJson.run.stepStates["step-c"]).toBeUndefined();

      // Delete the flow: there is nothing current to adopt -> 409.
      const deleted = await api("DELETE", `/conformity/flows/${flowId}`);
      expect(deleted.status, JSON.stringify(deleted.json)).toBe(200);
      flowDeleted = true;

      const orphanAdopt = await api("POST", `/conformity/flow-runs/${runId}/adopt-steps`);
      expect(orphanAdopt.status).toBe(409);
    } finally {
      if (!flowDeleted) await api("DELETE", `/conformity/flows/${flowId}`);
    }
  }, 30_000);
});
