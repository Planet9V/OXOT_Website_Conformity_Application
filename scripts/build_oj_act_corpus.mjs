/**
 * Build a statutory corpus from an authentic Official Journal text for acts
 * that are CORRECTED but not amended (task 17.1): the original OJ HTML plus
 * every English corrigendum applied as documented, must-fire from/to
 * substitutions — the CRA doctrine, parameterized. Acts amended in force use
 * build_consolidated_act_corpus.mjs instead.
 *
 * Usage:
 *   node scripts/build_oj_act_corpus.mjs <gdpr|data_act>
 *   node scripts/build_oj_act_corpus.mjs <act> --discover
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
  gdpr: {
    dir: "docs/gdpr_statutory_corpus",
    source: "source/CELEX_32016R0679_EN.html",
    meta: {
      regulation: "Regulation (EU) 2016/679",
      shortTitle: "GDPR",
      officialJournalReference: "OJ L 119, 4.5.2016, p. 1",
      celex: "32016R0679",
      eli: "http://data.europa.eu/eli/reg/2016/679/oj",
      sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679",
      adopted: "2016-04-27",
      entryIntoForce: "2016-05-24",
      appliesFrom: "2018-05-25",
      instrumentType: "regulation",
      nationalTranspositionRequired: false,
      corrigendaVerified: true,
      corrigendaNoted: [
        { id: "32016R0679R(01)", note: "DE, ET, IT, HU only — the English text is not affected." },
        { id: "32016R0679R(03)", note: "ES, CS, DE, EL, GA, HR, IT, LT, HU, NL, PL, PT, SK, FI, SV only." },
      ],
    },
    // Pinned from --discover 2026-08-17, cross-checked against the OJ document.
    expected: { recitals: 173, chapters: 11, articles: 99, annexes: [] },
    keywords: [
      [/personal data|data subject/i, "personal_data"],
      [/controller|processor/i, "controller_processor"],
      [/security of processing|breach/i, "security"],
      [/data protection by design|by default/i, "by_design"],
      [/impact assessment/i, "dpia"],
      [/supervisory authority/i, "supervision"],
      [/transfer/i, "transfers"],
      [/consent/i, "consent"],
    ],
    corrigenda: [
      {
        id: "32016R0679R(02)",
        ojRef: "OJ L 127, 23.5.2018, p. 2",
        eli: "http://data.europa.eu/eli/reg/2016/679/corrigendum/2018-05-23/oj",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679R(02)",
        corrections: [
          { recital: 71, from: "of the data subject and that prevents, inter alia, discriminatory effects", to: "of the data subject, and prevent, inter alia, discriminatory effects", note: "Recital 71, fifth/sixth sentences (first change)." },
          { recital: 71, from: "or that result in measures having such an effect.", to: "or processing that results in measures having such an effect.", note: "Recital 71 (second change)." },
          { article: 37, from: "pursuant to Article 9 and personal data relating to criminal convictions", to: "pursuant to Article 9 or personal data relating to criminal convictions", note: "Art 37(1)(c): 'and' → 'or'." },
          { article: 41, from: "the draft criteria for accreditation", to: "the draft requirements for accreditation", note: "Art 41(3)." },
          { article: 41, from: "if the conditions for accreditation are not", to: "if the requirements for accreditation are not", note: "Art 41(5)." },
          { article: 42, from: "provided that the relevant requirements continue to be met", to: "provided that the relevant criteria continue to be met", note: "Art 42(7) first change." },
          { article: 42, from: "where the requirements for the certification are not or are no longer met", to: "where the criteria for the certification are not or are no longer met", note: "Art 42(7) second change." },
          { article: 43, from: "on the basis of criteria approved by the supervisory authority", to: "on the basis of requirements approved by the supervisory authority", note: "Art 43(3)." },
          { article: 43, from: "transmit those requirements and criteria to the Board. The Board shall collate all certification mechanisms and data protection seals in a register and shall make them publicly available by any appropriate means.", to: "transmit those requirements and criteria to the Board.", note: "Art 43(6): final sentence deleted (register duty moved to Art 42(8))." },
          { article: 57, from: "draft and publish the criteria for accreditation", to: "draft and publish the requirements for accreditation", note: "Art 57(1)(p)." },
          { article: 64, from: "aims to approve the criteria for accreditation of a body pursuant to Article 41(3) or a certification body pursuant to Article 43(3);", to: "aims to approve the requirements for accreditation of a body pursuant to Article 41(3), of a certification body pursuant to Article 43(3) or the criteria for certification referred to in Article 42(5);", note: "Art 64(1)(c)." },
          { article: 64, from: "The competent supervisory authority shall not adopt its draft decision", to: "The competent supervisory authority referred to in paragraph 1 shall not adopt its draft decision", note: "Art 64(6)." },
          { article: 64, from: "The supervisory authority referred to in paragraph 1 shall take utmost account", to: "The competent supervisory authority referred to in paragraph 1 shall take utmost account", note: "Art 64(7)." },
          { article: 64, from: "Where the supervisory authority concerned informs the Chair", to: "Where the competent supervisory authority referred to in paragraph 1 informs the Chair", note: "Art 64(8)." },
          { article: 65, from: "to a draft decision of the lead authority or the lead authority has rejected such an objection", to: "to a draft decision of the lead supervisory authority and the lead supervisory authority has not followed the objection or has rejected such an objection", note: "Art 65(1)(a)." },
          { article: 69, from: "referred to in point (b) of Article 70(1) and in Article 70(2)", to: "referred to in Article 70(1) and (2)", note: "Art 69(2)." },
          { article: 70, from: "best practices referred to in points (e) and (f);", to: "best practices;", note: "Art 70(1)(l)." },
          { article: 70, from: "carry out the accreditation of certification bodies and its periodic review pursuant to Article 43 and maintain a public register of accredited bodies pursuant to Article 43(6) and of the accredited controllers or processors established in third countries pursuant to Article 42(7);", to: "approve the criteria of certification pursuant to Article 42(5) and maintain a public register of certification mechanisms and data protection seals and marks pursuant to Article 42(8) and of the certified controllers or processors established in third countries pursuant to Article 42(7);", note: "Art 70(1)(o)." },
          { article: 70, from: "specify the requirements referred to in Article 43(3) with a view to the accreditation of certification bodies under Article 42;", to: "approve the requirements referred to in Article 43(3) with a view to the accreditation of certification bodies referred to in Article 43;", note: "Art 70(1)(p)." },
        ],
      },
    ],
  },
  data_act: {
    dir: "docs/data_act_statutory_corpus",
    source: "source/CELEX_32023R2854_EN.html",
    meta: {
      regulation: "Regulation (EU) 2023/2854",
      shortTitle: "Data Act",
      officialJournalReference: "OJ L, 2023/2854, 22.12.2023",
      celex: "32023R2854",
      eli: "http://data.europa.eu/eli/reg/2023/2854/oj",
      sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R2854",
      adopted: "2023-12-13",
      entryIntoForce: "2024-01-11",
      appliesFrom: "2025-09-12",
      instrumentType: "regulation",
      nationalTranspositionRequired: false,
      corrigendaVerified: true,
      corrigendaNoted: [
        { id: "32023R2854R(02)", note: "ES only." },
        { id: "32023R2854R(03)", note: "FI only." },
        { id: "32023R2854R(04)", note: "DE, NL only." },
        { id: "32023R2854R(05)", note: "NL only." },
      ],
    },
    // Pinned from --discover 2026-08-17.
    expected: { recitals: 120, chapters: 11, articles: 50, annexes: [] },
    keywords: [
      [/connected product/i, "connected_products"],
      [/data holder/i, "data_holder"],
      [/data sharing|make data available/i, "data_sharing"],
      [/switching|cloud/i, "switching"],
      [/interoperab/i, "interoperability"],
      [/trade secret/i, "trade_secrets"],
      [/smart contract/i, "smart_contracts"],
      [/public sector bod/i, "b2g"],
    ],
    corrigenda: [
      {
        id: "32023R2854R(01)",
        ojRef: "OJ L, 2024/90740, 9.12.2024",
        eli: "http://data.europa.eu/eli/reg/2023/2854/corrigendum/2024-12-09/oj",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R2854R(01)",
        corrections: [
          { article: 48, from: "\u201868. Regulation (EU) 2023/2854", to: "\u2018(69) Regulation (EU) 2023/2854", note: "Art 48: the point number this Regulation takes in Annex I to Directive (EU) 2020/1828 is (69), not 68." },
        ],
      },
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

  /**
   * Apply every English corrigendum as a documented, MUST-FIRE substitution
   * (the CRA doctrine): a correction whose `from` text is not found fails the
   * build rather than silently skipping, so a re-parse can never quietly drop
   * one. Recital corrections apply to recitals; article corrections find the
   * paragraph carrying the superseded text.
   */
  const appliedCorrigenda = [];
  for (const group of act.corrigenda ?? []) {
    for (const fix of group.corrections) {
      if (fix.recital != null) {
        const rec = recitals.find((r) => r.number === fix.recital);
        if (!rec || !rec.text.includes(fix.from)) {
          throw new Error(`Corrigendum ${group.id} did not fire on recital ${fix.recital}: ${JSON.stringify(fix.from.slice(0, 60))}`);
        }
        rec.text = rec.text.replace(fix.from, fix.to);
      } else {
        const art = articles.find((a) => a.articleNumber === fix.article);
        const para = art?.paragraphs.find((pp) => pp.text.includes(fix.from));
        if (!para) {
          throw new Error(`Corrigendum ${group.id} did not fire on Article ${fix.article}: ${JSON.stringify(fix.from.slice(0, 60))}`);
        }
        para.text = para.text.replace(fix.from, fix.to);
      }
      appliedCorrigenda.push({ id: group.id, ojRef: group.ojRef, eli: group.eli, url: group.url, ...fix });
    }
  }

  const meta = {
    ...act.meta,
    corrigenda: appliedCorrigenda,
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
  console.log(`${act.meta.shortTitle}: recitals ${recitals.length} · chapters ${chapters.length} · articles ${articles.length} · annexes ${annexes.length} · corrigenda applied ${appliedCorrigenda.length} → ${path.relative(ROOT, CORPUS_DIR)}`);
}

main();
