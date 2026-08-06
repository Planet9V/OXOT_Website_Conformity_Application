/**
 * Pure prioritisation logic for the assessment "next actions" queue.
 *
 * Extracted from the NextActions panel so the same ordered worklist can drive
 * both the full panel and the single "next best action" nudge in the assessment
 * header — one source of truth for what the assessor should do next.
 *
 * Ordering is deliberate and must not change casually: not-met blockers and
 * statutory incident deadlines always outrank cosmetic gaps.
 */
import type {
  ConformityEvaluation,
  ConformityIncident,
  ConformityArtifact,
} from "@workspace/api-client-react";

export type ActionTab = "wizard" | "gaps" | "artifacts" | "readiness" | "incidents";

export interface ActionItem {
  id: string;
  title: string;
  detail?: string;
  tab: ActionTab;
  /** Assigned member username ("mine" filtering). Unset when unassigned. */
  owner?: string;
  /** True for a BLOCKER with no owner — nobody is on the hook for it. */
  unassignedBlocker?: boolean;
}

export type ActionGroupKey =
  | "blockers"
  | "overdue"
  | "route"
  | "risk"
  | "duesoon"
  | "openincidents"
  | "progress"
  | "docs";

export interface ActionGroup {
  key: ActionGroupKey;
  label: string;
  hint: string;
  tab: ActionTab;
  items: ActionItem[];
}

const DAY = 24 * 60 * 60 * 1000;

// Statuses that need no further action — everything else is actionable.
const TERMINAL_STATUSES = ["met", "not_applicable"];
const HIGH_RISK = ["critical", "high"];

function plural(n: number): string {
  return n === 1 ? "" : "s";
}

// Risk labels kept local so this pure module has no UI dependency.
function riskLabel(risk: string | null | undefined): string {
  switch (risk) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return risk ?? "";
  }
}

/**
 * Build the ordered, non-empty action groups for an assessment. `now` is passed
 * in (not read from the clock) so the result is deterministic and testable.
 */
export function buildActionGroups(
  evaluations: ConformityEvaluation[],
  incidents: ConformityIncident[],
  artifacts: ConformityArtifact[],
  now: number,
  /** Server-computed Art 32(2) route-validity advisory (assessment detail). */
  standardsAdvisory: string | null = null,
): ActionGroup[] {
  const isTerminal = (status: string) => TERMINAL_STATUSES.includes(status);
  const isHighRisk = (risk: string | null | undefined) => !!risk && HIGH_RISK.includes(risk);

  // Blockers: explicitly marked not met — these cap the readiness grade.
  const blockers: ActionItem[] = evaluations
    .filter((e) => e.status === "not_met")
    .map((e) => ({
      id: `blk-${e.id}`,
      title: `${e.requirementRefCode} — ${e.title}`,
      detail:
        [e.themeName, e.owner ? `Owner: ${e.owner}` : null].filter(Boolean).join(" · ") ||
        undefined,
      tab: "gaps" as ActionTab,
      owner: e.owner || undefined,
      unassignedBlocker: !e.owner,
    }));

  // High-risk gaps: high/critical risk, still open (not terminal, not a blocker).
  const highRisk: ActionItem[] = evaluations
    .filter((e) => isHighRisk(e.riskRating) && !isTerminal(e.status) && e.status !== "not_met")
    .map((e) => ({
      id: `risk-${e.id}`,
      title: `${e.requirementRefCode} — ${e.title}`,
      detail: [`${riskLabel(e.riskRating)} risk`, e.themeName].filter(Boolean).join(" · "),
      tab: "gaps" as ActionTab,
      owner: e.owner || undefined,
    }));

  // Everything else still open: in progress, partial, or not started (lower risk).
  const inProgress: ActionItem[] = evaluations
    .filter((e) => !isTerminal(e.status) && e.status !== "not_met" && !isHighRisk(e.riskRating))
    .map((e) => ({
      id: `prog-${e.id}`,
      title: `${e.requirementRefCode} — ${e.title}`,
      detail:
        [e.themeName, e.dueDate ? `Due ${e.dueDate}` : null].filter(Boolean).join(" · ") ||
        undefined,
      tab: "gaps" as ActionTab,
      owner: e.owner || undefined,
    }));

  // Incident work. Every incident still open (not resolved/closed) yields
  // exactly ONE action item, bucketed by its most urgent facet: overdue
  // deadline → due-soon deadline → otherwise a generic "still open" row (a
  // far-off next deadline, or every deadline met but not yet closed). This
  // guarantees an open incident is ALWAYS actionable, so the journey's
  // "not ready" state can never contradict a panel that would otherwise read
  // "all caught up". Classify on the raw timestamp (not rounded days) so
  // near-threshold deadlines are never misfiled; sort by urgency.
  const overdueRaw: { item: ActionItem; dueTime: number }[] = [];
  const dueSoonRaw: { item: ActionItem; dueTime: number }[] = [];
  const openIncidentItems: ActionItem[] = [];
  for (const i of incidents) {
    if (i.status === "resolved" || i.status === "closed") continue;
    const stages = [
      { label: "Early-warning notification", dueAt: i.earlyWarningDueAt, doneAt: i.earlyWarningDoneAt },
      { label: "Incident notification", dueAt: i.notificationDueAt, doneAt: i.notificationDoneAt },
      { label: "Final report", dueAt: i.finalReportDueAt, doneAt: i.finalReportDoneAt },
    ];
    const next = stages
      .filter((s) => s.dueAt && !s.doneAt)
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];
    if (next) {
      const dueTime = new Date(next.dueAt).getTime();
      const ms = dueTime - now;
      const owner = i.owner || undefined;
      if (ms < 0) {
        const days = Math.max(1, Math.ceil(-ms / DAY));
        overdueRaw.push({
          item: { id: `inc-${i.id}`, title: `${next.label} — ${i.title}`, detail: `Overdue by ${days} day${plural(days)}`, tab: "incidents", owner },
          dueTime,
        });
        continue;
      }
      if (ms <= 14 * DAY) {
        const days = Math.max(1, Math.round(ms / DAY));
        dueSoonRaw.push({
          item: { id: `inc-${i.id}`, title: `${next.label} — ${i.title}`, detail: `Due in ${days} day${plural(days)}`, tab: "incidents", owner },
          dueTime,
        });
        continue;
      }
      // Open, but the next statutory deadline is still comfortably ahead.
      const days = Math.max(1, Math.round(ms / DAY));
      openIncidentItems.push({
        id: `inc-${i.id}`,
        title: i.title,
        detail: `${next.label} due in ${days} day${plural(days)}`,
        tab: "incidents",
        owner,
      });
      continue;
    }
    // Still open, but every statutory deadline task is done — needs closing out.
    openIncidentItems.push({
      id: `inc-${i.id}`,
      title: i.title,
      detail: "All statutory deadlines met — record the outcome and close",
      tab: "incidents",
      owner: i.owner || undefined,
    });
  }
  overdueRaw.sort((a, b) => a.dueTime - b.dueTime); // most overdue first
  dueSoonRaw.sort((a, b) => a.dueTime - b.dueTime); // soonest first
  const overdue = overdueRaw.map((x) => x.item);
  const dueSoon = dueSoonRaw.map((x) => x.item);

  const docs: ActionItem[] = artifacts
    .map((a): ActionItem | null => {
      const incomplete = a.sections.filter((s) => !s.complete);
      if (incomplete.length === 0) return null;
      return {
        id: `doc-${a.id}`,
        title: `${a.label}: ${incomplete.length} section${plural(incomplete.length)} to complete`,
        detail:
          incomplete.slice(0, 3).map((s) => s.label).join(", ") +
          (incomplete.length > 3 ? "…" : ""),
        tab: "artifacts" as ActionTab,
      };
    })
    .filter((x): x is ActionItem => x !== null);

  // Art 32(2) route-validity advisory (server-computed, passed through so the
  // wizard alert and this worklist can never disagree). One item: back the
  // route with a fully-applied standard or change route — every document the
  // assessment produces rests on that choice being legally available.
  const routeItems: ActionItem[] = standardsAdvisory
    ? [
        {
          id: "route-standards",
          title: "Back the Module A route with a fully-applied standard",
          detail: standardsAdvisory,
          tab: "wizard" as ActionTab,
        },
      ]
    : [];

  const all: ActionGroup[] = [
    {
      key: "blockers",
      label: "Blockers",
      hint: "Requirements marked not met — these cap the readiness grade at D.",
      tab: "gaps",
      items: blockers,
    },
    {
      key: "overdue",
      label: "Overdue deadlines",
      hint: "Regulatory incident notifications past their due date.",
      tab: "incidents",
      items: overdue,
    },
    {
      key: "route",
      label: "Route validity",
      hint: "The selected conformity route needs standards coverage that isn't on record yet.",
      tab: "wizard",
      items: routeItems,
    },
    {
      key: "risk",
      label: "High-risk gaps",
      hint: "Critical or high-risk requirements not yet met.",
      tab: "gaps",
      items: highRisk,
    },
    {
      key: "duesoon",
      label: "Deadlines due soon",
      hint: "Incident notifications due within two weeks.",
      tab: "incidents",
      items: dueSoon,
    },
    {
      key: "openincidents",
      label: "Open incidents",
      hint: "Incidents still open — record the outcome and close them out.",
      tab: "incidents",
      items: openIncidentItems,
    },
    {
      key: "progress",
      label: "Open requirements",
      hint: "In progress, partial, or not yet started — still need an assessment decision.",
      tab: "gaps",
      items: inProgress,
    },
    {
      key: "docs",
      label: "Documentation to finish",
      hint: "Generated document sections flagged incomplete.",
      tab: "artifacts",
      items: docs,
    },
  ];
  return all.filter((g) => g.items.length > 0);
}

/**
 * A compact, journey-oriented view of the same worklist. Derived from the built
 * groups (plus the raw incident/artifact lists) so the compliance journey and
 * the Next Actions panel share ONE definition of "open work" — they can never
 * drift apart on what counts as a blocker, an open requirement, or finished
 * documentation. Terminal requirement statuses (met / not_applicable) are
 * already excluded by buildActionGroups, and resolved/closed incidents are
 * excluded here the same way the deadline buckets exclude them.
 */
export interface WorkSummary {
  /** not_met + high-risk-open + in-progress requirements (nothing terminal). */
  openRequirements: number;
  /** Requirements explicitly marked not met. */
  blockers: number;
  /** Incident statutory deadlines already past due. */
  overdueDeadlines: number;
  /** Incidents still open (not resolved or closed). */
  openIncidents: number;
  /** At least one generated document exists. */
  hasArtifacts: boolean;
  /** Document sections still flagged incomplete. */
  openDocSections: number;
}

export function summarizeWork(
  groups: ActionGroup[],
  incidents: ConformityIncident[],
  artifacts: ConformityArtifact[],
): WorkSummary {
  const count = (k: ActionGroupKey) => groups.find((g) => g.key === k)?.items.length ?? 0;
  return {
    blockers: count("blockers"),
    overdueDeadlines: count("overdue"),
    openRequirements: count("blockers") + count("risk") + count("progress"),
    openIncidents: incidents.filter((i) => i.status !== "resolved" && i.status !== "closed").length,
    hasArtifacts: artifacts.length > 0,
    openDocSections: count("docs"),
  };
}
