import { pgTable, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Global (non-locale) application settings. Currently holds the LLM model
 * selection per role. This stores only non-secret configuration (model ids and
 * preferences); API keys always live in Replit Secrets, never in the database.
 * Persisted as a single row (id = 1).
 */
export type LlmConfig = {
  openrouterApiKey?: string; // stored in Postgres DB for admin web app configuration
  chatModel?: string;
  embeddingModel?: string;
  longContextModel?: string;
  briefModel?: string;
  searchModel?: string;
  translationModel?: string;
};

/**
 * Non-secret per-integration health snapshot, updated on every verify/test/send/
 * post. Surfaced in the masked GET (it contains no credentials). Timestamps are
 * epoch ms; `lastError` is a short human-readable string.
 */
export type IntegrationHealth = {
  lastCheckedAt?: number | null;
  lastSuccessAt?: number | null;
  lastFailureAt?: number | null;
  lastError?: string | null;
};

/**
 * Admin-editable email (SMTP) delivery settings. Unlike LLM API keys — which
 * live in Replit Secrets — these are configured from the admin console and so
 * must be persisted. `smtpPassword` is a secret: it is never returned to the
 * client (the API masks it to a boolean "set" flag).
 */
export type EmailConfig = {
  enabled?: boolean;
  fromName?: string;
  fromEmail?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string; // secret — never sent to the client
  // Where operational alerts (failed social shares, expiring tokens) are sent.
  // Not a secret — falls back to fromEmail when unset.
  alertEmail?: string;
  // Non-secret observability snapshot (last verify/send outcome).
  health?: IntegrationHealth;
};

/**
 * Admin-editable LinkedIn settings. `accessToken` and `clientSecret` are
 * secrets. `expiresAt` (epoch ms) tracks token expiry for proactive warnings;
 * `lastExpiryWarningAt` (epoch ms) throttles those warning emails. `clientId`/
 * `clientSecret` power the OAuth re-authorization flow.
 */
export type LinkedinConfig = {
  enabled?: boolean;
  autoPublish?: boolean;
  profileUrl?: string;
  authorUrn?: string; // e.g. urn:li:person:xxx or urn:li:organization:xxx
  accessToken?: string; // secret — never sent to the client
  expiresAt?: number | null; // epoch ms when the access token expires
  lastExpiryWarningAt?: number | null; // epoch ms of last expiry warning email
  // Dedupe key of the last expiry warning sent (e.g. "expiring:<expiresAtMs>" or
  // "invalid:<expiresAtMs|unknown>"). One email per key — a new token (new
  // expiresAt) or a phase change (expiring -> invalid) re-keys and re-alerts.
  lastExpiryWarningKey?: string | null;
  clientId?: string; // OAuth app client id (admin-configured)
  clientSecret?: string; // secret — never sent to the client
  // Non-secret observability snapshot (last verify/post outcome).
  health?: IntegrationHealth;
};

/** Admin-editable X (Twitter) settings. All four credentials are secrets. */
export type XConfig = {
  enabled?: boolean;
  autoPublish?: boolean;
  username?: string;
  apiKey?: string; // secret
  apiSecret?: string; // secret
  accessToken?: string; // secret
  accessSecret?: string; // secret
  // Non-secret observability snapshot (last verify/post outcome).
  health?: IntegrationHealth;
};

/**
 * CRA incident deadline alert emails (conformity app). Non-secret.
 * `recipient` falls back to emailConfig.alertEmail -> fromEmail when blank.
 */
export type ConformityAlertsConfig = {
  enabled?: boolean;
  recipient?: string;
  /** Hours before a due timestamp at which an "approaching" alert fires. */
  leadTimeHours?: number;
  /** Send at most one digest per UTC day of overdue / due-soon incidents. */
  digestEnabled?: boolean;
  /** Hours between repeat "still overdue" reminders for a breached stage. */
  reminderIntervalHours?: number;
  /** Max repeat reminders per breached stage (after the initial breach email). */
  maxReminders?: number;
};

export const appSettingsTable = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  llmConfig: jsonb("llm_config").$type<LlmConfig>().notNull().default({}),
  emailConfig: jsonb("email_config").$type<EmailConfig>().notNull().default({}),
  linkedinConfig: jsonb("linkedin_config").$type<LinkedinConfig>().notNull().default({}),
  xConfig: jsonb("x_config").$type<XConfig>().notNull().default({}),
  conformityAlertsConfig: jsonb("conformity_alerts_config")
    .$type<ConformityAlertsConfig>()
    .notNull()
    .default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertAppSettingsSchema = createInsertSchema(appSettingsTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
export type AppSettingsRow = typeof appSettingsTable.$inferSelect;
