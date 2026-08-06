import type { ConformityArtifact, IncidentReportPackage } from "@workspace/api-client-react";

type Section = ConformityArtifact["sections"][number];

export interface PrintMeta {
  productName: string;
  regulationLabel: string;
  className?: string | null;
  routeName?: string | null;
  stageLabel?: string;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sectionHtml(section: Section): string {
  const status = section.complete
    ? '<span class="chip chip-ok">Complete</span>'
    : '<span class="chip chip-gap">Incomplete</span>';
  return `
    <section class="doc-section">
      <h3>${esc(section.label)} ${status}</h3>
      <pre>${esc(section.body || "—")}</pre>
    </section>`;
}

function artifactHtml(artifact: ConformityArtifact): string {
  return `
    <article class="doc">
      <div class="doc-head">
        <h2>${esc(artifact.label)}</h2>
        <div class="doc-meta">
          <span>v${artifact.version}</span>
          <span>${artifact.completeness}% complete</span>
        </div>
      </div>
      ${artifact.sections.map(sectionHtml).join("")}
    </article>`;
}

function buildHtml(
  meta: PrintMeta,
  artifacts: ConformityArtifact[],
  heading: string,
  exportedOn: string,
): string {
  const metaLine = [meta.regulationLabel, meta.className, meta.routeName, meta.stageLabel]
    .filter(Boolean)
    .map((s) => esc(String(s)))
    .join("&nbsp;&middot;&nbsp;");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(meta.productName)} — ${esc(heading)}</title>
<style>
  @page { margin: 20mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; margin: 0; line-height: 1.5; }
  .cover { border-bottom: 3px solid #e8641e; padding-bottom: 16px; margin-bottom: 24px; }
  .brand { font-family: Arial, Helvetica, sans-serif; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #e8641e; font-weight: 700; }
  .cover h1 { font-size: 26px; margin: 6px 0 4px; }
  .cover .sub { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #555; }
  .cover .exported { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #888; margin-top: 8px; }
  .doc { margin-bottom: 28px; page-break-inside: avoid; }
  .doc-head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 10px; }
  .doc-head h2 { font-size: 18px; margin: 0; }
  .doc-meta { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #666; display: flex; gap: 12px; }
  .doc-section { margin: 12px 0; page-break-inside: avoid; }
  .doc-section h3 { font-size: 13px; font-family: Arial, Helvetica, sans-serif; margin: 0 0 4px; }
  pre { white-space: pre-wrap; font-family: Georgia, serif; font-size: 12px; color: #333; margin: 0; }
  .chip { font-family: Arial, Helvetica, sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; padding: 2px 6px; border-radius: 3px; }
  .chip-ok { background: #e6f4ea; color: #1e7e34; }
  .chip-gap { background: #fff4e5; color: #b8690f; }
</style>
</head>
<body>
  <div class="cover">
    <div class="brand">OXOT Conformity</div>
    <h1>${esc(meta.productName)}</h1>
    <div class="sub">${metaLine}</div>
    <div class="sub">${esc(heading)}</div>
    <div class="exported">Exported ${esc(exportedOn)}</div>
  </div>
  ${artifacts.map(artifactHtml).join("")}
</body>
</html>`;
}

/**
 * Renders the conformity document package into a branded, print-optimized window
 * and triggers the browser print dialog (Save as PDF). Zero-dependency: relies on
 * the browser's own print-to-PDF. Pass a single artifact + singleLabel to export
 * one document.
 */
export function printArtifacts(
  meta: PrintMeta,
  artifacts: ConformityArtifact[],
  opts?: { singleLabel?: string },
): boolean {
  if (!artifacts || artifacts.length === 0) return false;
  const heading = opts?.singleLabel ?? "Conformity document package";
  const exportedOn = new Date().toLocaleString();
  const html = buildHtml(meta, artifacts, heading, exportedOn);
  return openPrintWindow(html);
}

function reportFieldHtml(field: IncidentReportPackage["sections"][number]["fields"][number]): string {
  const cite = field.citation ? ` <span class="doc-meta">${esc(field.citation)}</span>` : "";
  if (field.missing) {
    return `
    <div class="doc-section">
      <h3>${esc(field.label)}${cite} <span class="chip chip-gap">To complete</span></h3>
      <pre>To complete: ${esc(field.label)}</pre>
    </div>`;
  }
  return `
    <div class="doc-section">
      <h3>${esc(field.label)}${cite}</h3>
      <pre>${esc(field.value || "—")}</pre>
    </div>`;
}

function reportSectionHtml(section: IncidentReportPackage["sections"][number]): string {
  const status = section.doneAt
    ? `<span class="chip chip-ok">Submitted</span>`
    : `<span class="chip chip-gap">Not submitted</span>`;
  const due = new Date(section.dueAt).toUTCString();
  return `
    <article class="doc">
      <div class="doc-head">
        <h2>${esc(section.label)} ${status}</h2>
        <div class="doc-meta">${section.articleRef ? `<span>${esc(section.articleRef)}</span> · ` : ""}<span>Due ${esc(due)}</span></div>
      </div>
      ${section.fields.map(reportFieldHtml).join("")}
    </article>`;
}

/**
 * Renders the Article 14 incident report package (early warning / notification
 * / final report) into a print-optimized window, ready to copy into the ENISA
 * Single Reporting Platform. Missing content renders explicit "To complete:"
 * markers — nothing is invented.
 */
export function printIncidentReport(meta: PrintMeta, pkg: IncidentReportPackage): boolean {
  const heading = `Article 14 report package — ${pkg.kindLabel}`;
  const exportedOn = new Date().toLocaleString();
  const intro = `
    <article class="doc">
      <div class="doc-head"><h2>${esc(pkg.title)}</h2>
        <div class="doc-meta"><span>${esc(pkg.kindLabel)}</span></div>
      </div>
      <div class="doc-section"><pre>${esc(pkg.deadlineNote)}</pre></div>
    </article>`;
  const html = buildHtml(meta, [], heading, exportedOn).replace(
    "</body>",
    `${intro}${pkg.sections.map(reportSectionHtml).join("")}</body>`,
  );
  return openPrintWindow(html);
}

/**
 * Prints a fully composed HTML document (executive reports: the API returns a
 * complete, self-contained print document — no client-side assembly).
 */
export function printHtmlDocument(html: string): boolean {
  return openPrintWindow(html);
}

function openPrintWindow(html: string): boolean {
  const win = window.open("", "_blank", "width=920,height=1040");
  if (!win) return false; // popup blocked
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  // Give the new document a tick to lay out before printing.
  setTimeout(() => {
    try {
      win.print();
    } catch {
      /* user can print manually */
    }
  }, 350);
  return true;
}
