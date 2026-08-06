/**
 * Standalone entrypoint for the CRA deadline alert scan.
 *
 * Production runs this on a schedule (see replit.md — the autoscale web
 * deployment sleeps between requests, so an in-process timer is not reliable
 * there). Safe to run as often as you like: dedupe lives in the
 * conformity_alert_state table, so re-runs never double-send.
 *
 * Usage: pnpm --filter @workspace/api-server run alerts:run
 */
import { runConformityAlertScan } from "../lib/conformityAlertScan";

async function main(): Promise<void> {
  const result = await runConformityAlertScan();
  // Console (not the pino logger) so output is visible in scheduled-job logs.
  console.log(`[conformity-alerts] ${JSON.stringify(result)}`);
  if (!result.enabled) {
    console.log("[conformity-alerts] alerts are disabled in admin settings; nothing to do");
  } else if (!result.emailConfigured) {
    console.log("[conformity-alerts] email/recipient not configured; nothing sent");
  }
  process.exit(result.alertsFailed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[conformity-alerts] scan crashed:", err);
  process.exit(1);
});
