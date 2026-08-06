/**
 * CLI entry for the conformity reference-layer seed. The seeding logic lives in
 * `seedConformity.ts` as an exported function so the server's startup bootstrap
 * can reuse it without triggering a top-level self-invocation on import.
 */
import { pool } from "@workspace/db";
import { seedConformity } from "./seedConformity";

seedConformity()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    process.stderr.write(`Conformity seed failed: ${String(err)}\n`);
    await pool.end();
    process.exit(1);
  });
