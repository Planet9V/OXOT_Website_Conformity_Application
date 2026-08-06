import {
  getLinkedinConfig,
  getAlertRecipient,
  claimLinkedinExpiryWarning,
  releaseLinkedinExpiryWarning,
  recordIntegrationEvent,
} from "./integrationSettings";
import { getLinkedinStatusLive } from "./social";
import { sendEmail, isMailConfigured } from "./mailer";
import { logger } from "./logger";

/**
 * Scheduled LinkedIn token expiry check.
 *
 * Calls the LIVE LinkedIn validation (introspection when client credentials
 * are configured, else a bearer probe) and emails the admin when the token is
 * already invalid or has fewer than EXPIRY_WINDOW_DAYS days left.
 *
 * Dedupe: exactly one email per (phase, expiry) — the dedupe key
 * (`expiring:<expiresAtMs>` / `invalid:<expiresAtMs|unknown>`) is persisted in
 * linkedin_config.lastExpiryWarningKey. Re-authorizing (new token → new
 * expiresAt) or the phase worsening (expiring → invalid) re-keys and re-alerts;
 * repeated daily runs with the same key send nothing. The key is claimed
 * BEFORE sending and released on a failed send, so overlapping runs (dev
 * timer + external cron) never double-send and a failed send retries next run.
 *
 * Shared by the in-process dev timer (index.ts) and the bearer-guarded
 * external cron trigger (production autoscale has no always-on process).
 */

const EXPIRY_WINDOW_DAYS = 7;
const DAY_MS = 86_400_000;

export interface LinkedinExpiryScanResult {
  ranAt: string;
  /** Whether a live validation call was made. */
  checked: boolean;
  /** Why the scan stopped early, when it did. */
  skipped?: string;
  /** Days until expiry, when known. */
  expiresInDays?: number | null;
  /** Whether a warning email was sent this run. */
  warned: boolean;
  /** Send failure detail, if the email could not be delivered. */
  error?: string | null;
}

export async function runLinkedinExpiryScan(
  now: number = Date.now(),
): Promise<LinkedinExpiryScanResult> {
  const result: LinkedinExpiryScanResult = {
    ranAt: new Date(now).toISOString(),
    checked: false,
    warned: false,
  };

  const cfg = await getLinkedinConfig();
  if (cfg.enabled === false) {
    result.skipped = "linkedin disabled";
    return result;
  }
  if (!cfg.accessToken) {
    result.skipped = "no access token configured";
    return result;
  }

  const status = await getLinkedinStatusLive();
  result.checked = Boolean(status.checked);

  // Prefer the live expiry; fall back to the stored one (from the OAuth flow)
  // when introspection isn't available (no client credentials).
  const expiresAtMs = status.expiresAt
    ? Date.parse(status.expiresAt)
    : (cfg.expiresAt ?? null);
  const msLeft = expiresAtMs != null ? expiresAtMs - now : null;
  const daysLeft =
    msLeft != null ? Math.max(0, Math.floor(msLeft / DAY_MS)) : null;
  result.expiresInDays = daysLeft;

  const invalid = status.valid === false || (msLeft != null && msLeft <= 0);
  const expiringSoon =
    !invalid && msLeft != null && msLeft < EXPIRY_WINDOW_DAYS * DAY_MS;

  if (!invalid && !expiringSoon) {
    result.skipped =
      status.valid === null && expiresAtMs == null
        ? `validation indeterminate: ${status.error ?? "no expiry information"}`
        : "token healthy";
    return result;
  }

  const warningKey = invalid
    ? `invalid:${expiresAtMs ?? "unknown"}`
    : `expiring:${expiresAtMs}`;
  if (cfg.lastExpiryWarningKey === warningKey) {
    result.skipped = "already alerted for this token/phase";
    return result;
  }

  // Don't claim the dedupe key while nothing can be sent — the alert fires
  // once email becomes configured instead of being burned silently.
  if (!(await isMailConfigured())) {
    logger.warn("LinkedIn token expiring/invalid but email sending is not configured");
    result.skipped = "email not configured";
    return result;
  }
  const to = await getAlertRecipient();
  if (!to) {
    // Don't claim the key while nothing can be sent — the alert fires once a
    // recipient is configured instead of being burned silently.
    logger.warn("LinkedIn token expiring/invalid but no alert recipient configured");
    result.skipped = "no alert recipient configured";
    return result;
  }

  // Atomically claim BEFORE sending (conditional UPDATE: only succeeds when
  // the stored key differs from ours), so overlapping runs — the in-process
  // timer and the external cron — can never both send.
  const previousKey = cfg.lastExpiryWarningKey ?? null;
  const claimed = await claimLinkedinExpiryWarning(warningKey, now);
  if (!claimed) {
    result.skipped = "another run already claimed this alert";
    return result;
  }

  const when = expiresAtMs != null ? new Date(expiresAtMs).toISOString() : null;
  const html = invalid
    ? `<p>Your LinkedIn access token is <strong>expired or invalid</strong>${when ? ` (expiry: ${when})` : ""}.</p>
       <p>Posts to LinkedIn will fail until you reconnect. Open the admin
       Settings page &rarr; Social and use "Connect / Reconnect LinkedIn" to
       authorize a fresh token.</p>`
    : `<p>Your LinkedIn access token expires in <strong>${daysLeft} day(s)</strong> (expiry: ${when}).</p>
       <p>To avoid interruption, open the admin Settings page &rarr; Social and
       use "Connect / Reconnect LinkedIn" to refresh it before it lapses.</p>`;
  const subject = invalid
    ? "OXOT: LinkedIn token has expired"
    : `OXOT: LinkedIn token expires in ${daysLeft} day(s)`;

  const sent = await sendEmail({ to, subject, html });
  if (sent.delivered) {
    result.warned = true;
    void recordIntegrationEvent({
      integration: "email",
      kind: "linkedin_token_alert",
      success: true,
      detail: `${warningKey} → ${to}`,
    });
  } else {
    // Release OUR claim (conditional on the key still being ours) so the next
    // scan retries the send.
    await releaseLinkedinExpiryWarning(warningKey, previousKey);
    result.error = sent.error ?? "not delivered";
    logger.warn({ error: sent.error }, "LinkedIn expiry warning email not delivered");
    void recordIntegrationEvent({
      integration: "email",
      kind: "linkedin_token_alert",
      success: false,
      detail: `${warningKey}: ${sent.error ?? "not delivered"}`,
    });
  }
  return result;
}
