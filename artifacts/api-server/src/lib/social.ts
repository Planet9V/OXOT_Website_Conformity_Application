/**
 * Social posting lib: LinkedIn (UGC Posts v2) and X/Twitter (API v2 + OAuth 1.0a).
 *
 * Credentials and per-platform toggles are read at call-time from the
 * admin-configured integration settings (the `app_settings` singleton) — the
 * same values the admin Settings page writes. Nothing here reads environment
 * variables, so what the admin enters in the UI is the single source of truth
 * and takes effect without an app restart.
 */

import crypto from "node:crypto";
import {
  db,
  socialPostsTable,
  type SocialPostRow,
  type LinkedinConfig,
  type XConfig,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import {
  getLinkedinConfig,
  getXConfig,
  getAlertRecipient,
  recordIntegrationHealth,
} from "./integrationSettings";
import { sendEmail } from "./mailer";
import { logger } from "./logger";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Email the admin about failed social post attempts. Best-effort and only for
 * genuine failures (never on success). Degrades gracefully: if no alert
 * recipient or email isn't configured, it logs and returns without throwing.
 * Called once per attempt (manual send / auto-share / retry), never on a retry
 * loop tick, so it does not spam.
 */
export async function alertSocialFailures(
  outcomes: PostOutcome[],
  text: string,
  source: string,
): Promise<void> {
  const failures = outcomes.filter((o) => !o.success);
  if (failures.length === 0) return;
  try {
    const to = await getAlertRecipient();
    if (!to) {
      logger.warn(
        { platforms: failures.map((f) => f.platform), source },
        "Social post failed but no alert recipient configured; skipping alert email",
      );
      return;
    }
    const excerpt = text.slice(0, 280);
    const rows = failures
      .map(
        (f) =>
          `<li><strong>${escapeHtml(f.platform)}</strong>: ${escapeHtml(
            f.error ?? "Unknown error",
          )}</li>`,
      )
      .join("");
    const html = `
      <p>A social post attempt failed (source: <strong>${escapeHtml(source)}</strong>).</p>
      <ul>${rows}</ul>
      <p><strong>Post text excerpt:</strong></p>
      <blockquote>${escapeHtml(excerpt)}</blockquote>
      <p>Check the Social tab in the admin console for the full outcome log.</p>`;
    const result = await sendEmail({
      to,
      subject: `OXOT: social post failed (${failures.map((f) => f.platform).join(", ")})`,
      html,
    });
    if (!result.delivered) {
      logger.warn({ error: result.error, source }, "Social failure alert email not delivered");
    }
  } catch (err) {
    logger.error({ err }, "Failed to send social failure alert email");
  }
}

// ---------------------------------------------------------------------------
// LinkedIn OAuth (re-authorization) helpers
// ---------------------------------------------------------------------------

const LINKEDIN_SCOPES = "openid profile w_member_social";

/**
 * The public origin of the API server, used to build the OAuth redirect URI the
 * admin must whitelist in their LinkedIn app. Derived from REPLIT_DOMAINS (first
 * host), falling back to PUBLIC_API_ORIGIN if set.
 */
export function getPublicApiOrigin(): string {
  const explicit = process.env["PUBLIC_API_ORIGIN"];
  if (explicit) return explicit.replace(/\/+$/, "");
  const domains = process.env["REPLIT_DOMAINS"];
  const host = domains?.split(",")[0]?.trim();
  if (host) return `https://${host}`;
  const port = process.env["PORT"] ?? "3000";
  return `http://localhost:${port}`;
}

/** The exact redirect URI the admin must whitelist in their LinkedIn OAuth app. */
export function getLinkedinRedirectUri(): string {
  return `${getPublicApiOrigin()}/api/admin/social/linkedin/oauth/callback`;
}

/** HMAC-signed state token to protect the OAuth flow against CSRF. */
export function signOAuthState(): string {
  const secret = process.env["SESSION_SECRET"] ?? "";
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${nonce}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

/** Validate a state token created by signOAuthState (10-minute TTL). */
export function verifyOAuthState(state: string | undefined): boolean {
  if (!state) return false;
  const [payloadB64, sig] = state.split(".");
  if (!payloadB64 || !sig) return false;
  const secret = process.env["SESSION_SECRET"] ?? "";
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return false;
  }
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  const ts = Number(payload.split(".")[1]);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < 10 * 60 * 1000;
}

/** Build the LinkedIn authorization URL the admin browser is redirected to. */
export function buildLinkedinAuthUrl(clientId: string, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getLinkedinRedirectUri(),
    scope: LINKEDIN_SCOPES,
    state,
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export interface LinkedinTokenResult {
  accessToken: string;
  expiresAt: number | null;
}

/** Exchange an authorization code for an access token. Throws on failure. */
export async function exchangeLinkedinCode(
  code: string,
  clientId: string,
  clientSecret: string,
): Promise<LinkedinTokenResult> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getLinkedinRedirectUri(),
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`LinkedIn token exchange ${res.status}: ${detail}`);
  }
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) {
    throw new Error("LinkedIn token response missing access_token");
  }
  const expiresAt =
    typeof json.expires_in === "number" ? Date.now() + json.expires_in * 1000 : null;
  return { accessToken: json.access_token, expiresAt };
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

export interface SocialPlatformStatus {
  configured: boolean;
  /** Whether a live validation call was made against the provider. */
  checked?: boolean;
  /** Live token check result; null when not checked or indeterminate. */
  valid?: boolean | null;
  /** Whole days until the token expires, when the provider reports it. */
  expiresInDays?: number | null;
  /** ISO timestamp when the token expires, when known. */
  expiresAt?: string | null;
  /** Human-readable problem detected during validation, if any. */
  error?: string | null;
}

export interface SocialStatus {
  linkedin: SocialPlatformStatus;
  x: SocialPlatformStatus;
}

function linkedinConfigured(cfg: LinkedinConfig): boolean {
  return Boolean(cfg.accessToken && cfg.authorUrn);
}

function xConfigured(cfg: XConfig): boolean {
  return Boolean(cfg.apiKey && cfg.apiSecret && cfg.accessToken && cfg.accessSecret);
}

// "Ready" = the platform is active (not explicitly disabled) AND has complete
// credentials. This mirrors the gate in postLinkedIn/postX, so the status a
// caller sees accurately predicts whether a manual post will go through. (An
// auto-share on publish additionally requires `autoPublish`; see
// autoPublishablePlatforms.)
function linkedinReady(cfg: LinkedinConfig): boolean {
  return cfg.enabled !== false && linkedinConfigured(cfg);
}

function xReady(cfg: XConfig): boolean {
  return cfg.enabled !== false && xConfigured(cfg);
}

export async function getSocialStatus(): Promise<SocialStatus> {
  const [linkedin, x] = await Promise.all([getLinkedinConfig(), getXConfig()]);
  return {
    linkedin: { configured: linkedinReady(linkedin) },
    x: { configured: xReady(x) },
  };
}

// ---------------------------------------------------------------------------
// Live token validation
//
// LinkedIn user access tokens expire ~60 days after issue. When they lapse,
// every post silently 401s. We surface days-until-expiry proactively so the
// admin can re-authorize before the window closes.
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;

async function validateLinkedIn(cfg: LinkedinConfig): Promise<SocialPlatformStatus> {
  const token = cfg.accessToken;
  const author = cfg.authorUrn;
  if (!token || !author) {
    return { configured: false, checked: false, valid: null };
  }

  const clientId = cfg.clientId;
  const clientSecret = cfg.clientSecret;

  // Preferred path: OAuth token introspection reports both validity AND the
  // exact expiry timestamp, regardless of the token's posting scopes. It needs
  // the app's client credentials to authenticate the introspection call.
  if (clientId && clientSecret) {
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        token,
      });
      const res = await fetch(
        "https://www.linkedin.com/oauth/v2/introspectToken",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        },
      );
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        return {
          configured: true,
          checked: true,
          valid: null,
          error: `LinkedIn introspection failed (${res.status}): ${detail.slice(0, 200)}`,
        };
      }
      const data = (await res.json()) as {
        active?: boolean;
        status?: string;
        expires_at?: number;
      };
      const active =
        data.active === true &&
        (data.status ? data.status === "active" : true);
      let expiresAt: string | null = null;
      let expiresInDays: number | null = null;
      if (typeof data.expires_at === "number" && data.expires_at > 0) {
        const expMs = data.expires_at * 1000;
        expiresAt = new Date(expMs).toISOString();
        expiresInDays = Math.max(0, Math.floor((expMs - Date.now()) / DAY_MS));
      }
      return {
        configured: true,
        checked: true,
        valid: active,
        expiresAt,
        expiresInDays,
        error: active
          ? null
          : "LinkedIn token is expired or revoked. Re-authorize to resume posting.",
      };
    } catch (err) {
      return {
        configured: true,
        checked: true,
        valid: null,
        error:
          err instanceof Error
            ? err.message
            : "Unknown error validating LinkedIn token",
      };
    }
  }

  // Fallback: without client credentials we can only confirm the token still
  // works (not its expiry). A clear 401 means it has lapsed.
  try {
    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      return {
        configured: true,
        checked: true,
        valid: false,
        error:
          "LinkedIn token is invalid or expired. Re-authorize to resume posting.",
      };
    }
    if (!res.ok) {
      return {
        configured: true,
        checked: true,
        valid: null,
        error:
          "Couldn't confirm expiry. Add your LinkedIn Client ID and Client Secret in the admin Settings page to track days until the token expires.",
      };
    }
    return {
      configured: true,
      checked: true,
      valid: true,
      expiresInDays: null,
      expiresAt: null,
      error:
        "Token is valid, but expiry can't be tracked. Add your LinkedIn Client ID and Client Secret in the admin Settings page to see days until it expires.",
    };
  } catch (err) {
    return {
      configured: true,
      checked: true,
      valid: null,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error validating LinkedIn token",
    };
  }
}

async function validateX(cfg: XConfig): Promise<SocialPlatformStatus> {
  const apiKey = cfg.apiKey;
  const apiSecret = cfg.apiSecret;
  const accessToken = cfg.accessToken;
  const accessSecret = cfg.accessSecret;
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return { configured: false, checked: false, valid: null };
  }

  // X OAuth 1.0a tokens don't expire, so there's no days-until-expiry to
  // report — a signed test call just confirms the credentials are accepted.
  try {
    const url = "https://api.twitter.com/2/users/me";
    const authHeader = buildXAuthHeader(
      "GET",
      url,
      apiKey,
      apiSecret,
      accessToken,
      accessSecret,
    );
    const res = await fetch(url, { headers: { Authorization: authHeader } });
    if (res.ok) {
      return {
        configured: true,
        checked: true,
        valid: true,
        expiresInDays: null,
        expiresAt: null,
        error: null,
      };
    }
    const detail = await res.text().catch(() => "");
    if (res.status === 401 || res.status === 403) {
      return {
        configured: true,
        checked: true,
        valid: false,
        error: `X credentials were rejected (${res.status}). Re-check your API keys and access tokens. ${detail.slice(0, 150)}`,
      };
    }
    return {
      configured: true,
      checked: true,
      valid: null,
      error: `X validation returned ${res.status}: ${detail.slice(0, 150)}`,
    };
  } catch (err) {
    return {
      configured: true,
      checked: true,
      valid: null,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error validating X credentials",
    };
  }
}

/**
 * Live LinkedIn-only validation: real API call reporting token validity and
 * (when client credentials allow introspection) days until expiry. Used by the
 * scheduled expiry-warning scan so it doesn't also burn an X API call.
 */
export async function getLinkedinStatusLive(): Promise<SocialPlatformStatus> {
  return validateLinkedIn(await getLinkedinConfig());
}

/**
 * Live variant of getSocialStatus(): makes real API calls to confirm each
 * platform's credentials are accepted and, for LinkedIn, how many days remain
 * before the access token expires.
 */
export async function getSocialStatusLive(): Promise<SocialStatus> {
  const [linkedinCfg, xCfg] = await Promise.all([getLinkedinConfig(), getXConfig()]);
  const [linkedin, x] = await Promise.all([
    validateLinkedIn(linkedinCfg),
    validateX(xCfg),
  ]);
  return { linkedin, x };
}

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface PostOutcome {
  platform: string;
  success: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// LinkedIn
// ---------------------------------------------------------------------------

async function postLinkedIn(text: string, cfg: LinkedinConfig, url?: string): Promise<PostOutcome> {
  if (cfg.enabled === false) {
    return {
      platform: "linkedin",
      success: false,
      error: "LinkedIn posting is turned off in the admin Settings page",
    };
  }
  const token = cfg.accessToken;
  const author = cfg.authorUrn;
  if (!token || !author) {
    return {
      platform: "linkedin",
      success: false,
      error: "LinkedIn credentials not configured in the admin Settings page",
    };
  }
  try {
    // When a page URL is provided, attach it as an ARTICLE so LinkedIn fetches
    // the page's OG metadata (thumbnail, title, description) and renders a rich
    // link card instead of plain text. Without a URL, fall back to a text post.
    const shareContent: Record<string, unknown> = url
      ? {
          shareCommentary: { text },
          shareMediaCategory: "ARTICLE",
          media: [
            {
              status: "READY",
              originalUrl: url,
            },
          ],
        }
      : {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        };
    const body = JSON.stringify({
      author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": shareContent,
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    });
    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        platform: "linkedin",
        success: false,
        error: `LinkedIn API ${res.status}: ${detail}`,
      };
    }
    return { platform: "linkedin", success: true, error: null };
  } catch (err) {
    return {
      platform: "linkedin",
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// X / Twitter — OAuth 1.0a
// ---------------------------------------------------------------------------

function percentEncode(s: string): string {
  return encodeURIComponent(s).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/**
 * Build a signed OAuth 1.0a Authorization header for X/Twitter. Exported so
 * both the tweet-posting path (POST) and the non-destructive connection test
 * (GET /2/users/me) share one signer.
 */
export function buildXAuthHeader(
  method: string,
  url: string,
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  accessSecret: string,
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const sortedParamStr = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParamStr),
  ].join("&");

  const signingKey = `${percentEncode(apiSecret)}&${percentEncode(accessSecret)}`;
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  oauthParams.oauth_signature = signature;

  return (
    "OAuth " +
    Object.keys(oauthParams)
      .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
      .join(", ")
  );
}

async function postX(text: string, cfg: XConfig, pageUrl?: string): Promise<PostOutcome> {
  if (cfg.enabled === false) {
    return {
      platform: "x",
      success: false,
      error: "X posting is turned off in the admin Settings page",
    };
  }
  const apiKey = cfg.apiKey;
  const apiSecret = cfg.apiSecret;
  const accessToken = cfg.accessToken;
  const accessSecret = cfg.accessSecret;
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return {
      platform: "x",
      success: false,
      error: "X credentials not configured in the admin Settings page",
    };
  }
  try {
    // Append the page URL after the text so X unfurls it into a summary card
    // from the page's OG metadata. X auto-detects the trailing link.
    const tweetText = pageUrl ? `${text}\n\n${pageUrl}` : text;
    const url = "https://api.twitter.com/2/tweets";
    const authHeader = buildXAuthHeader(
      "POST",
      url,
      apiKey,
      apiSecret,
      accessToken,
      accessSecret,
    );
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: tweetText }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        platform: "x",
        success: false,
        error: `X API ${res.status}: ${detail}`,
      };
    }
    return { platform: "x", success: true, error: null };
  } catch (err) {
    return {
      platform: "x",
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Connection tests (non-destructive verify). These do NOT post/write anything.
// ---------------------------------------------------------------------------

export interface VerifyResult {
  ok: boolean;
  error?: string;
  checkedAt: string;
}

/**
 * Non-destructive X connection test: a signed GET to /2/users/me using the
 * stored OAuth 1.0a credentials. Never posts a tweet.
 */
export async function verifyXConnection(cfg: XConfig): Promise<VerifyResult> {
  const checkedAt = new Date().toISOString();
  const { apiKey, apiSecret, accessToken, accessSecret } = cfg;
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return { ok: false, error: "X credentials not configured in the admin Settings page", checkedAt };
  }
  try {
    const url = "https://api.twitter.com/2/users/me";
    const authHeader = buildXAuthHeader("GET", url, apiKey, apiSecret, accessToken, accessSecret);
    const res = await fetch(url, { method: "GET", headers: { Authorization: authHeader } });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `X API ${res.status}: ${detail}`.slice(0, 300), checkedAt };
    }
    return { ok: true, checkedAt };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error", checkedAt };
  }
}

/**
 * Non-destructive LinkedIn connection test: GET /v2/userinfo with the stored
 * Bearer access token. Never posts.
 */
export async function verifyLinkedinConnection(cfg: LinkedinConfig): Promise<VerifyResult> {
  const checkedAt = new Date().toISOString();
  const token = cfg.accessToken;
  if (!token) {
    return { ok: false, error: "LinkedIn access token not configured in the admin Settings page", checkedAt };
  }
  try {
    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `LinkedIn API ${res.status}: ${detail}`.slice(0, 300), checkedAt };
    }
    return { ok: true, checkedAt };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error", checkedAt };
  }
}

export async function postToSocial(
  text: string,
  platforms: ("linkedin" | "x")[],
  url?: string,
): Promise<PostOutcome[]> {
  if (platforms.length === 0) return [];
  const [linkedin, x] = await Promise.all([
    platforms.includes("linkedin") ? getLinkedinConfig() : Promise.resolve(null),
    platforms.includes("x") ? getXConfig() : Promise.resolve(null),
  ]);
  return Promise.all(
    platforms.map((p) =>
      p === "linkedin" ? postLinkedIn(text, linkedin ?? {}, url) : postX(text, x ?? {}, url),
    ),
  );
}

// ---------------------------------------------------------------------------
// Outcome log persistence
// ---------------------------------------------------------------------------

/**
 * Persist post outcomes so failures never go unnoticed. Called after both the
 * manual composer and the fire-and-forget auto-share. Best-effort: a logging
 * failure must never mask or block the post itself.
 */
export async function recordSocialOutcomes(
  outcomes: PostOutcome[],
  text: string,
  source: "manual" | "publish" | "retry",
): Promise<SocialPostRow[]> {
  if (outcomes.length === 0) return [];
  const excerpt = text.slice(0, 500);
  // Best-effort observability: mirror each post outcome into per-integration
  // health + the unified activity feed. Never let these block/throw the insert.
  // Record per-integration health here, but do NOT emit a `post` event into
  // integration_events: the activity feed already derives post items from
  // social_posts (inserted just below). Emitting here too would double-count.
  for (const o of outcomes) {
    const integration = o.platform === "x" ? "x" : "linkedin";
    void recordIntegrationHealth(integration, { success: o.success, error: o.error });
  }
  try {
    return await db
      .insert(socialPostsTable)
      .values(
        outcomes.map((o) => ({
          platform: o.platform,
          success: o.success,
          error: o.error,
          text: excerpt,
          source,
        })),
      )
      .returning();
  } catch (err) {
    logger.error({ err }, "Failed to record social post outcomes");
    return [];
  }
}

export interface SocialPostLogEntry {
  id: number;
  platform: string;
  success: boolean;
  error: string | null;
  text: string;
  source: string;
  createdAt: string;
}

/** Most-recent social post outcomes, newest first. Powers the Social tab log. */
export async function listRecentSocialPosts(limit = 25): Promise<SocialPostLogEntry[]> {
  const rows: SocialPostRow[] = await db
    .select()
    .from(socialPostsTable)
    .orderBy(desc(socialPostsTable.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    platform: r.platform,
    success: r.success,
    error: r.error,
    text: r.text,
    source: r.source,
    createdAt: r.createdAt.toISOString(),
  }));
}

/**
 * Re-attempt a stored social post by its log id. Loads the original row, posts
 * its text to its platform again using the current admin credentials, records a
 * new outcome row (source "retry"), alerts on failure, and returns the new log
 * entry. Returns null when the id doesn't exist.
 */
export async function retrySocialPost(id: number): Promise<SocialPostLogEntry | null> {
  const [row] = await db
    .select()
    .from(socialPostsTable)
    .where(eq(socialPostsTable.id, id))
    .limit(1);
  if (!row) return null;

  const platform = row.platform === "x" ? "x" : "linkedin";
  const outcomes = await postToSocial(row.text, [platform]);
  const inserted = await recordSocialOutcomes(outcomes, row.text, "retry");
  await alertSocialFailures(outcomes, row.text, "retry");

  const outcome = outcomes[0] ?? {
    platform,
    success: false,
    error: "No outcome produced",
  };
  // Prefer the freshly inserted retry row so we return its real id/createdAt.
  const newRow = inserted[0];
  if (newRow) {
    return {
      id: newRow.id,
      platform: newRow.platform,
      success: newRow.success,
      error: newRow.error,
      text: newRow.text,
      source: newRow.source,
      createdAt: newRow.createdAt.toISOString(),
    };
  }
  // Fallback (e.g. logging insert failed): still report the attempt outcome.
  return {
    id: row.id,
    platform: outcome.platform,
    success: outcome.success,
    error: outcome.error,
    text: row.text,
    source: "retry",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Fire-and-forget social share, similar to scheduleReindex(). Called from the
 * publish route so it doesn't block the HTTP response.
 *
 * Auto-share only posts to platforms the admin has both enabled AND opted into
 * auto-publishing on the Settings page (and that have complete credentials).
 * Platforms that don't qualify are silently skipped. Every attempt's outcome is
 * persisted so the admin can see success/failure per platform afterwards.
 *
 * When `url` is provided, the shared post links back to the published page so
 * LinkedIn/X render a rich article card from its OG metadata.
 */
export function scheduleSocialShare(
  text: string,
  platforms: ("linkedin" | "x")[],
  url?: string,
): void {
  if (platforms.length === 0) return;
  void (async () => {
    const eligible = await autoPublishablePlatforms(platforms);
    if (eligible.length === 0) return;
    const outcomes = await postToSocial(text, eligible, url);
    await recordSocialOutcomes(outcomes, text, "publish");
    await alertSocialFailures(outcomes, text, "publish");
  })().catch((err) => {
    logger.error({ err }, "Background social share failed");
  });
}

/**
 * Narrow a requested platform list to those the admin has enabled AND set to
 * auto-publish, and that have complete credentials. Used by scheduleSocialShare
 * so that a page publish only fans out to platforms the admin opted in.
 */
async function autoPublishablePlatforms(
  platforms: ("linkedin" | "x")[],
): Promise<("linkedin" | "x")[]> {
  const [linkedin, x] = await Promise.all([
    platforms.includes("linkedin") ? getLinkedinConfig() : Promise.resolve(null),
    platforms.includes("x") ? getXConfig() : Promise.resolve(null),
  ]);
  const eligible: ("linkedin" | "x")[] = [];
  if (
    platforms.includes("linkedin") &&
    linkedin?.enabled &&
    linkedin?.autoPublish &&
    linkedinConfigured(linkedin)
  ) {
    eligible.push("linkedin");
  }
  if (platforms.includes("x") && x?.enabled && x?.autoPublish && xConfigured(x)) {
    eligible.push("x");
  }
  return eligible;
}
