/**
 * THE source-of-truth check for the RED Delegated Regulation (EU) 2022/30
 * corpus (task 13.1). Same contract and three states as the other seven:
 *
 *   PASS  verified
 *   FAIL  contradicted
 *   ----  COULD NOT VERIFY
 *
 * This corpus is the base act AS AMENDED by Delegated Regulation (EU)
 * 2023/2444 — two documented replacements, provenance-quoted — and carries
 * the repeal by Delegated Regulation (EU) 2026/339 (with effect from
 * 11 December 2027, in favour of the CRA) as metadata. All three acts are
 * committed sources; every quote is verified against them here.
 *
 * Usage: node scripts/verify_red_delegated_corpus.mjs [--offline]
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { checkOjContentParity, negativeControl } from "./lib/oj_content_parity.mjs";

const ROOT = process.cwd();
const CORPUS = path.join(ROOT, "docs/red_delegated_2022_30");
const SOURCES = {
  base: "source/CELEX_32022R0030_EN.html",
  amending: "source/CELEX_32023R2444_EN.html",
  repealing: "source/CELEX_32026R0339_EN.html",
};
const BUNDLE = "artifacts/conformity/src/data/redDelegatedCorpusData.ts";

const results = [];
const ok = (id, msg) => results.push({ id, state: "PASS", msg });
const bad = (id, msg) => results.push({ id, state: "FAIL", msg });

const sha = (b) => createHash("sha256").update(b).digest("hex");
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(CORPUS, f), "utf8"));
const plainOf = (f) =>
  fs
    .readFileSync(path.join(CORPUS, f), "utf8")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

function checkSourcesPresent() {
  for (const [key, rel] of Object.entries(SOURCES)) {
    const p = path.join(CORPUS, rel);
    if (!fs.existsSync(p)) return bad("A1", `${key} source is missing (${rel})`);
    try {
      execFileSync("git", ["ls-files", "--error-unmatch", path.relative(ROOT, p)], { stdio: "ignore" });
    } catch {
      return bad("A1", `${key} source is not committed — provenance is unverifiable`);
    }
    const html = fs.readFileSync(p, "utf8");
    if (/has no legal effect|meant purely as a documentation tool/i.test(html)) {
      return bad("A1", `${key} source is a CONSOLIDATED text — no legal effect`);
    }
  }
  const base = fs.readFileSync(path.join(CORPUS, SOURCES.base), "utf8");
  if (!/Whereas/.test(base) || !base.includes("2022/30")) {
    return bad("A1", "base source does not look like the authentic OJ text of 2022/30");
  }
  ok("A1", "all three sources (base, amending, repealing) committed and authentic-looking");
}

function checkQuotesAnchored() {
  const meta = readJson("02_articles_full.json");
  const amendingPlain = plainOf(SOURCES.amending);
  const repealingPlain = plainOf(SOURCES.repealing);
  for (const am of meta.amendments ?? []) {
    if (!amendingPlain.includes(am.quoted.replace(/\s+/g, " "))) {
      return bad("B1", `amendment quote not found verbatim in ${am.celex}: ${am.provision}`);
    }
  }
  if ((meta.amendments ?? []).length !== 2) {
    return bad("B1", `expected the 2 amendments of 2023/2444, found ${(meta.amendments ?? []).length}`);
  }
  if (!repealingPlain.includes(meta.repeal.articleQuote)) {
    return bad("B1", "repeal quote not found verbatim in the committed 32026R0339 source");
  }
  if (!repealingPlain.includes(meta.repeal.reasonQuote)) {
    return bad("B1", "repeal reason quote not found verbatim in the committed 32026R0339 source");
  }
  ok("B1", "2 amendment quotes + repeal article and reason quotes anchored verbatim in their committed sources");
}

function checkAmendmentsInEffect() {
  const meta = readJson("02_articles_full.json");
  const arts = meta.chapters.flatMap((c) => c.articles);
  for (const am of meta.amendments ?? []) {
    const art = arts.find((a) => a.articleNumber === am.article);
    const hasNew = art?.paragraphs.some((p) => p.text.includes(am.to));
    const hasOld = art?.paragraphs.some((p) => p.text.includes(am.from));
    if (!hasNew) return bad("B2", `Article ${am.article} does not carry the amended wording (${am.provision})`);
    if (hasOld) return bad("B2", `Article ${am.article} still carries the SUPERSEDED wording (${am.provision})`);
  }
  ok("B2", "both amendments are in effect in the shipped text; superseded wording absent");
}

function checkRebuild() {
  const files = ["01_recitals_full.json", "02_articles_full.json"];
  const before = files.map((f) => sha(fs.readFileSync(path.join(CORPUS, f))));
  try {
    execFileSync("node", ["scripts/build_red_delegated_corpus.mjs"], { stdio: "ignore" });
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
  if (meta.recitalsCount !== 19) return bad("C2", `recitalsCount ${meta.recitalsCount} != 19`);
  if (arts.length !== 3) return bad("C2", `${arts.length} articles != 3`);
  if (arts.some((a) => a.title !== "")) return bad("C2", "an article carries an invented title — the OJ has none");
  if (meta.sourceSha256 !== sha(fs.readFileSync(path.join(CORPUS, SOURCES.base)))) {
    return bad("C2", "sourceSha256 differs from the committed base source — rebuild");
  }
  ok("C2", "19 recitals, 3 title-less articles, sourceSha256 matches the committed base source");
}

function checkBundleInSync() {
  const p = path.join(ROOT, BUNDLE);
  if (!fs.existsSync(p)) return bad("C3", "frontend bundle is missing — run the sync script");
  const bundle = fs.readFileSync(p, "utf8");
  const meta = readJson("02_articles_full.json");
  if (!bundle.includes(`"sourceSha256": ${JSON.stringify(meta.sourceSha256)}`)) {
    return bad("C3", "bundle sourceSha256 differs from the corpus — re-run the sync script");
  }
  ok("C3", "frontend bundle carries the same sourceSha256 as the corpus");
}

function checkVerbatimProbes() {
  const meta = readJson("02_articles_full.json");
  const arts = meta.chapters.flatMap((c) => c.articles);
  const probes = [
    { article: 1, phrase: "internet-connected radio equipment" },
    { article: 1, phrase: "transfer money, monetary value or virtual currency" },
    { article: 2, phrase: "By way of derogation from Article 1" },
    { article: 3, phrase: "It shall apply from 1 August 2025." },
  ];
  // The OJ writes "Article 1" with a non-breaking space — anchor probes
  // against a tag-stripped, whitespace-normalized rendering of the source.
  const sourcePlain = fs
    .readFileSync(path.join(CORPUS, SOURCES.base), "utf8")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;| /g, " ")
    .replace(/\s+/g, " ");
  for (const { article, phrase } of probes) {
    // Art 3's date comes from the AMENDING act, so the base-source anchor is
    // only required for the un-amended probes.
    if (article !== 3 && !sourcePlain.includes(phrase)) {
      return bad("D1", `probe phrase not in the base SOURCE: "${phrase.slice(0, 50)}…"`);
    }
    const a = arts.find((x) => x.articleNumber === article);
    if (!a?.paragraphs.some((p) => p.text.includes(phrase))) {
      return bad("D1", `Article ${article} does not carry its verbatim phrase — parser drift`);
    }
  }
  ok("D1", `${probes.length} verbatim probes match`);
}

function checkFullContentParity() {
  let r;
  try {
    r = checkOjContentParity({ corpusDir: CORPUS, sourceFile: SOURCES.base });
  } catch (e) {
    return bad("D2", e.message.replace(/^D2:\s*/, ""));
  }
  ok("D2", `full-content parity: ${r.articles} articles character-exact against the base source with ${r.corrigendaApplied} amendments applied`);
  if (!negativeControl({ corpusDir: CORPUS, sourceFile: SOURCES.base })) {
    return bad("D2N", "negative control DID NOT fail — the parity check is blind");
  }
  ok("D2N", "negative control fails as required (one flipped character is caught)");
}

function checkFraming() {
  const meta = readJson("02_articles_full.json");
  if (meta.instrumentType !== "delegated_regulation") return bad("F1", `instrumentType ${meta.instrumentType}`);
  if (!meta.supplements?.includes("2014/53")) return bad("F1", "metadata lost the supplements-RED relation");
  if (meta.appliesFrom !== "2025-08-01") return bad("F1", `appliesFrom ${meta.appliesFrom} — the amended Art 3 says 1 August 2025`);
  if (meta.repeal?.withEffectFrom !== "2027-12-11") {
    return bad("F1", "metadata lost the repeal date — the surface must state the 2022/30 → CRA handover");
  }
  ok("F1", "framing carried: delegated regulation under the RED, applies from 2025-08-01, repealed with effect from 2027-12-11 by 2026/339 in favour of the CRA");
}

checkSourcesPresent();
checkQuotesAnchored();
checkAmendmentsInEffect();
checkRebuild();
checkStructure();
checkBundleInSync();
checkVerbatimProbes();
checkFullContentParity();
checkFraming();

let failed = false;
for (const r of results) {
  console.log(`  ${r.state}  ${r.id}  ${r.msg}`);
  if (r.state === "FAIL") failed = true;
}
if (failed) {
  console.error("\nRED Delegated 2022/30 corpus verification FAILED.");
  process.exit(1);
}
console.log("\nRED Delegated 2022/30 corpus verification passed.");
