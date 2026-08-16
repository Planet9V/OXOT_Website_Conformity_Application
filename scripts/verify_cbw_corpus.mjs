/**
 * THE source-of-truth check for the Cyberbeveiligingswet corpus (W2.4, NL).
 *
 * Same contract as verify_cra_corpus.mjs / verify_nis2_corpus.mjs, and the
 * same three states, because the distinction matters more than the pass rate:
 *
 *   PASS  verified
 *   FAIL  contradicted — the corpus does not match the published text
 *   ----  COULD NOT VERIFY (offline, blocked, unavailable)
 *
 * "----" is never counted as success.
 *
 * What is different about a national transposition:
 * - The source is the PROMULGATED Staatsblad text (Stb. 2026, 187), the NL
 *   analogue of the Official Journal. The consolidated register
 *   (wetten.overheid.nl, BWBR0052872) is a documentation tool; if the law is
 *   ever amended, the consolidated text will diverge from this corpus and
 *   the corpus must then say so rather than quietly staying "current" (B2).
 * - The text is Dutch and MUST stay Dutch: F1 asserts the metadata carries
 *   language "nl" and instrumentType "national_transposition", so nothing
 *   downstream can quietly present it as the directive or as a translation.
 *
 * Usage: node scripts/verify_cbw_corpus.mjs [--offline]
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const CORPUS = path.join(ROOT, "docs/cbw_statutory_corpus");
const SOURCE = path.join(CORPUS, "source/stb-2026-187.xml");
const SOURCE_URL = "https://zoek.officielebekendmakingen.nl/stb-2026-187.xml";
const REGISTER_URL = "https://wetten.overheid.nl/BWBR0052872/2026-08-15";
const OFFLINE = process.argv.includes("--offline");

const results = [];
const ok = (id, msg) => results.push({ id, state: "PASS", msg });
const bad = (id, msg) => results.push({ id, state: "FAIL", msg });
const meh = (id, msg) => results.push({ id, state: "----", msg });

const sha = (b) => createHash("sha256").update(b).digest("hex");
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(CORPUS, f), "utf8"));

function fetchText(url) {
  return execFileSync(
    "curl",
    ["-sL", "--max-time", "90", "-H", "User-Agent: Mozilla/5.0", url],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
}

// ───────────────────────────────────────────────────────── A. source integrity

function checkSourcePresent() {
  if (!fs.existsSync(SOURCE)) return bad("A1", "cached Staatsblad source is missing");
  const bytes = fs.readFileSync(SOURCE);
  let tracked = false;
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", path.relative(ROOT, SOURCE)], {
      stdio: "ignore",
    });
    tracked = true;
  } catch {
    /* not tracked */
  }
  if (!tracked) return bad("A1", "Staatsblad source is not committed — provenance is unverifiable");

  const xml = bytes.toString("utf8");
  if (!xml.includes("<officiele-publicatie")) {
    return bad("A1", "cached source is not an officiele-publicatie XML document");
  }
  if (!xml.includes("Cyberbeveiligingswet") || !xml.includes("2022/2555")) {
    return bad("A1", "cached source does not look like the Cyberbeveiligingswet");
  }
  ok("A1", `authentic Staatsblad XML committed (${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…)`);
}

function checkSourceMatchesLive() {
  if (OFFLINE) return meh("A2", "offline — live Staatsblad comparison skipped");
  let live;
  try {
    live = fetchText(SOURCE_URL);
  } catch {
    return meh("A2", "could not reach zoek.officielebekendmakingen.nl");
  }
  if (!live || !live.includes("Cyberbeveiligingswet")) {
    return meh("A2", "live response does not look like the publication (blocked or moved)");
  }
  const cached = fs.readFileSync(SOURCE, "utf8");
  if (live === cached) return ok("A2", "committed source is byte-for-byte the live Staatsblad XML");
  bad("A2", "committed source DIFFERS from the live Staatsblad XML");
}

// ─────────────────────────────────────────── B. currency of the promulgation

function checkRegisterInForce() {
  const meta = readJson("01_articles_full.json");
  if (OFFLINE) return meh("B1", "offline — register probe skipped");
  let page;
  try {
    page = fetchText(REGISTER_URL);
  } catch {
    return meh("B1", "could not reach wetten.overheid.nl");
  }
  if (!page || page.length < 10_000) return meh("B1", "register response too small (blocked?)");
  if (!/Cyberbeveiligingswet/i.test(page)) {
    return bad("B1", "register entry BWBR0052872 no longer names the Cyberbeveiligingswet");
  }
  if (!page.includes("15-08-2026")) {
    return meh("B1", "register page did not show the expected in-force date marker");
  }
  ok("B1", `register confirms the law in force from ${meta.entryIntoForce} (BWBR0052872)`);
}

function checkAmendmentDrift() {
  // This corpus is the PROMULGATION. An amendment would change the
  // consolidated register while Stb. 2026, 187 stays identical — so this
  // check can only warn from the register page, not prove absence. It says
  // so instead of passing vacuously (same posture as NIS2's corrigenda B1).
  if (OFFLINE) return meh("B2", "offline — amendment probe skipped");
  let page;
  try {
    page = fetchText(REGISTER_URL);
  } catch {
    return meh("B2", "could not reach wetten.overheid.nl");
  }
  if (!page) return meh("B2", "no register response");
  // A superseded version banner on wetten.overheid.nl mentions a newer
  // "geldend van" period; the /2026-08-15 permalink stays valid regardless,
  // so absence of proof here is stated, not converted into proof of absence.
  meh("B2", "amendments cannot be proven absent from the promulgation; the register probe (B1) is the canary");
}

// ─────────────────────────────────────────────── C. corpus internal integrity

function checkCorpusIntegrity() {
  const meta = readJson("01_articles_full.json");
  const bijlagen = readJson("02_bijlagen_full.json");

  if (meta.sourceSha256 !== sha(fs.readFileSync(SOURCE))) {
    return bad("C1", "corpus records a different source sha256 than the committed source file — rebuild");
  }
  const all = meta.chapters.flatMap((c) => c.articles);
  if (all.length !== meta.totalArticles) {
    return bad("C1", `totalArticles says ${meta.totalArticles}, chapters contain ${all.length}`);
  }
  let prevBase = 0;
  for (const a of all) {
    const m = /^(\d+)([a-z]*)$/.exec(a.articleNumber);
    if (!m) return bad("C1", `unrecognised article number "${a.articleNumber}"`);
    const base = parseInt(m[1], 10);
    if (!(base === prevBase + 1 || (base === prevBase && m[2]))) {
      return bad("C1", `article numbering broken after ${prevBase}: ${a.articleNumber}`);
    }
    prevBase = base;
  }
  if (bijlagen.bijlagen.length !== meta.bijlagenCount) {
    return bad("C1", "bijlagen count mismatch");
  }
  const empty = all.filter((a) => a.paragraphs.some((p) => !p.text.trim()));
  if (empty.length) return bad("C1", `${empty.length} article(s) contain empty paragraphs`);
  ok(
    "C1",
    `${meta.chaptersCount} hoofdstukken, ${meta.totalArticles} artikelen (1..${meta.lastArticleNumber}), ${meta.bijlagenCount} bijlagen; sourceSha256 matches`,
  );
}

function checkBundleInSync() {
  const bundlePath = path.join(ROOT, "artifacts/conformity/src/data/cbwCorpusData.ts");
  if (!fs.existsSync(bundlePath)) return bad("C2", "frontend bundle cbwCorpusData.ts is missing");
  const bundle = fs.readFileSync(bundlePath, "utf8");
  const meta = readJson("01_articles_full.json");
  if (!bundle.includes(`"sourceSha256": ${JSON.stringify(meta.sourceSha256)}`)) {
    return bad("C2", "bundle sourceSha256 differs from the corpus — run sync_cbw_corpus_data.mjs");
  }
  ok("C2", "frontend bundle carries the same sourceSha256 as the corpus");
}

// ─────────────────────────────────────────────────── D. verbatim spot probes

function checkVerbatimProbes() {
  const meta = readJson("01_articles_full.json");
  const all = meta.chapters.flatMap((c) => c.articles);
  const sourceXml = fs.readFileSync(SOURCE, "utf8");

  // Each probe: a phrase that must exist verbatim BOTH in the source and in
  // the named article, so parser drift on either side fails loudly.
  const probes = [
    {
      article: "26",
      phrase: "vroegtijdige waarschuwing over het significante incident",
    },
    {
      article: "27",
      phrase: "binnen 72 uur nadat zij kennis heeft gekregen van het significante incident",
    },
    {
      article: "1",
      phrase: "een aanbieder van beheerde diensten die bijstand biedt of verleent",
    },
    {
      article: "99",
      phrase: "De Telecommunicatiewet wordt als volgt gewijzigd",
    },
  ];
  for (const { article, phrase } of probes) {
    if (!sourceXml.includes(phrase)) {
      return bad("D1", `probe phrase not in the SOURCE (did the publication change?): "${phrase.slice(0, 50)}…"`);
    }
    const a = all.find((x) => x.articleNumber === article);
    if (!a) return bad("D1", `artikel ${article} missing from the corpus`);
    if (!a.paragraphs.some((p) => p.text.includes(phrase))) {
      return bad("D1", `artikel ${article} does not carry its verbatim phrase — parser drift`);
    }
  }
  ok("D1", `${probes.length} verbatim probes match source AND corpus`);
}

// ──────────────────────────────────────────────────────── F. framing carried

function checkFraming() {
  const meta = readJson("01_articles_full.json");
  if (meta.instrumentType !== "national_transposition")
    return bad("F1", "metadata lost instrumentType national_transposition");
  if (meta.transposes !== "Directive (EU) 2022/2555")
    return bad("F1", "metadata lost the transposes reference to NIS2");
  if (meta.language !== "nl")
    return bad("F1", "metadata lost language nl — the text must never pose as a translation");
  ok("F1", "metadata carries: NL national transposition of Directive (EU) 2022/2555, Dutch verbatim");
}

// ────────────────────────────────────────────────────────────────────── main

checkSourcePresent();
checkSourceMatchesLive();
checkRegisterInForce();
checkAmendmentDrift();
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
  console.error("\nCbw corpus verification FAILED.");
  process.exit(1);
}
console.log("\nCbw corpus verification passed (—— lines are stated non-verification, never success).");
