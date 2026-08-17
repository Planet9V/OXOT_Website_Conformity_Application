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
  const anxJson = JSON.parse(fs.readFileSync(path.join(corpusDir, "03_annexes_full.json"), "utf8"));
  const articles = artJson.chapters ? artJson.chapters.flatMap((c) => c.articles) : artJson.articles;

  // Corrigenda: applied to the source side, and they MUST fire.
  const corrigenda = (artJson.corrigenda ?? []).map((c) => ({
    article: c.article,
    from: norm(c.from),
    to: norm(c.to),
    ojRef: c.ojRef,
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
