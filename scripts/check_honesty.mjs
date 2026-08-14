/**
 * Honesty gate (task_plan gate G4).
 *
 * Fails the build when a UI string asserts that a legal act was performed, a
 * status was verified, or an exemption was granted — the class of defect that
 * made this application dangerous to its users. tsc cannot catch these: every
 * one of them was a well-typed string (see docs/cra-personas/lessons.md, L3).
 *
 * A match is allowed only if the line, or the line above it, carries:
 *     honesty-ok: <reason>
 * The reason is mandatory and is printed in the report, so waivers stay visible.
 *
 * Usage: node scripts/check_honesty.mjs [--list]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = [
  "artifacts/conformity/src",
  "artifacts/oxot-web/src",
  "artifacts/api-server/src",
];
const EXT = new Set([".ts", ".tsx"]);
const SKIP = /node_modules|\/dist\/|craCorpusData\.ts|\.test\.tsx?$|__tests__/;

/**
 * Each rule is deliberately narrow. Broad rules get waived wholesale and stop
 * meaning anything; narrow rules stay actionable.
 */
const RULES = [
  {
    id: "claims-statutory-filing",
    why: "asserts a notification/report was filed with an authority",
    re: /\b(filed successfully|successfully filed|transmitted to (?:ENISA|CSIRT|the authority)|dispatched to (?:ENISA|CSIRT)|notification(?:s)? (?:sent|dispatched|transmitted)|report(?:ed)? to (?:ENISA|CSIRT) successfully|TRANSMITTED TO)\b/i,
  },
  {
    id: "claims-outbound-send",
    why: "asserts this app contacted a third party",
    re: /\b(advisory dispatched|dispatched to all|sent to all|emailed to|notified all (?:customers|CISOs))\b/i,
  },
  {
    id: "claims-exemption-granted",
    why: "asserts a legal exemption or immunity was conferred",
    re: /\b(liability exemption granted|exemption granted|legally exempt|zero (?:manufacturer )?liability|safe harbou?r (?:shield )?(?:enabled|active|granted)|indemnif)\b/i,
  },
  {
    id: "claims-certified",
    why: "asserts certification/verification this app cannot perform",
    re: /\b(certified (?:non-commercial|compliant|conformant)|legally recognized|legally recognised|officially recognised|statutorily valid)\b/i,
  },
  {
    id: "hardcoded-total-assurance",
    why: "absolute assurance figure stated as a literal",
    re: /["'`>][^"'`<]*\b(100\s*%\s*(?:verified|protected|compliant|conformant|audit ready|machine-readable|cleared)|fully compliant|zero known (?:vulnerabilities|gaps))\b/i,
  },
  {
    id: "empty-string-sha256",
    why: "SHA-256 of the empty string presented as a real digest",
    re: /e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855/i,
  },
  {
    id: "fake-digest",
    why: "digest fabricated from Math.random()",
    re: /Math\.random\(\)[\s\S]{0,120}?(sha256|digest)/i,
  },
  {
    id: "silent-mock-fallback",
    why: "falls back to sample data instead of an error state",
    re: /\|\|\s*(MOCK_[A-Z_]+|DEFAULT_FALLBACK_[A-Z_]+|SAMPLE_[A-Z_]+)\b/,
  },
];

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (SKIP.test(p)) continue;
    if (e.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(p))) out.push(p);
  }
  return out;
}

const WAIVER = /honesty-ok:\s*(.+)$/;

function scan() {
  const violations = [];
  const waivers = [];
  for (const dir of SCAN_DIRS) {
    for (const file of walk(path.join(ROOT, dir))) {
      const lines = fs.readFileSync(file, "utf8").split("\n");
      for (let i = 0; i < lines.length; i++) {
        for (const rule of RULES) {
          if (!rule.re.test(lines[i])) continue;
          const here = WAIVER.exec(lines[i]);
          const above = i > 0 ? WAIVER.exec(lines[i - 1]) : null;
          const waiver = here || above;
          const rel = path.relative(ROOT, file);
          if (waiver) {
            waivers.push({ file: rel, line: i + 1, rule: rule.id, reason: waiver[1].trim() });
          } else {
            violations.push({
              file: rel,
              line: i + 1,
              rule: rule.id,
              why: rule.why,
              text: lines[i].trim().slice(0, 140),
            });
          }
        }
      }
    }
  }
  return { violations, waivers };
}

const { violations, waivers } = scan();

if (process.argv.includes("--list")) {
  console.log(`Rules (${RULES.length}):`);
  for (const r of RULES) console.log(`  ${r.id} — ${r.why}`);
}

if (waivers.length) {
  console.log(`\n${waivers.length} waived:`);
  for (const w of waivers) console.log(`  ${w.file}:${w.line} [${w.rule}] — ${w.reason}`);
}

if (violations.length) {
  console.error(`\nHONESTY GATE FAILED — ${violations.length} unearned claim(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}`);
    console.error(`    rule : ${v.rule} — ${v.why}`);
    console.error(`    code : ${v.text}`);
    console.error(
      `    fix  : state what actually happened, or add "honesty-ok: <reason>" if the claim is genuinely computed.\n`
    );
  }
  process.exit(1);
}

console.log(`\nHonesty gate passed — no unearned statutory claims found.`);
