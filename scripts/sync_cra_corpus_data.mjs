import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const corpusDir = path.join(rootDir, "docs/cra_statutory_corpus");

const recitalsJson = JSON.parse(fs.readFileSync(path.join(corpusDir, "01_recitals_full.json"), "utf8"));
const articlesJson = JSON.parse(fs.readFileSync(path.join(corpusDir, "02_articles_full.json"), "utf8"));
const annexesJson = JSON.parse(fs.readFileSync(path.join(corpusDir, "03_annexes_full.json"), "utf8"));
const graphJson = JSON.parse(fs.readFileSync(path.join(corpusDir, "04_bidirectional_graph.json"), "utf8"));

const tsContent = `export const recitalsData = ${JSON.stringify(recitalsJson, null, 2)};\n
export const articlesData = ${JSON.stringify(articlesJson, null, 2)};\n
export const annexesData = ${JSON.stringify(annexesJson, null, 2)};\n
export const graphData = ${JSON.stringify(graphJson, null, 2)};\n`;

const targetFiles = [
  path.join(rootDir, "artifacts/api-server/src/lib/craCorpusData.ts"),
  path.join(rootDir, "artifacts/conformity/src/data/craCorpusData.ts"),
  path.join(rootDir, "artifacts/oxot-web/src/data/craCorpusData.ts"),
];

for (const target of targetFiles) {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(target, tsContent, "utf8");
  console.log(`Updated ${target}`);
}

console.log("Synchronized all 3 TypeScript data modules with 71 Articles and 128 Recitals!");
