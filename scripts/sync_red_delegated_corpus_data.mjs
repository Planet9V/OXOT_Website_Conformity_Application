/**
 * Copies the RED Delegated Regulation (EU) 2022/30 corpus into the
 * conformity app's TypeScript module — same pipeline as every other corpus:
 * built by scripts/build_red_delegated_corpus.mjs from three committed
 * authentic OJ sources (base act, amending act 2023/2444, repealing act
 * 2026/339), copied verbatim here, byte-for-byte reproducible in CI.
 *
 * Usage: node scripts/sync_red_delegated_corpus_data.mjs
 */
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const corpusDir = path.join(rootDir, "docs/red_delegated_2022_30");
const read = (f) => JSON.parse(fs.readFileSync(path.join(corpusDir, f), "utf8"));
const recitalsJson = read("01_recitals_full.json");
const articlesJson = read("02_articles_full.json");

const banner = `/**
 * ${recitalsJson.shortTitle} statutory corpus — ${recitalsJson.regulation},
 * as amended by Delegated Regulation (EU) 2023/2444, repealed with effect
 * from ${recitalsJson.repeal.withEffectFrom} by Delegated Regulation (EU) 2026/339.
 *
 * GENERATED FILE — DO NOT EDIT BY HAND.
 * Built from the Official Journal text (${recitalsJson.officialJournalReference},
 * CELEX ${recitalsJson.celex}) by scripts/build_red_delegated_corpus.mjs and
 * copied here by scripts/sync_red_delegated_corpus_data.mjs.
 *
 * Regenerate:
 *   node scripts/build_red_delegated_corpus.mjs
 *   node scripts/sync_red_delegated_corpus_data.mjs
 */
`;

const tsContent =
  banner +
  `export const redDelegatedRecitalsData = ${JSON.stringify(recitalsJson, null, 2)};\n\n` +
  `export const redDelegatedArticlesData = ${JSON.stringify(articlesJson, null, 2)};\n`;

const target = path.join(rootDir, "artifacts/conformity/src/data/redDelegatedCorpusData.ts");
fs.writeFileSync(target, tsContent);
console.log(`Wrote ${target} (${(tsContent.length / 1024).toFixed(0)} KiB)`);
