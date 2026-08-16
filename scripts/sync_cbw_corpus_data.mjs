/**
 * Copies the built Cyberbeveiligingswet corpus JSON into the conformity
 * app's TypeScript module — the same pipeline as the CRA and NIS2 corpora:
 * built from the Staatsblad text by scripts/build_cbw_corpus_from_stb.mjs,
 * copied verbatim here, and CI re-runs both steps to prove the bundle is
 * byte-for-byte reproducible from the committed source.
 */
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const corpusDir = path.join(rootDir, "docs/cbw_statutory_corpus");

const read = (f) => JSON.parse(fs.readFileSync(path.join(corpusDir, f), "utf8"));
const articlesJson = read("01_articles_full.json");
const bijlagenJson = read("02_bijlagen_full.json");

const banner = `/**
 * Cyberbeveiligingswet corpus — the Dutch NIS2 transposition (W2.4).
 *
 * GENERATED FILE — DO NOT EDIT BY HAND.
 * Built from the promulgated Staatsblad text (${articlesJson.staatsbladReference})
 * by scripts/build_cbw_corpus_from_stb.mjs and copied here by
 * scripts/sync_cbw_corpus_data.mjs. Every article paragraph and bijlage line
 * is verbatim Staatsblad text, in Dutch — there is no official English
 * translation, and a translation made here would be reconstruction.
 *
 * Regenerate:
 *   node scripts/build_cbw_corpus_from_stb.mjs
 *   node scripts/sync_cbw_corpus_data.mjs
 */
`;

const tsContent =
  banner +
  `export const cbwArticlesData = ${JSON.stringify(articlesJson, null, 2)};\n\n` +
  `export const cbwBijlagenData = ${JSON.stringify(bijlagenJson, null, 2)};\n`;

const target = path.join(rootDir, "artifacts/conformity/src/data/cbwCorpusData.ts");
fs.writeFileSync(target, tsContent);
console.log(`Wrote ${target} (${(tsContent.length / 1024).toFixed(0)} KiB)`);
