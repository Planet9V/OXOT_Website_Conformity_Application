/**
 * CLI entry for the demo workspace seed. The seeding logic lives in
 * `seedDemo.ts` as an exported function so the server's startup bootstrap can
 * reuse it without triggering a top-level self-invocation on import.
 */
import { pool } from "@workspace/db";
import { seedDemo } from "./seedDemo";

seedDemo()
  .then(async () => {
    await pool.end();
  })
  .catch(async (err) => {
    console.error("[seed:demo] failed:", err);
    await pool.end();
    process.exitCode = 1;
  });
