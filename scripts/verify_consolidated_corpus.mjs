/**
 * THE source-of-truth check for corpora built from EUR-Lex CONSOLIDATED
 * texts (task 15.3/15.4): acts amended in force, where no single authentic
 * OJ document carries the current text. Same contract and three states as
 * every other verifier.
 *
 * The disclosure IS the check here: A1 requires the consolidated source to
 * BE a consolidated text (the exact inverse of the OJ verifiers) and the
 * original to carry the preamble the consolidated lacks; F1 requires the
 * amendment trail and textBasis to stay carried in the metadata.
 *
 * Usage: node scripts/verify_consolidated_corpus.mjs <ai_act|machinery|gpsr>
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { checkConsolidatedContentParity, consolidatedNegativeControl } from "./lib/oj_content_parity.mjs";

const ACTS = {
  ai_act: {
    dir: "docs/ai_act_statutory_corpus",
    original: "source/CELEX_32024R1689_EN.html",
    consolidated: "source/CELEX_02024R1689-20260727_EN.html",
    bundle: "artifacts/conformity/src/data/aiActCorpusData.ts",
    marker: "2024/1689",
    expected: { recitals: 180, articles: 119, annexes: 14, lettered: "4a,60a,75a,75b,75c,75d", amendingActs: ["32026R1744"] },
    probes: [
      { article: "6", phrase: "Classification rules for high-risk AI systems" },
      { article: "113", phrase: "2 December 2027" },
      { article: "4a", phrase: "" },
      { article: "50", phrase: "Transparency obligations for providers and deployers" },
    ],
  },
  machinery: {
    dir: "docs/machinery_statutory_corpus",
    original: "source/CELEX_32023R1230_EN.html",
    consolidated: "source/CELEX_02023R1230-20260727_EN.html",
    bundle: "artifacts/conformity/src/data/machineryCorpusData.ts",
    marker: "2023/1230",
    expected: { recitals: 86, articles: 59, annexes: 12, lettered: "25a,25b,25c,25d,25e", amendingActs: ["32024R2748", "32026R1744"] },
    probes: [
      { article: "10", phrase: "Obligations of manufacturers of machinery" },
      { article: "25a", phrase: "Application of emergency procedures" },
      // Corrigendum R(01) incorporated: Art 47(2)'s date reads 19 July 2023.
      { article: "47", phrase: "19 July 2023" },
    ],
  },
  gpsr: {
    dir: "docs/gpsr_statutory_corpus",
    original: "source/CELEX_32023R0988_EN.html",
    consolidated: "source/CELEX_02023R0988-20260529_EN.html",
    bundle: null,
    marker: "2023/988",
    expected: { recitals: 108, articles: 55, annexes: 1, lettered: "8a,8b,8c", amendingActs: ["32024R2748"] },
    probes: [
      { article: "8a", phrase: "" },
      { article: "9", phrase: "Obligations of manufacturers" },
    ],
  },
};

const actKey = process.argv[2];
const act = ACTS[actKey];
if (!act) {
  console.error(`Usage: node scripts/verify_consolidated_corpus.mjs <${Object.keys(ACTS).join("|")}>`);
  process.exit(1);
}

const ROOT = process.cwd();
const CORPUS = path.join(ROOT, act.dir);
const results = [];
const ok = (id, msg) => results.push({ id, state: "PASS", msg });
const bad = (id, msg) => results.push({ id, state: "FAIL", msg });
const meh = (id, msg) => results.push({ id, state: "----", msg });
const sha = (b) => createHash("sha256").update(b).digest("hex");
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(CORPUS, f), "utf8"));

function checkSources() {
  for (const [key, rel] of [["original", act.original], ["consolidated", act.consolidated]]) {
    const p = path.join(CORPUS, rel);
    if (!fs.existsSync(p)) return bad("A1", `${key} source missing (${rel})`);
    try {
      execFileSync("git", ["ls-files", "--error-unmatch", path.relative(ROOT, p)], { stdio: "ignore" });
    } catch {
      return bad("A1", `${key} source is not committed — provenance is unverifiable`);
    }
  }
  const original = fs.readFileSync(path.join(CORPUS, act.original), "utf8");
  const consolidated = fs.readFileSync(path.join(CORPUS, act.consolidated), "utf8");
  if (!/Whereas/.test(original)) return bad("A1", "original source has no preamble — recitals cannot be authentic");
  if (!/has no legal effect|documentation tool/i.test(consolidated)) {
    return bad("A1", "the 'consolidated' source does not look like a EUR-Lex consolidated text — if it is an OJ text, use the OJ pipeline");
  }
  if (!consolidated.includes(act.marker)) return bad("A1", "consolidated source does not look like this act");
  ok("A1", "original (with preamble) and consolidated sources committed; consolidated correctly self-identifies as a documentation text");
}

function checkRebuild() {
  const files = ["01_recitals_full.json", "02_articles_full.json", "03_annexes_full.json"];
  const before = files.map((f) => sha(fs.readFileSync(path.join(CORPUS, f))));
  try {
    execFileSync("node", ["scripts/build_consolidated_act_corpus.mjs", actKey], { stdio: "ignore" });
  } catch (e) {
    return bad("C1", `the builder failed: ${e.message.split("\n")[0]}`);
  }
  const after = files.map((f) => sha(fs.readFileSync(path.join(CORPUS, f))));
  before.join() === after.join()
    ? ok("C1", "rebuilding from the committed sources reproduces the JSON byte-for-byte")
    : bad("C1", "rebuild does NOT reproduce the committed JSON — hand-edit or builder drift");
}

function checkStructure() {
  const meta = readJson("02_articles_full.json");
  const arts = meta.chapters.flatMap((c) => c.articles);
  const anx = readJson("03_annexes_full.json").annexes;
  if (meta.recitalsCount !== act.expected.recitals) return bad("C2", `recitals ${meta.recitalsCount} != ${act.expected.recitals}`);
  if (arts.length !== act.expected.articles) return bad("C2", `articles ${arts.length} != ${act.expected.articles}`);
  if (anx.length !== act.expected.annexes) return bad("C2", `annexes ${anx.length} != ${act.expected.annexes}`);
  const lettered = arts.filter((a) => /[a-z]/.test(String(a.articleNumber))).map((a) => a.articleNumber).join(",");
  if (lettered !== act.expected.lettered) return bad("C2", `inserted articles [${lettered}] != expected [${act.expected.lettered}]`);
  if (meta.sourceSha256 !== sha(fs.readFileSync(path.join(CORPUS, act.consolidated)))) {
    return bad("C2", "sourceSha256 differs from the committed consolidated source — rebuild");
  }
  ok("C2", `${act.expected.recitals} recitals · ${act.expected.articles} articles (inserted: ${act.expected.lettered}) · ${act.expected.annexes} annex(es); sha pinned`);
}

function checkBundle() {
  if (!act.bundle) return meh("C3", "no frontend bundle — no reader ships this act yet (stated, not silent)");
  const p = path.join(ROOT, act.bundle);
  if (!fs.existsSync(p)) return bad("C3", "frontend bundle missing — run the sync script");
  const bundle = fs.readFileSync(p, "utf8");
  const meta = readJson("02_articles_full.json");
  if (!bundle.includes(`"sourceSha256": ${JSON.stringify(meta.sourceSha256)}`)) {
    return bad("C3", "bundle sourceSha256 differs from the corpus — re-run the sync script");
  }
  ok("C3", "frontend bundle carries the same sourceSha256 as the corpus");
}

function checkProbes() {
  const meta = readJson("02_articles_full.json");
  const arts = meta.chapters.flatMap((c) => c.articles);
  for (const { article, phrase } of act.probes) {
    const a = arts.find((x) => String(x.articleNumber) === article);
    if (!a) return bad("D1", `Article ${article} missing from the corpus`);
    if (phrase && !(a.title.includes(phrase) || a.paragraphs.some((p) => p.text.includes(phrase)))) {
      return bad("D1", `Article ${article} does not carry its probe phrase "${phrase.slice(0, 40)}…"`);
    }
  }
  ok("D1", `${act.probes.length} probes present (inserted articles reachable, amended dates carried)`);
}

function checkParity() {
  let r;
  try {
    r = checkConsolidatedContentParity({ corpusDir: CORPUS, consolidatedFile: act.consolidated });
  } catch (e) {
    return bad("D2", e.message.replace(/^D2:\s*/, ""));
  }
  ok("D2", `full-content parity: ${r.articles} articles + ${r.annexes} annexes character-exact against the consolidated source`);
  if (!consolidatedNegativeControl({ corpusDir: CORPUS, consolidatedFile: act.consolidated })) {
    return bad("D2N", "negative control DID NOT fail — the parity check is blind");
  }
  ok("D2N", "negative control fails as required (one flipped character is caught)");
}

function checkFraming() {
  const meta = readJson("02_articles_full.json");
  if (meta.textBasis !== "consolidated") return bad("F1", "metadata lost textBasis=consolidated — the disclosed departure must stay disclosed");
  const trail = meta.amendmentTrail ?? [];
  const celexes = trail.map((t) => t.celex);
  for (const expected of act.expected.amendingActs) {
    if (!celexes.includes(expected)) return bad("F1", `amendment trail lost ${expected}`);
  }
  if (!meta.consolidationDate) return bad("F1", "metadata lost the consolidation date");
  ok("F1", `disclosed departure carried: consolidated ${meta.consolidationDate}, amended by ${celexes.join(", ")}`);
}

checkSources();
checkRebuild();
checkStructure();
checkBundle();
checkProbes();
checkParity();
checkFraming();

let failed = false;
for (const r of results) {
  console.log(`  ${r.state}  ${r.id}  ${r.msg}`);
  if (r.state === "FAIL") failed = true;
}
if (failed) {
  console.error(`\n${actKey} consolidated corpus verification FAILED.`);
  process.exit(1);
}
console.log(`\n${actKey} consolidated corpus verification passed.`);
