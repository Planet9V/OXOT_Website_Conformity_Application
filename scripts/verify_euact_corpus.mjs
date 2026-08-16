/**
 * THE source-of-truth check for the Phase-10 act corpora (task 10.3):
 * AI Act, Machinery Regulation, RED. Same contract and the same three
 * states as verify_cra_corpus.mjs / verify_nis2_corpus.mjs:
 *
 *   PASS  verified
 *   FAIL  contradicted — the corpus does not match the published text
 *   ----  COULD NOT VERIFY (offline, blocked, unavailable)
 *
 * "----" is never counted as success. Corrigenda absence CANNOT be proven
 * by scraping (the method failed the CRA's positive control), so B1 states
 * that instead of passing vacuously.
 *
 * Usage: node scripts/verify_euact_corpus.mjs <ai_act|machinery|red> [--offline]
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();

const ACTS = {
  ai_act: {
    dir: "docs/ai_act_statutory_corpus",
    source: "source/CELEX_32024R1689_EN.html",
    bundle: "artifacts/conformity/src/data/aiActCorpusData.ts",
    marker: "2024/1689",
    probes: [
      { article: 6, phrase: "Classification rules for high-risk AI systems" },
      { article: 50, phrase: "Transparency obligations for providers and deployers" },
      { article: 5, phrase: "Prohibited AI practices" },
    ],
  },
  machinery: {
    dir: "docs/machinery_statutory_corpus",
    source: "source/CELEX_32023R1230_EN.html",
    bundle: "artifacts/conformity/src/data/machineryCorpusData.ts",
    marker: "2023/1230",
    probes: [
      { article: 10, phrase: "Obligations of manufacturers of machinery" },
      { article: 25, phrase: "Conformity assessment procedures for machinery" },
      { article: 23, phrase: "General principles of the CE marking" },
    ],
  },
  red: {
    dir: "docs/red_statutory_corpus",
    source: "source/CELEX_32014L0053_EN.html",
    bundle: "artifacts/conformity/src/data/redCorpusData.ts",
    marker: "2014/53",
    probes: [
      { article: 3, phrase: "Essential requirements" },
      { article: 10, phrase: "Obligations of manufacturers" },
      { article: 17, phrase: "Conformity assessment procedures" },
    ],
  },
};

const actKey = process.argv[2];
const OFFLINE = process.argv.includes("--offline");
const act = ACTS[actKey];
if (!act) {
  console.error(`Usage: node scripts/verify_euact_corpus.mjs <${Object.keys(ACTS).join("|")}> [--offline]`);
  process.exit(1);
}

const CORPUS = path.join(ROOT, act.dir);
const SOURCE = path.join(CORPUS, act.source);

const results = [];
const ok = (id, msg) => results.push({ id, state: "PASS", msg });
const bad = (id, msg) => results.push({ id, state: "FAIL", msg });
const meh = (id, msg) => results.push({ id, state: "----", msg });

const sha = (b) => createHash("sha256").update(b).digest("hex");
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(CORPUS, f), "utf8"));
/** EUR-Lex embeds per-request WAF tokens; they are not part of the legal text. */
const stripVolatile = (h) => h.split("\n").filter((l) => !/agentId=|rpid=/.test(l)).join("\n");

function fetchText(url) {
  return execFileSync("curl", ["-sL", "--max-time", "120", "-H", "User-Agent: Mozilla/5.0", url], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function checkSourcePresent() {
  if (!fs.existsSync(SOURCE)) return bad("A1", "cached OJ source is missing");
  const bytes = fs.readFileSync(SOURCE);
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", path.relative(ROOT, SOURCE)], { stdio: "ignore" });
  } catch {
    return bad("A1", "OJ source is not committed — provenance is unverifiable");
  }
  const html = bytes.toString("utf8");
  if (/has no legal effect|meant purely as a documentation tool/i.test(html)) {
    return bad("A1", "cached source is a CONSOLIDATED text — no legal effect, no preamble");
  }
  if (!/Whereas/.test(html) || !html.includes(act.marker)) {
    return bad("A1", "cached source does not look like the act's authentic OJ text");
  }
  ok("A1", `authentic OJ source committed (${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…)`);
}

function checkSourceMatchesLive() {
  const meta = readJson("01_recitals_full.json");
  if (OFFLINE) return meh("A2", "offline — live EUR-Lex comparison skipped");
  let live;
  try {
    live = fetchText(meta.sourceUrl);
  } catch {
    return meh("A2", "could not reach EUR-Lex");
  }
  if (!live || live.length < 100_000 || !live.includes(act.marker)) {
    return meh("A2", "live response does not look like the act (bot challenge or moved)");
  }
  const cached = fs.readFileSync(SOURCE, "utf8");
  if (stripVolatile(live) === stripVolatile(cached)) {
    return ok("A2", "committed source matches the live EUR-Lex text (volatile tokens ignored)");
  }
  bad("A2", "committed source DIFFERS from the live EUR-Lex text beyond volatile tokens");
}

function checkCorrigenda() {
  const meta = readJson("01_recitals_full.json");
  if (meta.corrigendaVerified) {
    return ok("B1", `${meta.corrigenda.length} corrigendum record(s), verified`);
  }
  meh("B1", "corrigenda absence NOT verified — scraping failed the CRA's positive control; check the EUR-Lex act page before relying on Article-level wording");
}

function checkCorpusIntegrity() {
  const recitals = readJson("01_recitals_full.json");
  const articles = readJson("02_articles_full.json");
  const annexes = readJson("03_annexes_full.json");
  if (recitals.sourceSha256 !== sha(fs.readFileSync(SOURCE))) {
    return bad("C1", "corpus records a different source sha256 than the committed source — rebuild");
  }
  if (recitals.recitals.length !== recitals.recitalsCount) return bad("C1", "recital count mismatch");
  const all = articles.chapters.flatMap((c) => c.articles);
  if (all.length !== articles.totalArticles) return bad("C1", "article count mismatch");
  for (let i = 0; i < all.length; i++) {
    if (all[i].articleNumber !== i + 1) return bad("C1", `article numbering broke at ${all[i].articleNumber}`);
    if (!all[i].paragraphs.length) return bad("C1", `Article ${all[i].articleNumber} has no text`);
  }
  if (annexes.annexes.length !== annexes.annexesCount) return bad("C1", "annex count mismatch");
  ok("C1", `${recitals.recitalsCount} recitals, ${articles.totalArticles} articles (1..${articles.totalArticles}), ${annexes.annexesCount} annexes; sourceSha256 matches`);
}

function checkBundleInSync() {
  const bundlePath = path.join(ROOT, act.bundle);
  if (!fs.existsSync(bundlePath)) return bad("C2", "frontend bundle is missing");
  const bundle = fs.readFileSync(bundlePath, "utf8");
  const meta = readJson("01_recitals_full.json");
  if (!bundle.includes(`"sourceSha256": ${JSON.stringify(meta.sourceSha256)}`)) {
    return bad("C2", "bundle sourceSha256 differs from the corpus — re-run the sync script");
  }
  ok("C2", "frontend bundle carries the same sourceSha256 as the corpus");
}

function checkVerbatimProbes() {
  const articles = readJson("02_articles_full.json");
  const all = articles.chapters.flatMap((c) => c.articles);
  const sourceHtml = fs.readFileSync(SOURCE, "utf8");
  for (const { article, phrase } of act.probes) {
    if (!sourceHtml.includes(phrase)) {
      return bad("D1", `probe phrase not in the SOURCE: "${phrase.slice(0, 50)}…"`);
    }
    const a = all.find((x) => x.articleNumber === article);
    if (!a) return bad("D1", `Article ${article} missing from the corpus`);
    const inCorpus = a.title.includes(phrase) || a.paragraphs.some((p) => p.text.includes(phrase));
    if (!inCorpus) return bad("D1", `Article ${article} does not carry its verbatim phrase — parser drift`);
  }
  ok("D1", `${act.probes.length} verbatim probes match source AND corpus`);
}

function checkFraming() {
  const meta = readJson("01_recitals_full.json");
  if (meta.instrumentType === "directive") {
    if (meta.nationalTranspositionRequired !== true) {
      return bad("F1", "a DIRECTIVE's metadata lost nationalTranspositionRequired — downstream surfaces must carry the transposition caveat");
    }
    return ok("F1", "directive framing carried: national transposition governs what binds an entity");
  }
  if (meta.instrumentType !== "regulation") return bad("F1", `unknown instrumentType ${meta.instrumentType}`);
  ok("F1", "regulation framing carried: directly applicable, one text");
}

checkSourcePresent();
checkSourceMatchesLive();
checkCorrigenda();
checkCorpusIntegrity();
checkBundleInSync();
checkVerbatimProbes();
checkFraming();

let failed = false;
for (const r of results) {
  console.log(`  ${r.state === "PASS" ? "PASS" : r.state === "FAIL" ? "FAIL" : "----"}  ${r.id}  ${r.msg}`);
  if (r.state === "FAIL") failed = true;
}
if (failed) {
  console.error(`\n${actKey} corpus verification FAILED.`);
  process.exit(1);
}
console.log(`\n${actKey} corpus verification passed (—— lines are stated non-verification, never success).`);
