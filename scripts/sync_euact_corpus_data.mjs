/**
 * Copies a built Phase-10 act corpus (AI Act / Machinery / RED) into the
 * conformity app's TypeScript module — same pipeline as every other corpus:
 * built by scripts/build_consolidated_act_corpus.mjs from the committed
 * authentic OJ source, copied verbatim here, byte-for-byte reproducible in
 * CI.
 *
 * Usage: node scripts/sync_euact_corpus_data.mjs <ai_act|machinery|red>
 */
import fs from "fs";
import path from "path";

const ACTS = {
  ai_act: { dir: "docs/ai_act_statutory_corpus", prefix: "aiAct", target: "aiActCorpusData.ts" },
  machinery: { dir: "docs/machinery_statutory_corpus", prefix: "machinery", target: "machineryCorpusData.ts" },
  red: { dir: "docs/red_statutory_corpus", prefix: "red", target: "redCorpusData.ts" },
  gdpr: { dir: "docs/gdpr_statutory_corpus", prefix: "gdpr", target: "gdprCorpusData.ts" },
  data_act: { dir: "docs/data_act_statutory_corpus", prefix: "dataAct", target: "dataActCorpusData.ts" },
};

const act = ACTS[process.argv[2]];
if (!act) {
  console.error(`Usage: node scripts/sync_euact_corpus_data.mjs <${Object.keys(ACTS).join("|")}>`);
  process.exit(1);
}

const rootDir = process.cwd();
const corpusDir = path.join(rootDir, act.dir);
const read = (f) => JSON.parse(fs.readFileSync(path.join(corpusDir, f), "utf8"));
const recitalsJson = read("01_recitals_full.json");
const articlesJson = read("02_articles_full.json");
const annexesJson = read("03_annexes_full.json");

const instrument = recitalsJson.regulation ?? recitalsJson.directive;
const banner = `/**
 * ${recitalsJson.shortTitle} statutory corpus — ${instrument}.
 *
 * GENERATED FILE — DO NOT EDIT BY HAND.
 * Built from the Official Journal text (${recitalsJson.officialJournalReference},
 * CELEX ${recitalsJson.celex}) by scripts/build_consolidated_act_corpus.mjs and
 * copied here by scripts/sync_euact_corpus_data.mjs. Every recital, article
 * paragraph and annex line is verbatim OJ text.
 *
 * Regenerate:
 *   node scripts/build_consolidated_act_corpus.mjs ${process.argv[2]}
 *   node scripts/sync_euact_corpus_data.mjs ${process.argv[2]}
 */
`;

const tsContent =
  banner +
  `export const ${act.prefix}RecitalsData = ${JSON.stringify(recitalsJson, null, 2)};\n\n` +
  `export const ${act.prefix}ArticlesData = ${JSON.stringify(articlesJson, null, 2)};\n\n` +
  `export const ${act.prefix}AnnexesData = ${JSON.stringify(annexesJson, null, 2)};\n`;

const target = path.join(rootDir, "artifacts/conformity/src/data", act.target);
fs.writeFileSync(target, tsContent);
console.log(`Wrote ${target} (${(tsContent.length / 1024).toFixed(0)} KiB)`);
