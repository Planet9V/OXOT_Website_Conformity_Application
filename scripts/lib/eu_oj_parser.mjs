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
 */

export function blocks(frag) {
  const out = [];
  // Annexes III and IV use oj-enumeration-spacing divs rather than oj-normal
  // paragraphs, so both forms have to be recognised or those annexes come out empty.
  const re =
    /<div[^>]*class="oj-enumeration-spacing"[^>]*>[\s\S]*?<\/div>|<table[\s\S]*?<\/table>|<p[^>]*class="oj-normal"[^>]*>[\s\S]*?<\/p>/g;
  let m;
  while ((m = re.exec(frag)) !== null) {
    const chunk = m[0];
    if (chunk.startsWith("<table")) {
      for (const row of chunk.match(/<tr[\s\S]*?<\/tr>/g) || []) {
        const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => textOf(c[1]));
        const label = cells[0] || "";
        const body = cells.slice(1).join(" ").trim();
        const line = `${label} ${body}`.trim();
        if (line) out.push(line);
      }
    } else {
      const t = textOf(chunk);
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

export const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8 };

export function parseArticles(html, chapters, tagsFor, maxArticle) {
  const articles = [];
  for (let n = 1; n <= maxArticle; n++) {
    const frag = sliceById(html, `art_${n}`, [`art_${n + 1}`, "fnp_1", "anx_I"]);
    if (!frag) throw new Error(`Article ${n} not found in source`);
    const titleM = frag.match(/class="oj-sti-art"[^>]*>([\s\S]*?)<\/p>/);
    const title = titleM ? textOf(titleM[1]) : "";
    if (!title) throw new Error(`Article ${n} has no title in source`);

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

export function parseAnnexes(html, order, tagsFor, maxArticle) {
  const titles = [...html.matchAll(/class="oj-doc-ti"[^>]*>([\s\S]*?)<\/p>/g)].map((m) => textOf(m[1]));
  const annexes = [];
  for (let i = 0; i < order.length; i++) {
    const num = order[i];
    const frag = sliceById(html, `anx_${num}`, [`anx_${order[i + 1]}`, "fnp_1"]);
    if (!frag) throw new Error(`Annex ${num} not found in source`);
    const ti = titles.indexOf(`ANNEX ${num}`);
    const title = ti !== -1 && titles[ti + 1] ? titles[ti + 1] : `Annex ${num}`;
    const body = blocks(frag).filter((l) => l !== `ANNEX ${num}` && l !== title);
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
