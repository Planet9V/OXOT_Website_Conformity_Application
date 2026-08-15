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
 * Multi-act. Each act brings its own corpus, article range and concept table.
 * Attribution decides which act a citation belongs to, because the same number
 * means different things in different instruments: Article 21 is the deemed
 * manufacturer in the CRA and cybersecurity risk-management measures in NIS2.
 *
 * Usage: node scripts/check_citations.mjs [--map] [--act cra|nis2]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

/**
 * Every surface that cites a regulation to a human, not just application code.
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
// Corpora and their cached sources are the reference, not citation sites.
// docs/cra-personas records historical wrong numbers on purpose, as lessons.
const SKIP =
  /node_modules|\/dist\/|craCorpusData\.ts|cra_statutory_corpus|nis2_statutory_corpus|docs\/cra-personas/;

/** Load an act's article titles from its grounded corpus. */
function loadCorpus(relPath, actKey) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) {
    console.error(`Corpus for "${actKey}" not found at ${relPath}.`);
    console.error(`Run the corresponding build_*_corpus_from_eurlex.mjs first.`);
    process.exit(1);
  }
  const corpus = JSON.parse(fs.readFileSync(abs, "utf8"));
  const titles = new Map();
  for (const c of corpus.chapters) for (const a of c.articles) titles.set(a.articleNumber, a.title);
  return titles;
}

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
const CRA_CONCEPTS = [
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
  // Retention is actor-specific: manufacturer 13(13)/13(18), authorised rep
  // 18(3), importer 19(6), economic-operator traceability 23(2). Art. 10 and
  // Art. 17 are the draft-numbering errors this catches.
  {
    id: "record retention",
    articles: [13, 18, 19, 23],
    wrong: [10, 17],
    re: /retention|retain(?:ed|ing)?\b|keep (?:a copy|the|it) .{0,60}at the disposal|at the disposal of .{0,60}authorit/i,
  },
];

/**
 * NIS2 concepts, grounded in the article titles of the built corpus.
 *
 * `wrong` is empty for every entry, deliberately. The CRA's wrong-number lists
 * are a record of errors this codebase actually made over two years; NIS2 has
 * never been checked here, so there is no such history to encode. Inventing
 * plausible wrong numbers would flag citations nobody has miscited yet and
 * teach people to ignore the gate. Entries earn a `wrong` list when a real
 * miscitation is found.
 *
 * This means NIS2 concept checking is currently INERT: only the range check
 * bites for NIS2 until real miscitations are observed and recorded here. That is
 * stated rather than hidden, because a table that looks like coverage and is not
 * is worse than an empty one.
 *
 * A cross-concept rule was tried — flag a line naming concept A while citing an
 * article this table assigns to concept B — and REMOVED. It fired on
 * "the ten Article 21 measures, 24/72-hour...", a correct Article 21 citation on
 * a line that also mentions reporting. Prose routinely spans two concepts and
 * cites one. A gate that flags correct citations teaches people to "fix" them
 * into wrong ones, which is the 44-false-positive lesson (lessons.md, L25).
 */
const NIS2_CONCEPTS = [
  { id: "scope", articles: [2], wrong: [], re: /scope of (?:this|the) directive/i },
  { id: "essential and important entities", articles: [3], wrong: [], re: /essential (?:and|or) important entit|important entit(?:y|ies)|essential entit(?:y|ies)/i },
  { id: "CSIRT tasks", articles: [11], wrong: [], re: /tasks of (?:the )?CSIRTs?|CSIRT (?:requirements|capabilities)/i },
  { id: "coordinated vulnerability disclosure", articles: [12], wrong: [], re: /coordinated vulnerability disclosure|european vulnerability database/i },
  { id: "Cooperation Group", articles: [14], wrong: [], re: /cooperation group/i },
  { id: "CSIRTs network", articles: [15], wrong: [], re: /CSIRTs network/i },
  { id: "EU-CyCLONe", articles: [16], wrong: [], re: /CyCLONe|cyber crisis liaison organisation/i },
  { id: "peer reviews", articles: [19], wrong: [], re: /peer review/i },
  { id: "governance", articles: [20], wrong: [], re: /management bod(?:y|ies)|governance obligations/i },
  { id: "risk-management measures", articles: [21], wrong: [], re: /cybersecurity risk[- ]management measures|risk[- ]management measures/i },
  { id: "supply chain risk assessments", articles: [22], wrong: [], re: /coordinated security risk assessments|critical supply chains/i },
  { id: "reporting obligations", articles: [23], wrong: [], re: /reporting obligations|significant incident|early warning|72[- ]?h(?:our)?/i },
  { id: "certification schemes", articles: [24], wrong: [], re: /european cybersecurity certification scheme/i },
  { id: "jurisdiction", articles: [26], wrong: [], re: /jurisdiction and territorial|main establishment/i },
  { id: "registry of entities", articles: [27], wrong: [], re: /registry of entities/i },
  { id: "supervision of essential entities", articles: [32], wrong: [], re: /supervis\w* .{0,40}essential entit/i },
  { id: "supervision of important entities", articles: [33], wrong: [], re: /supervis\w* .{0,40}important entit/i },
  { id: "administrative fines", articles: [34], wrong: [], re: /administrative fine/i },
  { id: "penalties", articles: [36], wrong: [], re: /\bpenalt(?:y|ies)\b/i },
  { id: "transposition", articles: [41], wrong: [], re: /transposition|transpose/i },
];

/**
 * The acts this gate knows about.
 *
 * `names` is what marks a citation as belonging to this act when a line is
 * ambiguous. It matters because the same number means different things:
 * Article 21 is the deemed manufacturer in the CRA and cybersecurity
 * risk-management measures in NIS2, and Article 34 is mutual recognition in the
 * CRA and administrative fines in NIS2.
 */
const ACTS = {
  cra: {
    label: "Regulation (EU) 2024/2847 (CRA)",
    corpus: "docs/cra_statutory_corpus/02_articles_full.json",
    names: /2024\/2847|\bCRA\b|Cyber Resilience Act/i,
    concepts: CRA_CONCEPTS,
    /** Only the CRA has a paragraph-level rule so far. */
    paragraphRule: true,
  },
  nis2: {
    label: "Directive (EU) 2022/2555 (NIS2)",
    corpus: "docs/nis2_statutory_corpus/02_articles_full.json",
    names: /2022\/2555|\bNIS ?2\b|NIS2 Directive|network and information systems/i,
    concepts: NIS2_CONCEPTS,
    paragraphRule: false,
  },
};

for (const [key, act] of Object.entries(ACTS)) {
  act.key = key;
  act.titles = loadCorpus(act.corpus, key);
  act.maxArticle = Math.max(...act.titles.keys());
}

/**
 * Which paragraphs of Article 13 actually impose a retention duty. The concept
 * table above only reads article numbers, so it cannot catch "Article 13(4)" or
 * "Article 13(14)" — right article, wrong paragraph. Both were live in this
 * codebase, so retention gets a paragraph-level rule of its own.
 */
const ART13_RETENTION_PARAGRAPHS = [9, 13, 18];
const ART13_PARA = /\bArt(?:icle|\.)\s*13\s*\((\d{1,2})\)/gi;

/**
 * The rule fires only where a retention DURATION is stated. Bare "retain" is too
 * loose: Art. 13(2) is cited correctly for the risk assessment on lines that
 * happen to contain the word, and flagging those invites "fixing" a correct
 * citation into a wrong one — the same trap that produced 44 false positives
 * when the concept table over-matched substantial modification.
 */
const RETENTION_DURATION = /\b(?:10|ten)[- ]years?\b|retention (?:period|vault|mandate|expiry|until)|statutory retention/i;

if (process.argv.includes("--map")) {
  for (const act of Object.values(ACTS)) {
    console.log(`\n${act.label} — articles 1..${act.maxArticle}`);
    for (const c of act.concepts) {
      console.log(`  ${c.articles.join("/").padStart(6)} — ${c.id}  (flags: ${c.wrong.join(", ") || "—"})`);
    }
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
/**
 * Instruments that HAVE articles, and can therefore be the referent of an
 * "Article N" citation. Standards bodies are deliberately excluded: IEC, ETSI
 * and ISO documents have clauses and requirements, never Articles. Treating a
 * mention of "IEC 62443" as evidence that "Article 61" belongs to another
 * instrument suppressed a real error — the CRA's penalties are Article 64, and
 * the line claiming Article 61 went unflagged because it also mentioned IEC.
 */
const OTHER_INSTRUMENT = /NIS2|2022\/2555|2019\/1020|2019\/881|765\/2008|1182\/71|GDPR|2016\/679|AI Act|2024\/1689|Machinery Regulation|2023\/1230|RED\b|2014\/53|\bMDR\b|2017\/745|\bIVDR\b|2017\/746|\bDORA\b|2022\/2554|\bCER\b|2022\/2557|\bGPSR\b|2023\/988|Data Act|2023\/2854/i;
/**
 * How close another instrument's name must be to a citation to be taken as its
 * referent. "Article 21 of NIS2" attributes; a passing mention 200 characters
 * away in the same sentence does not.
 */
const ATTRIBUTION_WINDOW = 60;

/** Is this specific citation plausibly attributed to another instrument? */
function attributedElsewhere(line, matchIndex, namesThisAct) {
  if (namesThisAct.test(line)) return false;
  const from = Math.max(0, matchIndex - ATTRIBUTION_WINDOW);
  const to = Math.min(line.length, matchIndex + ATTRIBUTION_WINDOW);
  const near = line.slice(from, to);
  // NIS2 appears in OTHER_INSTRUMENT, so when we ARE checking NIS2 a nearby
  // "NIS2" must not disqualify the citation — it confirms it.
  if (namesThisAct.test(near)) return false;
  return OTHER_INSTRUMENT.test(near);
}

/**
 * A whole file can be about another instrument. `ai-act.md` cites the AI Act's
 * Articles 99 and 101 for penalties — correct there, and nothing on those lines
 * says "AI Act", so line-level context is not enough. Checking article numbers
 * from such a file against the CRA produced 13 false positives that, if
 * "fixed", would have turned correct citations into wrong ones.
 */
/**
 * A whole file can be about one instrument. Where we HAVE a corpus for that
 * instrument, the file is now checked against it instead of being skipped —
 * that is the point of going multi-act. nis2.md was previously skipped
 * wholesale, so every article number in it was unverified.
 *
 * Where we do NOT yet have a corpus, the file is still skipped, because
 * checking an AI Act article number against the CRA's range would flag correct
 * citations as wrong.
 */
const FILE_ACT = [
  { re: /\bnis2\b/i, act: "nis2" },
  { re: /ai[-_]act/i, act: null, name: "EU AI Act" },
  { re: /machinery/i, act: null, name: "Machinery Regulation" },
  { re: /\bgdpr\b/i, act: null, name: "GDPR" },
  { re: /\bdora\b/i, act: null, name: "DORA" },
  { re: /\bgpsr\b/i, act: null, name: "GPSR" },
  { re: /\bcer\b/i, act: null, name: "CER Directive" },
  { re: /data[-_]act/i, act: null, name: "Data Act" },
  { re: /radio[-_]equipment|\bred\b/i, act: null, name: "Radio Equipment Directive" },
];

/**
 * The verbatim source material the corpora are built and verified from. These
 * files quote EUR-Lex and the Commission FAQ exactly; every article number in
 * them is correct by definition, and "correcting" one would corrupt the very
 * thing every other citation is checked against. Never scan the source of truth.
 */
const SOURCE_OF_TRUTH = /^docs\/(cra_sources|cra_statutory_corpus|nis2_statutory_corpus)\//;

/**
 * Which act does this file default to? Returns the act, or a skip reason.
 * Files with no instrument in their name default to the CRA, which is what this
 * codebase is mostly about.
 */
function actForFile(relPath) {
  const base = relPath.split("/").pop() ?? relPath;
  for (const f of FILE_ACT) {
    if (!f.re.test(base)) continue;
    return f.act ? { act: ACTS[f.act] } : { skip: f.name };
  }
  return { act: ACTS.cra };
}

const violations = [];
const waived = [];
const skippedFiles = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const relFile = path.relative(ROOT, file);
    if (SOURCE_OF_TRUTH.test(relFile)) {
      skippedFiles.push({ file: relFile, instrument: "the CRA source of truth — verbatim, never edited" });
      continue;
    }
    const { act, skip } = actForFile(relFile);
    const other = skip;
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
      // Each citation is judged on its own attribution, not the whole line's.
      const citations = [...line.matchAll(CITE)]
        .map((m) => ({ n: Number(m[1]), index: m.index ?? 0 }))
        .filter((c) => !attributedElsewhere(line, c.index, act.names));
      const cited = citations.map((c) => c.n);
      if (!cited.length) continue;

      const record = (kind, msg) => {
        if (waiver) waived.push({ file: rel, line: i + 1, kind, reason: waiver[1].trim() });
        else violations.push({ file: rel, line: i + 1, kind, msg, text: line.trim().slice(0, 140) });
      };

      // 1. Range — `cited` already excludes citations attributed elsewhere.
      for (const n of cited) {
        if (n < 1 || n > act.maxArticle) {
          record("range", `Article ${n} does not exist — ${act.label} has ${act.maxArticle} articles.`);
        }
      }

      /**
       * 2. Concept contradiction.
       *
       * A line naming another instrument is normally ambiguous — "Article 21"
       * next to "NIS2" probably means NIS2's Article 21 — so such lines are
       * skipped. But the escape hatch was too broad: it fired on ANY mention of
       * another instrument or standard, so a line reading "Article 61
       * administrative fines ... and NIS2 supply chain synergy" was skipped
       * wholesale, hiding a real CRA error (penalties are Article 64). The word
       * "IEC" did the same for another.
       *
       * If the line explicitly names the CRA, the CRA is in play and the
       * citation must be right, whatever else is mentioned alongside it.
       */
      if (!cited.length) continue;
      for (const c of act.concepts) {
        if (!c.re.test(line)) continue;
        // Citing any governing article is correct — do not flag.
        if (c.articles.some((n) => cited.includes(n))) continue;
        const govern = c.articles.map((n) => `Article ${n} (${act.titles.get(n)})`).join(" or ");
        const wrong = cited.filter((n) => c.wrong.includes(n));
        if (wrong.length) {
          record("concept", `"${c.id}" is governed by ${govern}, not Article ${wrong.join("/")}.`);
        }

      }

      // 3. Right article, wrong paragraph — Article 13 retention only.
      if (act.paragraphRule && RETENTION_DURATION.test(line)) {
        for (const m of line.matchAll(ART13_PARA)) {
          const para = Number(m[1]);
          if (!ART13_RETENTION_PARAGRAPHS.includes(para)) {
            record(
              "paragraph",
              `Article 13(${para}) does not impose a retention duty — retention is 13(9) for security updates, 13(13) for the technical documentation and DoC, 13(18) for the Annex II user information.`,
            );
          }
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
  console.log(
    `Citation gate passed — every citation resolves against its act's corpus ` +
      `(${Object.values(ACTS).map((a) => `${a.key} 1..${a.maxArticle}`).join(", ")}).`,
  );
}
