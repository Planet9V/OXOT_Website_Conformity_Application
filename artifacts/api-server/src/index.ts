import app from "./app";
import { logger } from "./lib/logger";
import { runDueScheduledSends } from "./lib/newsletter";
import { runLinkedinExpiryScan } from "./lib/linkedinExpiryScan";
import { runConformityAlertScan } from "./lib/conformityAlertScan";
import { runRegulatoryNewsSchedule } from "./lib/regulatoryNewsGenerator";
import { runConformityBootstrap } from "./lib/conformityBootstrap";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Self-heal baseline conformity data (reference layer, CRA flow, example
  // workspace) so a freshly published deployment is never blank. Idempotent,
  // advisory-locked, and fire-and-forget so it never blocks serving requests.
  runConformityBootstrap().catch((err) =>
    logger.error({ err }, "Conformity bootstrap failed"),
  );

  // Poll for scheduled newsletters whose send time has arrived. Single-flight
  // so a slow batch never overlaps the next tick.
  let schedulerBusy = false;
  setInterval(() => {
    if (schedulerBusy) return;
    schedulerBusy = true;
    runDueScheduledSends()
      .catch((err) => logger.error({ err }, "Scheduled newsletter poll failed"))
      .finally(() => {
        schedulerBusy = false;
      });
  }, 60_000);

  // Warn the admin by email before the LinkedIn access token expires. The scan
  // makes a LIVE validation call, so run it at most ~daily (first tick after
  // boot counts as that day's run). Dedupe is persisted in linkedin_config, so
  // this timer + the external cron trigger never double-send. Production
  // (autoscale, no always-on process) relies on the cron trigger instead.
  const EXPIRY_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
  let lastExpiryCheck = 0;
  let expiryCheckBusy = false;
  setInterval(() => {
    const now = Date.now();
    if (expiryCheckBusy || now - lastExpiryCheck < EXPIRY_CHECK_INTERVAL_MS) return;
    lastExpiryCheck = now;
    expiryCheckBusy = true;
    runLinkedinExpiryScan(now)
      .then((r) => {
        if (r.warned || r.error) {
          logger.info(r, "LinkedIn token expiry scan");
        }
      })
      .catch((err) => logger.error({ err }, "LinkedIn expiry check failed"))
      .finally(() => {
        expiryCheckBusy = false;
      });
  }, 60_000);

  // Scan CRA incident deadlines and email alerts. Dev/workspace convenience —
  // production (autoscale, no always-on process) must schedule the standalone
  // `alerts:run` script instead; see replit.md. Dedupe lives in the DB
  // (conformity_alert_state), so timer + script + manual runs never double-send.
  const ALERT_SCAN_MIN_INTERVAL_MS = 10 * 60 * 1000;
  let lastAlertScan = 0;
  let alertScanBusy = false;
  setInterval(() => {
    const now = Date.now();
    if (alertScanBusy || now - lastAlertScan < ALERT_SCAN_MIN_INTERVAL_MS) return;
    lastAlertScan = now;
    alertScanBusy = true;
    runConformityAlertScan()
      .then((r) => {
        if (r.enabled && (r.alertsSent || r.alertsFailed || r.digestSent)) {
          logger.info(r, "Conformity alert scan");
        }
      })
      .catch((err) => logger.error({ err }, "Conformity alert scan failed"))
      .finally(() => {
        alertScanBusy = false;
      });
  }, 60_000);

  // Daily regeneration of the live CRA regulatory-news corpus. The runner is
  // timezone-aware and guarded by lastRunAt in app_settings, so a 5-minute
  // tick fires the LLM search once per day at the configured local hour
  // (default 07:00 America/Chicago) only when the admin has enabled it.
  let newsScheduleBusy = false;
  setInterval(() => {
    if (newsScheduleBusy) return;
    newsScheduleBusy = true;
    runRegulatoryNewsSchedule()
      .then((r) => {
        if (r.ran) logger.info(r, "Regulatory news scheduled run");
      })
      .catch((err) => logger.error({ err }, "Regulatory news schedule failed"))
      .finally(() => {
        newsScheduleBusy = false;
      });
  }, 5 * 60_000);
});
