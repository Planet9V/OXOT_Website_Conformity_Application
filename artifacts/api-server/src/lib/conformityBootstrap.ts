/**
 * Startup self-seeding for the conformity workbench.
 *
 * A freshly published deployment gets its schema from Replit's publish flow,
 * but the DATA starts empty — no regulations/requirements, no CRA process
 * flow, no example workspace. This bootstrap runs once per server boot and
 * idempotently guarantees the baseline the product depends on:
 *
 *  1. Reference layer (regulations, requirements, classes, routes, themes):
 *     seeded when the requirements table is empty.
 *  2. CRA process flow (`cra-default`): ALWAYS present. If it is missing it is
 *     restored from the canonical template, without touching existing flows.
 *  3. Example workspace (demo product + assessment + flow run): seeded only
 *     when there are ZERO conformity products, so a blank deployment is never
 *     empty but real customer data is never clobbered.
 *
 * Concurrency: autoscale can boot several instances at once, so the whole
 * bootstrap runs under a pg advisory lock; losers of the race skip (the winner
 * has either done the work or is doing it).
 */
import { eq } from "drizzle-orm";
import {
  db,
  pool,
  requirementsTable,
  conformityFlowsTable,
  conformityProductsTable,
} from "@workspace/db";
import { logger } from "./logger";
import { seedConformity } from "../scripts/seedConformity";
import { seedDemo, seedDemoMembers, seedDemoNis2Declarations } from "../scripts/seedDemo";
import { CRA_FLOW_KEY, CRA_FLOW_STEPS } from "../scripts/craFlowTemplate";

// Arbitrary but stable app-wide lock id for this bootstrap.
const BOOTSTRAP_LOCK_ID = 0x0c0f0b01;

export async function runConformityBootstrap(): Promise<void> {
  const client = await pool.connect();
  try {
    const lock = await client.query<{ locked: boolean }>(
      "SELECT pg_try_advisory_lock($1) AS locked",
      [BOOTSTRAP_LOCK_ID],
    );
    if (!lock.rows[0]?.locked) {
      logger.info("Conformity bootstrap: another instance holds the lock; skipping.");
      return;
    }
    try {
      // 0. Ensure team members (Jim, Jill, Jack, Nancy) are always present on server boot
      try {
        await seedDemoMembers();
        await seedDemoNis2Declarations();
        logger.info("Conformity bootstrap: team members (Jim, Jill, Jack, Nancy) verified & seeded.");
      } catch (memErr) {
        logger.error({ err: memErr }, "Failed to seed team members on bootstrap");
      }

      const [req] = await db.select({ id: requirementsTable.id }).from(requirementsTable).limit(1);
      const [product] = await db
        .select({ id: conformityProductsTable.id })
        .from(conformityProductsTable)
        .limit(1);

      // 1. Reference layer. `seedConformity` is a destructive clear+repopulate,
      // so it may ONLY run on a pristine database: no requirements AND no
      // products. If a workspace has products but an empty catalogue, that is
      // an operator problem to resolve deliberately — never auto-reset it.
      if (!req && !product) {
        logger.info("Conformity bootstrap: pristine database — seeding reference layer.");
        await seedConformity();
      } else if (!req) {
        logger.warn(
          "Conformity bootstrap: requirements catalogue is empty but products exist — NOT auto-seeding (run seed:conformity deliberately).",
        );
      }

      // 3. Example workspace (also creates/refreshes the CRA flow + a run).
      if (!product) {
        logger.info("Conformity bootstrap: no products — seeding example CRA workspace.");
        await seedDemo();
      }

      // 2. CRA flow template must exist even when real data is present (e.g.
      // the flow was deleted, or products predate the flows feature).
      const [flow] = await db
        .select({ id: conformityFlowsTable.id })
        .from(conformityFlowsTable)
        .where(eq(conformityFlowsTable.key, CRA_FLOW_KEY))
        .limit(1);
      if (!flow) {
        logger.info("Conformity bootstrap: CRA flow missing — restoring from template.");
        await db.insert(conformityFlowsTable).values({
          key: CRA_FLOW_KEY,
          name: "CRA conformity assessment",
          description:
            "Standard end-to-end Cyber Resilience Act assessment process: scope, standards route, xBOM analysis, gap closure, documentation and declaration.",
          steps: CRA_FLOW_STEPS,
        });
      }
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [BOOTSTRAP_LOCK_ID]);
    }
  } finally {
    client.release();
  }
}
