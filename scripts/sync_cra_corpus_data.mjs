/**
 * Copies the built CRA corpus JSON into the three app-local TypeScript modules.
 * Run after scripts/build_cra_corpus_from_eurlex.mjs.
 */
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const corpusDir = path.join(rootDir, "docs/cra_statutory_corpus");

const read = (f) => JSON.parse(fs.readFileSync(path.join(corpusDir, f), "utf8"));
const recitalsJson = read("01_recitals_full.json");
const articlesJson = read("02_articles_full.json");
const annexesJson = read("03_annexes_full.json");
const graphJson = read("04_bidirectional_graph.json");

const banner = `/**
 * CRA statutory corpus — ${recitalsJson.regulation}.
 *
 * GENERATED FILE — DO NOT EDIT BY HAND.
 * Built from the Official Journal text (${recitalsJson.officialJournalReference},
 * CELEX ${recitalsJson.celex}) by scripts/build_cra_corpus_from_eurlex.mjs and copied
 * here by scripts/sync_cra_corpus_data.mjs. Every recital, article paragraph and annex
 * line is verbatim OJ text; cross-references are extracted from that text.
 *
 * Regenerate:
 *   node scripts/build_cra_corpus_from_eurlex.mjs --refetch
 *   node scripts/sync_cra_corpus_data.mjs
 */
`;

const tsContent =
  banner +
  `export const recitalsData = ${JSON.stringify(recitalsJson, null, 2)};\n\n` +
  `export const articlesData = ${JSON.stringify(articlesJson, null, 2)};\n\n` +
  `export const annexesData = ${JSON.stringify(annexesJson, null, 2)};\n\n` +
  `export const graphData = ${JSON.stringify(graphJson, null, 2)};\n`;

const targetFiles = [
  path.join(rootDir, "artifacts/api-server/src/lib/craCorpusData.ts"),
  path.join(rootDir, "artifacts/conformity/src/data/craCorpusData.ts"),
  path.join(rootDir, "artifacts/oxot-web/src/data/craCorpusData.ts"),
];

for (const target of targetFiles) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, tsContent, "utf8");
  console.log(`Updated ${path.relative(rootDir, target)}`);
}

const articleCount = articlesJson.chapters.reduce((n, c) => n + c.articles.length, 0);
console.log(
  `Synchronised ${recitalsJson.totalRecitals} recitals, ${articleCount} articles ` +
    `across ${articlesJson.chaptersCount} chapters, and ${annexesJson.totalAnnexes} annexes.`
);
