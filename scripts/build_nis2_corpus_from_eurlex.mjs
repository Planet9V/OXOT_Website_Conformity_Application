/**
 * Build the NIS2 statutory corpus from the Official Journal text.
 *
 * Source: Directive (EU) 2022/2555, OJ L 333, 27.12.2022, p. 80
 *         (CELEX 32022L2555) — the AUTHENTIC text.
 *
 * Deliberately not the consolidated version (02022L2555-...). Consolidated
 * texts carry the Publications Office disclaimer that they are "meant purely as
 * a documentation tool and have no legal effect", and they OMIT the preamble
 * entirely. NIS2's 144 recitals carry real interpretive weight — the CRA's
 * Recitals 34, 38, 39, 42 and 64 are what settled the substantial-modification
 * analysis in this programme, and NIS2 is no different.
 *
 * And deliberately not any secondary site. A guard built on a non-authoritative
 * text is worse than no guard, because it lends a verifier's authority to
 * whatever the aggregator got wrong. That failure is why this programme exists.
 *
 * ── One thing NIS2 changes about how the output may be used ──────────────────
 * The CRA is a Regulation: directly applicable, one text, identical in every
 * Member State. NIS2 is a DIRECTIVE. It binds Member States, and what binds an
 * entity is the national transposition. This corpus is therefore authoritative
 * for what the DIRECTIVE says, and says nothing about what any given entity
 * must do. Anything built on it must state that distinction plainly.
 */
import fs from "node:fs";
import path from "node:path";
import {
  textOf,
  parseRecitals,
  parseChapters,
  parseArticles,
  parseAnnexes,
} from "./lib/eu_oj_parser.mjs";

const ROOT = process.cwd();
const CORPUS_DIR = path.join(ROOT, "docs/nis2_statutory_corpus");
const SOURCE_FILE = path.join(CORPUS_DIR, "source/CELEX_32022L2555_EN.html");
const SOURCE_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022L2555";

const DIRECTIVE = {
  directive: "Directive (EU) 2022/2555",
  shortTitle: "NIS2 Directive",
  officialJournalReference: "OJ L 333, 27.12.2022, p. 80",
  celex: "32022L2555",
  eli: "http://data.europa.eu/eli/dir/2022/2555/oj",
  sourceUrl: SOURCE_URL,
  adopted: "2022-12-14",
  entryIntoForce: "2023-01-16",
  /** Art. 41: Member States had to transpose by this date. */
  transpositionDeadline: "2024-10-17",
  /**
   * The distinction that governs every use of this corpus.
   */
  instrumentType: "directive",
  nationalTranspositionRequired: true,
  /**
   * Checked on 2026-08-15 by probing CELEX 32022L2555R(01)/R(02) and by
   * scanning the authentic source for "corrigendum" — neither found one. The
   * EUR-Lex record page was unreachable at the time (bot challenge), so this is
   * NOT a verified absence. Re-check before relying on it. The CRA had a
   * corrigendum (OJ L 2025/90555) that changed the meaning of Art. 64(10).
   */
  corrigenda: [],
  corrigendaVerified: false,
};

/** Structure of the Directive, asserted so a silent parse failure cannot pass. */
const EXPECTED = {
  recitals: 144,
  chapters: 9,
  articles: 46,
  annexes: ["I", "II", "III"],
};

/**
 * NIS2's tag vocabulary. Different from the CRA's: this Directive is about
 * entities and their governance, not products and their conformity.
 */
const KEYWORDS = [
  [/risk[- ]management measure|cybersecurity risk-management/i, "risk_management"],
  [/incident|significant incident|early warning/i, "incident_reporting"],
  [/CSIRT|computer security incident response/i, "csirt"],
  [/supply chain|supplier/i, "supply_chain"],
  [/management bod(y|ies)|governance|accountab/i, "governance"],
  [/essential entit|important entit/i, "entity_classification"],
  [/supervis|enforcement|penalt|administrative fine/i, "supervision_enforcement"],
  [/registr|register of entities/i, "registration"],
  [/vulnerabilit|coordinated vulnerability disclosure/i, "vulnerability_handling"],
  [/business continuity|crisis management/i, "continuity"],
  [/encryption|cryptograph/i, "cryptography"],
  [/jurisdiction|territorial/i, "jurisdiction"],
  [/cooperation group|peer review|CyCLONe/i, "cooperation"],
];

function tagsFor(text) {
  const tags = [];
  for (const [re, tag] of KEYWORDS) if (re.test(text)) tags.push(tag);
  return [...new Set(tags)];
}

function loadSource() {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(
      `Missing source: ${path.relative(ROOT, SOURCE_FILE)}\n\n` +
        `Fetch the AUTHENTIC text (not the consolidated version):\n` +
        `  curl -sL -A "Mozilla/5.0" "${SOURCE_URL}" -o "${path.relative(ROOT, SOURCE_FILE)}"\n`,
    );
    process.exit(1);
  }
  const html = fs.readFileSync(SOURCE_FILE, "utf8");
  // Refuse a consolidated text outright — it has no preamble and no legal effect.
  if (/has no legal effect|meant purely as a documentation tool/i.test(html)) {
    console.error(
      "Source is a CONSOLIDATED text: it has no legal effect and omits the preamble.\n" +
        "Fetch CELEX:32022L2555 (the authentic OJ text) instead.",
    );
    process.exit(1);
  }
  if (!/Whereas/.test(html)) {
    console.error("Source has no preamble — recitals would be lost. Refusing to build.");
    process.exit(1);
  }
  return html;
}

function assertStructure(recitals, chapters, articles, annexes) {
  const problems = [];
  if (recitals.length !== EXPECTED.recitals)
    problems.push(`recitals: got ${recitals.length}, expected ${EXPECTED.recitals}`);
  if (chapters.length !== EXPECTED.chapters)
    problems.push(`chapters: got ${chapters.length}, expected ${EXPECTED.chapters}`);
  if (articles.length !== EXPECTED.articles)
    problems.push(`articles: got ${articles.length}, expected ${EXPECTED.articles}`);
  if (annexes.length !== EXPECTED.annexes.length)
    problems.push(`annexes: got ${annexes.length}, expected ${EXPECTED.annexes.length}`);
  const empty = articles.filter((a) => !a.paragraphs.length).map((a) => a.articleNumber);
  if (empty.length) problems.push(`articles parsed with no text: ${empty.join(", ")}`);
  if (problems.length) {
    console.error("Parse does not match the expected structure:\n  " + problems.join("\n  "));
    process.exit(1);
  }
}

function main() {
  const html = loadSource();

  const recitals = parseRecitals(html, tagsFor, EXPECTED.recitals, EXPECTED.articles);
  const chapters = parseChapters(html);
  const articles = parseArticles(html, chapters, tagsFor, EXPECTED.articles);
  const annexes = parseAnnexes(html, EXPECTED.annexes, tagsFor, EXPECTED.articles);

  assertStructure(recitals, chapters, articles, annexes);

  const meta = {
    ...DIRECTIVE,
    builtFrom: path.relative(ROOT, SOURCE_FILE),
    recitalsCount: recitals.length,
    chaptersCount: chapters.length,
    totalArticles: articles.length,
    annexesCount: annexes.length,
  };

  fs.mkdirSync(CORPUS_DIR, { recursive: true });
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

  console.log(
    `Recitals ${recitals.length} · Chapters ${chapters.length} · ` +
      `Articles ${articles.length} · Annexes ${annexes.length}`,
  );
  console.log(`Wrote JSON to ${path.relative(ROOT, CORPUS_DIR)}`);
  console.log(
    "\nNIS2 is a DIRECTIVE. This corpus is authoritative for what the Directive\n" +
      "says; national transposition governs what any entity must actually do.",
  );
}

main();
