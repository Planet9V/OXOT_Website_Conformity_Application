#!/usr/bin/env node
/**
 * G8 — the UI reach gate.
 *
 * A capability that exists in the API but that no screen calls is invisible to
 * the customer. It passes typecheck, passes tests, ships, and does nothing.
 * Six of them accumulated before anyone noticed, and two of those looked
 * present because the words "attestations" and "mandates" appeared in a
 * navigation label and a copilot prompt chip. Grepping for the noun said
 * "covered". Grepping for the API path said otherwise.
 *
 * So this gate asks one question per capability: does any frontend source
 * contain a literal /api/... path that reaches it? Not the word — the path.
 *
 * ── The positive control ──
 *
 * A gate that checks the frontend alone can pass vacuously: rename a route in
 * the API and the registry below silently stops matching anything, at which
 * point every capability looks unreached OR the entry is quietly dropped. So
 * each entry is ALSO checked against the api-server routes. If a capability's
 * path is not found there, the registry is stale and that is reported as an
 * error rather than folded into the orphan count. This is the same failure the
 * CRA corpus verifier's B3 check had — it passed having detected nothing.
 *
 * Usage:
 *   node scripts/check_ui_reach.mjs                # report, exit 1 on any orphan
 *   node scripts/check_ui_reach.mjs --baseline 6   # tolerate 6 known orphans
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const FRONTEND = "artifacts/conformity/src";
const API_ROUTES = "artifacts/api-server/src/routes";

/**
 * Capability -> the distinctive path segment, and the surface that owns it.
 *
 * `home` comes from the orphan table in DESIGN_five_shapes.md iteration 2, so a
 * failure tells you where the thing belongs rather than merely that it is
 * missing. Keep the two in sync: this column is the design decision, not
 * something derivable from the code.
 */
const CAPABILITIES = [
  { name: "msa engagements",     path: "/conformity/msa/engagements",   home: "Authorities" },
  { name: "notified body",       path: "/conformity/notified-body",     home: "Products -> Assess; Organisation" },
  { name: "operator checks",     path: "/conformity/operator-checks",   home: "Products -> Verify" },
  { name: "steward policy",      path: "/conformity/steward/",          home: "Projects" },
  { name: "mandates",            path: "/conformity/mandates",          home: "Organisation -> Mandates" },
  { name: "attestations",        path: "/conformity/attestations",      home: "Signatures" },
  { name: "deemed manufacturer", path: "/conformity/deemed-manufacturer", home: "Products" },
  { name: "org obligations",     path: "/conformity/org/obligations",   home: "Home" },
  { name: "org profile",         path: "/conformity/org/profile",       home: "Organisation" },
  // Parented by a dynamic segment (/conformity/products/:id/statutory-file),
  // so the distinctive tail is the only stable thing to match on.
  { name: "statutory file",      path: "/statutory-file",               home: "Products -> product file" },
  { name: "evidence requests",   path: "/conformity/evidence-requests", home: "Home -> Your work" },
  { name: "entity incidents",    path: "/conformity/entity-incidents",  home: "Incidents" },
  // Consumed via the GENERATED client (spec-first), so the reach check is the
  // specific hook name appearing in app source — never a scan of the
  // generated client itself, which contains every path and would make the
  // gate pass vacuously.
  { name: "advisories",          path: "/conformity/advisories",        home: "Incidents", hook: "useListConformityAdvisories" },
  { name: "vuln reports",        path: "/conformity/vuln-reports",      home: "Incidents", hook: "useListConformityVulnReports" },
  { name: "product bulk import", path: "/conformity/products/import",   home: "Products",  hook: "useImportConformityProducts" },
  // Parented by a dynamic assessment id, so the distinctive tail is matched.
  { name: "auditor access",      path: "/auditor-access",               home: "Products -> product file", hook: "useListAuditorAccess" },
  { name: "auditor rfis",        path: "/auditor-rfis",                 home: "Products -> product file", hook: "useListAuditorRfis" },
  { name: "product users",       path: "/users",                        home: "Products -> product file", hook: "useListProductUsers" },
  { name: "impacted users",      path: "/impacted-users",               home: "Incidents -> advisory",    hook: "useGetAdvisoryImpactedUsers" },
  { name: "user notifications",  path: "/user-notifications",           home: "Products -> product file; Incidents", hook: "useListUserNotifications" },
];

/** Every /api/... literal, including template-literal segments like ${id}. */
const API_PATH = /\/api\/[^\s"'`)\]]+/g;

function sourceFiles(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full, exts));
    else if (exts.includes(extname(full))) out.push(full);
  }
  return out;
}

function main() {
  const i = process.argv.indexOf("--baseline");
  const baseline = i >= 0 ? Number(process.argv[i + 1]) : 0;

  // What the UI actually calls — literal /api paths, plus the full source
  // text for hook-name checks on spec-first capabilities.
  const called = new Set();
  let appSource = "";
  for (const f of sourceFiles(FRONTEND, [".ts", ".tsx"])) {
    const text = readFileSync(f, "utf8");
    appSource += text;
    for (const m of text.matchAll(API_PATH)) called.add(m[0]);
  }

  // What the API actually serves — the positive control.
  const served = sourceFiles(API_ROUTES, [".ts"])
    .filter((f) => !f.includes("__tests__"))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");

  const reached = [];
  const orphans = [];
  const stale = [];

  for (const cap of CAPABILITIES) {
    if (!served.includes(cap.path)) {
      stale.push(cap);
      continue;
    }
    const viaPath = [...called].some((p) => p.includes(cap.path));
    const viaHook = cap.hook ? appSource.includes(cap.hook) : false;
    if (viaPath || viaHook) reached.push(cap);
    else orphans.push(cap);
  }

  console.log(`UI reach: ${called.size} distinct /api paths called by ${FRONTEND}\n`);

  for (const c of reached) console.log(`  reached   ${c.name}`);
  for (const c of orphans) console.log(`  ORPHAN    ${c.name}  -> belongs in: ${c.home}`);
  for (const c of stale) {
    console.log(`  STALE     ${c.name}  — "${c.path}" not found in ${API_ROUTES}`);
  }

  if (stale.length) {
    console.error(
      `\nUI reach gate FAILED — ${stale.length} registry entr(ies) match no API route.\n` +
        `The registry is stale, so this gate is not actually checking them. Fix the\n` +
        `path in scripts/check_ui_reach.mjs, or drop the entry if the capability is gone.`,
    );
    process.exit(1);
  }

  console.log(
    `\n${reached.length} reached, ${orphans.length} orphaned (baseline ${baseline}).`,
  );

  if (orphans.length > baseline) {
    console.error(
      `\nUI reach gate FAILED — ${orphans.length} orphan(s) exceeds baseline ${baseline}.\n` +
        `A capability no screen calls is invisible to the customer. Either build the\n` +
        `surface, or lower the claim — do not raise the baseline to make this pass.`,
    );
    process.exit(1);
  }

  console.log("UI reach gate passed.");
}


main();
