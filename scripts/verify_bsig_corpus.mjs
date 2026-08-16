/**
 * THE source-of-truth check for the BSIG corpus (W2.4 DE).
 *
 * Same contract as its siblings, same three states:
 *
 *   PASS  verified
 *   FAIL  contradicted — the corpus does not match the published text
 *   ----  COULD NOT VERIFY (offline, blocked, unavailable)
 *
 * "----" is never counted as success.
 *
 * What is different about THIS corpus — and what the checks enforce:
 * - It is built from the CONSOLIDATED gesetze-im-internet.de text, not the
 *   authentic promulgation (which is an Artikelgesetz, PDF-only, and
 *   already amended). That was a deliberate, recorded decision; F1 asserts
 *   the metadata can never hide it.
 * - A consolidation moves when the law is amended. A2 compares the
 *   committed source to the live download IGNORING the volatile juris
 *   builddate attributes; B1 compares the standangabe (amendment trail):
 *   if juris records a NEW amendment, the corpus is STALE and that is a
 *   loud FAIL, not a shrug.
 *
 * Usage: node scripts/verify_bsig_corpus.mjs [--offline]
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import os from "node:os";

const ROOT = process.cwd();
const CORPUS = path.join(ROOT, "docs/bsig_statutory_corpus");
const SOURCE = path.join(CORPUS, "source/BJNR12D0B0025.xml");
const SOURCE_URL = "https://www.gesetze-im-internet.de/bsig_2025/xml.zip";
const OFFLINE = process.argv.includes("--offline");

const results = [];
const ok = (id, msg) => results.push({ id, state: "PASS", msg });
const bad = (id, msg) => results.push({ id, state: "FAIL", msg });
const meh = (id, msg) => results.push({ id, state: "----", msg });

const sha = (b) => createHash("sha256").update(b).digest("hex");
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(CORPUS, f), "utf8"));

/** juris stamps every element with the export run's builddate; it is not law. */
const stripVolatile = (xml) => xml.replace(/ builddate="\d+"/g, "");

function fetchLiveXml() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bsig-verify-"));
  const zipPath = path.join(tmp, "xml.zip");
  execFileSync("curl", ["-sL", "--max-time", "90", "-A", "Mozilla/5.0", "-o", zipPath, SOURCE_URL]);
  execFileSync("unzip", ["-o", "-q", zipPath, "-d", tmp]);
  const xmlFile = fs.readdirSync(tmp).find((f) => f.endsWith(".xml"));
  if (!xmlFile) throw new Error("no xml in the downloaded bundle");
  return fs.readFileSync(path.join(tmp, xmlFile), "utf8");
}

// ───────────────────────────────────────────────────────── A. source integrity

function checkSourcePresent() {
  if (!fs.existsSync(SOURCE)) return bad("A1", "cached gii source is missing");
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
  if (!tracked) return bad("A1", "gii source is not committed — provenance is unverifiable");
  const xml = bytes.toString("utf8");
  if (!xml.includes("gii-norm.dtd") || !xml.includes("BJNR12D0B0025")) {
    return bad("A1", "cached source is not the gii BSIG document");
  }
  if (!xml.includes("Bundesamt für Sicherheit in der Informationstechnik")) {
    return bad("A1", "cached source does not look like the BSI-Gesetz");
  }
  ok("A1", `gii BSIG XML committed (${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…)`);
}

function checkSourceMatchesLive() {
  if (OFFLINE) return meh("A2", "offline — live gii comparison skipped");
  let live;
  try {
    live = fetchLiveXml();
  } catch {
    return meh("A2", "could not fetch/unzip the live gii bundle");
  }
  if (!live.includes("BJNR12D0B0025")) {
    return meh("A2", "live bundle does not look like the BSIG document (moved or blocked)");
  }
  const cached = fs.readFileSync(SOURCE, "utf8");
  if (stripVolatile(live) === stripVolatile(cached)) {
    return ok("A2", "committed source matches the live gii XML (builddate stamps ignored)");
  }
  bad("A2", "committed source DIFFERS from the live gii XML beyond builddate — the consolidation moved; refresh and rebuild");
}

// ─────────────────────────────────────────────── B. consolidation currency

function checkAmendmentTrail() {
  const meta = readJson("01_sections_full.json");
  if (OFFLINE) return meh("B1", "offline — amendment-trail probe skipped");
  let live;
  try {
    live = fetchLiveXml();
  } catch {
    return meh("B1", "could not fetch the live gii bundle");
  }
  const liveTrail = [...live.matchAll(/<standkommentar>([^<]+)<\/standkommentar>/g)].map((m) => m[1]);
  const corpusTrail = meta.standangabe.map((s) => s.kommentar);
  const missing = liveTrail.filter((t) => !corpusTrail.includes(t));
  if (missing.length) {
    return bad("B1", `juris records ${missing.length} amendment entr(ies) the corpus lacks — STALE: ${missing[0].slice(0, 60)}…`);
  }
  ok("B1", `amendment trail current (${corpusTrail.length} standangabe entries match the live record)`);
}

// ─────────────────────────────────────────────── C. corpus internal integrity

function checkCorpusIntegrity() {
  const meta = readJson("01_sections_full.json");
  const anlagen = readJson("02_anlagen_full.json");
  if (meta.sourceSha256 !== sha(fs.readFileSync(SOURCE))) {
    return bad("C1", "corpus records a different source sha256 than the committed source file — rebuild");
  }
  if (meta.sections.length !== meta.sectionsCount) {
    return bad("C1", `sectionsCount says ${meta.sectionsCount}, file contains ${meta.sections.length}`);
  }
  let prevBase = 0;
  for (const s of meta.sections) {
    const m = /^(\d+)([a-z]*)$/.exec(s.section);
    if (!m) return bad("C1", `unrecognised section number "§ ${s.section}"`);
    const base = parseInt(m[1], 10);
    if (!(base === prevBase + 1 || (base === prevBase && m[2]))) {
      return bad("C1", `section numbering broken after § ${prevBase}: § ${s.section}`);
    }
    prevBase = base;
  }
  if (anlagen.anlagen.length !== meta.anlagenCount) return bad("C1", "Anlagen count mismatch");
  const empty = meta.sections.filter((s) => !s.text.trim());
  if (empty.length) return bad("C1", `${empty.length} empty section(s)`);
  ok("C1", `§§ 1..${meta.lastSection} (${meta.sectionsCount} sections), ${meta.anlagenCount} Anlagen; sourceSha256 matches`);
}

function checkBundleInSync() {
  const bundlePath = path.join(ROOT, "artifacts/conformity/src/data/bsigCorpusData.ts");
  if (!fs.existsSync(bundlePath)) return bad("C2", "frontend bundle bsigCorpusData.ts is missing");
  const bundle = fs.readFileSync(bundlePath, "utf8");
  const meta = readJson("01_sections_full.json");
  if (!bundle.includes(`"sourceSha256": ${JSON.stringify(meta.sourceSha256)}`)) {
    return bad("C2", "bundle sourceSha256 differs from the corpus — run sync_bsig_corpus_data.mjs");
  }
  ok("C2", "frontend bundle carries the same sourceSha256 as the corpus");
}

// ─────────────────────────────────────────────────── D. verbatim spot probes

function checkVerbatimProbes() {
  const meta = readJson("01_sections_full.json");
  const sourceXml = fs.readFileSync(SOURCE, "utf8");
  const probes = [
    {
      section: "32",
      phrase: "unverzüglich, spätestens jedoch innerhalb von 24 Stunden nach Kenntniserlangung",
    },
    {
      section: "32",
      phrase: "innerhalb von 72 Stunden nach Kenntniserlangung",
    },
    {
      section: "30",
      phrase: "geeignete, verhältnismäßige und wirksame technische und organisatorische Maßnahmen",
    },
    {
      section: "2",
      phrase: "Beinahevorfall",
    },
  ];
  for (const { section, phrase } of probes) {
    if (!sourceXml.includes(phrase)) {
      return bad("D1", `probe phrase not in the SOURCE (did the text change?): "${phrase.slice(0, 50)}…"`);
    }
    const s = meta.sections.find((x) => x.section === section);
    if (!s) return bad("D1", `§ ${section} missing from the corpus`);
    if (!s.text.includes(phrase)) {
      return bad("D1", `§ ${section} does not carry its verbatim phrase — parser drift`);
    }
  }
  ok("D1", `${probes.length} verbatim probes match source AND corpus`);
}

// ──────────────────────────────────────────────────────── F. framing carried

function checkFraming() {
  const meta = readJson("01_sections_full.json");
  if (meta.instrumentType !== "national_transposition")
    return bad("F1", "metadata lost instrumentType national_transposition");
  if (meta.transposes !== "Directive (EU) 2022/2555")
    return bad("F1", "metadata lost the transposes reference to NIS2");
  if (meta.language !== "de")
    return bad("F1", "metadata lost language de — the text must never pose as a translation");
  if (meta.consolidatedNotPromulgated !== true || !meta.whyConsolidated)
    return bad("F1", "metadata lost the consolidation disclosure — the departure from promulgation-first must stay visible");
  if (!meta.standangabe?.length)
    return bad("F1", "metadata lost the verbatim amendment trail");
  ok("F1", "metadata carries: DE transposition core, German verbatim, consolidation disclosed WITH its amendment trail");
}

// ────────────────────────────────────────────────────────────────────── main

checkSourcePresent();
checkSourceMatchesLive();
checkAmendmentTrail();
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
  console.error("\nBSIG corpus verification FAILED.");
  process.exit(1);
}
console.log("\nBSIG corpus verification passed (—— lines are stated non-verification, never success).");
