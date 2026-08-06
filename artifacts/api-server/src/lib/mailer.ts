import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "./logger";
import { getEmailConfig, recordIntegrationHealth, recordIntegrationEvent } from "./integrationSettings";
import type { EmailConfig } from "@workspace/db";

/**
 * Email-sending seam. Delivery uses SMTP credentials configured by the admin in
 * the admin console (stored in app_settings, not env). Until email is enabled
 * and configured, sends are a no-op that logs the intended subject, so the rest
 * of the newsletter system works end-to-end without a provider.
 */

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

export interface SendEmailResult {
  delivered: boolean;
  error?: string;
}

/** A config is usable only when enabled and the essential SMTP fields are set. */
function isConfigUsable(c: EmailConfig): boolean {
  return Boolean(c.enabled && c.smtpHost && c.smtpUser && c.smtpPassword && c.fromEmail);
}

/** Whether email delivery is enabled and fully configured. */
export async function isMailConfigured(): Promise<boolean> {
  const config = await getEmailConfig();
  return isConfigUsable(config);
}

/** From header for outgoing mail, e.g. `OXOT <news@oxot.eu>`. */
function formatFrom(c: EmailConfig): string {
  const email = c.fromEmail ?? "";
  return c.fromName ? `${c.fromName} <${email}>` : email;
}

function buildTransport(c: EmailConfig): Transporter {
  const port = c.smtpPort ?? 587;
  return nodemailer.createTransport({
    host: c.smtpHost,
    port,
    // `secure` true = implicit TLS (465); false = STARTTLS (587/25).
    secure: c.smtpSecure ?? port === 465,
    auth: { user: c.smtpUser, pass: c.smtpPassword },
  });
}

/** Send a single email. Returns delivered:false (never throws) on any failure. */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  // Everything (config read, transport creation, send) is inside one catch so
  // callers can rely on this never throwing — a DB hiccup must not crash a
  // newsletter batch send.
  try {
    const config = await getEmailConfig();
    if (!isConfigUsable(config)) {
      // Do not log the recipient address (PII).
      logger.warn({ subject: params.subject }, "Email not configured; skipping send");
      // Not configured is not a delivery failure per se — surface it but don't
      // pollute the failure health as an error the admin must fix.
      void recordIntegrationEvent({
        integration: "email",
        kind: "send",
        success: false,
        detail: "email_not_configured",
      });
      return { delivered: false, error: "email_not_configured" };
    }
    const transport = buildTransport(config);
    await transport.sendMail({
      from: formatFrom(config),
      to: params.to,
      subject: params.subject,
      html: params.html,
      headers: params.headers,
    });
    void recordIntegrationHealth("email", { success: true });
    void recordIntegrationEvent({ integration: "email", kind: "send", success: true, detail: params.subject });
    return { delivered: true };
  } catch (err) {
    const error = (err instanceof Error ? err.message : "send_failed").slice(0, 300);
    void recordIntegrationHealth("email", { success: false, error });
    void recordIntegrationEvent({ integration: "email", kind: "send", success: false, detail: error });
    return { delivered: false, error };
  }
}
