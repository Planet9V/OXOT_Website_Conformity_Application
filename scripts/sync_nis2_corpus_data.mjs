/**
 * Copies the built NIS2 corpus JSON into the conformity app's TypeScript
 * module — the same pipeline the CRA corpus uses (task 8.4): built from
 * EUR-Lex by scripts/build_nis2_corpus_from_eurlex.mjs, copied verbatim
 * here, and CI re-runs both steps to prove the bundle is byte-for-byte
 * reproducible from the committed source.
 */
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const corpusDir = path.join(rootDir, "docs/nis2_statutory_corpus");

const read = (f) => JSON.parse(fs.readFileSync(path.join(corpusDir, f), "utf8"));
const recitalsJson = read("01_recitals_full.json");
const articlesJson = read("02_articles_full.json");
const annexesJson = read("03_annexes_full.json");

const banner = `/**
 * NIS2 statutory corpus — ${recitalsJson.directive}.
 *
 * GENERATED FILE — DO NOT EDIT BY HAND.
 * Built from the Official Journal text (${recitalsJson.officialJournalReference},
 * CELEX ${recitalsJson.celex}) by scripts/build_nis2_corpus_from_eurlex.mjs and
 * copied here by scripts/sync_nis2_corpus_data.mjs. Every recital, article
 * paragraph and annex line is verbatim OJ text.
 *
 * Regenerate:
 *   node scripts/build_nis2_corpus_from_eurlex.mjs
 *   node scripts/sync_nis2_corpus_data.mjs
 */
`;

const tsContent =
  banner +
  `export const nis2RecitalsData = ${JSON.stringify(recitalsJson, null, 2)};\n\n` +
  `export const nis2ArticlesData = ${JSON.stringify(articlesJson, null, 2)};\n\n` +
  `export const nis2AnnexesData = ${JSON.stringify(annexesJson, null, 2)};\n`;

const target = path.join(rootDir, "artifacts/conformity/src/data/nis2CorpusData.ts");
fs.writeFileSync(target, tsContent);
console.log(`Wrote ${target} (${(tsContent.length / 1024).toFixed(0)} KiB)`);
