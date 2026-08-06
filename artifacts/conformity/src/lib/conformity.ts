/**
 * Shared presentation helpers for the conformity execution ("working") layer:
 * status/risk/severity option lists and the colour + formatting helpers the
 * wizard, gap worklist, artifacts, readiness and incident panels all reuse.
 */

export const EVAL_STATUS_OPTIONS = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "partial", label: "Partial" },
  { value: "met", label: "Met" },
  { value: "not_met", label: "Not met (blocker)" },
  { value: "not_applicable", label: "Not applicable" },
] as const;

export const RISK_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

export const SEVERITY_OPTIONS = RISK_OPTIONS;

// CRA Art 14 reporting tracks — each anchors its final report differently.
export const INCIDENT_KIND_OPTIONS = [
  { value: "exploited_vulnerability", label: "Actively exploited vulnerability" },
  { value: "severe_incident", label: "Severe incident" },
] as const;

export const INCIDENT_STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "mitigated", label: "Mitigated" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
] as const;

// Semantic evidence classification. "sbom" and "test_report" are matched by the
// artifact engine (buildTechnicalDoc / buildSbomReference) to complete the SBOM
// and test-report sections; "document" and "link" are generic attachments.
export const EVIDENCE_TYPE_OPTIONS = [
  { value: "document", label: "Supporting document" },
  { value: "sbom", label: "SBOM (software bill of materials)" },
  { value: "test_report", label: "Test / assessment report" },
  { value: "link", label: "Reference link" },
] as const;

export function evidenceTypeClass(type: string): string {
  switch (type) {
    case "sbom":
      return "bg-reg-cra/10 text-reg-cra border-reg-cra/30";
    case "test_report":
      return "bg-reg-iec/10 text-reg-iec border-reg-iec/30";
    case "link":
      return "bg-secondary/10 text-secondary border-secondary/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function labelFor(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export function evalStatusClass(status: string): string {
  switch (status) {
    case "met":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "partial":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "in_progress":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "not_met":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "not_applicable":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

export function riskClass(risk: string | null | undefined): string {
  switch (risk) {
    case "critical":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "high":
      return "bg-orange-500/10 text-orange-600 border-orange-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "low":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function gradeClass(letter: string): string {
  switch (letter) {
    case "A":
      return "text-green-600 border-green-500/40 bg-green-500/5";
    case "B":
      return "text-lime-600 border-lime-500/40 bg-lime-500/5";
    case "C":
      return "text-amber-600 border-amber-500/40 bg-amber-500/5";
    case "D":
      return "text-orange-600 border-orange-500/40 bg-orange-500/5";
    default:
      return "text-red-600 border-red-500/40 bg-red-500/5";
  }
}

export function stageLabel(stage: string): string {
  switch (stage) {
    case "scoping":
      return "Scoping";
    case "classification":
      return "Classification";
    case "route":
      return "Route";
    case "gap_assessment":
      return "Gap assessment";
    case "artifacts":
      return "Artifacts";
    case "complete":
      return "Complete";
    default:
      return stage;
  }
}

export function formatDateTime(s: string | null | undefined): string {
  if (!s) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(s));
}

/** Convert an ISO string to the value a <input type="datetime-local"> expects. */
export function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
