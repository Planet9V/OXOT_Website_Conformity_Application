import { logger } from "./logger";
import { getSlackConfig, recordIntegrationHealth, recordIntegrationEvent } from "./integrationSettings";

/**
 * Slack notification seam. Delivery uses a static Incoming Webhook URL
 * configured by the admin in the admin console (stored in app_settings, not
 * env) — unlike LinkedIn/X, this needs no OAuth and no token refresh. Until
 * Slack is enabled and configured, sends are a no-op that logs the intended
 * text, mirroring mailer.ts's sendEmail() seam.
 */

export interface SendSlackResult {
  delivered: boolean;
  error?: string;
}

/** Whether Slack delivery is enabled and has a webhook URL configured. */
export async function isSlackConfigured(): Promise<boolean> {
  const config = await getSlackConfig();
  return Boolean(config.enabled && config.webhookUrl);
}

/** Post a single message to the configured Slack webhook. Never throws. */
export async function sendSlackMessage(text: string): Promise<SendSlackResult> {
  try {
    const config = await getSlackConfig();
    if (!config.enabled || !config.webhookUrl) {
      logger.warn("Slack not configured; skipping send");
      void recordIntegrationEvent({
        integration: "slack",
        kind: "send",
        success: false,
        detail: "slack_not_configured",
      });
      return { delivered: false, error: "slack_not_configured" };
    }
    const res = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      throw new Error(`slack webhook responded ${res.status}`);
    }
    void recordIntegrationHealth("slack", { success: true });
    void recordIntegrationEvent({ integration: "slack", kind: "send", success: true, detail: text.slice(0, 120) });
    return { delivered: true };
  } catch (err) {
    const error = (err instanceof Error ? err.message : "send_failed").slice(0, 300);
    void recordIntegrationHealth("slack", { success: false, error });
    void recordIntegrationEvent({ integration: "slack", kind: "send", success: false, detail: error });
    return { delivered: false, error };
  }
}
