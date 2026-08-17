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
import {
  decode, textOf, blocks, sliceById,
  referencedArticles, referencedAnnexes,
  parseRecitals, parseChapters, parseArticles, parseAnnexes, ROMAN,
} from "./lib/eu_oj_parser.mjs";
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


/**
 * Corrigenda published after the original OJ text.
 *
 * The base HTML EUR-Lex serves at the OJ:L_202402847 URL is the text **as
 * originally published on 20 November 2024**. It does NOT incorporate later
 * corrigenda, and there is no consolidated version of this regulation. Building
 * only from that URL therefore yields superseded text — which is what happened
 * here until 2026-08-15.
 *
 * Each correction is applied as an exact string substitution and VERIFIED: if
 * the `from` text is not found, the build fails rather than silently skipping.
 * That way a future re-parse cannot quietly drop a correction.
 */
const CORRIGENDA = [
  {
    id: "32024R2847R(02)",
    ojRef: "OJ L, 2025/90555, 2.7.2025",
    eli: "http://data.europa.eu/eli/reg/2024/2847/corrigendum/2025-07-02/oj",
    url: "https://eur-lex.europa.eu/eli/reg/2024/2847/corrigendum/2025-07-02/oj/eng",
    corrections: [
      {
        note: "Page 65, Article 64(10), introductory wording. Widens the fine exemption to cover paragraph 2 — the EUR 15 000 000 / 2,5 % tier — so the Art. 64(10)(b) exemption for open-source software stewards is complete rather than partial.",
        article: 64,
        paragraph: 10,
        from: "By way of derogation from paragraphs 3 to 9,",
        to: "By way of derogation from paragraphs 2 to 9,",
      },
    ],
  },
  {
    // Found by the 15.x lifecycle sweep (L55) — published 2025-10-17,
    // unapplied until 2026-08-16.
    id: "32024R2847R(04)",
    ojRef: "OJ L, 2025/91117, 17.10.2025",
    eli: "http://data.europa.eu/eli/reg/2024/2847/corrigendum/2025-10-17/oj",
    url: "https://eur-lex.europa.eu/eli/reg/2024/2847/corrigendum/2025-10-17/oj/eng",
    corrections: [
      {
        note: "Page 66, Article 67 — the point number this Regulation takes in Annex I to Directive (EU) 2020/1828 is 72, not 69 (three other acts joined the annex first).",
        article: 67,
        paragraph: 0,
        from: "‘69. Regulation (EU) 2024/2847",
        to: "‘72. Regulation (EU) 2024/2847",
      },
    ],
  },
];

/**
 * Corrections and amendments that exist but are NOT applied, with the reason
 * stated — recorded so the lifecycle can never again drift silently (L55).
 */
const LIFECYCLE_NOTES = {
  corrigendaNoted: [
    {
      id: "32024R2847R(01)",
      eli: "http://data.europa.eu/eli/reg/2024/2847/corrigendum/2024-12-05/oj",
      note: "EN, title wording only ('(EU) No 2019/1020' → '(EU) 2019/1020'). The committed EUR-Lex source already serves the corrected title; no stored string carries the superseded form.",
    },
    { id: "32024R2847R(03)", note: "FR, HU only — the English text is not affected." },
    { id: "32024R2847R(05)", note: "SK only." },
    { id: "32024R2847R(06)", note: "FR only." },
    { id: "32024R2847R(07)", note: "DE only." },
  ],
  pendingAmendments: [
    {
      act: "Regulation (EU) 2025/327 (European Health Data Space)",
      celex: "32025R0327",
      eli: "http://data.europa.eu/eli/reg/2025/327/oj",
      applicableFrom: "2027-03-26",
      changes: [
        "Article 13(4) replaced (cybersecurity risk assessment may join other Union acts' risk assessment for Art 12 / Art 32(5a) products)",
        "Article 31(3) replaced (single set of technical documentation for those products)",
        "Article 32(5a) inserted (EHR systems under 2025/327 demonstrate conformity via that Regulation's procedure)",
      ],
      note: "ADOPTED but applicable only from 2027-03-26 — the law in force today is the unamended text; incorporate in the batch that opens when the date nears.",
    },
  ],
};

function applyCorrigenda(articles) {
  const applied = [];
  for (const c of CORRIGENDA) {
    for (const fix of c.corrections) {
      const art = articles.find((a) => a.articleNumber === fix.article);
      if (!art) throw new Error(`Corrigendum ${c.ojRef}: Article ${fix.article} not found`);
      const para = art.paragraphs.find((p) => p.paragraphNumber === fix.paragraph);
      if (!para) throw new Error(`Corrigendum ${c.ojRef}: Article ${fix.article}(${fix.paragraph}) not found`);
      if (!para.text.includes(fix.from)) {
        throw new Error(
          `Corrigendum ${c.ojRef} does not apply cleanly to Article ${fix.article}(${fix.paragraph}): ` +
            `expected to find ${JSON.stringify(fix.from)}. The source text may have changed — ` +
            `re-check the corrigendum before continuing.`,
        );
      }
      para.text = para.text.replace(fix.from, fix.to);
      applied.push({ id: c.id, ojRef: c.ojRef, eli: c.eli, url: c.url, ...fix });
    }
  }
  return applied;
}

// ---------------------------------------------------------------- parse

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
    const recitals = parseRecitals(html, tagsFor, 130, 71);
    const chapters = parseChapters(html);
    const articles = parseArticles(html, chapters, tagsFor, 71);
    const annexes = parseAnnexes(html, ["I","II","III","IV","V","VI","VII","VIII"], tagsFor, 71);
    const corrigendaApplied = applyCorrigenda(articles);
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

    const provenance = { ...REG, corrigenda: corrigendaApplied, ...LIFECYCLE_NOTES };
    const recitalsFull = { ...provenance, totalRecitals: recitals.length, recitals };
    const articlesFull = {
      ...provenance,
      chaptersCount: chapterList.length,
      totalArticles: articles.length,
      chapters: chapterList,
    };
    const annexesFull = { ...provenance, totalAnnexes: annexes.length, annexes };

    fs.mkdirSync(CORPUS_DIR, { recursive: true });
    const write = (f, o) =>
      fs.writeFileSync(path.join(CORPUS_DIR, f), JSON.stringify(o, null, 2), "utf8");
    write("01_recitals_full.json", recitalsFull);
    write("02_articles_full.json", articlesFull);
    write("03_annexes_full.json", annexesFull);
    write("04_bidirectional_graph.json", graph);

    const numberedParas = articles.reduce(
      (n, a) => n + a.paragraphs.filter((p) => p.paragraphNumber > 0).length, 0);
    process.stdout.write(
      `Recitals ${recitals.length} · Chapters ${chapterList.length} · Articles ${articles.length} ` +
        `(${articles.reduce((n, a) => n + a.paragraphs.length, 0)} paragraphs, ${numberedParas} numbered) · ` +
        `Annexes ${annexes.length} · Graph edges ${graph.edges.length} · Corrigenda applied ${corrigendaApplied.length}\n` +
        `Wrote JSON to ${path.relative(ROOT, CORPUS_DIR)} — now run scripts/sync_cra_corpus_data.mjs\n`
    );
  });
}

main().catch((e) => {
  process.stderr.write(`${e.stack || e}\n`);
  process.exit(1);
});
