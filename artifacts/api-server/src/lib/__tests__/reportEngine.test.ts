/**
 * Unit tests for the reporting engine's pure building blocks plus a DB-backed
 * determinism check: a frozen snapshot must always plan the exact same
 * sections, figures and reference list (reports may never drift after
 * creation — same contract as flow-run snapshots).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { desc } from "drizzle-orm";
import { db, conformityAssessmentsTable, type ReportOptions } from "@workspace/db";
import { CitationRegistry, validateMarkers, STATIC_BIBLIOGRAPHY } from "../reportCitations";
import { donutChart, barChart, riskMatrix, timelineChart, distributionChart, escapeXml } from "../reportCharts";
import { escapeHtml, renderMarkdown } from "../reportExport";
import {
  buildAssessmentSnapshot,
  buildPortfolioSnapshot,
  buildCitationRegistry,
  defaultReportTitle,
  planSections,
  aiSectionSpecs,
} from "../reportEngine";
import type { AssessmentSnapshot, SnapshotIncident } from "../reportTypes";
import { isIncidentClosed } from "../conformityEngine";

const OPTIONS: ReportOptions = {
  includeAnnexes: true,
  includeEvidenceRegister: true,
  includeIncidentDetail: true,
};

// ── CitationRegistry ─────────────────────────────────────────────────────────

describe("CitationRegistry", () => {
  it("numbers sources in add order and dedupes by key", () => {
    const reg = new CitationRegistry();
    expect(reg.add("regulation", "reg:cra", "CRA")).toBe(1);
    expect(reg.add("standard", "std:en-18031", "EN 18031")).toBe(2);
    expect(reg.add("regulation", "reg:cra", "CRA (again)")).toBe(1); // dedupe
    expect(reg.citations.map((c) => c.n)).toEqual([1, 2]);
    expect(reg.citations[0]!.label).toBe("CRA"); // first registration wins
  });

  it("cite() resolves aliases and returns '' for unknown keys", () => {
    const reg = new CitationRegistry();
    reg.add("regulation", "reg:cra", "CRA");
    reg.alias("bib:cra", "reg:cra");
    expect(reg.cite("reg:cra")).toBe("[1]");
    expect(reg.cite("bib:cra")).toBe("[1]");
    expect(reg.cite("missing")).toBe("");
    expect(reg.has("reg:cra")).toBe(true);
    expect(reg.has("bib:cra")).toBe(false); // alias, not a second entry
  });

  it("promptBlock lists every source with its marker", () => {
    const reg = new CitationRegistry();
    reg.add("regulation", "a", "Alpha");
    reg.add("evidence", "b", "Bravo");
    expect(reg.promptBlock()).toBe("[1] Alpha\n[2] Bravo");
  });
});

describe("validateMarkers", () => {
  const citations = [{ n: 1 }, { n: 2 }];

  it("keeps valid markers and strips unknown ones", () => {
    const { text, stripped } = validateMarkers("Fact [1] and claim [7] end [2].", citations);
    expect(text).toBe("Fact [1] and claim end [2].");
    expect(stripped).toEqual([7]);
  });

  it("does not touch markdown links that look like markers", () => {
    const { text, stripped } = validateMarkers("See [9](https://example.com) now [1].", citations);
    expect(text).toBe("See [9](https://example.com) now [1].");
    expect(stripped).toEqual([]);
  });
});

// ── HTML/markdown rendering ──────────────────────────────────────────────────

describe("renderMarkdown / escapeHtml", () => {
  it("escapeHtml neutralises the five HTML-significant characters", () => {
    expect(escapeHtml(`<img src="x" onerror='y'> & done`)).not.toMatch(/[<>]|onerror='y'/);
  });

  it("renders emphasis and lists, and never passes raw HTML through", () => {
    const html = renderMarkdown("**Bold** move\n\n- item one\n- item two\n\n<script>alert(1)</script>");
    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain("<li>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

// ── Charts ───────────────────────────────────────────────────────────────────

describe("report charts", () => {
  it("every chart returns a self-contained <svg> and escapes labels", () => {
    const hostile = `A<&"B`;
    const svgs = [
      donutChart({
        segments: [
          { label: hostile, value: 3, color: "#15803d" },
          { label: "Open", value: 2, color: "#b91c1c" },
        ],
        centerLabel: "60%",
        centerSub: hostile,
      }),
      barChart({ bars: [{ label: hostile, value: 5, max: 10 }] }),
      riskMatrix({ rows: [[1, 0], [0, 2]], rowLabels: [hostile, "High"], colLabels: ["Low", "High"] }),
      timelineChart({
        items: [{ label: hostile, date: new Date("2026-08-01T00:00:00Z"), kind: "due" }],
        start: new Date("2026-07-01T00:00:00Z"),
        end: new Date("2026-09-01T00:00:00Z"),
      }),
      distributionChart({ columns: [{ label: hostile, value: 4 }] }),
    ];
    for (const svg of svgs) {
      expect(svg.trimStart()).toMatch(/^<svg/);
      expect(svg).toContain(escapeXml(hostile));
      expect(svg).not.toContain(hostile);
    }
  });
});

// ── Engine determinism (DB-backed) ───────────────────────────────────────────

describe("report engine — frozen snapshot determinism", () => {
  let snapshot: AssessmentSnapshot;

  beforeAll(async () => {
    const [assessment] = await db
      .select({ id: conformityAssessmentsTable.id })
      .from(conformityAssessmentsTable)
      .orderBy(desc(conformityAssessmentsTable.id))
      .limit(1);
    if (!assessment) throw new Error("dev DB has no conformity assessment — run seed:demo first");
    const built = await buildAssessmentSnapshot(assessment.id);
    if (!built) throw new Error("buildAssessmentSnapshot returned null for an existing assessment");
    snapshot = built;
  });

  it("the same snapshot always plans byte-identical sections and citations", () => {
    const regA = buildCitationRegistry(snapshot, OPTIONS);
    const regB = buildCitationRegistry(snapshot, OPTIONS);
    expect(regA.citations).toEqual(regB.citations);
    expect(regA.citations.map((c) => c.n)).toEqual(regA.citations.map((_, i) => i + 1));
    expect(new Set(regA.citations.map((c) => c.key)).size).toBe(regA.citations.length);

    const title = defaultReportTitle(snapshot, "briefing");
    const a = planSections(snapshot, "briefing", "board", OPTIONS, regA, title);
    const b = planSections(snapshot, "briefing", "board", OPTIONS, regB, title);
    expect(JSON.stringify(a.sections)).toBe(JSON.stringify(b.sections));
  });

  it("briefing/board plan: deterministic sections pre-rendered, AI stubs pending", () => {
    const reg = buildCitationRegistry(snapshot, OPTIONS);
    const { sections, aiSpecs } = planSections(
      snapshot,
      "briefing",
      "board",
      OPTIONS,
      reg,
      defaultReportTitle(snapshot, "briefing"),
    );
    expect(sections.map((s) => s.key)).toEqual([
      "cover",
      "kpi_band",
      "posture_charts",
      "executive_summary",
      "key_findings",
      "risk_outlook",
      "decisions_requested",
      "references",
    ]);
    for (const s of sections) {
      if (s.kind === "deterministic") {
        expect(s.status).toBe("ready");
        expect(s.html.length).toBeGreaterThan(0);
      } else {
        expect(s.status).toBe("pending");
        expect(s.html).toBe("");
      }
    }
    // Every AI stub has a matching drafting spec.
    const stubKeys = sections.filter((s) => s.kind === "ai").map((s) => s.key);
    expect(aiSpecs.map((s) => s.key)).toEqual(stubKeys);
    // The references section lists the static bibliography (always registered).
    const references = sections.find((s) => s.key === "references")!;
    expect(references.html).toContain("2024/2847"); // CRA OJ reference
    expect(reg.citations.length).toBeGreaterThanOrEqual(STATIC_BIBLIOGRAPHY.length);
  });

  it("full format honours annex options", () => {
    const reg = buildCitationRegistry(snapshot, OPTIONS);
    const withAnnexes = planSections(snapshot, "full", "regulator", OPTIONS, reg, "T");
    const keys = withAnnexes.sections.map((s) => s.key);
    expect(keys).toContain("annex_requirements");
    expect(keys).toContain("annex_evidence");

    const slim: ReportOptions = { includeAnnexes: false, includeEvidenceRegister: false, includeIncidentDetail: false };
    const without = planSections(snapshot, "full", "regulator", slim, buildCitationRegistry(snapshot, slim), "T");
    const slimKeys = without.sections.map((s) => s.key);
    expect(slimKeys).not.toContain("annex_requirements");
    expect(slimKeys).not.toContain("annex_evidence");
  });

  it("regulator audience swaps the board decision section (briefing format)", () => {
    const reg = buildCitationRegistry(snapshot, OPTIONS);
    const keys = planSections(snapshot, "briefing", "regulator", OPTIONS, reg, "T").sections.map((s) => s.key);
    expect(keys).toContain("compliance_position");
    expect(keys).not.toContain("decisions_requested");
  });

  it("incident KPIs count every non-terminal status as open (only resolved/closed are terminal)", () => {
    // Canonical semantics shared with alerting, rollups and the worklist.
    expect(isIncidentClosed("open")).toBe(false);
    expect(isIncidentClosed("investigating")).toBe(false);
    expect(isIncidentClosed("mitigated")).toBe(false);
    expect(isIncidentClosed("resolved")).toBe(true);
    expect(isIncidentClosed("closed")).toBe(true);

    const mk = (id: number, status: string): SnapshotIncident => ({
      id,
      title: `INC ${status}`,
      kind: "exploited_vulnerability",
      severity: "high",
      status,
      detectedAt: "2026-06-01T00:00:00.000Z",
      clocks: [
        { label: "Early warning (24h)", dueAt: "2026-06-02T00:00:00.000Z", doneAt: "2026-06-01T12:00:00.000Z", overdue: false },
        { label: "Notification (72h)", dueAt: "2026-06-04T00:00:00.000Z", doneAt: null, overdue: false },
        { label: "Final report", dueAt: "2026-07-04T00:00:00.000Z", doneAt: null, overdue: false },
      ],
      memberStates: "",
      correctiveMeasures: "",
      userMitigations: "",
    });
    const mixed: AssessmentSnapshot = {
      ...snapshot,
      incidents: [mk(1, "open"), mk(2, "investigating"), mk(3, "mitigated"), mk(4, "resolved"), mk(5, "closed")],
    };
    const plan = planSections(mixed, "briefing", "board", OPTIONS, buildCitationRegistry(mixed, OPTIONS), "T");
    const kpi = plan.sections.find((s) => s.key === "kpi_band")?.html ?? "";
    // The KPI tile for open incidents must read 3 (open+investigating+mitigated).
    // Matched label-then-value: the renderer emits the label div before the
    // value div (the old assertion expected the reverse order and went stale
    // when the tile markup was reworked - the ENGINE was right all along).
    expect(kpi).toMatch(/Open Incidents[^]{0,80}?>3</);
  });

  it("aiSectionSpecs prompts differ by audience", () => {
    const board = aiSectionSpecs("assessment", "briefing", "board").map((s) => s.key);
    const regulator = aiSectionSpecs("assessment", "briefing", "regulator").map((s) => s.key);
    expect(board).toContain("decisions_requested");
    expect(regulator).toContain("compliance_position");
  });

  it("default title carries the product name", () => {
    expect(defaultReportTitle(snapshot, "briefing")).toContain(snapshot.product.name);
  });

  it("portfolio snapshot plans a coherent briefing too", async () => {
    const portfolio = await buildPortfolioSnapshot();
    expect(portfolio.scope).toBe("portfolio");
    const reg = buildCitationRegistry(portfolio, OPTIONS);
    const { sections, aiSpecs } = planSections(
      portfolio,
      "briefing",
      "board",
      OPTIONS,
      reg,
      defaultReportTitle(portfolio, "briefing"),
    );
    expect(sections.length).toBeGreaterThan(3);
    expect(sections.at(-1)!.key).toBe("references");
    const stubKeys = sections.filter((s) => s.kind === "ai").map((s) => s.key);
    expect(stubKeys.length).toBeGreaterThan(0);
    expect(aiSpecs.map((s) => s.key)).toEqual(stubKeys);
    for (const s of sections.filter((x) => x.kind === "deterministic")) {
      expect(s.html.length).toBeGreaterThan(0);
    }
  });
});
