/**
 * Build a statutory corpus for one of the Phase-10 acts from the Official
 * Journal text (task 10.3): AI Act, Machinery Regulation, or the Radio
 * Equipment Directive. Same doctrine as the CRA/NIS2 builders, same shared
 * parser, one parameterized script instead of three copies.
 *
 * Usage:
 *   node scripts/build_euact_corpus_from_eurlex.mjs <ai_act|machinery|red>
 *   node scripts/build_euact_corpus_from_eurlex.mjs <act> --discover
 *
 * --discover prints the parsed structure next to INDEPENDENT regex counts
 * from the raw source, for pinning EXPECTED. A build without --discover
 * refuses unless the parse matches the pinned structure exactly — a silent
 * parse failure must never produce a plausible-looking corpus.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  parseRecitals,
  parseChapters,
  parseArticles,
  textOf,
  blocks,
  stripTrailingFooter,
  referencedArticles,
} from "./lib/eu_oj_parser.mjs";

const ROOT = process.cwd();

const ACTS = {
  // ai_act and machinery moved to the CONSOLIDATED pipeline in 15.3/15.4
  // (amended in force; see build_consolidated_act_corpus.mjs). Rebuilding them
  // here would resurrect superseded law over the as-amended corpora.

  red: {
    dir: "docs/red_statutory_corpus",
    source: "source/CELEX_32014L0053_EN.html",
    meta: {
      directive: "Directive 2014/53/EU",
      shortTitle: "RED",
      officialJournalReference: "OJ L 153, 22.5.2014, p. 62",
      celex: "32014L0053",
      eli: "http://data.europa.eu/eli/dir/2014/53/oj",
      sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014L0053",
      adopted: "2014-04-16",
      entryIntoForce: "2014-06-11",
      instrumentType: "directive",
      nationalTranspositionRequired: true,
      corrigenda: [],
      corrigendaVerified: false,
    },
    // Pinned from --discover 2026-08-16, cross-checked against the OJ
    // document (52 articles; annexes I..VIII).
    expected: { recitals: 75, chapters: 7, articles: 52, annexes: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] },
    keywords: [
      [/essential requirement/i, "essential_requirements"],
      [/radio equipment|radio spectrum/i, "radio"],
      [/conformity assessment|notified bod/i, "conformity_assessment"],
      [/manufacturer|importer|distributor/i, "operator_roles"],
      [/CE marking|declaration of conformity/i, "ce_marking"],
      [/market surveillance|safeguard/i, "supervision_enforcement"],
      [/harmonised standard/i, "standards"],
      [/delegated act|implementing act/i, "delegated_acts"],
      [/personal data|privacy|fraud/i, "privacy_security"],
    ],
  },
};

const actKey = process.argv[2];
const discover = process.argv.includes("--discover");
const act = ACTS[actKey];
if (!act) {
  console.error(`Usage: node scripts/build_euact_corpus_from_eurlex.mjs <${Object.keys(ACTS).join("|")}> [--discover]`);
  process.exit(1);
}

const CORPUS_DIR = path.join(ROOT, act.dir);
const SOURCE_FILE = path.join(CORPUS_DIR, act.source);

function tagsFor(text) {
  const tags = [];
  for (const [re, tag] of act.keywords) if (re.test(text)) tags.push(tag);
  return [...new Set(tags)];
}

function loadSource() {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Missing source: fetch the AUTHENTIC text:\n  curl -sL -A "Mozilla/5.0" "${act.meta.sourceUrl}" -o "${path.relative(ROOT, SOURCE_FILE)}"`);
    process.exit(1);
  }
  const html = fs.readFileSync(SOURCE_FILE, "utf8");
  if (/has no legal effect|meant purely as a documentation tool/i.test(html)) {
    console.error("Source is a CONSOLIDATED text — it has no legal effect and omits the preamble. Refusing.");
    process.exit(1);
  }
  if (!/Whereas/.test(html)) {
    console.error("Source has no preamble — recitals would be lost. Refusing.");
    process.exit(1);
  }
  return html;
}

function independentCounts(html) {
  // The OJ HTML carries explicit structural anchors (id="art_N", id="rct_N",
  // id="cpt_N", id="anx_R"). Counting THOSE is citation-proof — a text scan
  // for "Article N" once matched "Article 114 TFEU" in the preamble.
  const ids = (prefix) =>
    new Set([...html.matchAll(new RegExp(`id="${prefix}([0-9IVXLC.]+)"`, "g"))].map((m) => m[1]));
  const arts = [...ids("art_")].map(Number).filter(Number.isFinite);
  const rcts = [...ids("rct_")].map(Number).filter(Number.isFinite);
  const chapters = [...ids("cpt_")].filter((c) => /^[IVXLC]+$|^\d+$/.test(c));
  const annexes = [...ids("anx_")].filter((a) => /^[IVXLC]+$/.test(a));
  return {
    maxRecital: rcts.length ? Math.max(...rcts) : 0,
    maxArticle: arts.length ? Math.max(...arts) : 0,
    chapterCount: chapters.length,
    annexes,
  };
}

function main() {
  const html = loadSource();
  const indep = independentCounts(html);

  // The AI Act nests SECTION headings in the same class as CHAPTER headings;
  // keep only true chapters (the shared parser stays untouched — the CRA and
  // NIS2 corpora's reproducibility depends on its exact behaviour).
  const onlyChapters = (chapters) => chapters.filter((c) => /^CHAPTER/i.test(c.label));

  // Annexes are parsed by their VISIBLE headings, not ids: the Machinery
  // Regulation's OJ HTML ships BROKEN annex anchors (ANNEX IX reuses
  // id="anx_I", ANNEX X a bare id="anx_"), so id-based slicing would return
  // the wrong annex while looking successful. Heading order is asserted
  // against the pinned roman sequence.
  const parseAnnexesByHeading = (maxArticle) => {
    const heads = [...html.matchAll(/class="oj-doc-ti"[^>]*>\s*ANNEX\s+([IVXLC]+)\s*<\/p>/g)].map(
      (m) => ({ roman: m[1], index: m.index }),
    );
    // A document-level attachment ("STATEMENT OF THE EUROPEAN PARLIAMENT" in
    // the RED) follows the last annex under its own oj-doc-ti heading. It is
    // not annex content — the shipped RED Annex VIII carried its body text
    // until the D2 parity check exposed it. Bound the last annex before it.
    const statement = html.search(/class="oj-doc-ti"[^>]*>\s*STATEMENT/);
    return heads.map((h, i) => {
      let end = i + 1 < heads.length ? heads[i + 1].index : html.length;
      if (statement !== -1 && statement > h.index && statement < end) end = statement;
      const frag = html.slice(h.index, end);
      const titleM = frag
        .slice(1)
        .match(/class="(?:oj-doc-ti|oj-ti-grseq-1)"[^>]*>([\s\S]*?)<\/p>/);
      const title = titleM ? textOf(titleM[1]) : `Annex ${h.roman}`;
      const body = stripTrailingFooter(blocks(frag).filter((l) => l !== `ANNEX ${h.roman}` && l !== title));
      if (!body.length) throw new Error(`Annex ${h.roman} parsed empty`);
      return {
        annexNumber: h.roman,
        title,
        blocks: body,
        tags: tagsFor(body.join("\n")),
        referencedArticles: referencedArticles(body.join("\n"), maxArticle),
      };
    });
  };

  if (discover || !act.expected) {
    const maxA = indep.maxArticle || 200;
    const recitals = parseRecitals(html, tagsFor, indep.maxRecital || 300, maxA);
    const chapters = onlyChapters(parseChapters(html));
    const articles = parseArticles(html, chapters, tagsFor, maxA);
    const annexes = parseAnnexesByHeading(maxA);
    console.log(`[discover] parsed: recitals=${recitals.length} chapters=${chapters.length} articles=${articles.length} annexes=${annexes.length}`);
    console.log(`[discover] independent: maxRecital=${indep.maxRecital} maxArticle=${indep.maxArticle} chapters=${indep.chapterCount} annexes=${indep.annexes.join(",")}`);
    const empty = articles.filter((a) => !a.paragraphs.length).map((a) => a.articleNumber);
    if (empty.length) console.log(`[discover] articles with NO text: ${empty.join(", ")}`);
    if (!act.expected) {
      console.error("EXPECTED not pinned for this act yet — pin it from the discovery output (after checking it against the document), then build.");
      process.exit(discover ? 0 : 1);
    }
    if (discover) process.exit(0);
  }

  const EXPECTED = act.expected;
  const recitals = parseRecitals(html, tagsFor, EXPECTED.recitals, EXPECTED.articles);
  const chapters = onlyChapters(parseChapters(html));
  const articles = parseArticles(html, chapters, tagsFor, EXPECTED.articles);
  const annexes = parseAnnexesByHeading(EXPECTED.articles);

  const problems = [];
  if (recitals.length !== EXPECTED.recitals) problems.push(`recitals: got ${recitals.length}, expected ${EXPECTED.recitals}`);
  if (chapters.length !== EXPECTED.chapters) problems.push(`chapters: got ${chapters.length}, expected ${EXPECTED.chapters}`);
  if (articles.length !== EXPECTED.articles) problems.push(`articles: got ${articles.length}, expected ${EXPECTED.articles}`);
  const annexSeq = annexes.map((x) => x.annexNumber).join(",");
  if (annexSeq !== EXPECTED.annexes.join(","))
    problems.push(`annex sequence: got [${annexSeq}], expected [${EXPECTED.annexes.join(",")}]`);
  const empty = articles.filter((a) => !a.paragraphs.length).map((a) => a.articleNumber);
  if (empty.length) problems.push(`articles parsed with no text: ${empty.join(", ")}`);
  // Cross-check against the independent counts so BOTH heuristics must agree.
  if (indep.maxArticle && indep.maxArticle !== EXPECTED.articles)
    problems.push(`independent article count ${indep.maxArticle} disagrees with EXPECTED ${EXPECTED.articles}`);
  if (indep.maxRecital && indep.maxRecital !== EXPECTED.recitals)
    problems.push(`independent recital count ${indep.maxRecital} disagrees with EXPECTED ${EXPECTED.recitals}`);
  if (problems.length) {
    console.error("Parse does not match the pinned structure:\n  " + problems.join("\n  "));
    process.exit(1);
  }

  const meta = {
    ...act.meta,
    builtFrom: path.relative(ROOT, SOURCE_FILE),
    sourceSha256: createHash("sha256").update(fs.readFileSync(SOURCE_FILE)).digest("hex"),
    recitalsCount: recitals.length,
    chaptersCount: chapters.length,
    totalArticles: articles.length,
    annexesCount: annexes.length,
  };

  const write = (name, data) =>
    fs.writeFileSync(path.join(CORPUS_DIR, name), JSON.stringify(data, null, 2) + "\n");
  write("01_recitals_full.json", { ...meta, recitals });
  write("02_articles_full.json", {
    ...meta,
    chapters: chapters.map((c, i) => ({
      chapterNumber: i + 1,
      label: c.label,
      title: c.title,
      articles: articles.filter((a) => a.chapterNumber === i + 1),
    })),
  });
  write("03_annexes_full.json", { ...meta, annexes });
  console.log(`${act.meta.shortTitle}: recitals ${recitals.length} · chapters ${chapters.length} · articles ${articles.length} · annexes ${annexes.length} → ${path.relative(ROOT, CORPUS_DIR)}`);
}

main();
