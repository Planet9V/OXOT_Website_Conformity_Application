/**
 * Parser for EUR-Lex CONSOLIDATED text HTML (task 15.3/15.4).
 *
 * Consolidated pages are a DIFFERENT dialect from the OJ pages the
 * eu_oj_parser handles: `title-division-1/2` chapters, `eli-subdivision`
 * article containers with `title-article-norm` numbers (letter suffixes for
 * inserted articles — 4a, 25a…), `span.no-parag` paragraph markers,
 * `grid-container grid-list` point rows instead of two-column tables,
 * `title-annex-1` annex headings, and `p.modref` consolidation apparatus
 * (the ▼M/▼B markers linking each passage to its amending act) which is NOT
 * part of the legal text and is excluded everywhere, including from the D2
 * parity flatten.
 *
 * Consolidated texts carry NO preamble: recitals must come from the
 * committed ORIGINAL OJ source (the hybrid-corpus rule, findings.md
 * 2026-08-16). And a consolidated text has no legal effect of its own —
 * every corpus built from one is a DISCLOSED DEPARTURE whose metadata must
 * carry the amendment trail (BSIG precedent).
 */

import { decode, romanToInt } from "./eu_oj_parser.mjs";

/** Visible text of a fragment, consolidation apparatus removed. */
export function consTextOf(html) {
  return decode(
    html
      .replace(/<p[^>]*class="modref"[^>]*>[\s\S]*?<\/p>/g, "")
      .replace(/<span[^>]*class="superscript"[^>]*>[\s\S]*?<\/span>/g, "")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/ /g, " ")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** End index (exclusive) of the balanced <div> starting at `start`. */
export function balancedDivEnd(html, start) {
  let depth = 0;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = start;
  let m;
  while ((m = re.exec(html)) !== null) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) return re.lastIndex;
  }
  return html.length;
}

/**
 * Top-level child segments of a region: <p…>…</p>, <div…>…</div> (balanced)
 * and <table…>…</table> (balanced) in document order — PLUS the bare text
 * between and after them (`gap` segments). An amendment list writes the ";"
 * after a quoted block as a naked text node between two elements; dropping
 * inter-element text lost exactly that character until D2 caught it.
 */
function topLevelSegments(region) {
  const out = [];
  let i = 0;
  const open = /<(p|div|table)\b[^>]*>/g;
  const pushGap = (from, to) => {
    const raw = region.slice(from, to);
    if (/[^\s]/.test(raw.replace(/<[^>]+>/g, ""))) out.push({ tag: "gap", html: raw, attrs: "" });
  };
  while (i < region.length) {
    open.lastIndex = i;
    const m = open.exec(region);
    if (!m) {
      pushGap(i, region.length);
      break;
    }
    pushGap(i, m.index);
    const tag = m[1];
    let end;
    if (tag === "p") {
      end = region.indexOf("</p>", m.index);
      end = end === -1 ? region.length : end + 4;
    } else if (tag === "div") {
      end = balancedDivEnd(region, m.index);
    } else {
      let depth = 0;
      const re = /<table\b|<\/table>/g;
      re.lastIndex = m.index;
      let t;
      end = region.length;
      while ((t = re.exec(region)) !== null) {
        depth += t[0] === "</table>" ? -1 : 1;
        if (depth === 0) { end = re.lastIndex; break; }
      }
    }
    out.push({ tag, html: region.slice(m.index, end), attrs: m[0] });
    i = end;
  }
  return out;
}

const classOf = (attrs) => (attrs.match(/class="([^"]*)"/) || [, ""])[1];

/** Lines (in document order) of a content region — the block flattener. */
export function consLines(region, out = []) {
  for (const seg of topLevelSegments(region)) {
    const cls = classOf(seg.attrs);
    if (cls.includes("modref") || cls.includes("separator-annex")) continue;
    // Consolidated footnote DEFINITIONS ("( *1 ) Regulation (EU) …", anchored
    // back to their in-text marker via href="#src.E…") are apparatus, not the
    // law — excluded exactly as oj-note paragraphs are in the OJ dialect.
    // Scoped to p segments: containers holding one elsewhere still recurse.
    if (seg.tag === "p" && seg.html.includes('href="#src.E')) continue;
    if (seg.tag === "gap") {
      // Bare text between elements (the ";" after a quoted block) belongs to
      // the line it follows.
      const t = consTextOf(seg.html);
      if (!t) continue;
      if (out.length) out[out.length - 1] = `${out[out.length - 1]}${/^[;,.]/.test(t) ? "" : " "}${t}`;
      else out.push(t);
      continue;
    }
    if (seg.tag === "p") {
      const t = consTextOf(seg.html);
      if (t) out.push(t);
      continue;
    }
    if (seg.tag === "table") {
      for (const row of seg.html.match(/<tr[\s\S]*?<\/tr>/g) || []) {
        const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => consTextOf(c[1]));
        const line = cells.join(" ").replace(/\s+/g, " ").trim();
        if (line) out.push(line);
      }
      continue;
    }
    // div
    if (cls.includes("grid-container")) {
      const inner = seg.html.replace(/^<div[^>]*>/, "").replace(/<\/div>\s*$/, "");
      const kids = topLevelSegments(inner);
      const label = kids.length ? consTextOf(kids[0].html) : "";
      const bodySeg = kids[1];
      if (!bodySeg) {
        if (label) out.push(label);
        continue;
      }
      const bodyInner = bodySeg.html.replace(/^<div[^>]*>/, "").replace(/<\/div>\s*$/, "");
      // The body cell may itself hold paragraphs and nested grids: the FIRST
      // text line joins the label; everything after stands alone.
      const bodyLines = consLines(bodyInner, []);
      if (bodyLines.length) {
        out.push(`${label} ${bodyLines[0]}`.trim());
        out.push(...bodyLines.slice(1));
      } else if (label) {
        out.push(label);
      }
      continue;
    }
    // Plain div containers (norm, inline-element, eli-subdivision…): recurse —
    // gap segments carry any bare text, including the leading "1.  " no-parag
    // marker, which must START a line (never join a previous one), so a
    // container boundary resets the join target.
    const inner = seg.html.replace(/^<div[^>]*>/, "").replace(/<\/div>\s*$/, "");
    if (/<(p|div|table)\b/.test(inner)) {
      const childLines = consLines(inner, []);
      out.push(...childLines);
    } else {
      const t = consTextOf(inner);
      if (t) out.push(t);
    }
  }
  return out;
}

/** Articles, in document order, letter suffixes preserved. */
export function parseConsolidatedArticles(html, tagsFor, maxArticleForRefs) {
  const heads = [...html.matchAll(/<div class="eli-subdivision" id="(art_[0-9]+[a-z]*)">/g)].map(
    (m) => ({ id: m[1], index: m.index }),
  );
  // Chapters by position.
  const chapters = [...html.matchAll(/<p class="title-division-1"[^>]*>([\s\S]*?)<\/p>\s*<p class="title-division-2"[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => ({ label: consTextOf(m[1]), title: consTextOf(m[2]), index: m.index }))
    .filter((c) => /^CHAPTER/i.test(c.label));

  const articles = [];
  for (const h of heads) {
    const end = balancedDivEnd(html, h.index);
    const region = html.slice(h.index, end);
    const numberLabel = consTextOf((region.match(/<p class="title-article-norm"[^>]*>([\s\S]*?)<\/p>/) || [, ""])[1]);
    const articleNumber = numberLabel.replace(/^Article\s*/i, "");
    if (!articleNumber) throw new Error(`${h.id}: no article number label`);
    const titleM = region.match(/<div class="eli-title"[^>]*>([\s\S]*?)<\/div>/);
    const title = titleM ? consTextOf(titleM[1]) : "";

    // Content = the region minus the number/title headers.
    let content = region
      .replace(/^<div[^>]*>/, "")
      .replace(/<\/div>\s*$/, "")
      .replace(/<p class="title-article-norm"[^>]*>[\s\S]*?<\/p>/, "")
      .replace(/<div class="eli-title"[^>]*>[\s\S]*?<\/div>/, "");

    const lines = consLines(content, []);
    const paragraphs = [];
    let cur = null;
    for (const line of lines) {
      const numbered = /^(\d{1,2})\.\s+(.*)$/s.exec(line);
      if (numbered) {
        cur = { paragraphNumber: Number(numbered[1]), text: numbered[2].trim() };
        paragraphs.push(cur);
      } else if (/^\d{1,2}\.$/.test(line.trim())) {
        // The no-parag marker emitted alone (its body followed as a child div).
        cur = { paragraphNumber: Number(line.trim().replace(".", "")), text: "" };
        paragraphs.push(cur);
      } else if (cur) {
        cur.text = cur.text ? `${cur.text}\n${line}` : line;
      } else {
        cur = { paragraphNumber: 0, text: line };
        paragraphs.push(cur);
      }
    }
    if (!paragraphs.length) throw new Error(`Article ${articleNumber} parsed with no paragraphs`);

    let chapter = chapters[0] ?? { label: "", title: "" };
    for (const c of chapters) if (c.index < h.index) chapter = c;
    const roman = (chapter.label.match(/CHAPTER\s+([IVXLC]+)([a-z]*)/i) || []);
    const chapterLabel = roman[1] ? `${roman[1]}${roman[2] ?? ""}` : "";

    const full = paragraphs.map((p) => p.text).join("\n");
    articles.push({
      articleNumber,
      title,
      chapterNumber: roman[1] ? romanToInt(roman[1]) : 1,
      chapterLabel,
      chapterTitle: chapter.title,
      paragraphs,
      tags: tagsFor(full),
      referencedArticles: [...full.matchAll(/Article\s+(\d{1,3})\b/g)]
        .map((m) => Number(m[1]))
        .filter((n, i, a) => n >= 1 && n <= maxArticleForRefs && a.indexOf(n) === i)
        .sort((a, b) => a - b),
    });
  }
  return articles;
}

/** Annexes by their title-annex-1 headings; grseq headings kept as lines. */
export function parseConsolidatedAnnexes(html, tagsFor, maxArticleForRefs) {
  const heads = [...html.matchAll(/<p class="title-annex-1"[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => ({ label: consTextOf(m[1]), index: m.index }))
    .filter((h) => /^ANNEX\b/i.test(h.label));
  const annexes = [];
  for (let i = 0; i < heads.length; i++) {
    const start = heads[i].index;
    const end = i + 1 < heads.length ? heads[i + 1].index : html.length;
    let region = html.slice(start, end)
      .replace(/<p class="title-annex-1"[^>]*>[\s\S]*?<\/p>/, "");
    // The annex TITLE is the title-annex-2 element; where an annex has none,
    // no title is invented (grseq headings are CONTENT — the Part/Class/
    // Section structure L53 taught us never to drop).
    const titleM = region.match(/<p class="title-annex-2"[^>]*>([\s\S]*?)<\/p>/);
    const title = titleM ? consTextOf(titleM[1]) : "";
    if (titleM) region = region.replace(titleM[0], "");
    // Page-tail apparatus after the last annex.
    region = region.replace(/<script[\s\S]*?<\/script>/gi, "");
    const body = consLines(region, []).filter(
      (l) => !/^(ELI:\s*http|ISSN\s+\d{4}-\d{4}|Top\b)/.test(l),
    );
    if (!body.length) throw new Error(`${heads[i].label} parsed empty`);
    const annexNumber = heads[i].label.replace(/^ANNEX\s*/i, "") || "—";
    annexes.push({
      annexNumber,
      title,
      blocks: body,
      tags: tagsFor(body.join("\n")),
      referencedArticles: [...body.join("\n").matchAll(/Article\s+(\d{1,3})\b/g)]
        .map((m) => Number(m[1]))
        .filter((n, i2, a) => n >= 1 && n <= maxArticleForRefs && a.indexOf(n) === i2)
        .sort((a, b) => a - b),
    });
  }
  return annexes;
}
