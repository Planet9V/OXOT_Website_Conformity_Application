/**
 * CRA Article 14 incident tracks — API integration walk.
 *
 * Boots the real Express app against the real dev DB on an ephemeral port and
 * locks down the two-track reporting model:
 *  - create requires a valid track (`kind`) → 400 otherwise;
 *  - vulnerability final report re-anchors to corrective-available + 14 days;
 *  - severe-incident final report re-anchors to notification-done + one
 *    calendar month (exact month arithmetic, not 30 days);
 *  - marking a stage done requires a recorded submission proof;
 *  - clearing an anchor falls back to the conservative deadline;
 *  - semantic no-op updates change nothing (same updatedAt);
 *  - report package returns the three stage sections with missing markers;
 *  - auth contract: anon → 401, demo → 403 on mutations.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";
import { addCalendarMonth } from "../../lib/conformityEngine";

let server: Server;
let baseUrl: string;
let adminCookie: string;
let demoCookie: string;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("incident-admin")}`;
  demoCookie = `${ADMIN_COOKIE}=${createSessionToken("oxotdemo", "demo")}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

type Json = Record<string, unknown>;
const ANON = Symbol("anon");

async function api(
  method: string,
  path: string,
  body?: unknown,
  cookie: string | typeof ANON = adminCookie,
): Promise<{ status: number; json: Json }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(cookie === ANON ? {} : { cookie }),
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json: Json = {};
  try {
    json = text ? (JSON.parse(text) as Json) : {};
  } catch {
    json = { __raw: text };
  }
  return { status: res.status, json };
}

let productId: number;
let assessmentId: number;
const detectedAt = new Date(Date.now() - 10 * HOUR);

beforeAll(async () => {
  const product = await api("POST", "/conformity/products", {
    name: `Incident Track Product ${Date.now()}`,
    productType: "software",
  });
  expect(product.status, JSON.stringify(product.json)).toBe(200);
  productId = product.json.id as number;
  const assessment = await api("POST", "/conformity/assessments", {
    productId,
    regulationKey: "cra",
  });
  expect(assessment.status, JSON.stringify(assessment.json)).toBe(200);
  assessmentId = (assessment.json.assessment as Json).id as number;
});

afterAll(async () => {
  if (productId) await api("DELETE", `/conformity/products/${productId}`);
});

function ms(v: unknown): number {
  return new Date(String(v)).getTime();
}

describe("incident creation — track required, per-track conservative clocks", () => {
  it("rejects a missing/invalid track with 400", async () => {
    const missing = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "No track",
      detectedAt: detectedAt.toISOString(),
    });
    expect(missing.status).toBe(400);
    const invalid = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "Bad track",
      kind: "meh",
      detectedAt: detectedAt.toISOString(),
    });
    expect(invalid.status).toBe(400);
  });

  it("vulnerability: 24h/72h from detection, conservative final = detection + 14d", async () => {
    const res = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "Exploited CVE",
      kind: "exploited_vulnerability",
      detectedAt: detectedAt.toISOString(),
    });
    expect(res.status, JSON.stringify(res.json)).toBe(200);
    expect(res.json.kind).toBe("exploited_vulnerability");
    expect(ms(res.json.earlyWarningDueAt)).toBe(detectedAt.getTime() + 24 * HOUR);
    expect(ms(res.json.notificationDueAt)).toBe(detectedAt.getTime() + 72 * HOUR);
    expect(ms(res.json.finalReportDueAt)).toBe(detectedAt.getTime() + 14 * DAY);
  });

  it("severe incident: conservative final = detection + 72h + one calendar month", async () => {
    const res = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "Severe outage",
      kind: "severe_incident",
      detectedAt: detectedAt.toISOString(),
    });
    expect(res.status, JSON.stringify(res.json)).toBe(200);
    expect(ms(res.json.finalReportDueAt)).toBe(
      addCalendarMonth(new Date(detectedAt.getTime() + 72 * HOUR)).getTime(),
    );
  });
});

describe("anchor recompute in the update transaction", () => {
  it("setting corrective-available re-anchors a vulnerability final report; clearing falls back", async () => {
    const created = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "Recompute vuln",
      kind: "exploited_vulnerability",
      detectedAt: detectedAt.toISOString(),
    });
    const id = created.json.id as number;
    const fixAt = new Date(detectedAt.getTime() + 3 * DAY);
    const set = await api("PUT", `/conformity/incidents/${id}`, {
      correctiveAvailableAt: fixAt.toISOString(),
    });
    expect(set.status).toBe(200);
    expect(ms(set.json.finalReportDueAt)).toBe(fixAt.getTime() + 14 * DAY);
    const cleared = await api("PUT", `/conformity/incidents/${id}`, {
      correctiveAvailableAt: null,
    });
    expect(ms(cleared.json.finalReportDueAt)).toBe(detectedAt.getTime() + 14 * DAY);
  });

  it("marking the 72h notification done requires a submission proof, then re-anchors to + one calendar month", async () => {
    const created = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "Recompute severe",
      kind: "severe_incident",
      detectedAt: detectedAt.toISOString(),
    });
    const id = created.json.id as number;
    // Must stay in the past: submission proofs cannot carry future timestamps.
    const doneAt = new Date(detectedAt.getTime() + 5 * HOUR);

    // Without a submission proof, the stage cannot be marked done.
    const ungated = await api("PUT", `/conformity/incidents/${id}`, {
      notificationDoneAt: doneAt.toISOString(),
    });
    expect(ungated.status).toBe(400);
    expect(String(ungated.json.error)).toContain("submission");

    // Recording the proof stamps notificationDoneAt AND re-anchors the final
    // report to submission + one calendar month in the same transaction.
    const proof = await api("POST", `/conformity/incidents/${id}/submissions`, {
      stage: "notification",
      submittedAt: doneAt.toISOString(),
      channel: "srp",
      reference: "SRP-2026-0001",
    });
    expect(proof.status, JSON.stringify(proof.json)).toBe(200);
    const list = await api("GET", `/conformity/assessments/${assessmentId}/incidents`);
    const row = (list.json as unknown as Json[]).find((i) => i.id === id)!;
    expect(ms(row.notificationDoneAt)).toBe(doneAt.getTime());
    expect(ms(row.finalReportDueAt)).toBe(addCalendarMonth(doneAt).getTime());

    // Reopening returns to the conservative fallback…
    const reopened = await api("PUT", `/conformity/incidents/${id}`, {
      notificationDoneAt: null,
    });
    expect(ms(reopened.json.finalReportDueAt)).toBe(
      addCalendarMonth(new Date(detectedAt.getTime() + 72 * HOUR)).getTime(),
    );
    // …and re-marking done is allowed because the proof exists.
    const redone = await api("PUT", `/conformity/incidents/${id}`, {
      notificationDoneAt: doneAt.toISOString(),
    });
    expect(redone.status).toBe(200);
    expect(ms(redone.json.finalReportDueAt)).toBe(addCalendarMonth(doneAt).getTime());
  });

  it("switching track recomputes the final-report deadline", async () => {
    const created = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "Relabelled",
      kind: "exploited_vulnerability",
      detectedAt: detectedAt.toISOString(),
    });
    const id = created.json.id as number;
    const switched = await api("PUT", `/conformity/incidents/${id}`, {
      kind: "severe_incident",
    });
    expect(switched.json.kind).toBe("severe_incident");
    expect(ms(switched.json.finalReportDueAt)).toBe(
      addCalendarMonth(new Date(detectedAt.getTime() + 72 * HOUR)).getTime(),
    );
  });

  it("a semantic no-op update leaves the row untouched", async () => {
    const created = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "No-op",
      kind: "severe_incident",
      detectedAt: detectedAt.toISOString(),
      memberStates: "NL",
    });
    const id = created.json.id as number;
    const before = created.json.updatedAt;
    const noop = await api("PUT", `/conformity/incidents/${id}`, {
      kind: "severe_incident",
      memberStates: "NL",
    });
    expect(noop.status).toBe(200);
    expect(noop.json.updatedAt).toBe(before);
  });
});

describe("anchor date validation — a rejected date never marks a deadline done", () => {
  it("POST with correctiveAvailableAt before detectedAt → 400, no row created", async () => {
    const before = await api("GET", `/conformity/assessments/${assessmentId}/incidents`);
    const countBefore = (before.json as unknown as Json[]).length ?? 0;
    const res = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "Bad corrective anchor",
      kind: "exploited_vulnerability",
      detectedAt: detectedAt.toISOString(),
      correctiveAvailableAt: new Date(detectedAt.getTime() - DAY).toISOString(),
    });
    expect(res.status).toBe(400);
    expect(String(res.json.error)).toContain("detection time");
    const after = await api("GET", `/conformity/assessments/${assessmentId}/incidents`);
    expect((after.json as unknown as Json[]).length).toBe(countBefore);
  });

  it("PUT with notificationDoneAt before detectedAt → 400, row unchanged, no ledger entry", async () => {
    const created = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "Reject backdated notification",
      kind: "severe_incident",
      detectedAt: detectedAt.toISOString(),
    });
    expect(created.status, JSON.stringify(created.json)).toBe(200);
    const id = created.json.id as number;

    const activityBefore = await api(
      "GET",
      `/conformity/assessments/${assessmentId}/activity`,
    );
    const ledgerBefore = (activityBefore.json as unknown as Json[]).length;

    const res = await api("PUT", `/conformity/incidents/${id}`, {
      notificationDoneAt: new Date(detectedAt.getTime() - 2 * DAY).toISOString(),
    });
    expect(res.status).toBe(400);
    expect(String(res.json.error)).toContain("detection time");

    // Row unchanged: notification still open, deadline still conservative,
    // updatedAt untouched.
    const list = await api("GET", `/conformity/assessments/${assessmentId}/incidents`);
    const row = (list.json as unknown as Json[]).find((i) => i.id === id)!;
    expect(row.notificationDoneAt).toBeNull();
    expect(ms(row.finalReportDueAt)).toBe(
      addCalendarMonth(new Date(detectedAt.getTime() + 72 * HOUR)).getTime(),
    );
    expect(row.updatedAt).toBe(created.json.updatedAt);

    // No activity ledger entry was written for the rejected update.
    const activityAfter = await api(
      "GET",
      `/conformity/assessments/${assessmentId}/activity`,
    );
    expect((activityAfter.json as unknown as Json[]).length).toBe(ledgerBefore);
  });

  it("PUT with correctiveAvailableAt more than a year in the future → 400", async () => {
    const created = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "Reject far-future corrective",
      kind: "exploited_vulnerability",
      detectedAt: detectedAt.toISOString(),
    });
    const id = created.json.id as number;
    const res = await api("PUT", `/conformity/incidents/${id}`, {
      correctiveAvailableAt: new Date(Date.now() + 400 * DAY).toISOString(),
    });
    expect(res.status).toBe(400);
    expect(String(res.json.error)).toContain("year");
    const list = await api("GET", `/conformity/assessments/${assessmentId}/incidents`);
    const row = (list.json as unknown as Json[]).find((i) => i.id === id)!;
    expect(row.correctiveAvailableAt).toBeNull();
    expect(ms(row.finalReportDueAt)).toBe(detectedAt.getTime() + 14 * DAY);
  });

  it("valid anchor → 200 and finalReportDueAt recomputed", async () => {
    const created = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "Valid anchor recompute",
      kind: "exploited_vulnerability",
      detectedAt: detectedAt.toISOString(),
    });
    const id = created.json.id as number;
    const fixAt = new Date(detectedAt.getTime() + 5 * HOUR);
    const res = await api("PUT", `/conformity/incidents/${id}`, {
      correctiveAvailableAt: fixAt.toISOString(),
    });
    expect(res.status, JSON.stringify(res.json)).toBe(200);
    expect(ms(res.json.correctiveAvailableAt)).toBe(fixAt.getTime());
    expect(ms(res.json.finalReportDueAt)).toBe(fixAt.getTime() + 14 * DAY);
  });
});

describe("report package", () => {
  it("returns the three stage sections with 'missing' markers for uncaptured content", async () => {
    const created = await api("POST", `/conformity/assessments/${assessmentId}/incidents`, {
      title: "Package vuln",
      kind: "exploited_vulnerability",
      detectedAt: detectedAt.toISOString(),
      description: "Heap overflow exploited in the wild.",
      memberStates: "NL, DE",
    });
    const id = created.json.id as number;
    const pkg = await api("GET", `/conformity/incidents/${id}/report-package`);
    expect(pkg.status, JSON.stringify(pkg.json)).toBe(200);
    const sections = pkg.json.sections as { stage: string; fields: Json[] }[];
    expect(sections.map((s) => s.stage)).toEqual([
      "early_warning",
      "notification",
      "final_report",
    ]);
    const notif = sections[1]!;
    const memberStates = notif.fields.find((f) => f.label === "EU member states affected");
    expect(memberStates?.missing).toBe(false);
    const measures = notif.fields.find(
      (f) => f.label === "Corrective or mitigating measures taken",
    );
    expect(measures?.missing).toBe(true);
    expect(pkg.json.kindLabel).toBe("Actively exploited vulnerability");
  });

  it("404s for an unknown incident", async () => {
    const res = await api("GET", "/conformity/incidents/999999/report-package");
    expect(res.status).toBe(404);
  });
});

describe("auth contract", () => {
  it("anonymous callers get 401, never data", async () => {
    const res = await api(
      "GET",
      `/conformity/incidents/1/report-package`,
      undefined,
      ANON,
    );
    expect(res.status).toBe(401);
  });

  it("the read-only demo role is blocked from incident mutations (403)", async () => {
    const res = await api(
      "POST",
      `/conformity/assessments/${assessmentId}/incidents`,
      {
        title: "Demo attempt",
        kind: "severe_incident",
        detectedAt: detectedAt.toISOString(),
      },
      demoCookie,
    );
    expect(res.status).toBe(403);
    const upd = await api("PUT", "/conformity/incidents/1", { severity: "low" }, demoCookie);
    expect(upd.status).toBe(403);
  });
});
