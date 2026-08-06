/**
 * Rich observability for the admin Integrations console: a per-integration
 * health summary and a unified activity feed. Health merges the non-secret
 * `health` snapshot stored in each config with recent success/failure counts
 * (from `social_posts` for linkedin/x, from `integration_events` for email).
 * The activity feed merges `social_posts` (as `post` events) and
 * `integration_events` into one reverse-chronological list.
 */

import {
  db,
  socialPostsTable,
  integrationEventsTable,
  type SocialPostRow,
  type IntegrationEventRow,
  type IntegrationHealth,
} from "@workspace/db";
import { and, desc, eq, gte } from "drizzle-orm";
import { getEmailConfig, getLinkedinConfig, getXConfig } from "./integrationSettings";

const RECENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export interface IntegrationHealthEntry {
  enabled: boolean;
  configured: boolean;
  connected: boolean | null;
  lastCheckedAt: number | null;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  lastError: string | null;
  tokenExpiresAt: number | null;
  recentSuccessCount: number;
  recentFailureCount: number;
}

export interface IntegrationsHealth {
  email: IntegrationHealthEntry;
  linkedin: IntegrationHealthEntry;
  x: IntegrationHealthEntry;
}

/**
 * `connected` reflects the outcome of the last verify/check: true if the most
 * recent success is at least as recent as the most recent failure, false if a
 * failure is newer, null if nothing has been checked yet.
 */
function connectedFromHealth(h: IntegrationHealth | undefined): boolean | null {
  const lastSuccess = h?.lastSuccessAt ?? null;
  const lastFailure = h?.lastFailureAt ?? null;
  if (lastSuccess === null && lastFailure === null) return null;
  if (lastFailure === null) return true;
  if (lastSuccess === null) return false;
  return lastSuccess >= lastFailure;
}

/** Count recent social_posts outcomes for a platform (last ~30 days). */
async function recentSocialCounts(platform: "linkedin" | "x"): Promise<{ success: number; failure: number }> {
  const since = new Date(Date.now() - RECENT_WINDOW_MS);
  const rows = await db
    .select({ success: socialPostsTable.success })
    .from(socialPostsTable)
    .where(and(eq(socialPostsTable.platform, platform), gte(socialPostsTable.createdAt, since)));
  let success = 0;
  let failure = 0;
  for (const r of rows) r.success ? success++ : failure++;
  return { success, failure };
}

/** Count recent integration_events for an integration (last ~30 days). */
async function recentEventCounts(integration: string): Promise<{ success: number; failure: number }> {
  const since = new Date(Date.now() - RECENT_WINDOW_MS);
  const rows = await db
    .select({ success: integrationEventsTable.success })
    .from(integrationEventsTable)
    .where(
      and(eq(integrationEventsTable.integration, integration), gte(integrationEventsTable.createdAt, since)),
    );
  let success = 0;
  let failure = 0;
  for (const r of rows) r.success ? success++ : failure++;
  return { success, failure };
}

export async function getIntegrationsHealth(): Promise<IntegrationsHealth> {
  const [email, linkedin, x] = await Promise.all([getEmailConfig(), getLinkedinConfig(), getXConfig()]);
  const [emailCounts, linkedinCounts, xCounts] = await Promise.all([
    recentEventCounts("email"),
    recentSocialCounts("linkedin"),
    recentSocialCounts("x"),
  ]);

  const emailConfigured = Boolean(
    email.smtpHost && email.smtpUser && email.smtpPassword && email.fromEmail,
  );
  const linkedinConfigured = Boolean(linkedin.accessToken && linkedin.authorUrn);
  const xConfigured = Boolean(x.apiKey && x.apiSecret && x.accessToken && x.accessSecret);

  return {
    email: {
      enabled: email.enabled ?? false,
      configured: emailConfigured,
      connected: connectedFromHealth(email.health),
      lastCheckedAt: email.health?.lastCheckedAt ?? null,
      lastSuccessAt: email.health?.lastSuccessAt ?? null,
      lastFailureAt: email.health?.lastFailureAt ?? null,
      lastError: email.health?.lastError ?? null,
      tokenExpiresAt: null,
      recentSuccessCount: emailCounts.success,
      recentFailureCount: emailCounts.failure,
    },
    linkedin: {
      enabled: linkedin.enabled ?? false,
      configured: linkedinConfigured,
      connected: connectedFromHealth(linkedin.health),
      lastCheckedAt: linkedin.health?.lastCheckedAt ?? null,
      lastSuccessAt: linkedin.health?.lastSuccessAt ?? null,
      lastFailureAt: linkedin.health?.lastFailureAt ?? null,
      lastError: linkedin.health?.lastError ?? null,
      tokenExpiresAt: linkedin.expiresAt ?? null,
      recentSuccessCount: linkedinCounts.success,
      recentFailureCount: linkedinCounts.failure,
    },
    x: {
      enabled: x.enabled ?? false,
      configured: xConfigured,
      connected: connectedFromHealth(x.health),
      lastCheckedAt: x.health?.lastCheckedAt ?? null,
      lastSuccessAt: x.health?.lastSuccessAt ?? null,
      lastFailureAt: x.health?.lastFailureAt ?? null,
      lastError: x.health?.lastError ?? null,
      tokenExpiresAt: null,
      recentSuccessCount: xCounts.success,
      recentFailureCount: xCounts.failure,
    },
  };
}

export interface ActivityItem {
  id: string;
  integration: string;
  kind: string;
  success: boolean;
  detail: string | null;
  createdAt: string;
}

/**
 * Unified reverse-chronological activity feed merging `social_posts` (mapped to
 * `post` events) and `integration_events`. Ids are namespaced (`sp:`/`ie:`) so
 * they stay unique across the two source tables.
 */
export async function getIntegrationActivity(
  limit: number,
  integration?: "email" | "linkedin" | "x",
): Promise<ActivityItem[]> {
  const socialWhere = integration
    ? integration === "email"
      ? // email never appears in social_posts
        eq(socialPostsTable.platform, "__none__")
      : eq(socialPostsTable.platform, integration)
    : undefined;

  const eventsWhere = integration
    ? eq(integrationEventsTable.integration, integration)
    : undefined;

  const [socialRows, eventRows]: [SocialPostRow[], IntegrationEventRow[]] = await Promise.all([
    db
      .select()
      .from(socialPostsTable)
      .where(socialWhere)
      .orderBy(desc(socialPostsTable.createdAt))
      .limit(limit),
    db
      .select()
      .from(integrationEventsTable)
      .where(eventsWhere)
      .orderBy(desc(integrationEventsTable.createdAt))
      .limit(limit),
  ]);

  const items: ActivityItem[] = [
    ...socialRows.map((r) => ({
      id: `sp:${r.id}`,
      integration: r.platform,
      kind: "post",
      success: r.success,
      detail: r.error ?? (r.text ? r.text.slice(0, 280) : null),
      createdAt: r.createdAt.toISOString(),
    })),
    ...eventRows.map((r) => ({
      id: `ie:${r.id}`,
      integration: r.integration,
      kind: r.kind,
      success: r.success,
      detail: r.detail,
      createdAt: r.createdAt.toISOString(),
    })),
  ];

  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return items.slice(0, limit);
}
