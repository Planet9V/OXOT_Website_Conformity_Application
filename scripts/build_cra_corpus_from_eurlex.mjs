/**
 * Builds the CRA statutory corpus from the authentic Official Journal text.
 *
 * Source: Regulation (EU) 2024/2847, OJ L, 2024/2847, 20.11.2024 (CELEX 32024R2847),
 * fetched from EUR-Lex and cached under docs/cra_statutory_corpus/source/.
 *
 * This REPLACES scripts/generate_full_cra_corpus.mjs, which fabricated the corpus:
 * it hand-wrote 10 recital summaries, filled the other 118 from a rotating template
 * ("Recital N establishes the legislative intent of..."), gave all 71 articles the
 * same two synthetic paragraphs, and invented the article numbering.
 *
 * Nothing in this script writes statutory prose. Every recital, article paragraph
 * and annex line below is lifted verbatim from the OJ HTML. Titles are the real
 * headings. Cross-references are extracted from the text, not generated.
 *
 * Usage:  node scripts/build_cra_corpus_from_eurlex.mjs [--refetch]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CORPUS_DIR = path.join(ROOT, "docs/cra_statutory_corpus");
const SOURCE_DIR = path.join(CORPUS_DIR, "source");
const SOURCE_FILE = path.join(SOURCE_DIR, "OJ_L_202402847_EN.html");
const SOURCE_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202402847";

const REG = {
  regulation: "Regulation (EU) 2024/2847",
  shortTitle: "EU Cyber Resilience Act (CRA)",
  officialJournalReference: "OJ L, 2024/2847, 20.11.2024",
  celex: "32024R2847",
  sourceUrl: SOURCE_URL,
  entryIntoForce: "2024-12-10",
  generalApplicationDate: "2027-12-11",
  // Art. 71(2): Article 14 (reporting obligations) applies from 11 September 2026.
  earlyReportingApplicationDate: "2026-09-11",
  // Art. 71(2): Chapter IV (notification of conformity assessment bodies) from 11 June 2026.
  cabNotificationApplicationDate: "2026-06-11",
};

// ---------------------------------------------------------------- fetch

async function loadSource() {
  const refetch = process.argv.includes("--refetch");
  if (!refetch && fs.existsSync(SOURCE_FILE)) {
    return fs.readFileSync(SOURCE_FILE, "utf8");
  }
  process.stdout.write(`Fetching ${SOURCE_URL}\n`);
  const res = await fetch(SOURCE_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (OXOT CRA corpus builder)" },
  });
  if (!res.ok) throw new Error(`EUR-Lex fetch failed: HTTP ${res.status}`);
  const html = await res.text();
  if (!html.includes("2024/2847") || !html.includes("Whereas"))
    throw new Error("Fetched document does not look like the CRA OJ text");
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  fs.writeFileSync(SOURCE_FILE, html, "utf8");
  return html;
}

// ---------------------------------------------------------------- text helpers

const ENTITIES = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  laquo: "«", raquo: "»", hellip: "…", ndash: "–", mdash: "—",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  deg: "°", euro: "€", sect: "§", middot: "·", times: "×",
};

function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, d) => String.fromCodePoint(parseInt(d, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENTITIES ? ENTITIES[n.toLowerCase()] : m));
}

/** Strip markup and footnote reference markers, collapse whitespace. */
function textOf(html) {
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
function blocks(frag) {
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

function sliceById(html, id, nextIds) {
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
function referencedArticles(text) {
  const nums = new Set();
  for (const m of text.matchAll(/Article\s+(\d{1,2})\b/g)) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 71) nums.add(n);
  }
  return [...nums].sort((a, b) => a - b);
}

function referencedAnnexes(text) {
  const set = new Set();
  for (const m of text.matchAll(/Annex\s+(VIII|VII|VI|IV|IX|V|III|II|I)\b/g)) set.add(m[1]);
  return [...set];
}

/** Keyword tags — asserted only where the term literally occurs in the text. */
const KEYWORDS = [
  ["SBOM", /software bill of materials|SBOM/i],
  ["VulnerabilityHandling", /vulnerabilit/i],
  ["Reporting", /notif(y|ication)|report(ing)?\b/i],
  ["CEMarking", /CE marking/i],
  ["NotifiedBody", /notified bod/i],
  ["OpenSource", /open[- ]source/i],
  ["SupportPeriod", /support period/i],
  ["SpareParts", /spare part/i],
  ["SubstantialModification", /substantial(ly)? modif/i],
  ["Penalties", /penalt|fine/i],
  ["MarketSurveillance", /market surveillance/i],
  ["HarmonisedStandards", /harmonised standard/i],
  ["ConformityAssessment", /conformity assessment/i],
  ["Importer", /importer/i],
  ["Distributor", /distributor/i],
  ["Manufacturer", /manufacturer/i],
  ["Steward", /steward/i],
  ["SME", /SME|small and medium/i],
];

function tagsFor(text) {
  return KEYWORDS.filter(([, re]) => re.test(text)).map(([t]) => t);
}

// ---------------------------------------------------------------- parse

function parseRecitals(html) {
  const ids = Array.from({ length: 130 }, (_, i) => `rct_${i + 1}`);
  const recitals = [];
  for (let n = 1; n <= 130; n++) {
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
      relatedArticles: referencedArticles(text),
      relatedAnnexes: referencedAnnexes(text),
    });
  }
  void ids;
  return recitals;
}

function parseChapters(html) {
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

const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8 };

function parseArticles(html, chapters) {
  const articles = [];
  for (let n = 1; n <= 71; n++) {
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
      referencedArticles: referencedArticles(full).filter((x) => x !== n),
      referencedAnnexes: referencedAnnexes(full),
    });
  }
  return articles;
}

function parseAnnexes(html) {
  const order = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
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
      referencedArticles: referencedArticles(body.join("\n")),
    });
  }
  return annexes;
}

/** Edges derived from real cross-references, not hand-authored. */
function buildGraph(recitals, articles, annexes) {
  const edges = [];
  const seen = new Set();
  const push = (source, target, type) => {
    const k = `${source}|${target}`;
    if (seen.has(k)) return;
    seen.add(k);
    edges.push({ source, target, type });
  };
  for (const r of recitals) {
    for (const a of r.relatedArticles) push(`RECITAL_${r.number}`, `ARTICLE_${a}`, "recital_explains_article");
    for (const x of r.relatedAnnexes) push(`RECITAL_${r.number}`, `ANNEX_${x}`, "recital_refers_annex");
  }
  for (const a of articles) {
    for (const b of a.referencedArticles) push(`ARTICLE_${a.articleNumber}`, `ARTICLE_${b}`, "article_refers_article");
    for (const x of a.referencedAnnexes) push(`ARTICLE_${a.articleNumber}`, `ANNEX_${x}`, "article_refers_annex");
  }
  for (const x of annexes) {
    for (const a of x.referencedArticles) push(`ANNEX_${x.annexNumber}`, `ARTICLE_${a}`, "annex_refers_article");
  }
  return {
    graphVersion: "2.0-eurlex",
    statutoryFramework: REG.regulation,
    derivedFrom: "literal cross-references in the Official Journal text",
    nodesCount: recitals.length + articles.length + annexes.length,
    edgesCount: edges.length,
    edges,
  };
}

// ---------------------------------------------------------------- emit

function main() {
  return loadSource().then((html) => {
    const recitals = parseRecitals(html);
    const chapters = parseChapters(html);
    const articles = parseArticles(html, chapters);
    const annexes = parseAnnexes(html);
    const graph = buildGraph(recitals, articles, annexes);

    const chapterList = chapters.map((c) => {
      const roman = (c.label.match(/CHAPTER\s+([IVX]+)/) || [])[1] || "I";
      const num = ROMAN[roman] || 1;
      const arts = articles.filter((a) => a.chapterNumber === num);
      return {
        chapterNumber: num,
        chapterLabel: c.label,
        chapterTitle: c.title,
        articlesRange: arts.length
          ? `Articles ${arts[0].articleNumber}–${arts[arts.length - 1].articleNumber}`
          : "",
        articles: arts,
      };
    });

    const recitalsFull = { ...REG, totalRecitals: recitals.length, recitals };
    const articlesFull = {
      ...REG,
      chaptersCount: chapterList.length,
      totalArticles: articles.length,
      chapters: chapterList,
    };
    const annexesFull = { ...REG, totalAnnexes: annexes.length, annexes };

    fs.mkdirSync(CORPUS_DIR, { recursive: true });
    const write = (f, o) =>
      fs.writeFileSync(path.join(CORPUS_DIR, f), JSON.stringify(o, null, 2), "utf8");
    write("01_recitals_full.json", recitalsFull);
    write("02_articles_full.json", articlesFull);
    write("03_annexes_full.json", annexesFull);
    write("04_bidirectional_graph.json", graph);

    const banner = `/**
 * CRA statutory corpus — Regulation (EU) 2024/2847.
 *
 * GENERATED FILE. Do not edit by hand.
 * Built by scripts/build_cra_corpus_from_eurlex.mjs from the Official Journal
 * text (${REG.officialJournalReference}, CELEX ${REG.celex}) cached at
 * docs/cra_statutory_corpus/source/. Every recital, article paragraph and annex
 * line is verbatim OJ text. Regenerate with:
 *   node scripts/build_cra_corpus_from_eurlex.mjs --refetch && node scripts/sync_cra_corpus_data.mjs
 */
`;
    const ts =
      banner +
      `export const recitalsData = ${JSON.stringify(recitalsFull, null, 2)} as const;\n\n` +
      `export const articlesData = ${JSON.stringify(articlesFull, null, 2)} as const;\n\n` +
      `export const annexesData = ${JSON.stringify(annexesFull, null, 2)} as const;\n\n` +
      `export const graphData = ${JSON.stringify(graph, null, 2)} as const;\n`;

    const target = path.join(ROOT, "artifacts/api-server/src/lib/craCorpusData.ts");
    fs.writeFileSync(target, ts, "utf8");

    const numberedParas = articles.reduce(
      (n, a) => n + a.paragraphs.filter((p) => p.paragraphNumber > 0).length, 0);
    process.stdout.write(
      `Recitals ${recitals.length} · Chapters ${chapterList.length} · Articles ${articles.length} ` +
        `(${articles.reduce((n, a) => n + a.paragraphs.length, 0)} paragraphs, ${numberedParas} numbered) · ` +
        `Annexes ${annexes.length} · Graph edges ${graph.edges.length}\n` +
        `Wrote ${path.relative(ROOT, target)}\n`
    );
  });
}

main().catch((e) => {
  process.stderr.write(`${e.stack || e}\n`);
  process.exit(1);
});
