/**
 * D2 full-content parity for the OJ corpus family (L51).
 *
 * Reproducibility proves builder(source) == corpus. It cannot prove the
 * BUILDER kept every character — a parser that drops an element reproduces
 * its own loss byte-for-byte. This module re-flattens each article and annex
 * region of the committed OJ source through an INDEPENDENT code path (raw
 * tag-strip, no block recognition at all) and requires the corpus to carry
 * the same characters, whitespace-normalized. It is the check that exposed
 * the missing NIS2 entity column, the lost Part/Class/Section headings, the
 * OJ footer inside CRA Annex VIII and the Parliament statement inside RED
 * Annex VIII.
 *
 * Shared with the builder (like the Cbw D2 shares parseXmlOrdered): entity
 * decoding, region boundaries and the exclusion DEFINITIONS (footnotes,
 * chapter/section headings, page footer). Independent from the builder: the
 * flattening itself — everything visible in a region must surface, not only
 * the element classes the builder knows.
 *
 * Corrigenda declared in the corpus metadata are applied to the SOURCE side
 * and are required to fire — a corrigendum whose "from" text no longer
 * matches means the source or the declaration drifted, and that is a FAIL,
 * not a skip.
 */

import fs from "node:fs";
import path from "node:path";
import { decode, sliceById, textOf, FOOTER_BLOCK } from "./eu_oj_parser.mjs";

/**
 * Independent flatten of a raw HTML region: drop what is BY DEFINITION not
 * content (scripts/styles, footnote paragraphs and markers, chapter/section
 * headings, page-footer paragraphs), then strip every remaining tag and all
 * whitespace. No block classes, no tables logic — that independence is the
 * point.
 */
function flattenRegion(html) {
  let s = html
    // A slice may start/end mid-tag (region bounds are attribute offsets).
    .replace(/^[^>]*>/, "")
    .replace(/<[^>]*$/, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    // Footnote paragraphs and markers are excluded everywhere, as in the corpus.
    .replace(/<p[^>]*class="oj-note"[^>]*>[\s\S]*?<\/p>/g, "")
    .replace(/<span[^>]*class="oj-super[^"]*"[^>]*>[\s\S]*?<\/span>/g, "")
    .replace(/<a[^>]*class="oj-note"[^>]*>[\s\S]*?<\/a>/g, "")
    // Chapter/section headings belong to the chapter structure, not to the
    // article they happen to precede (verified separately by the pins).
    .replace(/<p[^>]*class="oj-ti-section-[12]"[^>]*>[\s\S]*?<\/p>/g, "");
  // Page-footer paragraphs (statement note, ELI, ISSN) — same definition the
  // builder strips from the last annex.
  s = s.replace(/<p[^>]*class="oj-normal"[^>]*>[\s\S]*?<\/p>/g, (m) =>
    FOOTER_BLOCK.test(textOf(m)) ? "" : m,
  );
  return decode(s.replace(/<[^>]+>/g, " "))
    .replace(/\(\s*\)/g, "")
    .replace(/\s+/g, "");
}

const norm = (s) => s.replace(/\s+/g, "");

function rebuildArticle(a) {
  return norm(
    `Article ${a.articleNumber}` +
      a.title +
      a.paragraphs
        .map((p) => (p.paragraphNumber > 0 ? `${p.paragraphNumber}.` : "") + p.text)
        .join(""),
  );
}

function firstDivergence(a, b) {
  let i = 0;
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
  return `at char ${i}: source "…${a.slice(Math.max(0, i - 25), i + 35)}…" vs corpus "…${b.slice(Math.max(0, i - 25), i + 35)}…"`;
}

/**
 * Runs the parity check. Returns { articles, annexes } counts on success;
 * throws with a precise message on the first divergence.
 */
export function checkOjContentParity({ corpusDir, sourceFile }) {
  const html = fs.readFileSync(path.join(corpusDir, sourceFile), "utf8");
  const artJson = JSON.parse(fs.readFileSync(path.join(corpusDir, "02_articles_full.json"), "utf8"));
  const anxPath = path.join(corpusDir, "03_annexes_full.json");
  // An annex-less act (the RED's Delegated Regulation 2022/30) has no annex
  // file; zero corpus annexes against zero source headings verifies below.
  const anxJson = fs.existsSync(anxPath) ? JSON.parse(fs.readFileSync(anxPath, "utf8")) : { annexes: [] };
  const articles = artJson.chapters ? artJson.chapters.flatMap((c) => c.articles) : artJson.articles;

  // Corrigenda AND documented amendments (2023/2444-style): both are
  // declared from→to transformations with provenance, applied to the source
  // side, and they MUST fire.
  const corrigenda = [...(artJson.corrigenda ?? []), ...(artJson.amendments ?? [])].map((c) => ({
    article: c.article,
    from: norm(c.from),
    to: norm(c.to),
    ojRef: c.ojRef ?? c.act,
  }));

  for (const a of articles) {
    const n = a.articleNumber;
    const frag = sliceById(html, `art_${n}`, [`art_${n + 1}`, "fnp_1", "anx_I"]);
    if (!frag) throw new Error(`D2: Article ${n} region not found in the source`);
    let src = flattenRegion(frag);
    for (const c of corrigenda.filter((c) => c.article === n)) {
      if (!src.includes(c.from)) {
        throw new Error(
          `D2: corrigendum (${c.ojRef}) no longer matches the source at Article ${n} — source or declaration drifted`,
        );
      }
      src = src.replace(c.from, c.to);
    }
    const rebuilt = rebuildArticle(a);
    if (src !== rebuilt) {
      throw new Error(
        `D2: Article ${n} character content diverges from the source (${src.length} vs ${rebuilt.length} chars) ${firstDivergence(src, rebuilt)}`,
      );
    }
  }

  // Annex regions by their visible headings (annex ids are broken in the
  // Machinery OJ), bounded by the next annex, a STATEMENT attachment, the
  // footnotes section or the document end.
  const heads = [...html.matchAll(/class="oj-doc-ti"[^>]*>\s*ANNEX\s+([IVXLC]+)\s*<\/p>/g)].map((m) => ({
    roman: m[1],
    index: m.index,
  }));
  const statement = html.search(/class="oj-doc-ti"[^>]*>\s*STATEMENT/);
  const fnp = html.indexOf('id="fnp_');
  const annexes = anxJson.annexes;
  if (heads.length !== annexes.length) {
    throw new Error(`D2: ${heads.length} annex headings in the source vs ${annexes.length} annexes in the corpus`);
  }
  for (let i = 0; i < annexes.length; i++) {
    const a = annexes[i];
    if (heads[i].roman !== a.annexNumber) {
      throw new Error(`D2: annex order mismatch — source ${heads[i].roman} vs corpus ${a.annexNumber} at position ${i + 1}`);
    }
    let end = i + 1 < heads.length ? heads[i + 1].index : html.length;
    if (statement !== -1 && statement > heads[i].index && statement < end) end = statement;
    if (fnp !== -1 && fnp > heads[i].index && fnp < end) end = fnp;
    const src = flattenRegion(html.slice(heads[i].index, end));
    const rebuilt = norm(`ANNEX ${a.annexNumber}` + a.title + a.blocks.join(""));
    if (src !== rebuilt) {
      throw new Error(
        `D2: Annex ${a.annexNumber} character content diverges from the source (${src.length} vs ${rebuilt.length} chars) ${firstDivergence(src, rebuilt)}`,
      );
    }
  }

  return { articles: articles.length, annexes: annexes.length, corrigendaApplied: corrigenda.length };
}

/**
 * Negative control (L51): the check must FAIL against deliberately corrupted
 * corpus data, or a green D2 proves nothing. Flips one character of one
 * article paragraph in a deep copy and requires a divergence error.
 */
export function negativeControl({ corpusDir, sourceFile }) {
  const artPath = path.join(corpusDir, "02_articles_full.json");
  const original = fs.readFileSync(artPath, "utf8");
  const mutated = JSON.parse(original);
  const arts = mutated.chapters ? mutated.chapters.flatMap((c) => c.articles) : mutated.articles;
  const target = arts[0].paragraphs[0];
  target.text = target.text.length > 10 ? `X${target.text.slice(1)}` : `${target.text}X`;
  try {
    fs.writeFileSync(artPath, JSON.stringify(mutated));
    try {
      checkOjContentParity({ corpusDir, sourceFile });
      return false; // a corrupted corpus passed — the check is blind
    } catch {
      return true;
    }
  } finally {
    fs.writeFileSync(artPath, original);
  }
}

/**
 * D2 for CONSOLIDATED-text corpora (task 15.3/15.4): same doctrine, different
 * dialect. Regions are `div.eli-subdivision#art_X` (balanced) and
 * `p.title-annex-1` spans; the consolidation APPARATUS (`p.modref` ▼-markers,
 * superscript footnote refs, page chrome) is excluded BY DEFINITION — it is
 * EUR-Lex's marking, not the law. Corrigenda/amendments are already
 * incorporated in a consolidated text, so nothing is applied here.
 */
function flattenConsolidatedRegion(html) {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<p[^>]*class="modref"[^>]*>[\s\S]*?<\/p>/g, "")
      // Footnote DEFINITIONS (anchored via href="#src.E…") are apparatus,
      // excluded on both sides — same doctrine as oj-note paragraphs.
      .replace(/<p\b(?:[^>]*)>(?:(?!<\/p>)[\s\S])*?href="#src\.E[\s\S]*?<\/p>/g, "")
      .replace(/<span[^>]*class="superscript"[^>]*>[\s\S]*?<\/span>/g, "")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\(\s*\)/g, "")
    .replace(/\s+/g, "");
}

function balancedDivEndAt(html, start) {
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

export function checkConsolidatedContentParity({ corpusDir, consolidatedFile }) {
  const html = fs.readFileSync(path.join(corpusDir, consolidatedFile), "utf8");
  const artJson = JSON.parse(fs.readFileSync(path.join(corpusDir, "02_articles_full.json"), "utf8"));
  const anxJson = JSON.parse(fs.readFileSync(path.join(corpusDir, "03_annexes_full.json"), "utf8"));
  const articles = artJson.chapters.flatMap((c) => c.articles);

  const heads = [...html.matchAll(/<div class="eli-subdivision" id="art_([0-9]+[a-z]*)">/g)].map((m) => ({
    n: m[1],
    index: m.index,
  }));
  if (heads.length !== articles.length) {
    throw new Error(`D2: ${heads.length} article regions in the source vs ${articles.length} in the corpus`);
  }
  for (let i = 0; i < heads.length; i++) {
    const a = articles[i];
    if (String(a.articleNumber) !== heads[i].n) {
      throw new Error(`D2: article order mismatch at position ${i + 1}: source art_${heads[i].n} vs corpus ${a.articleNumber}`);
    }
    const src = flattenConsolidatedRegion(html.slice(heads[i].index, balancedDivEndAt(html, heads[i].index)));
    const rebuilt = norm(
      `Article ${a.articleNumber}` +
        a.title +
        a.paragraphs.map((p) => (p.paragraphNumber > 0 ? `${p.paragraphNumber}.` : "") + p.text).join(""),
    );
    if (src !== rebuilt) {
      throw new Error(
        `D2: Article ${a.articleNumber} character content diverges from the consolidated source (${src.length} vs ${rebuilt.length} chars) ${firstDivergence(src, rebuilt)}`,
      );
    }
  }

  const anxHeads = [...html.matchAll(/<p class="title-annex-1"[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => ({ label: m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), index: m.index }))
    .filter((h) => /^ANNEX\b/i.test(h.label.replace(/ /g, " ")));
  const annexes = anxJson.annexes;
  if (anxHeads.length !== annexes.length) {
    throw new Error(`D2: ${anxHeads.length} annex headings vs ${annexes.length} in the corpus`);
  }
  for (let i = 0; i < annexes.length; i++) {
    const a = annexes[i];
    const start = anxHeads[i].index;
    const end = i + 1 < anxHeads.length ? anxHeads[i + 1].index : html.length;
    const src = flattenConsolidatedRegion(html.slice(start, end));
    const label = anxHeads[i].label.replace(/ /g, " ");
    const rebuilt = norm(label + a.title + a.blocks.join(""));
    if (src !== rebuilt) {
      throw new Error(
        `D2: Annex ${a.annexNumber} character content diverges from the consolidated source (${src.length} vs ${rebuilt.length} chars) ${firstDivergence(src, rebuilt)}`,
      );
    }
  }
  return { articles: articles.length, annexes: annexes.length };
}

/** Negative control for the consolidated check (L51). */
export function consolidatedNegativeControl({ corpusDir, consolidatedFile }) {
  const artPath = path.join(corpusDir, "02_articles_full.json");
  const original = fs.readFileSync(artPath, "utf8");
  const mutated = JSON.parse(original);
  const arts = mutated.chapters.flatMap((c) => c.articles);
  const target = arts[0].paragraphs[0];
  target.text = target.text.length > 10 ? `X${target.text.slice(1)}` : `${target.text}X`;
  try {
    fs.writeFileSync(artPath, JSON.stringify(mutated));
    try {
      checkConsolidatedContentParity({ corpusDir, consolidatedFile });
      return false;
    } catch {
      return true;
    }
  } finally {
    fs.writeFileSync(artPath, original);
  }
}
