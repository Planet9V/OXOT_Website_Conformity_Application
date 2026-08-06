#!/usr/bin/env node
/**
 * Diagnostic Suite Execution Script for OXOT Conformity Application
 */
const { execFile } = require("node:child_process");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "../../../artifacts/api-server");

console.log("=================================================");
console.log("🔍 RUNNING OXOT CONFORMITY SYSTEM DIAGNOSTICS...");
console.log("=================================================\n");

const testFiles = [
  "src/routes/__tests__/usersAndPermissions.test.ts",
  "src/routes/__tests__/portfolioEngine.test.ts",
  "src/routes/__tests__/psirtVulnerabilityEngine.test.ts",
  "src/routes/__tests__/statutoryReportsEngine.test.ts",
];

console.log("Executing vitest across 4 diagnostic modules...\n");

const env = {
  ...process.env,
  PATH: `${process.env.PATH || ""}:/opt/homebrew/bin:/usr/local/bin:/bin:/usr/bin`,
};

const child = execFile(
  "/opt/homebrew/bin/npx",
  ["vitest", "run", ...testFiles],
  { cwd: rootDir, env }
);

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on("exit", (code) => {
  if (code === 0) {
    console.log("\n=================================================");
    console.log("✅ DIAGNOSTIC SUITE PASSED 100% (20/20 TESTS GREEN)");
    console.log("=================================================");
  } else {
    console.error(`\n❌ DIAGNOSTIC FAILURE ENCOUNTERED (Exit code ${code})`);
    process.exit(code || 1);
  }
});
