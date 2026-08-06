import type { ConformityReportRow, ReportSection } from "@workspace/db";

/**
 * Print-document composition for the executive reporting suite.
 *
 * Produces a fully self-contained HTML document (typography, charts inline as
 * SVG, no scripts) that the client opens through the existing print pipeline
 * (window.open + document.write -> browser "Save as PDF").
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Minimal, deterministic markdown renderer for AI-drafted prose. Supports the
 * subset the narrative prompt allows: paragraphs, ##/### headings, bold,
 * italics, unordered/ordered lists, and [n] citation markers (rendered as
 * superscripts). Input is HTML-escaped before any markup is applied.
 */
export function renderMarkdown(md: string): string {
  const inline = (text: string): string =>
    escapeHtml(text)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/\[(\d{1,3})\](?!\()/g, '<sup class="cite">[$1]</sup>');

  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  let paragraph: string[] = [];

  const flushParagraph = (): void => {
    if (paragraph.length) {
      out.push(`<p>${paragraph.join(" ")}</p>`);
      paragraph = [];
    }
  };
  const closeList = (): void => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      closeList();
      const level = Math.min(4, Math.max(3, heading[1]!.length + 1)); // h3/h4 inside sections
      out.push(`<h${level}>${inline(heading[2]!)}</h${level}>`);
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      if (list !== "ul") {
        closeList();
        out.push("<ul>");
        list = "ul";
      }
      out.push(`<li>${inline(bullet[1]!)}</li>`);
      continue;
    }
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      flushParagraph();
      if (list !== "ol") {
        closeList();
        out.push("<ol>");
        list = "ol";
      }
      out.push(`<li>${inline(numbered[1]!)}</li>`);
      continue;
    }
    closeList();
    paragraph.push(inline(line));
  }
  flushParagraph();
  closeList();
  return out.join("\n");
}

/** Body HTML for one section (deterministic html verbatim; ai md rendered). */
export function sectionBodyHtml(section: ReportSection): string {
  if (section.kind === "deterministic") return section.html;
  if (section.status === "failed") {
    return '<p class="muted">This section could not be drafted automatically. Edit it manually or regenerate it.</p>';
  }
  if (section.status === "pending") {
    return '<p class="muted">Drafting in progress…</p>';
  }
  return renderMarkdown(section.contentMd);
}

const PRINT_CSS = `
@page { margin: 18mm 16mm; }
* { box-sizing: border-box; }
body {
  font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif;
  color: #0f172a; margin: 0; font-size: 11.5pt; line-height: 1.55;
}
h1, h2, h3, h4, .kpi, .doc-meta, table, .readout-headline {
  font-family: 'Source Sans 3', 'Segoe UI', Arial, sans-serif;
}
main { max-width: 720pt; margin: 0 auto; padding: 24px 28px 48px; }
h1 { font-size: 24pt; line-height: 1.2; margin: 0 0 6px; letter-spacing: -0.01em; }
h2 { font-size: 15pt; margin: 28px 0 10px; padding-top: 14px; border-top: 2px solid #0f172a; }
h2 .secno { color: #64748b; font-weight: 600; margin-right: 10px; }
h3 { font-size: 12.5pt; margin: 18px 0 6px; }
h4 { font-size: 11.5pt; margin: 14px 0 4px; }
p { margin: 0 0 10px; text-align: justify; hyphens: auto; }
ul, ol { margin: 0 0 12px; padding-left: 22px; }
li { margin-bottom: 4px; }
sup.cite { font-size: 8pt; color: #1d4ed8; font-family: 'Source Sans 3', Arial, sans-serif; }
table { border-collapse: collapse; width: 100%; margin: 10px 0 16px; font-size: 9.5pt; }
th { text-align: left; border-bottom: 1.5px solid #0f172a; padding: 6px 8px; font-weight: 600; }
td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; vertical-align: top; }
tr { page-break-inside: avoid; }
.muted { color: #64748b; }
.section { page-break-inside: auto; }
.section.break-before { page-break-before: always; }
figure { margin: 14px 0 18px; page-break-inside: avoid; }
figcaption { font-size: 9pt; color: #64748b; margin-top: 6px; font-family: 'Source Sans 3', Arial, sans-serif; }
.figure-row { display: flex; gap: 28px; align-items: flex-start; flex-wrap: wrap; }
.cover { min-height: 88vh; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
.cover .brand { font-family: 'Source Sans 3', Arial, sans-serif; font-weight: 700; letter-spacing: 0.18em; color: #1d4ed8; }
.cover .subtitle { font-size: 13pt; color: #334155; margin-top: 4px; }
.cover .coverline { border-top: 3px solid #0f172a; padding-top: 14px; }
.doc-meta { font-size: 9.5pt; color: #475569; }
.doc-meta strong { color: #0f172a; }
.kpi-grid { display: flex; gap: 12px; flex-wrap: wrap; margin: 12px 0 6px; }
.kpi { border: 1.5px solid #0f172a; border-radius: 8px; padding: 10px 14px; min-width: 108px; page-break-inside: avoid; }
.kpi .v { font-size: 20pt; font-weight: 700; line-height: 1.1; }
.kpi .l { font-size: 8.5pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
.callout { border-left: 4px solid #b45309; background: #fffbeb; padding: 10px 14px; margin: 12px 0; page-break-inside: avoid; }
.callout.info { border-left-color: #1d4ed8; background: #eff6ff; }
.badge { display: inline-block; border-radius: 999px; padding: 1px 9px; font-size: 8.5pt; font-family: 'Source Sans 3', Arial, sans-serif; font-weight: 600; }
.badge.ok { background: #dcfce7; color: #15803d; }
.badge.warn { background: #fef3c7; color: #b45309; }
.badge.bad { background: #fee2e2; color: #b91c1c; }
.badge.na { background: #e2e8f0; color: #475569; }
.references ol { padding-left: 26px; }
.references li { margin-bottom: 6px; font-size: 10pt; }
.readout-headline { font-size: 17pt; font-weight: 700; margin: 6px 0 12px; }
.readout-page { page-break-after: always; }
footer.page-note { margin-top: 36px; font-size: 8.5pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
`;

/** Composes the final, self-contained print document. */
export function composeReportHtml(report: ConformityReportRow): { title: string; html: string } {
  const audienceLabel = report.audience === "board" ? "Board edition" : "Regulatory edition";
  const title = `${report.title} — ${audienceLabel}`;
  let sectionNumber = 0;
  const body = report.sections
    .map((section) => {
      const numbered =
        report.reportType === "full" &&
        section.kind === "ai" ||
        (report.reportType === "full" && section.kind === "deterministic" && !section.key.startsWith("cover") && section.key !== "title_page");
      const isCoverLike = section.key === "cover" || section.key === "title_page";
      const heading = isCoverLike
        ? ""
        : `<h2>${numbered ? `<span class="secno">${++sectionNumber}.</span>` : ""}${escapeHtml(section.heading)}</h2>`;
      const breakBefore = report.reportType === "full" && !isCoverLike && sectionNumber > 1 ? "" : "";
      return `<section class="section${breakBefore}" data-key="${escapeHtml(section.key)}">${heading}${sectionBodyHtml(section)}</section>`;
    })
    .join("\n");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>${PRINT_CSS}</style>
</head>
<body>
<main>
${body}
<footer class="page-note">Generated by the OXOT Conformity Workbench · ${escapeHtml(new Date(report.createdAt).toISOString().slice(0, 10))} · Report #${report.id} · ${escapeHtml(audienceLabel)}</footer>
</main>
</body>
</html>`;
  return { title, html };
}
