/**
 * Executive reporting suite — HTTP contract + lifecycle tests.
 *
 * Boots the real Express app on an ephemeral port against the real dev
 * database (same pattern as conformityAuth.test.ts) and drives the full
 * report lifecycle over HTTP:
 *
 *   create -> background AI drafting -> draft -> edit -> regenerate ->
 *   finalize -> read-only -> export -> delete
 *
 * The ONLY thing mocked is the LLM boundary (`draftSection` in
 * lib/reportNarrative): tests must be fast, deterministic and free. The
 * snapshot builder, section planner, citation registry, markdown renderer,
 * routes and the background generation pipeline all run for real.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  db,
  conformityAssessmentsTable,
  conformityActivityTable,
  conformityReportsTable,
} from "@workspace/db";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";

// ── LLM boundary mock ────────────────────────────────────────────────────────
// Everything except draftSection stays real. Sections whose key is present in
// `draftFailures` throw once (the flag is consumed) so the failed-section path
// and its recovery via regenerate can be exercised.
const mocks = vi.hoisted(() => ({ draftFailures: new Set<string>() }));

vi.mock("../../lib/reportNarrative", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../../lib/reportNarrative")>();
  const draftSection: typeof mod.draftSection = async (_ctx, spec) => {
    // Small artificial latency so "locked while generating" guards can be
    // asserted deterministically right after create.
    await new Promise((r) => setTimeout(r, 250));
    if (mocks.draftFailures.has(spec.key)) {
      mocks.draftFailures.delete(spec.key);
      throw new Error("mock LLM outage");
    }
    return { contentMd: `Mock prose for ${spec.key} [1].` };
  };
  return { ...mod, draftSection };
});

// app must be imported AFTER vi.mock is registered (vitest hoists vi.mock, so
// a static import is fine — noted for readers).
import app from "../../app";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

let server: Server;
let baseUrl: string;
let adminCookie: string;
let demoCookie: string;
let assessmentId: number;
const createdReportIds: number[] = [];

async function api(
  method: Method,
  path: string,
  opts: { cookie?: string; body?: unknown } = {},
): Promise<{ status: number; body: any }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(opts.cookie ? { cookie: opts.cookie } : {}),
      ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

/** Creates a report as admin and tracks it for cleanup. */
async function createReport(payload: Record<string, unknown>): Promise<any> {
  const res = await api("POST", "/conformity/reports", { cookie: adminCookie, body: payload });
  expect(res.status).toBe(200);
  const report = res.body.report;
  expect(report?.id).toBeTypeOf("number");
  createdReportIds.push(report.id);
  return report;
}

/** Polls GET /reports/:id until `done(report)` holds. */
async function waitForReport(
  id: number,
  done: (report: any) => boolean,
  timeoutMs = 15_000,
): Promise<any> {
  const start = Date.now();
  for (;;) {
    const res = await api("GET", `/conformity/reports/${id}`, { cookie: adminCookie });
    if (res.status === 200 && done(res.body.report)) return res.body.report;
    if (Date.now() - start > timeoutMs) {
      throw new Error(
        `timeout waiting on report ${id}; last status=${res.status} report.status=${res.body?.report?.status}`,
      );
    }
    await new Promise((r) => setTimeout(r, 150));
  }
}

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  const username = process.env["ADMIN_USERNAME"] ?? "admin";
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken(username)}`;
  demoCookie = `${ADMIN_COOKIE}=${createSessionToken("oxotdemo", "demo")}`;

  const [assessment] = await db
    .select({ id: conformityAssessmentsTable.id })
    .from(conformityAssessmentsTable)
    .orderBy(desc(conformityAssessmentsTable.id))
    .limit(1);
  if (!assessment) throw new Error("dev DB has no conformity assessment — run seed:demo first");
  assessmentId = assessment.id;
});

afterAll(async () => {
  if (createdReportIds.length) {
    await db.delete(conformityReportsTable).where(inArray(conformityReportsTable.id, createdReportIds));
    await db
      .delete(conformityActivityTable)
      .where(
        and(
          eq(conformityActivityTable.entityType, "report"),
          inArray(conformityActivityTable.entityId, createdReportIds),
        ),
      );
  }
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

// ── Auth contract ────────────────────────────────────────────────────────────

const ENDPOINTS: { method: Method; path: string }[] = [
  { method: "GET", path: "/conformity/reports" },
  { method: "POST", path: "/conformity/reports" },
  { method: "GET", path: "/conformity/reports/1" },
  { method: "PATCH", path: "/conformity/reports/1/sections/executive_summary" },
  { method: "POST", path: "/conformity/reports/1/sections/executive_summary/regenerate" },
  { method: "POST", path: "/conformity/reports/1/finalize" },
  { method: "GET", path: "/conformity/reports/1/export" },
  { method: "DELETE", path: "/conformity/reports/1" },
];

describe("reports — anonymous access is rejected", () => {
  it.each(ENDPOINTS)("$method $path returns 401 without a session", async ({ method, path }) => {
    const res = await api(method, path, { body: method === "GET" || method === "DELETE" ? undefined : {} });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body).not.toHaveProperty("report");
    expect(res.body).not.toHaveProperty("reports");
  });
});

describe("reports — demo role is read-only", () => {
  it("demo can list but every mutation is 403", async () => {
    const list = await api("GET", "/conformity/reports", { cookie: demoCookie });
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.reports)).toBe(true);

    for (const { method, path } of ENDPOINTS.filter((e) => e.method !== "GET")) {
      const res = await api(method, path, { cookie: demoCookie, body: {} });
      expect(res.status, `${method} ${path}`).toBe(403);
    }
  });
});

// ── Validation ───────────────────────────────────────────────────────────────

describe("reports — creation validation", () => {
  it("assessment scope without assessmentId is 400", async () => {
    const res = await api("POST", "/conformity/reports", {
      cookie: adminCookie,
      body: { scope: "assessment", reportType: "briefing", audience: "board" },
    });
    expect(res.status).toBe(400);
  });

  it("unknown assessment is 404", async () => {
    const res = await api("POST", "/conformity/reports", {
      cookie: adminCookie,
      body: { scope: "assessment", assessmentId: 99_999_999, reportType: "briefing", audience: "board" },
    });
    expect(res.status).toBe(404);
  });

  it("invalid reportType is rejected", async () => {
    const res = await api("POST", "/conformity/reports", {
      cookie: adminCookie,
      body: { scope: "assessment", assessmentId, reportType: "novel", audience: "board" },
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

// ── Full lifecycle ───────────────────────────────────────────────────────────

describe("reports — lifecycle (create → draft → edit → regenerate → finalize → export → delete)", () => {
  it("walks the whole lifecycle with the documented state guards", async () => {
    const created = await createReport({
      scope: "assessment",
      assessmentId,
      reportType: "briefing",
      audience: "board",
      title: "  Lifecycle test report  ",
    });
    const id = created.id as number;

    // Freshly created: generating, deterministic sections pre-rendered, AI pending.
    expect(created.status).toBe("generating");
    expect(created.title).toBe("Lifecycle test report"); // trimmed
    const detKeys = created.sections.filter((s: any) => s.kind === "deterministic").map((s: any) => s.key);
    const aiKeys = created.sections.filter((s: any) => s.kind === "ai").map((s: any) => s.key);
    expect(detKeys).toEqual(["cover", "kpi_band", "posture_charts", "references"]);
    expect(aiKeys).toEqual(["executive_summary", "key_findings", "risk_outlook", "decisions_requested"]);
    for (const s of created.sections) {
      if (s.kind === "deterministic") {
        expect(s.status).toBe("ready");
        expect(s.html.length).toBeGreaterThan(0);
      } else {
        expect(s.status).toBe("pending");
      }
    }
    expect(created.citations.length).toBeGreaterThan(0);
    expect(created.citations.map((c: any) => c.n)).toEqual(created.citations.map((_: any, i: number) => i + 1));

    // Mutations are locked while generating (the pipeline is the only writer).
    // The mocked LLM sleeps 250ms/section, so the report is still generating.
    const whileGenerating = await api("PATCH", `/conformity/reports/${id}/sections/executive_summary`, {
      cookie: adminCookie,
      body: { contentMd: "too early" },
    });
    expect(whileGenerating.status).toBe(409);
    expect(
      (await api("POST", `/conformity/reports/${id}/finalize`, { cookie: adminCookie })).status,
    ).toBe(409);

    // Background drafting (mocked LLM) promotes the report to draft.
    const draft = await waitForReport(id, (r) => r.status === "draft");
    for (const key of aiKeys) {
      const s = draft.sections.find((x: any) => x.key === key);
      expect(s.status).toBe("ready");
      expect(s.contentMd).toBe(`Mock prose for ${key} [1].`);
      expect(s.html).toContain(`Mock prose for ${key}`); // server-side pre-render
    }
    expect(draft.sectionsReady).toBe(draft.sectionsTotal);

    // Deterministic sections cannot be edited or regenerated.
    const editDet = await api("PATCH", `/conformity/reports/${id}/sections/cover`, {
      cookie: adminCookie,
      body: { contentMd: "nope" },
    });
    expect(editDet.status).toBe(400);
    const regenDet = await api("POST", `/conformity/reports/${id}/sections/cover/regenerate`, {
      cookie: adminCookie,
    });
    expect(regenDet.status).toBe(400);
    const editMissing = await api("PATCH", `/conformity/reports/${id}/sections/nope`, {
      cookie: adminCookie,
      body: { contentMd: "nope" },
    });
    expect(editMissing.status).toBe(404);

    // Edit an AI section: markdown is re-rendered server-side, author stamped.
    const edited = await api("PATCH", `/conformity/reports/${id}/sections/executive_summary`, {
      cookie: adminCookie,
      body: { contentMd: "**Edited** summary [1]." },
    });
    expect(edited.status).toBe(200);
    const editedSection = edited.body.report.sections.find((s: any) => s.key === "executive_summary");
    expect(editedSection.contentMd).toBe("**Edited** summary [1].");
    expect(editedSection.html).toContain("<strong>Edited</strong>");
    expect(editedSection.editedBy).toMatch(/^admin:/);
    expect(editedSection.editedAt).toBeTruthy();

    // Regenerate clears the manual edit and re-drafts.
    const regen = await api("POST", `/conformity/reports/${id}/sections/executive_summary/regenerate`, {
      cookie: adminCookie,
    });
    expect(regen.status).toBe(200);
    expect(regen.body.report.sections.find((s: any) => s.key === "executive_summary").status).toBe("pending");
    const redrafted = await waitForReport(id, (r) =>
      r.sections.every((s: any) => s.status === "ready"),
    );
    const regenSection = redrafted.sections.find((s: any) => s.key === "executive_summary");
    expect(regenSection.contentMd).toBe("Mock prose for executive_summary [1].");
    expect(regenSection.editedBy).toBe("");

    // Finalize locks the report.
    const finalized = await api("POST", `/conformity/reports/${id}/finalize`, { cookie: adminCookie });
    expect(finalized.status).toBe(200);
    expect(finalized.body.report.status).toBe("final");
    expect((await api("POST", `/conformity/reports/${id}/finalize`, { cookie: adminCookie })).status).toBe(409);
    expect(
      (
        await api("PATCH", `/conformity/reports/${id}/sections/executive_summary`, {
          cookie: adminCookie,
          body: { contentMd: "after final" },
        })
      ).status,
    ).toBe(409);
    expect(
      (
        await api("POST", `/conformity/reports/${id}/sections/executive_summary/regenerate`, {
          cookie: adminCookie,
        })
      ).status,
    ).toBe(409);

    // Export composes a self-contained print document.
    const exported = await api("GET", `/conformity/reports/${id}/export`, { cookie: adminCookie });
    expect(exported.status).toBe(200);
    // composeReportHtml decorates the document title with the audience edition.
    expect(exported.body.title).toContain("Lifecycle test report");
    const html = (exported.body.html as string).toLowerCase();
    expect(html).toContain("<!doctype");
    expect(exported.body.html).toContain("Mock prose for key_findings");
    expect(exported.body.html).toContain("References");

    // Delete, then the report is gone.
    const deleted = await api("DELETE", `/conformity/reports/${id}`, { cookie: adminCookie });
    expect(deleted.status).toBe(200);
    expect(deleted.body).toEqual({ ok: true });
    expect((await api("GET", `/conformity/reports/${id}`, { cookie: adminCookie })).status).toBe(404);
  }, 60_000);
});

// ── Failure + recovery ───────────────────────────────────────────────────────

describe("reports — a failed section blocks finalize and recovers via regenerate", () => {
  it("marks the section failed with a note, then regenerate heals it", async () => {
    mocks.draftFailures.add("risk_outlook");
    const created = await createReport({
      scope: "assessment",
      assessmentId,
      reportType: "briefing",
      audience: "board",
    });
    const id = created.id as number;

    const draft = await waitForReport(id, (r) => r.status === "draft");
    const failed = draft.sections.find((s: any) => s.key === "risk_outlook");
    expect(failed.status).toBe("failed");
    expect(failed.note).toContain("Drafting failed");
    expect(failed.note).toContain("mock LLM outage");

    // Finalize refuses while a section is not ready.
    const finalize = await api("POST", `/conformity/reports/${id}/finalize`, { cookie: adminCookie });
    expect(finalize.status).toBe(409);
    expect(finalize.body.error).toContain("not ready");

    // Regenerate (failure flag consumed) heals the section.
    expect(
      (await api("POST", `/conformity/reports/${id}/sections/risk_outlook/regenerate`, { cookie: adminCookie }))
        .status,
    ).toBe(200);
    const healed = await waitForReport(id, (r) =>
      r.sections.every((s: any) => s.status === "ready"),
    );
    expect(healed.sections.find((s: any) => s.key === "risk_outlook").contentMd).toContain("Mock prose");
    expect((await api("POST", `/conformity/reports/${id}/finalize`, { cookie: adminCookie })).status).toBe(200);
  }, 60_000);
});

// ── Report-level failure recovery ────────────────────────────────────────────

describe("reports — a fully-failed report heals back to draft", () => {
  const AI_KEYS = ["executive_summary", "key_findings", "risk_outlook", "decisions_requested"];

  /** Creates a briefing whose every AI section fails, yielding status=failed. */
  async function createFailedReport(): Promise<number> {
    for (const k of AI_KEYS) mocks.draftFailures.add(k);
    const created = await createReport({ scope: "assessment", assessmentId, reportType: "briefing", audience: "board" });
    const failedReport = await waitForReport(created.id, (r) => r.status === "failed");
    expect(failedReport.sections.filter((s: any) => s.kind === "ai").every((s: any) => s.status === "failed")).toBe(
      true,
    );
    return created.id as number;
  }

  it("editing a section on a failed report succeeds and returns it to draft", async () => {
    const id = await createFailedReport();
    const edited = await api("PATCH", `/conformity/reports/${id}/sections/executive_summary`, {
      cookie: adminCookie,
      body: { contentMd: "Manually written after the outage [1]." },
    });
    expect(edited.status).toBe(200);
    expect(edited.body.report.status).toBe("draft");
    const section = edited.body.report.sections.find((s: any) => s.key === "executive_summary");
    expect(section.status).toBe("ready");
    expect(section.note ? section.note : "").toBe(""); // no visible note on a clean edit
  }, 60_000);

  it("regenerating a section on a failed report runs (no stuck pending) and returns it to draft", async () => {
    const id = await createFailedReport();
    const regen = await api("POST", `/conformity/reports/${id}/sections/risk_outlook/regenerate`, {
      cookie: adminCookie,
    });
    expect(regen.status).toBe(200);
    // Healed at claim time so the background worker (draft-only) can proceed.
    expect(regen.body.report.status).toBe("draft");
    const healed = await waitForReport(
      id,
      (r) => r.sections.find((s: any) => s.key === "risk_outlook").status === "ready",
    );
    expect(healed.status).toBe("draft");
    expect(healed.sections.find((s: any) => s.key === "risk_outlook").contentMd).toContain("Mock prose");
  }, 60_000);
});

// ── Citation traceability on manual edits ────────────────────────────────────

describe("reports — manual edits obey the citation contract", () => {
  it("strips markers not in the reference list and notes what was removed", async () => {
    const created = await createReport({ scope: "assessment", assessmentId, reportType: "briefing", audience: "board" });
    await waitForReport(created.id, (r) => r.status === "draft");
    const edited = await api("PATCH", `/conformity/reports/${created.id}/sections/key_findings`, {
      cookie: adminCookie,
      body: { contentMd: "Valid citation [1] but bogus [999] must go." },
    });
    expect(edited.status).toBe(200);
    const section = edited.body.report.sections.find((s: any) => s.key === "key_findings");
    expect(section.contentMd).toContain("[1]");
    expect(section.contentMd).not.toContain("[999]");
    expect(section.html).not.toContain("[999]");
    expect(section.note).toContain("[999]");
  }, 60_000);
});

// ── Portfolio scope + list filters ──────────────────────────────────────────

describe("reports — portfolio scope and list filters", () => {
  it("creates a portfolio report and filters lists by scope/assessment", async () => {
    const portfolio = await createReport({ scope: "portfolio", reportType: "briefing", audience: "board" });
    expect(portfolio.assessmentId).toBeNull();
    expect(portfolio.productName).toBeNull();
    await waitForReport(portfolio.id, (r) => r.status === "draft");

    const assessment = await createReport({
      scope: "assessment",
      assessmentId,
      reportType: "briefing",
      audience: "regulator",
    });
    // Regulator audience swaps the board-only decision section out.
    const aiKeys = assessment.sections.filter((s: any) => s.kind === "ai").map((s: any) => s.key);
    expect(aiKeys).toContain("compliance_position");
    expect(aiKeys).not.toContain("decisions_requested");
    expect(assessment.productName).toBeTruthy();

    const portfolioList = await api("GET", "/conformity/reports?scope=portfolio", { cookie: adminCookie });
    expect(portfolioList.status).toBe(200);
    const portfolioIds = portfolioList.body.reports.map((r: any) => r.id);
    expect(portfolioIds).toContain(portfolio.id);
    expect(portfolioIds).not.toContain(assessment.id);

    const scoped = await api("GET", `/conformity/reports?scope=assessment&assessmentId=${assessmentId}`, {
      cookie: adminCookie,
    });
    const scopedIds = scoped.body.reports.map((r: any) => r.id);
    expect(scopedIds).toContain(assessment.id);
    expect(scopedIds).not.toContain(portfolio.id);
    for (const r of scoped.body.reports) expect(r.assessmentId).toBe(assessmentId);
  }, 60_000);
});
