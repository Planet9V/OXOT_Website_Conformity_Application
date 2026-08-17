/**
 * The lifecycle guard (task 15.5, L55): an act's text is not its status.
 *
 * For every EU-act corpus, fetch the act's EUR-Lex ALL view and extract the
 * relationship rows that can change the text — "Corrected by" and
 * "Modified by" (and "Repealed by") — then require every one of them to be
 * ACCOUNTED FOR in the corpus metadata: applied corrigenda, noted
 * language-scoped corrigenda, the amendment trail of a consolidated corpus,
 * pending (future-dated) amendments, or a recorded repeal.
 *
 * Three states, and a POSITIVE CONTROL per act: if the page does not surface
 * relations we ALREADY KNOW exist, the extraction is broken and the honest
 * answer is "could not verify", never "clean" (the B3 lesson).
 *
 * This is the check whose absence let four shipped corpora drift: the CRA
 * and NIS2 carried unapplied EN corrigenda, the AI Act and Machinery
 * Regulation were amended in force for weeks with every gate green.
 *
 * Usage: node scripts/check_lifecycle.mjs [--offline]
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const OFFLINE = process.argv.includes("--offline");

/** Per act: where its metadata lives and a relation the page MUST show. */
const ACTS = [
  { key: "cra", celex: "32024R2847", corpus: "docs/cra_statutory_corpus/02_articles_full.json", mustFind: "32024R2847R(02)" },
  { key: "nis2", celex: "32022L2555", corpus: "docs/nis2_statutory_corpus/02_articles_full.json", mustFind: "32022L2555R(04)" },
  { key: "ai_act", celex: "32024R1689", corpus: "docs/ai_act_statutory_corpus/02_articles_full.json", mustFind: "32026R1744" },
  { key: "machinery", celex: "32023R1230", corpus: "docs/machinery_statutory_corpus/02_articles_full.json", mustFind: "32024R2748" },
  { key: "gpsr", celex: "32023R0988", corpus: "docs/gpsr_statutory_corpus/02_articles_full.json", mustFind: "32024R2748" },
  { key: "red", celex: "32014L0053", corpus: "docs/red_statutory_corpus/02_articles_full.json", mustFind: "32022L2380" },
  { key: "red_delegated", celex: "32022R0030", corpus: "docs/red_delegated_2022_30/02_articles_full.json", mustFind: "32023R2444" },
];

function fetchText(url) {
  return execFileSync("curl", ["-sL", "--max-time", "90", "-H", "User-Agent: Mozilla/5.0", url], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** Every text-affecting relation id on the ALL page. */
function extractRelations(allHtml) {
  const plain = allHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const section = plain.slice(plain.indexOf("Modified by:"));
  const rel = new Set();
  for (const m of section.matchAll(/(?:Corrected by|Modified by|Repealed by|Completed by)\s+(3\d{4}[A-Z]\d{4}(?:R\(\d{2}\))?)/g)) {
    // "Completed by" acts SUPPLEMENT (delegated/implementing) — they do not
    // change the text and are not required to be accounted; everything else is.
    const kind = m[0].split(" ")[0];
    if (kind !== "Completed") rel.add(m[1]);
  }
  return rel;
}

/** Everything this corpus's metadata accounts for. */
function accountedFor(corpusPath, ownCelex) {
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, corpusPath), "utf8"));
  const ids = new Set([ownCelex]);
  for (const c of meta.corrigenda ?? []) if (c.id) ids.add(c.id);
  // The CRA builder flattens applied corrigenda without ids; account them via
  // eli date → R-number is not derivable, so also accept: any applied
  // corrigendum counts by its ojRef presence — handled by corrigendaNoted +
  // explicit ids below. Builders SHOULD carry ids; where they do not yet, the
  // noted list must.
  for (const c of meta.corrigendaNoted ?? []) if (c.id) ids.add(c.id);
  for (const a of meta.amendmentTrail ?? []) if (a.celex) ids.add(a.celex);
  for (const a of meta.pendingAmendments ?? []) if (a.celex) ids.add(a.celex);
  for (const a of meta.amendments ?? []) if (a.celex) ids.add(a.celex);
  if (meta.repeal?.celex) ids.add(meta.repeal.celex);
  if (meta.appliedCorrigendaIds) for (const id of meta.appliedCorrigendaIds) ids.add(id);
  return { ids, meta };
}

let failed = false;
let unverified = 0;
for (const act of ACTS) {
  if (OFFLINE) {
    console.log(`  ----  ${act.key}  offline — lifecycle NOT verified`);
    unverified++;
    continue;
  }
  let html;
  try {
    html = fetchText(`https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:${act.celex}`);
  } catch {
    console.log(`  ----  ${act.key}  EUR-Lex unreachable — lifecycle NOT verified`);
    unverified++;
    continue;
  }
  if (!html || html.length < 50_000 || !html.includes("Modified by")) {
    console.log(`  ----  ${act.key}  ALL view did not render its relationship table — NOT verified`);
    unverified++;
    continue;
  }
  const relations = extractRelations(html);
  if (!relations.has(act.mustFind)) {
    console.log(`  ----  ${act.key}  POSITIVE CONTROL failed: known relation ${act.mustFind} not surfaced — extraction broken, NOT verified`);
    unverified++;
    continue;
  }
  const { ids } = accountedFor(act.corpus, act.celex);
  const unaccounted = [...relations].filter((r) => !ids.has(r));
  if (unaccounted.length) {
    console.log(`  FAIL  ${act.key}  unaccounted lifecycle relations: ${unaccounted.join(", ")} — the law may have moved`);
    failed = true;
  } else {
    console.log(`  PASS  ${act.key}  all ${relations.size} text-affecting relations accounted for`);
  }
}

if (failed) {
  console.error("\nLifecycle check FAILED — a corpus may carry superseded text. Investigate before shipping.");
  process.exit(1);
}
if (unverified) console.log(`\n${unverified} act(s) could not be verified — stated, never counted as clean.`);
console.log("Lifecycle check complete.");
