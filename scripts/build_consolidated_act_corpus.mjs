/**
 * Builds a HYBRID corpus for an act whose text has been AMENDED in force
 * (task 15.3/15.4 + GPSR): recitals from the committed ORIGINAL OJ source
 * (consolidated texts carry no preamble), articles and annexes from the
 * committed CONSOLIDATED EUR-Lex text at the pinned consolidation date.
 *
 * A consolidated text has no legal effect of its own — this is a DISCLOSED
 * DEPARTURE (BSIG precedent): the metadata carries the full amendment trail
 * (every amending act, its date of application, and the subdivisions it
 * touched, read from the EUR-Lex ALL view on the sweep date) and the
 * corrigenda disposition. The verifier asserts all of it stays carried.
 *
 * Usage: node scripts/build_consolidated_act_corpus.mjs <ai_act|machinery|gpsr>
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { parseRecitals } from "./lib/eu_oj_parser.mjs";
import { parseConsolidatedArticles, parseConsolidatedAnnexes } from "./lib/eu_consolidated_parser.mjs";

const ROOT = process.cwd();
const sha = (b) => createHash("sha256").update(b).digest("hex");

const ACTS = {
  ai_act: {
    dir: "docs/ai_act_statutory_corpus",
    original: "source/CELEX_32024R1689_EN.html",
    consolidated: "source/CELEX_02024R1689-20260727_EN.html",
    regulation: "Regulation (EU) 2024/1689",
    shortTitle: "EU AI Act",
    officialJournalReference: "OJ L, 2024/1689, 12.7.2024",
    celex: "32024R1689",
    consolidatedCelex: "02024R1689-20260727",
    eli: "http://data.europa.eu/eli/reg/2024/1689/oj",
    sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R1689",
    consolidatedUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02024R1689-20260727",
    adopted: "2024-06-13",
    instrumentType: "regulation",
    expected: { recitals: 180, articles: 119, annexes: 14, letteredArticles: ["4a", "60a", "75a", "75b", "75c", "75d"] },
    amendmentTrail: [
      {
        act: "Regulation (EU) 2026/1744 (Digital Omnibus on AI)",
        celex: "32026R1744",
        eli: "http://data.europa.eu/eli/reg/2026/1744/oj",
        applicableFrom: "2026-07-27",
        summary:
          "Inserts Arts 4a, 60a, 75a–75d and Annex XIV; replaces Art 75(1) and Art 113(c) — high-risk application moved to 2027-12-02 (Annex III, Art 6(2)) and 2028-08-02 (Annex I embedded, Art 6(1)); adds prohibited practices applying from 2026-12-02.",
      },
    ],
    corrigendaNoted: [
      { id: "32024R1689R(01)", note: "ES, DE, FR, GA, LT, HU, SK, SL, SV only — the English text is not affected." },
      { id: "32024R1689R(02)", note: "NL, SL only." },
      { id: "32024R1689R(03)", note: "CS only." },
      { id: "32024R1689R(04)", note: "ES, NL only." },
    ],
    tags: [["high-risk", "high_risk"], ["provider", "provider"], ["deployer", "deployer"], ["general-purpose", "gpai"], ["cybersecurity", "cybersecurity"], ["transparen", "transparency"]],
  },
  machinery: {
    dir: "docs/machinery_statutory_corpus",
    original: "source/CELEX_32023R1230_EN.html",
    consolidated: "source/CELEX_02023R1230-20260727_EN.html",
    regulation: "Regulation (EU) 2023/1230",
    shortTitle: "Machinery Regulation",
    officialJournalReference: "OJ L 165, 29.6.2023",
    celex: "32023R1230",
    consolidatedCelex: "02023R1230-20260727",
    eli: "http://data.europa.eu/eli/reg/2023/1230/oj",
    sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R1230",
    consolidatedUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02023R1230-20260727",
    adopted: "2023-06-14",
    instrumentType: "regulation",
    expected: { recitals: 86, articles: 59, annexes: 12, letteredArticles: ["25a", "25b", "25c", "25d", "25e"] },
    amendmentTrail: [
      {
        act: "Regulation (EU) 2024/2748 (internal market emergency procedures)",
        celex: "32024R2748",
        eli: "http://data.europa.eu/eli/reg/2024/2748/oj",
        applicableFrom: "2026-05-29",
        summary: "Inserts chapter IVa (Arts 25a–25e, emergency procedures) and Art 3 points 37–38.",
      },
      {
        act: "Regulation (EU) 2026/1744 (Digital Omnibus on AI)",
        celex: "32026R1744",
        eli: "http://data.europa.eu/eli/reg/2026/1744/oj",
        applicableFrom: "2026-07-27",
        summary: "Replaces Art 47(3) and related provisions aligning machinery AI-safety assessment with the amended AI Act timeline.",
      },
    ],
    corrigendaNoted: [
      {
        id: "32023R1230R(01)",
        note: "EN — fourteen date corrections (the 13/14 July → 19/20 July family; Art 54 point (b) 2023→2026). INCORPORATED in the consolidated text this corpus is built from.",
      },
      { id: "32023R1230R(02)", note: "NL only." },
      { id: "32023R1230R(03)", note: "DE, SK only." },
    ],
    tags: [["safety component", "safety_component"], ["cybersecurity", "cybersecurity"], ["corruption", "protection_against_corruption"], ["control system", "control_systems"]],
  },
  red: {
    dir: "docs/red_statutory_corpus",
    original: "source/CELEX_32014L0053_EN.html",
    consolidated: "source/CELEX_02014L0053-20260530_EN.html",
    regulation: "Directive 2014/53/EU",
    shortTitle: "RED",
    officialJournalReference: "OJ L 153, 22.5.2014, p. 62",
    celex: "32014L0053",
    consolidatedCelex: "02014L0053-20260530",
    eli: "http://data.europa.eu/eli/dir/2014/53/oj",
    sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014L0053",
    consolidatedUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02014L0053-20260530",
    adopted: "2014-04-16",
    instrumentType: "directive",
    nationalTranspositionRequired: true,
    expected: { recitals: 75, articles: 58, annexes: 9, letteredArticles: ["3a", "43a", "43b", "43c", "43d", "43e"] },
    amendmentTrail: [
      { act: "Regulation (EU) 2018/1139 (Basic Aviation Regulation)", celex: "32018R1139", eli: "http://data.europa.eu/eli/reg/2018/1139/oj", applicableFrom: "2018-09-11", summary: "Replaces Annex I point 3 (aviation exclusion scope)." },
      { act: "Directive (EU) 2022/2380 (common charger)", celex: "32022L2380", eli: "http://data.europa.eu/eli/dir/2022/2380/oj", applicableFrom: "2022-12-27", summary: "Adds Art 3(4) (charging interoperability), Art 3a and Annex Ia (USB Type-C specifications); replaces Art 3(3)(a), Art 10(8), Art 17(2) and market-surveillance provisions (Arts 40, 43, 44); adds charger information duties to Arts 12 and 13." },
      { act: "Commission Delegated Directive (EU) 2023/1717", celex: "32023R1717", eli: "http://data.europa.eu/eli/dir_del/2023/1717/oj", applicableFrom: "2023-10-01", summary: "Replaces Annex Ia part I points 2.1, 2.2 and 3.1 (USB Power Delivery references)." },
      { act: "Directive (EU) 2024/2749 (internal market emergency procedures)", celex: "32024L2749", eli: "http://data.europa.eu/eli/dir/2024/2749/oj", applicableFrom: "2024-11-28", summary: "Inserts chapter Va (Arts 43a\u201343e, emergency procedures) and Art 2(1) points 27\u201328." },
      { act: "Directive (EU) 2024/2839", celex: "32024L2839", eli: "http://data.europa.eu/eli/dir/2024/2839/oj", applicableFrom: "2024-11-27", summary: "Replaces Art 47(1) (Commission reporting)." },
    ],
    corrigendaNoted: [
      { id: "32014L0053R(01)", note: "DE, BG, SV only \u2014 the English text is not affected." },
      { id: "32014L0053R(02)", note: "SV only." },
      { id: "32014L0053R(03)", note: "FR only." },
    ],
    tags: [["essential requirement", "essential_requirements"], ["radio", "radio"], ["charging", "common_charger"], ["personal data", "privacy"], ["fraud", "fraud"], ["conformity assessment", "conformity_assessment"]],
  },
  gpsr: {
    dir: "docs/gpsr_statutory_corpus",
    original: "source/CELEX_32023R0988_EN.html",
    consolidated: "source/CELEX_02023R0988-20260529_EN.html",
    regulation: "Regulation (EU) 2023/988",
    shortTitle: "General Product Safety Regulation",
    officialJournalReference: "OJ L 135, 23.5.2023",
    celex: "32023R0988",
    consolidatedCelex: "02023R0988-20260529",
    eli: "http://data.europa.eu/eli/reg/2023/988/oj",
    sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R0988",
    consolidatedUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02023R0988-20260529",
    adopted: "2023-05-10",
    instrumentType: "regulation",
    expected: { recitals: 108, articles: 55, annexes: 1, letteredArticles: ["8a", "8b", "8c"] },
    amendmentTrail: [
      {
        act: "Regulation (EU) 2024/2748 (internal market emergency procedures)",
        celex: "32024R2748",
        eli: "http://data.europa.eu/eli/reg/2024/2748/oj",
        applicableFrom: "2026-05-29",
        summary: "Inserts chapter IIa (Arts 8a–8c, emergency procedures), Art 3 points 29–30 and amends Art 2(1).",
      },
    ],
    corrigendaNoted: [
      { id: "32023R0988R(01)", note: "ES, ET, DE, HR, NL, RO, FI only — the English text is not affected." },
      { id: "32023R0988R(02)", note: "PT only." },
      { id: "32023R0988R(03)", note: "ES only." },
      { id: "32023R0988R(04)", note: "ES only." },
    ],
    tags: [["online marketplace", "online_marketplace"], ["recall", "recall"], ["traceability", "traceability"], ["dangerous product", "dangerous_product"]],
  },
};

const actKey = process.argv[2];
const act = ACTS[actKey];
if (!act) {
  console.error(`Usage: node scripts/build_consolidated_act_corpus.mjs <${Object.keys(ACTS).join("|")}>`);
  process.exit(1);
}

const CORPUS = path.join(ROOT, act.dir);
const originalHtml = fs.readFileSync(path.join(CORPUS, act.original), "utf8");
const consolidatedHtml = fs.readFileSync(path.join(CORPUS, act.consolidated), "utf8");

if (!/has no legal effect|documentation tool/i.test(consolidatedHtml)) {
  throw new Error("the consolidated source does not look like a EUR-Lex consolidated text");
}
if (!/Whereas/.test(originalHtml)) {
  throw new Error("the original source has no preamble — recitals must come from the OJ publication");
}

const tagsFor = (text) => act.tags.filter(([kw]) => text.toLowerCase().includes(kw)).map(([, t]) => t);
const numericMax = Math.max(
  ...[...consolidatedHtml.matchAll(/id="art_(\d+)[a-z]*"/g)].map((m) => Number(m[1])),
);

const recitals = parseRecitals(originalHtml, tagsFor, act.expected.recitals, numericMax);
const articles = parseConsolidatedArticles(consolidatedHtml, tagsFor, numericMax);
const annexes = parseConsolidatedAnnexes(consolidatedHtml, tagsFor, numericMax);

const problems = [];
if (recitals.length !== act.expected.recitals) problems.push(`recitals ${recitals.length} != ${act.expected.recitals}`);
if (articles.length !== act.expected.articles) problems.push(`articles ${articles.length} != ${act.expected.articles}`);
if (annexes.length !== act.expected.annexes) problems.push(`annexes ${annexes.length} != ${act.expected.annexes}`);
const lettered = articles.filter((a) => /[a-z]/.test(a.articleNumber)).map((a) => a.articleNumber);
if (lettered.join(",") !== act.expected.letteredArticles.join(",")) {
  problems.push(`lettered articles [${lettered}] != expected [${act.expected.letteredArticles}]`);
}
if (problems.length) throw new Error(`structure pins failed: ${problems.join("; ")}`);

// Group by chapter label in document order.
const chapterList = [];
for (const a of articles) {
  let ch = chapterList.find((c) => c.chapterLabel === a.chapterLabel);
  if (!ch) {
    ch = { chapterNumber: a.chapterNumber, chapterLabel: a.chapterLabel, chapterTitle: a.chapterTitle, articles: [] };
    chapterList.push(ch);
  }
  ch.articles.push(a);
}

const meta = {
  regulation: act.regulation,
  shortTitle: act.shortTitle,
  officialJournalReference: act.officialJournalReference,
  celex: act.celex,
  consolidatedCelex: act.consolidatedCelex,
  eli: act.eli,
  sourceUrl: act.sourceUrl,
  consolidatedUrl: act.consolidatedUrl,
  adopted: act.adopted,
  instrumentType: act.instrumentType,
  nationalTranspositionRequired: act.nationalTranspositionRequired ?? false,
  /**
   * The disclosed departure: articles and annexes are built from the EUR-Lex
   * CONSOLIDATED text (which itself has no legal effect) because the act has
   * been amended in force and no single authentic OJ document carries the
   * current text. Recitals are from the original OJ publication, which no
   * amendment retro-edits.
   */
  textBasis: "consolidated",
  consolidationDate: act.consolidatedCelex.split("-")[1].replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
  amendmentTrail: act.amendmentTrail,
  corrigendaNoted: act.corrigendaNoted,
  builtFrom: {
    original: { file: act.original, sha256: sha(fs.readFileSync(path.join(CORPUS, act.original))) },
    consolidated: { file: act.consolidated, sha256: sha(fs.readFileSync(path.join(CORPUS, act.consolidated))) },
  },
  sourceSha256: sha(fs.readFileSync(path.join(CORPUS, act.consolidated))),
  recitalsCount: recitals.length,
  chaptersCount: chapterList.length,
  totalArticles: articles.length,
  annexesCount: annexes.length,
};

fs.writeFileSync(path.join(CORPUS, "01_recitals_full.json"), JSON.stringify({ ...meta, recitals }, null, 2) + "\n");
fs.writeFileSync(path.join(CORPUS, "02_articles_full.json"), JSON.stringify({ ...meta, chapters: chapterList }, null, 2) + "\n");
fs.writeFileSync(path.join(CORPUS, "03_annexes_full.json"), JSON.stringify({ ...meta, annexes }, null, 2) + "\n");
console.log(
  `${act.shortTitle} (as amended, consolidated ${meta.consolidationDate}): recitals ${recitals.length} · chapters ${chapterList.length} · articles ${articles.length} (${lettered.join(",") || "no"} inserted) · annexes ${annexes.length} → ${act.dir}`,
);
