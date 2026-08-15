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
/**
 * Every surface that cites the CRA to a human, not just application code.
 * Blogs, podcast scripts and FAQs are published material: a wrong article
 * number there misleads a reader exactly as a wrong number in the UI does.
 */
const SCAN_DIRS = [
  "artifacts/conformity/src",
  "artifacts/oxot-web/src",
  "artifacts/api-server/src",
  "docs",
];
const EXT = new Set([".ts", ".tsx", ".md", ".mdx"]);
// The corpus and its cached source are the reference, not a citation site.
// docs/cra-personas records historical wrong numbers on purpose, as lessons.
const SKIP = /node_modules|\/dist\/|craCorpusData\.ts|cra_statutory_corpus|docs\/cra-personas/;

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
/**
 * Concept -> the article(s) that actually govern it.
 *
 * `articles` may hold MORE THAN ONE, because the regulation genuinely splits
 * some concepts. Substantial modification is the clearest case: Art. 21 covers
 * an importer or distributor who modifies, Art. 22 covers any other person.
 * Treating 21 as wrong there was a defect in this table and would have turned
 * correct citations into incorrect ones.
 *
 * `wrong` lists numbers this codebase has historically used that are not
 * governing for the concept, so the error message can say what happened.
 * A line is flagged only when it cites a `wrong` number and cites none of the
 * `articles`.
 */
const CONCEPTS = [
  { id: "manufacturer obligations", articles: [13], wrong: [10], re: /obligations of manufacturers|manufacturer obligations/i },
  { id: "reporting obligations", articles: [14], wrong: [], re: /reporting obligations|24[- ]?h(?:our)? early warning|early warning/i },
  { id: "authorised representative", articles: [18], wrong: [12], re: /authoris(?:ed|ed) representative/i },
  { id: "importer obligations", articles: [19], wrong: [17], re: /obligations of importers|importer obligations/i },
  { id: "distributor obligations", articles: [20], wrong: [18], re: /obligations of distributors|distributor obligations|duty to refrain/i },
  // Art. 21 (importer/distributor) and Art. 22 (any other person) both apply.
  { id: "substantial modification", articles: [21, 22], wrong: [20], re: /substantial(?:ly)? modif/i },
  { id: "identification of economic operators", articles: [23], wrong: [21], re: /identification of economic operators/i },
  { id: "open-source steward obligations", articles: [24], wrong: [16, 33], re: /open[- ]source software steward|steward obligations/i },
  { id: "presumption of conformity", articles: [27], wrong: [24, 34], re: /presumption of conformity/i },
  { id: "EU declaration of conformity", articles: [28], wrong: [22], re: /EU declaration of conformity/i },
  // Art. 29 general principles, Art. 30 rules for affixing — both govern CE marking.
  { id: "CE marking", articles: [29, 30], wrong: [22, 23], re: /CE marking/i },
  { id: "technical documentation", articles: [31], wrong: [27], re: /technical documentation/i },
  { id: "conformity assessment procedures", articles: [32], wrong: [28], re: /conformity assessment procedure/i },
  { id: "penalties", articles: [64], wrong: [61], re: /penalt(?:y|ies)|administrative fine|\bfines?\b/i },
];

if (process.argv.includes("--map")) {
  for (const c of CONCEPTS) {
    console.log(`  ${c.articles.join("/").padStart(5)} — ${c.id}  (flags: ${c.wrong.join(", ") || "—"})`);
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

/**
 * A whole file can be about another instrument. `ai-act.md` cites the AI Act's
 * Articles 99 and 101 for penalties — correct there, and nothing on those lines
 * says "AI Act", so line-level context is not enough. Checking article numbers
 * from such a file against the CRA produced 13 false positives that, if
 * "fixed", would have turned correct citations into wrong ones.
 */
const FILE_IS_ANOTHER_INSTRUMENT = [
  { re: /ai[-_]act/i, name: "EU AI Act" },
  { re: /machinery/i, name: "Machinery Regulation" },
  { re: /\bnis2\b/i, name: "NIS2 Directive" },
  { re: /\bgdpr\b/i, name: "GDPR" },
  { re: /\bdora\b/i, name: "DORA" },
  { re: /\bgpsr\b/i, name: "GPSR" },
  { re: /\bcer\b/i, name: "CER Directive" },
  { re: /data[-_]act/i, name: "Data Act" },
  { re: /radio[-_]equipment|\bred\b/i, name: "Radio Equipment Directive" },
];

/** Which instrument is this file about, judged by its path? */
function otherInstrumentFor(relPath) {
  const base = relPath.split("/").pop() ?? relPath;
  for (const i of FILE_IS_ANOTHER_INSTRUMENT) if (i.re.test(base)) return i.name;
  return null;
}

const violations = [];
const waived = [];
const skippedFiles = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const relFile = path.relative(ROOT, file);
    const other = otherInstrumentFor(relFile);
    if (other) {
      skippedFiles.push({ file: relFile, instrument: other });
      continue;
    }
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
        // Citing any governing article is correct — do not flag.
        if (c.articles.some((n) => cited.includes(n))) continue;
        const wrong = cited.filter((n) => c.wrong.includes(n));
        if (wrong.length) {
          const govern = c.articles.map((n) => `Article ${n} (${titles.get(n)})`).join(" or ");
          record("concept", `"${c.id}" is governed by ${govern}, not Article ${wrong.join("/")}.`);
        }
      }
    }
  }
}

/**
 * Baseline ratchet. These gates start red on a codebase that predates them, and
 * a permanently-red CI is one everybody learns to ignore. `--baseline <n>` fails
 * only when the count EXCEEDS n, so new defects are blocked immediately while the
 * known backlog is burned down. The number must only ever go down.
 */
const baselineArg = process.argv.indexOf("--baseline");
const BASELINE = baselineArg !== -1 ? Number(process.argv[baselineArg + 1]) : 0;

if (skippedFiles.length) {
  console.log(`\n${skippedFiles.length} file(s) skipped as being about another instrument:`);
  for (const f of skippedFiles.slice(0, 10)) console.log(`  ${f.file} — ${f.instrument}`);
}

if (waived.length) {
  console.log(`\n${waived.length} waived:`);
  for (const w of waived) console.log(`  ${w.file}:${w.line} [${w.kind}] — ${w.reason}`);
}

if (violations.length > BASELINE) {
  console.error(
    `\nCITATION GATE FAILED — ${violations.length} citation(s) contradict the corpus, baseline ${BASELINE}:\n`,
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.kind}]`);
    console.error(`    ${v.msg}`);
    console.error(`    code: ${v.text}`);
    console.error(`    fix : correct the number, or add "citation-ok: <reason>" if it cites another instrument.\n`);
  }
  process.exit(1);
}

if (violations.length) {
  console.log(
    `\nCitation gate: ${violations.length} known finding(s), at or under baseline ${BASELINE}. Not failing.`,
  );
  for (const v of violations) console.log(`  ${v.file}:${v.line} [${v.kind}]`);
} else {
  console.log(`Citation gate passed — all CRA article citations resolve against the corpus (1..${MAX}).`);
}
