/**
 * Print-safe inline-SVG chart builders for the executive reporting suite.
 *
 * Pure functions: data in, SVG string out. No DOM, no dependencies, fully
 * deterministic — the same inputs always render byte-identical SVG, which
 * keeps report snapshots reproducible and the builders unit-testable.
 *
 * All charts inherit the report's serif/sans stack via `font-family` and use
 * an executive ink-on-paper palette that survives grayscale printing and high-res PDF rendering.
 */

export const CHART_INK = "#0f172a";
export const CHART_MUTED = "#64748b";
export const CHART_GRID = "#e2e8f0";
export const CHART_ACCENT = "#0284c7";
export const CHART_OK = "#16a34a";
export const CHART_WARN = "#d97706";
export const CHART_BAD = "#dc2626";

const FONT = 'font-family="system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif"';

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const fmt = (n: number): string => String(Math.round(n * 100) / 100);

export type DonutSegment = { label: string; value: number; color: string };

/** Executive readiness/status donut with clean SVG arcs and centred headline figure. */
export function donutChart(opts: {
  segments: DonutSegment[];
  centerLabel: string;
  centerSub: string;
  size?: number;
}): string {
  const size = opts.size ?? 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const stroke = size * 0.12;
  const total = opts.segments.reduce((s, seg) => s + Math.max(0, seg.value), 0);
  const circumference = 2 * Math.PI * r;
  let offset = -circumference / 4; // start at 12 o'clock
  const arcs: string[] = [];

  if (total <= 0) {
    arcs.push(
      `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r)}" fill="none" stroke="${CHART_GRID}" stroke-width="${fmt(stroke)}"/>`,
    );
  } else {
    for (const seg of opts.segments) {
      const share = Math.max(0, seg.value) / total;
      if (share <= 0) continue;
      const len = share * circumference;
      arcs.push(
        `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r)}" fill="none" stroke="${seg.color}" stroke-width="${fmt(stroke)}" stroke-dasharray="${fmt(len)} ${fmt(circumference - len)}" stroke-dashoffset="${fmt(-offset)}" stroke-linecap="round"/>`,
      );
      offset += len;
    }
  }

  const legendY = size + 16;
  const legend = opts.segments
    .map((seg, i) => {
      const y = legendY + i * 20;
      return (
        `<rect x="12" y="${y - 10}" width="12" height="12" rx="3" fill="${seg.color}"/>` +
        `<text x="32" y="${y}" ${FONT} font-size="12" font-weight="500" fill="${CHART_INK}">${escapeXml(seg.label)} — <tspan font-weight="700">${fmt(seg.value)}</tspan></text>`
      );
    })
    .join("");

  const height = legendY + opts.segments.length * 20 + 8;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${height}" width="${size}" height="${height}" role="img" aria-label="${escapeXml(opts.centerSub)}">` +
    `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r)}" fill="none" stroke="#f1f5f9" stroke-width="${fmt(stroke)}"/>` +
    arcs.join("") +
    `<text x="${fmt(cx)}" y="${fmt(cy - 2)}" ${FONT} font-size="${fmt(size * 0.18)}" font-weight="800" fill="${CHART_INK}" text-anchor="middle">${escapeXml(opts.centerLabel)}</text>` +
    `<text x="${fmt(cx)}" y="${fmt(cy + size * 0.1)}" ${FONT} font-size="11" font-weight="600" fill="${CHART_MUTED}" text-anchor="middle" letter-spacing="0.05em" text-transform="uppercase">${escapeXml(opts.centerSub)}</text>` +
    legend +
    `</svg>`
  );
}

export type Bar = { label: string; value: number; max: number; color?: string; detail?: string };

/** Horizontal bars (e.g. per-theme coverage). Values rendered with rounded tracks and inline percentages. */
export function barChart(opts: { bars: Bar[]; width?: number; valueSuffix?: string }): string {
  const width = opts.width ?? 580;
  const rowH = 34;
  const labelW = Math.round(width * 0.4);
  const trackW = width - labelW - 70;
  const height = opts.bars.length * rowH + 12;
  const rows = opts.bars
    .map((bar, i) => {
      const y = i * rowH + 10;
      const share = bar.max > 0 ? Math.min(1, Math.max(0, bar.value / bar.max)) : 0;
      const w = Math.max(share * trackW, bar.value > 0 ? 4 : 0);
      const color = bar.color ?? CHART_ACCENT;
      const valueText = `${fmt(bar.value)}${opts.valueSuffix ?? ""}`;
      return (
        `<text x="${labelW - 10}" y="${y + 15}" ${FONT} font-size="12" font-weight="600" fill="${CHART_INK}" text-anchor="end">${escapeXml(bar.label)}</text>` +
        `<rect x="${labelW}" y="${y}" width="${fmt(trackW)}" height="20" rx="6" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1"/>` +
        `<rect x="${labelW}" y="${y}" width="${fmt(w)}" height="20" rx="6" fill="${color}"/>` +
        `<text x="${labelW + trackW + 10}" y="${y + 15}" ${FONT} font-size="12" font-weight="700" fill="${color}">${escapeXml(valueText)}</text>`
      );
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Bar chart">${rows}</svg>`;
}

export function distributionChart(opts: {
  columns: { label: string; value: number; color?: string }[];
  width?: number;
}): string {
  const width = opts.width ?? 580;
  const height = 48;
  const total = opts.columns.reduce((sum, c) => sum + Math.max(0, c.value), 0);
  if (total <= 0) return "";

  let x = 0;
  const rects = opts.columns
    .map((c) => {
      const w = (Math.max(0, c.value) / total) * width;
      const rect = `<rect x="${fmt(x)}" y="0" width="${fmt(w)}" height="20" fill="${c.color ?? CHART_ACCENT}"/>`;
      x += w;
      return rect;
    })
    .join("");

  const legendStep = width / opts.columns.length;
  const legend = opts.columns
    .map(
      (c, i) =>
        `<circle cx="${fmt(i * legendStep + 5)}" cy="37" r="5" fill="${c.color ?? CHART_ACCENT}"/>` +
        `<text x="${fmt(i * legendStep + 14)}" y="41" ${FONT} font-size="11" font-weight="600" fill="${CHART_INK}">${escapeXml(c.label)} — ${fmt(c.value)}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Distribution bar">${rects}${legend}</svg>`;
}

/** Likelihood x impact heatmap of open risk counts. rows[0] = highest band. */
export function riskMatrix(opts: { rows: number[][]; rowLabels: string[]; colLabels: string[] }): string {
  const cell = 84;
  const labelW = 92;
  const labelH = 26;
  const cols = opts.colLabels.length;
  const rows = opts.rowLabels.length;
  const width = labelW + cols * cell;
  const height = labelH + rows * cell;

  const colHeaders = opts.colLabels
    .map(
      (lbl, c) =>
        `<text x="${labelW + c * cell + cell / 2}" y="18" ${FONT} font-size="11" font-weight="700" fill="${CHART_MUTED}" text-anchor="middle">${escapeXml(lbl)}</text>`,
    )
    .join("");

  const cells: string[] = [];
  for (let r = 0; r < rows; r += 1) {
    const y = labelH + r * cell;
    const rLbl = opts.rowLabels[r] ?? "";
    cells.push(
      `<text x="${labelW - 8}" y="${y + cell / 2 + 4}" ${FONT} font-size="11" font-weight="700" fill="${CHART_MUTED}" text-anchor="end">${escapeXml(rLbl)}</text>`,
    );
    for (let c = 0; c < cols; c += 1) {
      const x = labelW + c * cell;
      const count = opts.rows[r]?.[c] ?? 0;
      const severityIndex = (rows - 1 - r) + c;
      const bg = severityIndex >= 3 ? "#fef2f2" : severityIndex >= 2 ? "#fffbe6" : "#f0fdf4";
      const border = severityIndex >= 3 ? "#fca5a5" : severityIndex >= 2 ? "#fde047" : "#86efac";
      const textColor = severityIndex >= 3 ? CHART_BAD : severityIndex >= 2 ? CHART_WARN : CHART_OK;

      cells.push(
        `<rect x="${x + 2}" y="${y + 2}" width="${cell - 4}" height="${cell - 4}" rx="8" fill="${bg}" stroke="${border}" stroke-width="1.5"/>` +
        `<text x="${x + cell / 2}" y="${y + cell / 2 + 6}" ${FONT} font-size="18" font-weight="800" fill="${textColor}" text-anchor="middle">${count}</text>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Risk matrix">${colHeaders}${cells.join("")}</svg>`;
}

export type TimelineItem = { label: string; date: Date; kind: "done" | "due" | "overdue" };

export function timelineChart(opts: { items: TimelineItem[]; start: Date; end: Date; width?: number }): string {
  const width = opts.width ?? 580;
  const height = 84;
  if (opts.items.length === 0) return "";
  const t0 = opts.start.getTime();
  const span = Math.max(1, opts.end.getTime() - t0);

  const line = `<line x1="20" y1="30" x2="${width - 20}" y2="30" stroke="${CHART_GRID}" stroke-width="3"/>`;
  const nodes = opts.items
    .map((it, i) => {
      const ratio = Math.min(1, Math.max(0, (it.date.getTime() - t0) / span));
      const x = 20 + ratio * (width - 40);
      const color = it.kind === "done" ? CHART_OK : it.kind === "overdue" ? CHART_BAD : CHART_ACCENT;
      // Alternate label rows so date-clustered deadlines stay legible.
      const labelY = i % 2 === 0 ? 50 : 64;
      const dateY = labelY + 12;
      return (
        `<circle cx="${fmt(x)}" cy="30" r="7" fill="${color}"/>` +
        `<text x="${fmt(x)}" y="${labelY}" ${FONT} font-size="10" font-weight="600" fill="${CHART_INK}" text-anchor="middle">${escapeXml(it.label)}</text>` +
        `<text x="${fmt(x)}" y="${dateY}" ${FONT} font-size="9" fill="${CHART_MUTED}" text-anchor="middle">${escapeXml(it.date.toISOString().slice(0, 10))}</text>`
      );
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Timeline">${line}${nodes}</svg>`;
}
