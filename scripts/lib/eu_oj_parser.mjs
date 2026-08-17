/**
 * Shared parser for Official Journal HTML in the EUR-Lex ELI markup.
 *
 * The CRA and NIS2 pages use the same structure — `id="art_N"`, `id="rct_N"`,
 * `id="anx_X"`, `oj-ti-section-1/2` chapter headings, `oj-sti-art` article
 * titles, `oj-normal` paragraphs, and two-column tables for lettered points. So
 * the PARSING is generic; only the metadata, the expected counts, the annex
 * list and the tag vocabulary are per-act.
 *
 * Extracted from build_cra_corpus_from_eurlex.mjs when NIS2 became the second
 * act. Deliberately extracted rather than duplicated: 350 lines of parser copied
 * per act is 350 lines to fix twice when the OJ markup shifts.
 *
 * The CRA corpus reproducibility check in CI is the regression test for this
 * module — if the extraction changed behaviour, the CRA corpus stops rebuilding
 * byte-identically and the build fails.
 */

const ENTITIES = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  laquo: "«", raquo: "»", hellip: "…", ndash: "–", mdash: "—",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  deg: "°", euro: "€", sect: "§", middot: "·", times: "×",
};

export function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, d) => String.fromCodePoint(parseInt(d, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENTITIES ? ENTITIES[n.toLowerCase()] : m));
}

/** Strip markup and footnote reference markers, collapse whitespace. */

export function textOf(html) {
  return decode(
    html
      // Footnote PARAGRAPHS are excluded uniformly. Without this line they
      // were excluded only where blocks() never recognised them — but a note
      // sitting inside a table cell (the AI Act's Art 108 amendment quote)
      // was swept into the cell's text, the one place footnote text leaked
      // into a corpus (caught by D2).
      .replace(/<p[^>]*class="oj-note"[^>]*>[\s\S]*?<\/p>/g, "")
      // OJ footnote anchors, e.g. the superscript "(1)" linking to a note
      .replace(/<span[^>]*class="oj-super[^"]*"[^>]*>[\s\S]*?<\/span>/g, "")
      .replace(/<a[^>]*class="oj-note"[^>]*>[\s\S]*?<\/a>/g, "")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/ /g, " ")
    // Footnote anchors leave an empty "( )" behind once the marker span is removed.
    .replace(/\(\s*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Walks a fragment in document order and returns its visible blocks.
 * OJ uses two-column tables for lettered/numbered points: first cell is the
 * label "(a)", second is the text. We rejoin them onto one line.
 *
 * Two extraction gaps shipped for months before the D2 parity check (L51/L53)
 * exposed them, both fixed here:
 *
 * 1. `<table[\s\S]*?<\/table>` is non-greedy, so a NESTED table (NIS2's
 *    sector/subsector/entity annex tables) was truncated at the first inner
 *    `</table>` — the entire "Type of entity" column of NIS2 Annexes I/II was
 *    silently missing from the corpus. Tables are now matched BALANCED and
 *    walked recursively, cells in document order.
 * 2. `oj-ti-grseq-*` subdivision headings ("Part I", "Class I", "Section A",
 *    module titles) were not a recognised block, so every annex lost its
 *    internal structure — the CRA's Class I/Class II boundary and the
 *    Machinery Regulation's Part A/Part B boundary among them.
 *
 * For the simple two-column point tables this walk produces byte-identical
 * output to the old code — the article corpora prove that via the
 * reproducibility diff (articles contain no nested tables and no grseq).
 */

/** End index (exclusive) of the balanced <table> that starts at `start`. */
function balancedTableEnd(html, start) {
  let depth = 0;
  const re = /<table\b|<\/table>/g;
  re.lastIndex = start;
  let m;
  while ((m = re.exec(html)) !== null) {
    depth += m[0] === "</table>" ? -1 : 1;
    if (depth === 0) return re.lastIndex;
  }
  return html.length;
}

/** Direct <tr>…</tr> segments of a table, skipping rows of nested tables. */
function directRows(tableHtml) {
  const rows = [];
  let depth = 0;
  let rowStart = -1;
  const re = /<table\b|<\/table>|<tr\b|<\/tr>/g;
  let m;
  while ((m = re.exec(tableHtml)) !== null) {
    if (m[0] === "<table") depth++;
    else if (m[0] === "</table>") depth--;
    else if (m[0] === "<tr" && depth === 1 && rowStart === -1) rowStart = m.index;
    else if (m[0] === "</tr>" && depth === 1 && rowStart !== -1) {
      rows.push(tableHtml.slice(rowStart, re.lastIndex));
      rowStart = -1;
    }
  }
  return rows;
}

/** Direct <td> inner-HTML segments of a row, skipping cells of nested tables. */
function directCells(rowHtml) {
  const cells = [];
  let depth = 0;
  let cellStart = -1;
  const re = /<table\b|<\/table>|<td\b[^>]*>|<\/td>/g;
  let m;
  while ((m = re.exec(rowHtml)) !== null) {
    if (m[0] === "<table") depth++;
    else if (m[0] === "</table>") depth--;
    else if (m[0].startsWith("<td") && depth === 0 && cellStart === -1) cellStart = re.lastIndex;
    else if (m[0] === "</td>" && depth === 0 && cellStart !== -1) {
      cells.push(rowHtml.slice(cellStart, m.index));
      cellStart = -1;
    }
  }
  return cells;
}

function tableLines(tableHtml, out) {
  for (const row of directRows(tableHtml)) {
    const cells = directCells(row);
    if (cells.some((c) => /<table\b/.test(c))) {
      // A composite row (a cell holding text and/or nested tables — NIS2's
      // sector tables, the CRA's "(c) … including:" + (i)-(iii) lists). Walk
      // every cell's segments in DOCUMENT ORDER: plain text accumulates onto
      // one line (so a label still joins its leading text), each nested table
      // recurses as its own lines. Nothing is dropped.
      let pending = [];
      const flush = () => {
        const line = pending.join(" ").trim();
        if (line) out.push(line);
        pending = [];
      };
      for (const cell of cells) {
        let i = 0;
        while (i < cell.length) {
          const s = cell.indexOf("<table", i);
          if (s === -1) {
            const t = textOf(cell.slice(i));
            if (t) pending.push(t);
            break;
          }
          const t = textOf(cell.slice(i, s));
          if (t) pending.push(t);
          flush();
          const end = balancedTableEnd(cell, s);
          tableLines(cell.slice(s, end), out);
          i = end;
        }
      }
      flush();
    } else {
      const label = cells.length ? textOf(cells[0]) : "";
      const body = cells.slice(1).map((c) => textOf(c)).join(" ").trim();
      const line = `${label} ${body}`.trim();
      if (line) out.push(line);
    }
  }
}

export function blocks(frag) {
  const out = [];
  // Annexes III and IV use oj-enumeration-spacing divs rather than oj-normal
  // paragraphs, so both forms have to be recognised or those annexes come out empty.
  const re =
    /<div[^>]*class="oj-enumeration-spacing"[^>]*>[\s\S]*?<\/div>|<table\b|<p[^>]*class="oj-normal"[^>]*>[\s\S]*?<\/p>|<p[^>]*class="oj-ti-grseq-\d+"[^>]*>[\s\S]*?<\/p>/g;
  let m;
  while ((m = re.exec(frag)) !== null) {
    if (m[0] === "<table") {
      const end = balancedTableEnd(frag, m.index);
      tableLines(frag.slice(m.index, end), out);
      re.lastIndex = end;
    } else {
      const t = textOf(m[0]);
      if (t) out.push(t);
    }
  }
  return out;
}

export function sliceById(html, id, nextIds) {
  const start = html.indexOf(`id="${id}"`);
  if (start === -1) return null;
  let end = html.length;
  for (const n of nextIds) {
    const i = html.indexOf(`id="${n}"`, start + 1);
    if (i !== -1 && i < end) end = i;
  }
  return html.slice(start, end);
}

/** Real cross-references to articles, extracted from the text itself. */

export function referencedArticles(text, maxArticle) {
  const nums = new Set();
  for (const m of text.matchAll(/Article\s+(\d{1,2})\b/g)) {
    const n = Number(m[1]);
    if (n >= 1 && n <= maxArticle) nums.add(n);
  }
  return [...nums].sort((a, b) => a - b);
}

export function referencedAnnexes(text) {
  const set = new Set();
  for (const m of text.matchAll(/Annex\s+(VIII|VII|VI|IV|IX|V|III|II|I)\b/g)) set.add(m[1]);
  return [...set];
}

/** Keyword tags — asserted only where the term literally occurs in the text. */

/**
 * Counts are parameters, not defaults. The CRA's 71 articles and 130 recitals
 * were baked into this parser and silently broke NIS2 at Article 47 — a default
 * that is really one act's fact is how that happens.
 *
 * `tagsFor` is injected because the tag vocabulary is per-act: the CRA cares
 * about SBOM and support periods, NIS2 about incident reporting and management
 * bodies. Everything else about recital parsing is identical.
 */
export function parseRecitals(html, tagsFor, maxRecital, maxArticle) {
  const ids = Array.from({ length: 130 }, (_, i) => `rct_${i + 1}`);
  const recitals = [];
  for (let n = 1; n <= maxRecital; n++) {
    const frag = sliceById(html, `rct_${n}`, [`rct_${n + 1}`, "enc_1"]);
    if (!frag) throw new Error(`Recital ${n} not found in source`);
    // The first cell holds "(n)"; drop it and keep the body.
    const b = blocks(frag);
    const cleaned = b.map((line) => line.replace(new RegExp(`^\\(${n}\\)\\s*`), "").trim()).filter(Boolean);
    const text = cleaned.join("\n");
    if (!text) throw new Error(`Recital ${n} parsed empty`);
    recitals.push({
      number: n,
      // Real recitals carry no titles. We do not invent one.
      title: `Recital ${n}`,
      text,
      tags: tagsFor(text),
      relatedArticles: referencedArticles(text, maxArticle),
      relatedAnnexes: referencedAnnexes(text),
    });
  }
  void ids;
  return recitals;
}

export function parseChapters(html) {
  // CHAPTER heading pairs: oj-ti-section-1 = "CHAPTER N", oj-ti-section-2 = title.
  const heads = [...html.matchAll(/class="oj-ti-section-([12])"[^>]*>([\s\S]*?)<\/p>/g)].map((m) => ({
    level: Number(m[1]),
    text: textOf(m[2]),
    index: m.index,
  }));
  const chapters = [];
  for (let i = 0; i < heads.length; i++) {
    if (heads[i].level !== 1) continue;
    const title = heads[i + 1] && heads[i + 1].level === 2 ? heads[i + 1].text : "";
    chapters.push({ label: heads[i].text, title, index: heads[i].index });
  }
  return chapters;
}

// A real conversion, not a lookup: the original table stopped at VIII, which
// silently misassigned every article in a chapter IX+ to chapter 1 — the
// SHIPPED NIS2 corpus carried that for its final-provisions chapter until the
// 10.3 verifier caught it (chapters IX..XIII exist in the AI Act).
export function romanToInt(roman) {
  const VAL = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const v = VAL[roman[i]] ?? 0;
    const next = VAL[roman[i + 1]] ?? 0;
    total += v < next ? -v : v;
  }
  return total;
}
export const ROMAN = new Proxy({}, { get: (_t, p) => (typeof p === "string" ? romanToInt(p) || undefined : undefined) });

export function parseArticles(html, chapters, tagsFor, maxArticle, opts = {}) {
  // Short Commission acts (the RED's Delegated Regulation 2022/30 among
  // them) publish articles with NO titles; `titleOptional` admits that
  // without weakening the invariant for the acts that do carry titles.
  const { titleOptional = false } = opts;
  const articles = [];
  for (let n = 1; n <= maxArticle; n++) {
    const frag = sliceById(html, `art_${n}`, [`art_${n + 1}`, "fnp_1", "anx_I"]);
    if (!frag) throw new Error(`Article ${n} not found in source`);
    const titleM = frag.match(/class="oj-sti-art"[^>]*>([\s\S]*?)<\/p>/);
    const title = titleM ? textOf(titleM[1]) : "";
    if (!title && !titleOptional) throw new Error(`Article ${n} has no title in source`);

    const paragraphs = [];
    let cur = null;
    for (const line of blocks(frag)) {
      const numbered = /^(\d{1,2})\.\s+(.*)$/s.exec(line);
      if (numbered) {
        cur = { paragraphNumber: Number(numbered[1]), text: numbered[2].trim() };
        paragraphs.push(cur);
      } else if (cur) {
        cur.text += `\n${line}`;
      } else {
        // Leading text before any numbered paragraph (or a single-paragraph article).
        cur = { paragraphNumber: 0, text: line };
        paragraphs.push(cur);
      }
    }
    if (!paragraphs.length) throw new Error(`Article ${n} parsed with no paragraphs`);

    const idx = html.indexOf(`id="art_${n}"`);
    let chapter = chapters[0];
    for (const c of chapters) if (c.index < idx) chapter = c;
    const roman = (chapter.label.match(/CHAPTER\s+([IVX]+)/) || [])[1] || "I";

    const full = paragraphs.map((p) => p.text).join("\n");
    articles.push({
      articleNumber: n,
      title,
      chapterNumber: ROMAN[roman] || 1,
      chapterTitle: chapter.title,
      paragraphs,
      tags: tagsFor(full),
      referencedArticles: referencedArticles(full, maxArticle).filter((x) => x !== n),
      referencedAnnexes: referencedAnnexes(full),
    });
  }
  return articles;
}

/**
 * The OJ page footer — the "statement" note, the act's own ELI line and the
 * ISSN line — sits as plain oj-normal paragraphs directly after the LAST
 * annex, with no structural wrapper. Slicing to end-of-document therefore
 * swallowed it: the shipped CRA Annex VIII carried "ISSN 1977-0677
 * (electronic edition)" as statutory content until the D2 parity check
 * exposed it. These are boilerplate, not the act.
 */
export const FOOTER_BLOCK = /^(A statement has been made with regard to this act|ELI:\s*http|ISSN\s+\d{4}-\d{4})/;
export function stripTrailingFooter(blockList) {
  const out = [...blockList];
  while (out.length && FOOTER_BLOCK.test(out[out.length - 1])) out.pop();
  return out;
}

export function parseAnnexes(html, order, tagsFor, maxArticle) {
  const titles = [...html.matchAll(/class="oj-doc-ti"[^>]*>([\s\S]*?)<\/p>/g)].map((m) => textOf(m[1]));
  const annexes = [];
  for (let i = 0; i < order.length; i++) {
    const num = order[i];
    const frag = sliceById(html, `anx_${num}`, [`anx_${order[i + 1]}`, "fnp_1"]);
    if (!frag) throw new Error(`Annex ${num} not found in source`);
    const ti = titles.indexOf(`ANNEX ${num}`);
    const title = ti !== -1 && titles[ti + 1] ? titles[ti + 1] : `Annex ${num}`;
    const body = stripTrailingFooter(blocks(frag).filter((l) => l !== `ANNEX ${num}` && l !== title));
    if (!body.length) throw new Error(`Annex ${num} parsed empty`);
    annexes.push({
      annexNumber: num,
      title,
      blocks: body,
      tags: tagsFor(body.join("\n")),
      referencedArticles: referencedArticles(body.join("\n"), maxArticle),
    });
  }
  return annexes;
}

/** Edges derived from real cross-references, not hand-authored. */
