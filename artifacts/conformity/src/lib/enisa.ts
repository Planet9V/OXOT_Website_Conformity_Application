import type { IncidentReportPackage } from "@workspace/api-client-react";

/**
 * Build the ENISA single-reporting-platform (Art 16 CRA) submission structure
 * from an Article 14 report package. One entry per stage, each carrying its
 * statutory basis, deadline state and the field content keyed by the platform
 * labels. Missing mandatory content is exported as `null` with `missing: true`
 * so nothing is invented — the file is ready to file once every `missing`
 * marker is resolved.
 */
export function buildEnisaSubmission(pkg: IncidentReportPackage) {
  return {
    platform: "ENISA single reporting platform",
    legalBasis: "Regulation (EU) 2024/2847 (CRA), Articles 14 and 16",
    reportTrack: pkg.kindLabel,
    incident: {
      workbenchIncidentId: pkg.incidentId,
      assessmentId: pkg.assessmentId,
      product: pkg.productName,
      title: pkg.title,
    },
    generatedAt: pkg.generatedAt,
    deadlineNote: pkg.deadlineNote,
    stages: pkg.sections.map((s) => ({
      stage: s.stage,
      label: s.label,
      articleRef: s.articleRef,
      dueAt: s.dueAt,
      submittedAt: s.doneAt,
      complete: s.fields.every((f) => !f.missing),
      fields: s.fields.map((f) => ({
        label: f.label,
        citation: f.citation,
        value: f.missing ? null : f.value,
        missing: f.missing,
      })),
    })),
  };
}

/** Trigger a browser download of the ENISA submission JSON. */
export function downloadEnisaSubmission(pkg: IncidentReportPackage): void {
  const body = JSON.stringify(buildEnisaSubmission(pkg), null, 2);
  const blob = new Blob([body], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `enisa-art14-incident-${pkg.incidentId}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
