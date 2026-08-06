/**
 * Shared visual language for the portfolio command centre. Kept in one place so
 * the posture band, deadline horizon, coverage panel and triage board stay
 * consistent — and so the credibility rules (blockers dominate, ready recedes,
 * journey ≠ grade) are encoded once.
 */
export const DAY_MS = 24 * 60 * 60 * 1000;

export const READINESS = {
  blocked: { label: "Blocked", bar: "bg-red-500", dot: "bg-red-500", text: "text-red-500" },
  in_progress: { label: "In progress", bar: "bg-primary", dot: "bg-primary", text: "text-primary" },
  not_started: { label: "Not started", bar: "bg-muted-foreground/40", dot: "bg-muted-foreground/50", text: "text-muted-foreground" },
  ready: { label: "Ready", bar: "bg-green-500", dot: "bg-green-500", text: "text-green-600" },
} as const;

export type ReadinessKey = keyof typeof READINESS;

// Visual order reads fires → done: blocked leftmost, ready trailing.
export const READINESS_ORDER: ReadinessKey[] = ["blocked", "in_progress", "not_started", "ready"];

export function readinessMeta(key: string) {
  return READINESS[key as ReadinessKey] ?? READINESS.not_started;
}

/** Grade letter → colour set (mirrors ReadinessRing / gradeClass palette). */
export function gradeColor(letter: string | null | undefined) {
  switch (letter) {
    case "A":
      return { text: "text-green-600", chip: "bg-green-500/10 text-green-600 border-green-500/25" };
    case "B":
      return { text: "text-lime-600", chip: "bg-lime-500/10 text-lime-600 border-lime-500/25" };
    case "C":
      return { text: "text-amber-600", chip: "bg-amber-500/10 text-amber-600 border-amber-500/25" };
    case "D":
      return { text: "text-orange-600", chip: "bg-orange-500/10 text-orange-600 border-orange-500/25" };
    case "F":
      return { text: "text-red-600", chip: "bg-red-500/10 text-red-600 border-red-500/25" };
    default:
      return { text: "text-muted-foreground", chip: "bg-muted text-muted-foreground border-border" };
  }
}

const REG_LABEL: Record<string, string> = {
  cra: "CRA",
  ai_act: "AI Act",
  machinery: "Machinery",
  iec_62443: "IEC 62443",
  nis2: "NIS2",
};
export function regLabel(key: string): string {
  return REG_LABEL[key] ?? key.replace(/_/g, " ").toUpperCase();
}

const KIND_LABEL: Record<string, string> = {
  early_warning: "Early warning",
  notification: "Notification",
  final_report: "Final report",
};
export function deadlineKindLabel(kind: string): string {
  return KIND_LABEL[kind] ?? kind;
}

/** CRA Art 14 reporting track label for an incident. */
const TRACK_LABEL: Record<string, string> = {
  exploited_vulnerability: "Actively exploited vulnerability",
  severe_incident: "Severe incident",
};
export function trackLabel(kind: string | undefined): string {
  return (kind && TRACK_LABEL[kind]) || TRACK_LABEL.exploited_vulnerability!;
}

/** Coverage % → tone. Null (nothing to measure) is muted, never green/red. */
export function coverageTone(pct: number | null): string {
  if (pct == null) return "text-muted-foreground";
  if (pct >= 80) return "text-green-600";
  if (pct >= 50) return "text-amber-600";
  return "text-red-500";
}
export function coverageBar(pct: number | null): string {
  if (pct == null) return "bg-muted-foreground/30";
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
}

/** Compact relative label from an injected `now` (kept consistent per render). */
export function relLabel(iso: string, now: number): string {
  const ms = new Date(iso).getTime() - now;
  const days = Math.max(1, Math.round(Math.abs(ms) / DAY_MS));
  return ms < 0 ? `${days}d overdue` : `in ${days}d`;
}
