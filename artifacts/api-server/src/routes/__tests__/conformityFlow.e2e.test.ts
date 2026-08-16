/**
 * End-to-end regression walk over the full CRA conformity flow.
 *
 * Why this test exists
 * --------------------
 * The wizard → engine flow spans a long chain of endpoints, each of which
 * parses its own response with a generated zod schema *after* mutating the
 * database. A single response-shape mismatch breaks a step silently for the
 * assessor: the most recent example was delete handlers returning HTTP 500
 * *after* the row was already deleted, because they parsed `{ ok: true }`
 * against a `{ success: boolean }` schema.
 *
 * This test drives the whole CRA walk against the real Express app and the
 * real database, asserting both the HTTP status (200, not 500) and the
 * derived engine output at each fork. Any parse-after-mutate regression, any
 * broken computation, or any drifted response shape surfaces here before an
 * assessor hits it.
 *
 * The walk:
 *   create product → create assessment → save scoping (in_scope) →
 *   save classification (important_class_i) → route fork (Art. 32(2) keeps the
 *   recommendation off Module A) → select route (stage advances) → instantiate (evaluations
 *   created) → update evaluation → add evidence → generate artifacts →
 *   compute grade → create incident → delete evidence/incident/assessment/
 *   product (each 200 + { success: true }, row actually gone).
 */

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";
import { ARTIFACT_TYPES } from "../../lib/conformityEngine";
import { objectStorage } from "../../lib/storageBackend";

let server: Server;
let baseUrl: string;
let cookie: string;

beforeAll(async () => {
  cookie = `${ADMIN_COOKIE}=${createSessionToken("e2e-admin")}`;
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
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

describe("CRA conformity flow — full end-to-end walk", () => {
  it("walks create → scope → classify → route → instantiate → evaluate → evidence → artifacts → grade → incident → delete", async () => {
    // ---- create product ---------------------------------------------------
    const created = await api("POST", "/conformity/products", {
      name: `E2E CRA Product ${Date.now()}`,
      productType: "software",
    });
    expect(created.status, JSON.stringify(created.json)).toBe(200);
    const productId = (created.json as { id: number }).id;
    expect(typeof productId).toBe("number");

    // ---- create assessment (Detail wrapper → .assessment.id) --------------
    const asmCreated = await api("POST", "/conformity/assessments", {
      productId,
      regulationKey: "cra",
    });
    expect(asmCreated.status, JSON.stringify(asmCreated.json)).toBe(200);
    const assessmentId = (asmCreated.json as { assessment: { id: number } })
      .assessment.id;
    expect(typeof assessmentId).toBe("number");

    // ---- save scoping → must land in_scope --------------------------------
    const scoped = await api(
      "PUT",
      `/conformity/assessments/${assessmentId}/answers`,
      {
        answers: [
          { questionKey: "is_pde", value: { bool: true } },
          { questionKey: "made_available_eu", value: { bool: true } },
          { questionKey: "excluded_sectoral", value: { bool: false } },
          { questionKey: "is_saas_only", value: { bool: false } },
          { questionKey: "is_oss_noncommercial", value: { bool: false } },
        ],
      },
    );
    expect(scoped.status, JSON.stringify(scoped.json)).toBe(200);
    expect((scoped.json as { scope: { result: string } }).scope.result).toBe(
      "in_scope",
    );

    // ---- save classification → important_class_i --------------------------
    const classified = await api(
      "PUT",
      `/conformity/assessments/${assessmentId}/answers`,
      {
        answers: [
          {
            questionKey: "product_categories",
            // "vpn" is an Annex III, Class I important-product category.
            value: { options: ["vpn"] },
          },
        ],
      },
    );
    expect(classified.status, JSON.stringify(classified.json)).toBe(200);
    expect(
      (classified.json as { classification: { classKey: string } })
        .classification.classKey,
    ).toBe("important_class_i");

    // Recommended route for a Class I product without harmonised standards
    // fully applied must NOT be the self-assessment module (Module A).
    const recommendedBeforeFork = (
      classified.json as { recommendedRouteKey: string | null }
    ).recommendedRouteKey;
    expect(recommendedBeforeFork).not.toBe("module_a");

    // ---- route fork → recommended route changes ---------------------------
    const forked = await api(
      "PUT",
      `/conformity/assessments/${assessmentId}/answers`,
      {
        answers: [
          { questionKey: "applies_harmonised_standards", value: { bool: true } },
        ],
      },
    );
    expect(forked.status, JSON.stringify(forked.json)).toBe(200);
    const recommendedAfterFork = (
      forked.json as { recommendedRouteKey: string | null }
    ).recommendedRouteKey;
    /**
     * This assertion used to read "fully applying harmonised standards unlocks
     * Module A self-assessment", and it was wrong on the law.
     *
     * Art. 32(2) closes internal control for an important Class I product in
     * three cases: the manufacturer has not applied a basis under Art. 27, has
     * applied one only in part, OR "where such harmonised standards, common
     * specifications or European cybersecurity certification schemes DO NOT
     * EXIST". No CRA harmonised standard has been cited in the Official Journal
     * and no common specification adopted, so the third limb bites today
     * regardless of the answer given — a manufacturer cannot have applied a
     * standard that does not exist.
     *
     * The answer therefore cannot unlock Module A, and the recommendation stays
     * on a third-party route. If a citation is ever published, the register in
     * lib/presumption.ts gains a reference and this flips back on its own.
     */
    expect(recommendedAfterFork).not.toBe("module_a");
    expect(recommendedAfterFork).toBe(recommendedBeforeFork);

    const allowedRoutes = (
      forked.json as { allowedRoutes: { key: string }[] }
    ).allowedRoutes;
    expect(allowedRoutes.some((r) => r.key === "module_a")).toBe(false);
    expect(allowedRoutes.some((r) => r.key === "module_b_c")).toBe(true);

    // ---- select route → stage advances ------------------------------------
    const stageBefore = (forked.json as { assessment: { currentStage: string } })
      .assessment.currentStage;
    const routed = await api(
      "PUT",
      `/conformity/assessments/${assessmentId}/route`,
      // Module A is not on offer for this product — see the Art. 32(2) note
      // above — so the walk continues down the route the Regulation leaves open.
      { routeKey: "module_b_c" },
    );
    expect(routed.status, JSON.stringify(routed.json)).toBe(200);
    const routedJson = routed.json as {
      assessment: { currentStage: string; routeKey: string | null };
    };
    expect(routedJson.assessment.routeKey).toBe("module_b_c");
    expect(routedJson.assessment.currentStage).toBe("gap_assessment");
    expect(routedJson.assessment.currentStage).not.toBe(stageBefore);

    // ---- applied standards ledger (Art 32) --------------------------------
    /**
     * The Art. 32(2) advisory warns a Class I manufacturer who has selected
     * Module A that no standard is fully applied. It is deliberately scoped to
     * Module A, so on a third-party route there is nothing to advise — the
     * manufacturer is already doing what Art. 32(2) would have directed them to.
     *
     * That advisory is currently dormant rather than dead: Module A cannot be
     * selected for a Class I product while no harmonised standard has been
     * cited, so nothing reaches it. It becomes live again the moment a citation
     * is published and Module A reopens, which is why it is kept.
     *
     * The ledger itself must still work on any route — that is what the rest of
     * this section exercises.
     */
    expect(
      (routed.json as { standardsAdvisory: string | null }).standardsAdvisory,
    ).toBeNull();
    const partialStd = await api(
      "PUT",
      `/conformity/assessments/${assessmentId}/standards`,
      { standards: [{ reference: "ETSI EN 303 645", coverage: "partial" }] },
    );
    expect(partialStd.status, JSON.stringify(partialStd.json)).toBe(200);
    expect(
      (partialStd.json as { standardsAdvisory: string | null }).standardsAdvisory,
    ).toBeNull();
    expect(
      (partialStd.json as { assessment: { appliedStandards: unknown } }).assessment
        .appliedStandards,
    ).toEqual([{ reference: "ETSI EN 303 645", coverage: "partial" }]);
    const fullStd = await api(
      "PUT",
      `/conformity/assessments/${assessmentId}/standards`,
      {
        standards: [
          {
            reference: "EN 18031-1:2024",
            title: "Common security requirements for radio equipment",
            coverage: "full",
          },
        ],
      },
    );
    expect(fullStd.status, JSON.stringify(fullStd.json)).toBe(200);
    const fullStdJson = fullStd.json as {
      standardsAdvisory: string | null;
      assessment: { appliedStandards: unknown };
    };
    expect(fullStdJson.standardsAdvisory).toBeNull();
    expect(fullStdJson.assessment.appliedStandards).toEqual([
      {
        reference: "EN 18031-1:2024",
        title: "Common security requirements for radio equipment",
        coverage: "full",
      },
    ]);

    // Semantic no-op: an identical repeat PUT must not touch the row or append
    // a ledger entry. This also pins the comparison itself — jsonb readback
    // reorders object keys, so a naive stringify-compare of stored vs incoming
    // objects would never match and would re-write on every save.
    const activityBefore = await api(
      "GET",
      `/conformity/assessments/${assessmentId}/activity`,
    );
    const repeatStd = await api(
      "PUT",
      `/conformity/assessments/${assessmentId}/standards`,
      {
        standards: [
          {
            reference: "EN 18031-1:2024",
            title: "Common security requirements for radio equipment",
            coverage: "full",
          },
        ],
      },
    );
    expect(repeatStd.status, JSON.stringify(repeatStd.json)).toBe(200);
    const repeatJson = repeatStd.json as {
      standardsAdvisory: string | null;
      assessment: { updatedAt: string };
    };
    expect(repeatJson.standardsAdvisory).toBeNull();
    expect(repeatJson.assessment.updatedAt).toBe(
      (fullStd.json as { assessment: { updatedAt: string } }).assessment.updatedAt,
    );
    const activityAfter = await api(
      "GET",
      `/conformity/assessments/${assessmentId}/activity`,
    );
    expect((activityAfter.json as unknown as unknown[]).length).toBe(
      (activityBefore.json as unknown as unknown[]).length,
    );

    // ---- instantiate → evaluations created --------------------------------
    const instantiated = await api(
      "POST",
      `/conformity/assessments/${assessmentId}/instantiate`,
    );
    expect(instantiated.status, JSON.stringify(instantiated.json)).toBe(200);
    /**
     * The complete CRA requirement library for a manufacturer:
     *   Annex I Part I (13) + Part II (8)                        = 21
     *   Art 13 / 13(5) / 13(6) / 13(8) / 13(13) / 13(18) / 14    =  7
     *   Annex II / V / VII                                       =  3
     *   Art 23 (economic-operator traceability)                  =  1
     *                                                              ---
     *                                                               32
     * plus IEC 62443, which is also a declared regulation here.
     *
     * Deliberately an exact number rather than "greater than zero": the point of
     * this assertion is to catch instantiation silently dropping requirements.
     * It must be updated whenever the seeded library changes — the last change
     * added Art 13(13), 13(18) and 23.
     */
    expect(
      (instantiated.json as { counts: { evaluationsTotal: number } }).counts
        .evaluationsTotal,
    ).toBe(33);

    const evalList = await api(
      "GET",
      `/conformity/assessments/${assessmentId}/evaluations`,
    );
    expect(evalList.status, JSON.stringify(evalList.json)).toBe(200);
    const evaluations = evalList.json as unknown as {
      id: number;
      requirementRefCode: string;
    }[];
    expect(Array.isArray(evaluations)).toBe(true);
    expect(evaluations.length).toBeGreaterThan(0);
    const firstEval = evaluations[0]!;

    // ---- update evaluation → status persists ------------------------------
    const updatedEval = await api(
      "PUT",
      `/conformity/evaluations/${firstEval.id}`,
      { status: "met", implementationNote: "Covered by e2e walk." },
    );
    expect(updatedEval.status, JSON.stringify(updatedEval.json)).toBe(200);
    expect((updatedEval.json as { status: string }).status).toBe("met");

    // ---- re-instantiate (top-up) → idempotent, preserves existing state ----
    // Assessments created before the requirement library grew are topped up by
    // re-running instantiate: only missing rows are added, existing evaluation
    // statuses/notes are never touched.
    const topUp = await api(
      "POST",
      `/conformity/assessments/${assessmentId}/instantiate`,
    );
    expect(topUp.status, JSON.stringify(topUp.json)).toBe(200);
    expect(
      (topUp.json as { counts: { evaluationsTotal: number } }).counts
        .evaluationsTotal,
    ).toBe(33);
    const evalsAfterTopUp = await api(
      "GET",
      `/conformity/assessments/${assessmentId}/evaluations`,
    );
    const preserved = (
      evalsAfterTopUp.json as unknown as {
        id: number;
        status: string;
        implementationNote: string;
      }[]
    ).find((e) => e.id === firstEval.id);
    expect(preserved?.status).toBe("met");
    expect(preserved?.implementationNote).toBe("Covered by e2e walk.");

    // ---- add evidence -----------------------------------------------------
    const addedEvidence = await api(
      "POST",
      `/conformity/assessments/${assessmentId}/evidence`,
      {
        requirementRefCode: firstEval.requirementRefCode,
        title: "E2E evidence document",
        evidenceType: "document",
      },
    );
    expect(addedEvidence.status, JSON.stringify(addedEvidence.json)).toBe(200);
    const evidenceId = (addedEvidence.json as { id: number }).id;
    expect(typeof evidenceId).toBe("number");
    // The DTO must always carry a fileHash string; url/no-object evidence is "".
    expect((addedEvidence.json as { fileHash: unknown }).fileHash).toBe("");

    // ---- add evidence WITH a file → server fingerprints the stored bytes ----
    // The app runs in-process, so spying the storage prototype intercepts the
    // route's own download and lets us assert the persisted SHA-256 is correct.
    const knownBytes = Buffer.from("conformity-evidence-under-test");
    const expectedHash = createHash("sha256").update(knownBytes).digest("hex");
    const downloadSpy = vi
      .spyOn(objectStorage, "downloadToBufferIfWithin")
      .mockResolvedValue(knownBytes);
    let hashedEvidenceId = 0;
    try {
      const withFile = await api(
        "POST",
        `/conformity/assessments/${assessmentId}/evidence`,
        {
          requirementRefCode: firstEval.requirementRefCode,
          title: "E2E evidence with file",
          evidenceType: "sbom",
          objectPath: "/objects/uploads/e2e-test.bin",
          fileName: "e2e-test.bin",
        },
      );
      expect(withFile.status, JSON.stringify(withFile.json)).toBe(200);
      expect((withFile.json as { fileHash: string }).fileHash).toBe(expectedHash);
      hashedEvidenceId = (withFile.json as { id: number }).id;
    } finally {
      downloadSpy.mockRestore();
    }
    // Remove the extra row so it doesn't perturb the rest of the walk.
    if (hashedEvidenceId) {
      await api("DELETE", `/conformity/evidence/${hashedEvidenceId}`);
    }

    // ---- generate artifacts ----------------------------------------------
    type ArtifactDto = {
      id: number;
      artifactType: string;
      version: number;
      sections: { key: string; body: string; complete: boolean }[];
    };
    const artifacts = await api(
      "POST",
      `/conformity/assessments/${assessmentId}/artifacts/generate`,
    );
    expect(artifacts.status, JSON.stringify(artifacts.json)).toBe(200);
    const artifactList = artifacts.json as unknown as ArtifactDto[];
    expect(Array.isArray(artifactList)).toBe(true);
    // Bulk-generate must produce every generatable type — silently skipping one
    // (e.g. after adding a type to the enum but not the builder map) is exactly
    // the failure mode this guards.
    expect(artifactList.length).toBe(ARTIFACT_TYPES.length);
    const userInfo = artifactList.find((a) => a.artifactType === "user_information");
    expect(userInfo, "Annex II user-information document must be generated").toBeDefined();

    // The DoC must cite the recorded standards ledger verbatim (section 6).
    const euDoc = artifactList.find((a) => a.artifactType === "eu_doc");
    const standardsSection = euDoc?.sections.find((s) => s.key === "standards");
    expect(standardsSection?.complete).toBe(true);
    expect(standardsSection?.body).toContain("EN 18031-1:2024");

    // The walk's product has no support end date yet, so the Annex II
    // support-period section must be an honest "To complete" marker …
    const supportBefore = userInfo!.sections.find((s) => s.key === "support_period");
    expect(supportBefore?.complete).toBe(false);
    expect(supportBefore?.body).toContain("To complete: ");

    // … and filling the driving field on the product resolves it on regenerate.
    const productName = (created.json as { name: string }).name;
    const productUpdated = await api("PUT", `/conformity/products/${productId}`, {
      name: productName,
      supportPeriodEnd: "2031-12-31",
    });
    expect(productUpdated.status, JSON.stringify(productUpdated.json)).toBe(200);
    const regenerated = await api(
      "POST",
      `/conformity/assessments/${assessmentId}/artifacts/generate`,
    );
    expect(regenerated.status, JSON.stringify(regenerated.json)).toBe(200);
    const userInfoAfter = (regenerated.json as unknown as ArtifactDto[]).find(
      (a) => a.artifactType === "user_information",
    );
    const supportAfter = userInfoAfter?.sections.find((s) => s.key === "support_period");
    expect(supportAfter?.complete).toBe(true);
    expect(supportAfter?.body).toContain("2031-12-31");
    // Regeneration versions the document instead of duplicating it.
    expect(userInfoAfter!.version).toBe(userInfo!.version + 1);

    // ---- compute grade ----------------------------------------------------
    const grade = await api(
      "POST",
      `/conformity/assessments/${assessmentId}/grade`,
    );
    expect(grade.status, JSON.stringify(grade.json)).toBe(200);
    const gradeJson = grade.json as {
      id: number;
      overallGrade: string;
      overallScore: number;
    };
    expect(typeof gradeJson.id).toBe("number");
    expect(typeof gradeJson.overallGrade).toBe("string");
    expect(gradeJson.overallGrade.length).toBeGreaterThan(0);

    // ---- create incident --------------------------------------------------
    const incident = await api(
      "POST",
      `/conformity/assessments/${assessmentId}/incidents`,
      {
        title: "E2E actively exploited vulnerability",
        kind: "exploited_vulnerability",
        description: "Simulated incident for the regression walk.",
        severity: "high",
        detectedAt: new Date("2026-01-15T09:00:00.000Z").toISOString(),
      },
    );
    expect(incident.status, JSON.stringify(incident.json)).toBe(200);
    const incidentJson = incident.json as {
      id: number;
      earlyWarningDueAt: string;
      notificationDueAt: string;
      finalReportDueAt: string;
    };
    const incidentId = incidentJson.id;
    expect(typeof incidentId).toBe("number");
    // The Article 14 clock must be computed and serialized as ISO strings.
    expect(new Date(incidentJson.earlyWarningDueAt).getTime()).not.toBeNaN();
    expect(new Date(incidentJson.notificationDueAt).getTime()).not.toBeNaN();
    expect(new Date(incidentJson.finalReportDueAt).getTime()).not.toBeNaN();

    // ---- deletes: 200 + { success: true } AND the row is actually gone ----
    // (regression guard against parse-after-mutate returning HTTP 500)

    // evidence
    const delEvidence = await api("DELETE", `/conformity/evidence/${evidenceId}`);
    expect(delEvidence.status, JSON.stringify(delEvidence.json)).toBe(200);
    expect((delEvidence.json as { success: boolean }).success).toBe(true);
    const evidenceAfter = await api(
      "GET",
      `/conformity/assessments/${assessmentId}/evidence`,
    );
    expect(
      (evidenceAfter.json as unknown as { id: number }[]).some(
        (e) => e.id === evidenceId,
      ),
    ).toBe(false);

    // incident
    const delIncident = await api(
      "DELETE",
      `/conformity/incidents/${incidentId}`,
    );
    expect(delIncident.status, JSON.stringify(delIncident.json)).toBe(200);
    expect((delIncident.json as { success: boolean }).success).toBe(true);
    const incidentsAfter = await api(
      "GET",
      `/conformity/assessments/${assessmentId}/incidents`,
    );
    expect(
      (incidentsAfter.json as unknown as { id: number }[]).some(
        (i) => i.id === incidentId,
      ),
    ).toBe(false);

    // assessment (cascades its children)
    const delAssessment = await api(
      "DELETE",
      `/conformity/assessments/${assessmentId}`,
    );
    expect(delAssessment.status, JSON.stringify(delAssessment.json)).toBe(200);
    expect((delAssessment.json as { success: boolean }).success).toBe(true);
    const assessmentAfter = await api(
      "GET",
      `/conformity/assessments/${assessmentId}`,
    );
    expect(assessmentAfter.status).toBe(404);

    // product
    const delProduct = await api("DELETE", `/conformity/products/${productId}`);
    expect(delProduct.status, JSON.stringify(delProduct.json)).toBe(200);
    expect((delProduct.json as { success: boolean }).success).toBe(true);
    const productAfter = await api("GET", `/conformity/products/${productId}`);
    expect(productAfter.status).toBe(404);
    /**
     * This walk drives ~30 requests through the real app and a real database.
     * On its own it takes about 18 seconds; sharing a machine with the rest of
     * the suite it regularly passed 30 and failed on the clock rather than on an
     * assertion. Seeding three more CRA requirements (Art. 13(13), 13(18) and
     * 23) added evaluations to instantiate and pushed a marginal budget over.
     * Raised rather than trimmed: every step here guards a real regression.
     */
  }, 120_000);
});
