/**
 * Copies the built BSIG corpus JSON into the conformity app's TypeScript
 * module — the same pipeline as the CRA, NIS2 and Cbw corpora: built from
 * the committed source by scripts/build_bsig_corpus_from_gii.mjs, copied
 * verbatim here, and CI re-runs both steps to prove the bundle is
 * byte-for-byte reproducible.
 */
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const corpusDir = path.join(rootDir, "docs/bsig_statutory_corpus");

const read = (f) => JSON.parse(fs.readFileSync(path.join(corpusDir, f), "utf8"));
const sectionsJson = read("01_sections_full.json");
const anlagenJson = read("02_anlagen_full.json");

const banner = `/**
 * BSI-Gesetz corpus — the core of the German NIS2 transposition (W2.4 DE).
 *
 * GENERATED FILE — DO NOT EDIT BY HAND.
 * Built from the CONSOLIDATED gesetze-im-internet.de text (${sectionsJson.jurabk},
 * enacted by Artikel 1 NIS2UmsuCG, ${sectionsJson.fundstelle}) by
 * scripts/build_bsig_corpus_from_gii.mjs and copied here by
 * scripts/sync_bsig_corpus_data.mjs. Every section and Anlage line is
 * verbatim source text, in German — no official English translation exists,
 * and a translation made here would be reconstruction. The consolidation
 * (not the promulgation) was chosen because the law has already been
 * amended; the metadata carries the verbatim amendment trail.
 *
 * Regenerate:
 *   node scripts/build_bsig_corpus_from_gii.mjs
 *   node scripts/sync_bsig_corpus_data.mjs
 */
`;

const tsContent =
  banner +
  `export const bsigSectionsData = ${JSON.stringify(sectionsJson, null, 2)};\n\n` +
  `export const bsigAnlagenData = ${JSON.stringify(anlagenJson, null, 2)};\n`;

const target = path.join(rootDir, "artifacts/conformity/src/data/bsigCorpusData.ts");
fs.writeFileSync(target, tsContent);
console.log(`Wrote ${target} (${(tsContent.length / 1024).toFixed(0)} KiB)`);
