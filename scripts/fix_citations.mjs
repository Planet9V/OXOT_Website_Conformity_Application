/**
 * Repairs the citations that scripts/check_citations.mjs reports.
 *
 *   node scripts/fix_citations.mjs --dry-run   # show what would change
 *   node scripts/fix_citations.mjs             # apply
 *
 * Driven entirely by the gate's own findings, so it can only touch lines the
 * gate flags. Two safeguards, both learned the hard way:
 *
 *  - A concept with MORE THAN ONE governing article is never auto-fixed.
 *    "Substantial modification" is Art. 21 for an importer or distributor and
 *    Art. 22 for anyone else; picking one requires knowing who the author meant.
 *    Those are listed for a human instead.
 *  - The wrong number must actually appear on the line, and only that number is
 *    replaced. No line is rewritten wholesale.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const DRY = process.argv.includes("--dry-run");

function gateFindings() {
  let out = "";
  try {
    out = execFileSync("node", ["scripts/check_citations.mjs"], { cwd: ROOT, encoding: "utf8" });
  } catch (e) {
    out = (e.stdout || "") + (e.stderr || "");
  }
  const findings = [];
  const lines = out.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const head = /^ {2}(\S+):(\d+) {2}\[(concept|range)\]/.exec(lines[i]);
    if (!head) continue;
    const detail = lines[i + 1] ?? "";
    const m = /"([^"]+)" is governed by (.+?), not Article ([\d/]+)\./.exec(detail);
    if (!m) continue;
    const governing = [...m[2].matchAll(/Article (\d+)/g)].map((x) => Number(x[1]));
    findings.push({
      file: m ? head[1] : head[1],
      line: Number(head[2]),
      concept: m[1],
      governing,
      wrong: m[3].split("/").map(Number),
    });
  }
  return findings;
}

const findings = gateFindings();
const auto = findings.filter((f) => f.governing.length === 1);
const manual = findings.filter((f) => f.governing.length > 1);

// Group by file so each file is read and written once.
const byFile = new Map();
for (const f of auto) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

let changed = 0;
let skipped = 0;
const touched = [];

for (const [rel, items] of byFile) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const lines = fs.readFileSync(abs, "utf8").split("\n");
  let fileChanged = 0;

  for (const f of items) {
    const idx = f.line - 1;
    if (idx < 0 || idx >= lines.length) continue;
    const right = f.governing[0];
    let line = lines[idx];
    const before = line;

    for (const wrong of f.wrong) {
      // Replace only this article number, keeping "Article"/"Art." style and
      // any paragraph suffix such as (2) or (10).
      const re = new RegExp(`\\b(Art(?:icle|\\.))(\\s*)${wrong}\\b`, "g");
      if (!re.test(line)) continue;
      line = line.replace(re, `$1$2${right}`);
    }
    if (line !== before) {
      lines[idx] = line;
      fileChanged++;
    } else {
      skipped++;
    }
  }

  if (fileChanged) {
    if (!DRY) fs.writeFileSync(abs, lines.join("\n"), "utf8");
    changed += fileChanged;
    touched.push({ rel, n: fileChanged });
  }
}

console.log(`\n${DRY ? "DRY RUN — nothing written" : "Applied"}\n`);
console.log(`  auto-fixable findings : ${auto.length}`);
console.log(`  citations corrected   : ${changed}`);
if (skipped) console.log(`  could not locate on line: ${skipped}`);
console.log(`  files touched         : ${touched.length}`);

const byConcept = {};
for (const f of auto) byConcept[f.concept] = (byConcept[f.concept] ?? 0) + 1;
console.log("\n  by concept:");
for (const [c, n] of Object.entries(byConcept).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(n).padStart(4)}  ${c}`);
}

if (manual.length) {
  console.log(
    `\n  ${manual.length} finding(s) NOT auto-fixed — the concept has more than one\n` +
      `  governing article, so the right one depends on who the author meant:\n`,
  );
  for (const f of manual) {
    console.log(`    ${f.file}:${f.line}  ${f.concept} — cites Art. ${f.wrong.join("/")}, ` +
                `should be Art. ${f.governing.join(" or ")}`);
  }
}
console.log();
