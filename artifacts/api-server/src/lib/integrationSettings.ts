import {
  db,
  appSettingsTable,
  integrationEventsTable,
  type EmailConfig,
  type LinkedinConfig,
  type XConfig,
  type ConformityAlertsConfig,
  type IntegrationHealth,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getAppSettings } from "./models";
import { logger } from "./logger";

export type IntegrationName = "email" | "linkedin" | "x";

/**
 * Admin-configurable integration settings (email/SMTP, LinkedIn, X).
 *
 * These live in the `app_settings` singleton row because they are edited from
 * the admin console and must persist. Secret fields (SMTP password, LinkedIn
 * token, X credentials) are NEVER returned to the client — the masked views
 * below replace each secret with a boolean "…Set" flag so the UI can show
 * whether a value is stored without ever exposing it. On save, an empty secret
 * field means "leave the stored value unchanged".
 */

// ---------- Masked (client-facing) shapes ----------

export interface MaskedHealth {
  lastCheckedAt: number | null;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  lastError: string | null;
}

export interface MaskedEmailConfig {
  enabled: boolean;
  fromName: string;
  fromEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPasswordSet: boolean;
  alertEmail: string;
  health: MaskedHealth;
}

export interface MaskedLinkedinConfig {
  enabled: boolean;
  autoPublish: boolean;
  profileUrl: string;
  authorUrn: string;
  accessTokenSet: boolean;
  // expiresAt is not a secret — surfaced so the UI can show token expiry.
  expiresAt: number | null;
  clientId: string;
  clientSecretSet: boolean;
  health: MaskedHealth;
}

export interface MaskedXConfig {
  enabled: boolean;
  autoPublish: boolean;
  username: string;
  apiKeySet: boolean;
  apiSecretSet: boolean;
  accessTokenSet: boolean;
  accessSecretSet: boolean;
  health: MaskedHealth;
}

/** No secrets in here — masked shape exists for UI symmetry + effectiveRecipient. */
export interface MaskedConformityAlertsConfig {
  enabled: boolean;
  recipient: string;
  leadTimeHours: number;
  digestEnabled: boolean;
  reminderIntervalHours: number;
  maxReminders: number;
  /** Where alerts actually go right now (recipient → alertEmail → fromEmail). */
  effectiveRecipient: string;
}

export interface MaskedIntegrationSettings {
  email: MaskedEmailConfig;
  linkedin: MaskedLinkedinConfig;
  x: MaskedXConfig;
  conformityAlerts: MaskedConformityAlertsConfig;
}

// ---------- Server-side getters (with secrets) ----------

export async function getEmailConfig(): Promise<EmailConfig> {
  const row = await getAppSettings();
  return row.emailConfig ?? {};
}

export async function getLinkedinConfig(): Promise<LinkedinConfig> {
  const row = await getAppSettings();
  return row.linkedinConfig ?? {};
}

export async function getXConfig(): Promise<XConfig> {
  const row = await getAppSettings();
  return row.xConfig ?? {};
}

export async function getConformityAlertsConfig(): Promise<ConformityAlertsConfig> {
  const row = await getAppSettings();
  return row.conformityAlertsConfig ?? {};
}

// ---------- Masking ----------

function maskHealth(h: IntegrationHealth | undefined): MaskedHealth {
  return {
    lastCheckedAt: h?.lastCheckedAt ?? null,
    lastSuccessAt: h?.lastSuccessAt ?? null,
    lastFailureAt: h?.lastFailureAt ?? null,
    lastError: h?.lastError ?? null,
  };
}

function maskEmail(c: EmailConfig): MaskedEmailConfig {
  return {
    enabled: c.enabled ?? false,
    fromName: c.fromName ?? "",
    fromEmail: c.fromEmail ?? "",
    smtpHost: c.smtpHost ?? "",
    smtpPort: c.smtpPort ?? 587,
    smtpSecure: c.smtpSecure ?? false,
    smtpUser: c.smtpUser ?? "",
    smtpPasswordSet: Boolean(c.smtpPassword),
    alertEmail: c.alertEmail ?? "",
    health: maskHealth(c.health),
  };
}

function maskLinkedin(c: LinkedinConfig): MaskedLinkedinConfig {
  return {
    enabled: c.enabled ?? false,
    autoPublish: c.autoPublish ?? false,
    profileUrl: c.profileUrl ?? "",
    authorUrn: c.authorUrn ?? "",
    accessTokenSet: Boolean(c.accessToken),
    expiresAt: c.expiresAt ?? null,
    clientId: c.clientId ?? "",
    clientSecretSet: Boolean(c.clientSecret),
    health: maskHealth(c.health),
  };
}

function maskX(c: XConfig): MaskedXConfig {
  return {
    enabled: c.enabled ?? false,
    autoPublish: c.autoPublish ?? false,
    username: c.username ?? "",
    apiKeySet: Boolean(c.apiKey),
    apiSecretSet: Boolean(c.apiSecret),
    accessTokenSet: Boolean(c.accessToken),
    accessSecretSet: Boolean(c.accessSecret),
    health: maskHealth(c.health),
  };
}

function maskConformityAlerts(
  c: ConformityAlertsConfig,
  email: EmailConfig,
): MaskedConformityAlertsConfig {
  return {
    enabled: c.enabled ?? false,
    recipient: c.recipient ?? "",
    leadTimeHours: c.leadTimeHours ?? 6,
    digestEnabled: c.digestEnabled ?? false,
    reminderIntervalHours: c.reminderIntervalHours ?? 24,
    maxReminders: c.maxReminders ?? 5,
    effectiveRecipient:
      c.recipient?.trim() || email.alertEmail?.trim() || email.fromEmail?.trim() || "",
  };
}

export async function getIntegrationSettingsMasked(): Promise<MaskedIntegrationSettings> {
  const row = await getAppSettings();
  return {
    email: maskEmail(row.emailConfig ?? {}),
    linkedin: maskLinkedin(row.linkedinConfig ?? {}),
    x: maskX(row.xConfig ?? {}),
    conformityAlerts: maskConformityAlerts(row.conformityAlertsConfig ?? {}, row.emailConfig ?? {}),
  };
}

// ---------- Merge helper (preserves secrets on blank input) ----------

function mergePreservingSecrets<T extends Record<string, unknown>>(
  existing: T,
  patch: Partial<T>,
  secretKeys: readonly (keyof T)[],
): T {
  const merged = { ...existing } as T;
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const k = key as keyof T;
    if (secretKeys.includes(k)) {
      // Blank secret means "keep whatever is already stored".
      if (value === "" || value === null) continue;
    }
    (merged as Record<string, unknown>)[key] = value;
  }
  return merged;
}

// ---------- Save (returns the full masked settings) ----------

export async function saveEmailConfig(patch: Partial<EmailConfig>): Promise<MaskedIntegrationSettings> {
  const row = await getAppSettings();
  const merged = mergePreservingSecrets(row.emailConfig ?? {}, patch, ["smtpPassword"]);
  await db.update(appSettingsTable).set({ emailConfig: merged }).where(eq(appSettingsTable.id, row.id));
  return getIntegrationSettingsMasked();
}

export async function saveLinkedinConfig(
  patch: Partial<LinkedinConfig>,
): Promise<MaskedIntegrationSettings> {
  const row = await getAppSettings();
  const merged = mergePreservingSecrets(row.linkedinConfig ?? {}, patch, [
    "accessToken",
    "clientSecret",
  ]);
  await db.update(appSettingsTable).set({ linkedinConfig: merged }).where(eq(appSettingsTable.id, row.id));
  return getIntegrationSettingsMasked();
}

/**
 * Persist a LinkedIn token (and its expiry) obtained via the OAuth flow, without
 * going through the secret-masking merge. Overwrites accessToken/expiresAt
 * directly and clears any previous expiry warning throttle.
 */
export async function saveLinkedinToken(
  accessToken: string,
  expiresAt: number | null,
): Promise<void> {
  const row = await getAppSettings();
  const merged: LinkedinConfig = {
    ...(row.linkedinConfig ?? {}),
    accessToken,
    expiresAt,
    lastExpiryWarningAt: null,
    lastExpiryWarningKey: null,
  };
  await db.update(appSettingsTable).set({ linkedinConfig: merged }).where(eq(appSettingsTable.id, row.id));
}

/**
 * Atomically claim a LinkedIn expiry warning: a single conditional UPDATE that
 * only succeeds when the currently stored dedupe key differs from `key`, so
 * two overlapping scans (in-process timer + external cron) can never both
 * claim — exactly one sees rowCount 1 and proceeds to send. Uses jsonb_set on
 * ONLY these two sub-paths (never a full-object RMW) so a concurrent admin
 * save of secrets/toggles can't be clobbered by this background write.
 * Returns true when this caller won the claim.
 */
export async function claimLinkedinExpiryWarning(
  key: string,
  when: number,
): Promise<boolean> {
  const row = await getAppSettings();
  const res = await db.execute(sql`
    update app_settings
    set linkedin_config = jsonb_set(
      jsonb_set(
        coalesce(linkedin_config, '{}'::jsonb),
        '{lastExpiryWarningKey}',
        ${JSON.stringify(key)}::jsonb,
        true
      ),
      '{lastExpiryWarningAt}',
      ${JSON.stringify(when)}::jsonb,
      true
    )
    where id = ${row.id}
      and coalesce(linkedin_config->>'lastExpiryWarningKey', '') is distinct from ${key}
  `);
  return (res.rowCount ?? 0) > 0;
}

/**
 * Release a claim after a FAILED send, restoring the previous key so the next
 * scan retries. Conditional on the claim still being ours (`key`), so only the
 * process that successfully claimed can roll it back.
 */
export async function releaseLinkedinExpiryWarning(
  key: string,
  previousKey: string | null,
): Promise<void> {
  const row = await getAppSettings();
  await db.execute(sql`
    update app_settings
    set linkedin_config = jsonb_set(
      jsonb_set(
        coalesce(linkedin_config, '{}'::jsonb),
        '{lastExpiryWarningKey}',
        ${JSON.stringify(previousKey)}::jsonb,
        true
      ),
      '{lastExpiryWarningAt}',
      'null'::jsonb,
      true
    )
    where id = ${row.id}
      and linkedin_config->>'lastExpiryWarningKey' = ${key}
  `);
}

/**
 * The recipient for operational alert emails (failed social shares, expiring
 * tokens): the configured alertEmail, else the fromEmail, else null.
 */
export async function getAlertRecipient(): Promise<string | null> {
  const c = await getEmailConfig();
  return c.alertEmail?.trim() || c.fromEmail?.trim() || null;
}

export async function saveXConfig(patch: Partial<XConfig>): Promise<MaskedIntegrationSettings> {
  const row = await getAppSettings();
  const merged = mergePreservingSecrets(row.xConfig ?? {}, patch, [
    "apiKey",
    "apiSecret",
    "accessToken",
    "accessSecret",
  ]);
  await db.update(appSettingsTable).set({ xConfig: merged }).where(eq(appSettingsTable.id, row.id));
  return getIntegrationSettingsMasked();
}

/** No secret fields in this config — plain merge (undefined keys are skipped). */
export async function saveConformityAlertsConfig(
  patch: Partial<ConformityAlertsConfig>,
): Promise<MaskedIntegrationSettings> {
  const row = await getAppSettings();
  const merged = mergePreservingSecrets(row.conformityAlertsConfig ?? {}, patch, []);
  await db
    .update(appSettingsTable)
    .set({ conformityAlertsConfig: merged })
    .where(eq(appSettingsTable.id, row.id));
  return getIntegrationSettingsMasked();
}

// ---------- Observability: health + events ----------

/**
 * Record a health snapshot for one integration by read-modify-writing the
 * non-secret `health` object inside its JSONB config. Updates lastCheckedAt and
 * (on success) lastSuccessAt / (on failure) lastFailureAt + lastError. Best-
 * effort: never throws — a health-write failure must not break the caller.
 */
export async function recordIntegrationHealth(
  integration: IntegrationName,
  outcome: { success: boolean; error?: string | null },
): Promise<void> {
  try {
    const row = await getAppSettings();
    const now = Date.now();
    const buildHealth = (prev: IntegrationHealth | undefined): IntegrationHealth => {
      const prevHealth = prev ?? {};
      return {
        lastCheckedAt: now,
        lastSuccessAt: outcome.success ? now : (prevHealth.lastSuccessAt ?? null),
        lastFailureAt: outcome.success ? (prevHealth.lastFailureAt ?? null) : now,
        lastError: outcome.success ? null : (outcome.error ?? "Unknown error").slice(0, 300),
      };
    };
    const existingHealth =
      integration === "email"
        ? row.emailConfig?.health
        : integration === "linkedin"
          ? row.linkedinConfig?.health
          : row.xConfig?.health;
    const column =
      integration === "email"
        ? "email_config"
        : integration === "linkedin"
          ? "linkedin_config"
          : "x_config";
    const newHealth = buildHealth(existingHealth);
    // Atomically update ONLY the `health` sub-path via jsonb_set. This must never
    // read-modify-write the whole config object, or a concurrent admin save of
    // secrets/toggles could be clobbered by this best-effort health write.
    await db.execute(sql`
      update app_settings
      set ${sql.raw(column)} = jsonb_set(
        coalesce(${sql.raw(column)}, '{}'::jsonb),
        '{health}',
        ${JSON.stringify(newHealth)}::jsonb,
        true
      )
      where id = ${row.id}
    `);
  } catch (err) {
    logger.error({ err, integration }, "Failed to record integration health");
  }
}

/**
 * Thin INSERT into `integration_events` for the unified activity feed. Best-
 * effort: never throws — logs and returns on failure so posting/sending paths
 * are never blocked by observability writes.
 */
export async function recordIntegrationEvent(event: {
  integration: IntegrationName;
  kind: string;
  success: boolean;
  detail?: string | null;
}): Promise<void> {
  try {
    await db.insert(integrationEventsTable).values({
      integration: event.integration,
      kind: event.kind,
      success: event.success,
      detail: event.detail ? event.detail.slice(0, 1000) : null,
    });
  } catch (err) {
    logger.error({ err, integration: event.integration, kind: event.kind }, "Failed to record integration event");
  }
}
