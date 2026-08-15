/**
 * Citation gate (task_plan gate G5).
 *
 * Every article number written in source must resolve against the grounded
 * corpus, and must not contradict it. Roughly 45 of 71 article numbers in this
 * codebase were invented before 2026-08-14; this stops them coming back
 * (docs/cra-personas/lessons.md, L6).
 *
 * Two checks:
 *   1. Range — an "Article N" citation with N outside 1..71 cannot be the CRA.
 *   2. Concept — if a line names a concept whose real article is known, and
 *      cites a different article, that is a contradiction of the corpus.
 *
 * Waiver: append "citation-ok: <reason>" to the line or the line above.
 * Use it for citations to *other* instruments (NIS2, Reg. 2019/1020, etc.).
 *
 * Usage: node scripts/check_citations.mjs [--map]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CORPUS = path.join(ROOT, "docs/cra_statutory_corpus/02_articles_full.json");
const SCAN_DIRS = [
  "artifacts/conformity/src",
  "artifacts/oxot-web/src",
  "artifacts/api-server/src",
];
const EXT = new Set([".ts", ".tsx"]);
const SKIP = /node_modules|\/dist\/|craCorpusData\.ts/;

if (!fs.existsSync(CORPUS)) {
  console.error(`Corpus not found at ${path.relative(ROOT, CORPUS)}.`);
  console.error("Run: node scripts/build_cra_corpus_from_eurlex.mjs");
  process.exit(1);
}

const corpus = JSON.parse(fs.readFileSync(CORPUS, "utf8"));
const titles = new Map();
for (const c of corpus.chapters) for (const a of c.articles) titles.set(a.articleNumber, a.title);
const MAX = Math.max(...titles.keys());

/**
 * Concept → the article that actually governs it, per the corpus titles above.
 * Each entry lists the wrong numbers this codebase has historically used, so the
 * error message can say precisely what happened.
 */
const CONCEPTS = [
  { id: "manufacturer obligations", article: 13, formerly: [10], re: /obligations of manufacturers|manufacturer obligations/i },
  { id: "reporting obligations", article: 14, formerly: [], re: /reporting obligations|24[- ]?h(?:our)? early warning|early warning/i },
  { id: "authorised representative", article: 18, formerly: [12], re: /authoris(?:ed|ed) representative/i },
  { id: "importer obligations", article: 19, formerly: [17], re: /obligations of importers|importer obligations/i },
  { id: "distributor obligations", article: 20, formerly: [18], re: /obligations of distributors|distributor obligations|duty to refrain/i },
  { id: "substantial modification", article: 22, formerly: [20, 21], re: /substantial(?:ly)? modif/i },
  { id: "identification of economic operators", article: 23, formerly: [21], re: /identification of economic operators/i },
  { id: "open-source steward obligations", article: 24, formerly: [16, 33], re: /open[- ]source software steward|steward obligations/i },
  { id: "EU declaration of conformity", article: 28, formerly: [22], re: /EU declaration of conformity/i },
  { id: "CE marking", article: 29, formerly: [22, 23], re: /CE marking/i },
  { id: "presumption of conformity", article: 27, formerly: [24, 34], re: /presumption of conformity/i },
  { id: "technical documentation", article: 31, formerly: [27], re: /technical documentation/i },
  { id: "conformity assessment procedures", article: 32, formerly: [28], re: /conformity assessment procedure/i },
  { id: "penalties", article: 64, formerly: [61], re: /penalt(?:y|ies)|administrative fine/i },
];

if (process.argv.includes("--map")) {
  for (const c of CONCEPTS) {
    console.log(`  ${String(c.article).padStart(2)} — ${c.id}  (was: ${c.formerly.join(", ") || "—"})`);
  }
  process.exit(0);
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (SKIP.test(p)) continue;
    if (e.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(p))) out.push(p);
  }
  return out;
}

const CITE = /\bArt(?:icle|\.)\s*(\d{1,3})\b/gi;
const WAIVER = /citation-ok:\s*(.+)$/;
// Other instruments cited by article number — not CRA articles.
const OTHER_INSTRUMENT = /NIS2|2022\/2555|2019\/1020|2019\/881|765\/2008|1182\/71|IEC|ETSI|ISO|GDPR|2016\/679|AI Act|2024\/1689/i;

const violations = [];
const waived = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const lines = fs.readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const here = WAIVER.exec(line);
      const above = i > 0 ? WAIVER.exec(lines[i - 1]) : null;
      const waiver = here || above;
      const rel = path.relative(ROOT, file);
      const cited = [...line.matchAll(CITE)].map((m) => Number(m[1]));
      if (!cited.length) continue;

      const record = (kind, msg) => {
        if (waiver) waived.push({ file: rel, line: i + 1, kind, reason: waiver[1].trim() });
        else violations.push({ file: rel, line: i + 1, kind, msg, text: line.trim().slice(0, 140) });
      };

      // 1. Range
      for (const n of cited) {
        if ((n < 1 || n > MAX) && !OTHER_INSTRUMENT.test(line)) {
          record("range", `Article ${n} does not exist — the CRA has ${MAX} articles.`);
        }
      }

      // 2. Concept contradiction
      if (OTHER_INSTRUMENT.test(line)) continue;
      for (const c of CONCEPTS) {
        if (!c.re.test(line)) continue;
        if (cited.includes(c.article)) continue;
        const wrong = cited.filter((n) => c.formerly.includes(n));
        if (wrong.length) {
          record(
            "concept",
            `"${c.id}" is Article ${c.article} (${titles.get(c.article)}), not Article ${wrong.join("/")}.`
          );
        }
      }
    }
  }
}

if (waived.length) {
  console.log(`\n${waived.length} waived:`);
  for (const w of waived) console.log(`  ${w.file}:${w.line} [${w.kind}] — ${w.reason}`);
}

if (violations.length) {
  console.error(`\nCITATION GATE FAILED — ${violations.length} citation(s) contradict the corpus:\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.kind}]`);
    console.error(`    ${v.msg}`);
    console.error(`    code: ${v.text}`);
    console.error(`    fix : correct the number, or add "citation-ok: <reason>" if it cites another instrument.\n`);
  }
  process.exit(1);
}

console.log(`Citation gate passed — all CRA article citations resolve against the corpus (1..${MAX}).`);
