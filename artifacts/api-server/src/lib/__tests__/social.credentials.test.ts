/**
 * Regression guard: social credentials must come from admin Settings (the
 * app_settings DB singleton) — never from process.env.
 *
 * Test strategy
 * -------------
 * 1. Mock `integrationSettings` so getLinkedinConfig / getXConfig return
 *    known DB-sourced credential values (sentinel strings).
 * 2. Place *different* sentinel strings in the relevant process.env keys so
 *    any env-read would produce a distinct, detectable value.
 * 3. Intercept `fetch` globally and capture every Authorization / body payload
 *    the code sends.
 * 4. Assert the DB sentinels — not the env sentinels — appear in every
 *    outgoing call, across all three call paths:
 *      • postToSocial (manual post)
 *      • getSocialStatusLive (validate=true status check)
 *      • scheduleSocialShare / autoPublishablePlatforms (auto-share on publish)
 * 5. Also assert the graceful no-op / configured:false when the DB config is
 *    empty (ensuring we never fall back to env when credentials are absent).
 */

import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from "vitest";

// ---------------------------------------------------------------------------
// Sentinel values
// ---------------------------------------------------------------------------

/** Credential values that will be returned by the mocked DB getter. */
const DB = {
  linkedin: {
    accessToken: "DB_LI_ACCESS_TOKEN",
    authorUrn: "urn:li:member:DB_AUTHOR",
    clientId: "DB_LI_CLIENT_ID",
    clientSecret: "DB_LI_CLIENT_SECRET",
  },
  x: {
    apiKey: "DB_X_API_KEY",
    apiSecret: "DB_X_API_SECRET",
    accessToken: "DB_X_ACCESS_TOKEN",
    accessSecret: "DB_X_ACCESS_SECRET",
  },
} as const;

/**
 * Credential values placed in process.env. They must never show up in any
 * outgoing fetch call — if they do, the code is reading from env instead of
 * the DB.
 */
const ENV = {
  LINKEDIN_ACCESS_TOKEN: "ENV_LI_ACCESS_TOKEN",
  LINKEDIN_AUTHOR_URN: "urn:li:member:ENV_AUTHOR",
  X_API_KEY: "ENV_X_API_KEY",
  X_API_SECRET: "ENV_X_API_SECRET",
  X_ACCESS_TOKEN: "ENV_X_ACCESS_TOKEN",
  X_ACCESS_SECRET: "ENV_X_ACCESS_SECRET",
} as const;

// ---------------------------------------------------------------------------
// Mock integrationSettings BEFORE importing social (vi.mock is hoisted)
// ---------------------------------------------------------------------------

vi.mock("../integrationSettings", () => ({
  getLinkedinConfig: vi.fn(),
  getXConfig: vi.fn(),
  getAlertRecipient: vi.fn().mockResolvedValue(null),
  recordIntegrationHealth: vi.fn().mockResolvedValue(undefined),
  recordIntegrationEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock @workspace/db so recordSocialOutcomes doesn't need a real DB connection
vi.mock("@workspace/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
  socialPostsTable: {},
  desc: vi.fn(),
  eq: vi.fn(),
}));

// Now import the module under test
import {
  postToSocial,
  getSocialStatusLive,
  scheduleSocialShare,
} from "../social";
import { getLinkedinConfig, getXConfig } from "../integrationSettings";

const mockGetLinkedinConfig = getLinkedinConfig as MockedFunction<typeof getLinkedinConfig>;
const mockGetXConfig = getXConfig as MockedFunction<typeof getXConfig>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Capture every fetch() call made during a test. */
function interceptFetch(): { calls: { url: string; init: RequestInit }[] } {
  const calls: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit = {}): Promise<Response> => {
      calls.push({ url, init });
      // Return a generic 200 so the code doesn't throw on a real network call
      return new Response(JSON.stringify({ active: true, status: "active" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
  return { calls };
}

/** Collect every string value present in all fetch call headers + bodies. */
function allFetchPayloads(calls: { url: string; init: RequestInit }[]): string {
  return calls
    .map((c) => {
      const headerStr = c.init.headers
        ? Object.entries(c.init.headers as Record<string, string>)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")
        : "";
      const bodyStr = typeof c.init.body === "string" ? c.init.body : "";
      return `${c.url}\n${headerStr}\n${bodyStr}`;
    })
    .join("\n---\n");
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Inject env-sentinel values so any accidental env-read is detectable
  for (const [k, v] of Object.entries(ENV)) {
    process.env[k] = v;
  }
});

afterEach(() => {
  // Remove the sentinel env vars and restore fetch
  for (const k of Object.keys(ENV)) {
    delete process.env[k];
  }
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests — path 1: postToSocial (manual post)
// ---------------------------------------------------------------------------

describe("postToSocial — manual post", () => {
  it("posts to LinkedIn using DB credentials, not process.env", async () => {
    mockGetLinkedinConfig.mockResolvedValue({
      enabled: true,
      accessToken: DB.linkedin.accessToken,
      authorUrn: DB.linkedin.authorUrn,
    });
    mockGetXConfig.mockResolvedValue({ enabled: false });

    const { calls } = interceptFetch();
    const outcomes = await postToSocial("Test post text", ["linkedin"]);

    // Must have attempted the LinkedIn API call
    expect(calls.length).toBeGreaterThan(0);
    const payload = allFetchPayloads(calls);

    // DB token must be present in the Authorization header
    expect(payload).toContain(DB.linkedin.accessToken);

    // Env sentinel must NOT appear anywhere in outgoing requests
    expect(payload).not.toContain(ENV.LINKEDIN_ACCESS_TOKEN);
    expect(payload).not.toContain(ENV.LINKEDIN_AUTHOR_URN);

    // The call must report success (200 from our mock)
    expect(outcomes[0]?.success).toBe(true);
    expect(outcomes[0]?.platform).toBe("linkedin");
  });

  it("posts to X using DB credentials, not process.env", async () => {
    mockGetLinkedinConfig.mockResolvedValue({ enabled: false });
    mockGetXConfig.mockResolvedValue({
      enabled: true,
      apiKey: DB.x.apiKey,
      apiSecret: DB.x.apiSecret,
      accessToken: DB.x.accessToken,
      accessSecret: DB.x.accessSecret,
    });

    const { calls } = interceptFetch();
    const outcomes = await postToSocial("Test X post", ["x"]);

    expect(calls.length).toBeGreaterThan(0);
    const payload = allFetchPayloads(calls);

    // DB API key must be part of the OAuth Authorization header
    expect(payload).toContain(DB.x.apiKey);
    expect(payload).toContain(DB.x.accessToken);

    // Env sentinels must NOT appear
    expect(payload).not.toContain(ENV.X_API_KEY);
    expect(payload).not.toContain(ENV.X_ACCESS_TOKEN);

    expect(outcomes[0]?.success).toBe(true);
    expect(outcomes[0]?.platform).toBe("x");
  });

  it("returns configured:false error for LinkedIn when DB config is empty (no env fallback)", async () => {
    mockGetLinkedinConfig.mockResolvedValue({});
    mockGetXConfig.mockResolvedValue({});

    const { calls } = interceptFetch();
    const outcomes = await postToSocial("No-op text", ["linkedin"]);

    // No fetch should have been made — credentials are absent
    expect(calls.length).toBe(0);

    // The outcome must clearly signal the platform is unconfigured
    expect(outcomes[0]?.success).toBe(false);
    expect(outcomes[0]?.error).toMatch(/credentials not configured/i);
  });

  it("returns configured:false error for X when DB config is empty (no env fallback)", async () => {
    mockGetLinkedinConfig.mockResolvedValue({});
    mockGetXConfig.mockResolvedValue({});

    const { calls } = interceptFetch();
    const outcomes = await postToSocial("No-op text", ["x"]);

    expect(calls.length).toBe(0);
    expect(outcomes[0]?.success).toBe(false);
    expect(outcomes[0]?.error).toMatch(/credentials not configured/i);
  });

  it("skips a disabled platform and still does not read env for its credentials", async () => {
    mockGetLinkedinConfig.mockResolvedValue({ enabled: false });
    mockGetXConfig.mockResolvedValue({ enabled: false });

    const { calls } = interceptFetch();
    const outcomes = await postToSocial("Disabled platforms", ["linkedin", "x"]);

    // No HTTP calls for disabled platforms
    expect(calls.length).toBe(0);

    for (const o of outcomes) {
      expect(o.success).toBe(false);
      expect(o.error).toMatch(/turned off/i);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests — path 2: getSocialStatusLive (validate=true status check)
// ---------------------------------------------------------------------------

describe("getSocialStatusLive — live token validation", () => {
  it("validates LinkedIn token using DB credentials, not process.env", async () => {
    mockGetLinkedinConfig.mockResolvedValue({
      enabled: true,
      accessToken: DB.linkedin.accessToken,
      authorUrn: DB.linkedin.authorUrn,
      clientId: DB.linkedin.clientId,
      clientSecret: DB.linkedin.clientSecret,
    });
    mockGetXConfig.mockResolvedValue({});

    const { calls } = interceptFetch();
    const status = await getSocialStatusLive();

    expect(calls.length).toBeGreaterThan(0);
    const payload = allFetchPayloads(calls);

    // DB token must appear in the introspection request body or auth header
    expect(payload).toContain(DB.linkedin.accessToken);
    expect(payload).toContain(DB.linkedin.clientId);

    // Env sentinels must be absent
    expect(payload).not.toContain(ENV.LINKEDIN_ACCESS_TOKEN);

    // Status correctly reports the platform as configured
    expect(status.linkedin.configured).toBe(true);
    expect(status.linkedin.checked).toBe(true);
  });

  it("validates X credentials using DB credentials, not process.env", async () => {
    mockGetLinkedinConfig.mockResolvedValue({});
    mockGetXConfig.mockResolvedValue({
      enabled: true,
      apiKey: DB.x.apiKey,
      apiSecret: DB.x.apiSecret,
      accessToken: DB.x.accessToken,
      accessSecret: DB.x.accessSecret,
    });

    const { calls } = interceptFetch();
    const status = await getSocialStatusLive();

    const payload = allFetchPayloads(calls);

    // DB API key must be in the signed OAuth header
    expect(payload).toContain(DB.x.apiKey);
    expect(payload).toContain(DB.x.accessToken);

    // Env sentinels must be absent
    expect(payload).not.toContain(ENV.X_API_KEY);
    expect(payload).not.toContain(ENV.X_ACCESS_TOKEN);

    expect(status.x.configured).toBe(true);
    expect(status.x.checked).toBe(true);
  });

  it("reports configured:false for LinkedIn when DB config is empty (no env fallback)", async () => {
    mockGetLinkedinConfig.mockResolvedValue({});
    mockGetXConfig.mockResolvedValue({});

    const { calls } = interceptFetch();
    const status = await getSocialStatusLive();

    // No real HTTP call should be made when credentials are absent
    const linkedinCalls = calls.filter((c) => c.url.includes("linkedin.com"));
    expect(linkedinCalls.length).toBe(0);

    expect(status.linkedin.configured).toBe(false);
    expect(status.linkedin.checked).toBe(false);
  });

  it("reports configured:false for X when DB config is empty (no env fallback)", async () => {
    mockGetLinkedinConfig.mockResolvedValue({});
    mockGetXConfig.mockResolvedValue({});

    const { calls } = interceptFetch();
    const status = await getSocialStatusLive();

    const xCalls = calls.filter((c) => c.url.includes("twitter.com"));
    expect(xCalls.length).toBe(0);

    expect(status.x.configured).toBe(false);
    expect(status.x.checked).toBe(false);
  });

  it("falls back to userinfo endpoint (no introspection) when clientId/clientSecret are absent in DB", async () => {
    // Only access token present — no client credentials
    mockGetLinkedinConfig.mockResolvedValue({
      enabled: true,
      accessToken: DB.linkedin.accessToken,
      authorUrn: DB.linkedin.authorUrn,
      // clientId and clientSecret intentionally absent
    });
    mockGetXConfig.mockResolvedValue({});

    const { calls } = interceptFetch();
    const status = await getSocialStatusLive();

    // Must use the userinfo fallback path
    const userinfoCalls = calls.filter((c) => c.url.includes("/v2/userinfo"));
    expect(userinfoCalls.length).toBeGreaterThan(0);

    const payload = allFetchPayloads(userinfoCalls);
    expect(payload).toContain(DB.linkedin.accessToken);
    expect(payload).not.toContain(ENV.LINKEDIN_ACCESS_TOKEN);

    expect(status.linkedin.configured).toBe(true);
    expect(status.linkedin.checked).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests — path 3: scheduleSocialShare / autoPublishablePlatforms (auto-share)
// ---------------------------------------------------------------------------

describe("scheduleSocialShare — auto-share on publish", () => {
  it("posts using DB credentials when autoPublish is enabled on both platforms", async () => {
    mockGetLinkedinConfig.mockResolvedValue({
      enabled: true,
      autoPublish: true,
      accessToken: DB.linkedin.accessToken,
      authorUrn: DB.linkedin.authorUrn,
    });
    mockGetXConfig.mockResolvedValue({
      enabled: true,
      autoPublish: true,
      apiKey: DB.x.apiKey,
      apiSecret: DB.x.apiSecret,
      accessToken: DB.x.accessToken,
      accessSecret: DB.x.accessSecret,
    });

    const { calls } = interceptFetch();

    // scheduleSocialShare is fire-and-forget; we await the promise it spawns
    // by waiting for the next microtask batch.
    scheduleSocialShare("Auto-publish text", ["linkedin", "x"]);
    // Flush async work (multiple rounds to let all promises settle)
    for (let i = 0; i < 10; i++) await new Promise((r) => setImmediate(r));

    expect(calls.length).toBeGreaterThan(0);
    const payload = allFetchPayloads(calls);

    // DB credentials must be used
    expect(payload).toContain(DB.linkedin.accessToken);
    expect(payload).toContain(DB.x.apiKey);

    // Env sentinels must be absent
    expect(payload).not.toContain(ENV.LINKEDIN_ACCESS_TOKEN);
    expect(payload).not.toContain(ENV.X_API_KEY);
  });

  it("does not post when autoPublish is false in DB — no env fallback attempted", async () => {
    mockGetLinkedinConfig.mockResolvedValue({
      enabled: true,
      autoPublish: false, // opted out
      accessToken: DB.linkedin.accessToken,
      authorUrn: DB.linkedin.authorUrn,
    });
    mockGetXConfig.mockResolvedValue({
      enabled: true,
      autoPublish: false,
      apiKey: DB.x.apiKey,
      apiSecret: DB.x.apiSecret,
      accessToken: DB.x.accessToken,
      accessSecret: DB.x.accessSecret,
    });

    const { calls } = interceptFetch();

    scheduleSocialShare("Should not post", ["linkedin", "x"]);
    for (let i = 0; i < 10; i++) await new Promise((r) => setImmediate(r));

    // autoPublish:false means no HTTP calls should be made
    expect(calls.length).toBe(0);
  });

  it("silently skips all platforms when DB config is empty (configured:false — no env fallback)", async () => {
    mockGetLinkedinConfig.mockResolvedValue({});
    mockGetXConfig.mockResolvedValue({});

    const { calls } = interceptFetch();

    scheduleSocialShare("No creds", ["linkedin", "x"]);
    for (let i = 0; i < 10; i++) await new Promise((r) => setImmediate(r));

    // No calls — platforms are not eligible without credentials
    expect(calls.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Meta-guard: ensure getLinkedinConfig / getXConfig are never bypassed
// ---------------------------------------------------------------------------

describe("credential source guard", () => {
  it("getLinkedinConfig is called for every postToSocial LinkedIn attempt", async () => {
    mockGetLinkedinConfig.mockResolvedValue({
      enabled: true,
      accessToken: DB.linkedin.accessToken,
      authorUrn: DB.linkedin.authorUrn,
    });
    mockGetXConfig.mockResolvedValue({});
    interceptFetch();

    await postToSocial("guard test", ["linkedin"]);

    // The DB getter must have been invoked — if it wasn't, credentials came
    // from somewhere else (env, hard-coded, etc.)
    expect(mockGetLinkedinConfig).toHaveBeenCalled();
  });

  it("getXConfig is called for every postToSocial X attempt", async () => {
    mockGetLinkedinConfig.mockResolvedValue({});
    mockGetXConfig.mockResolvedValue({
      enabled: true,
      apiKey: DB.x.apiKey,
      apiSecret: DB.x.apiSecret,
      accessToken: DB.x.accessToken,
      accessSecret: DB.x.accessSecret,
    });
    interceptFetch();

    await postToSocial("guard test", ["x"]);

    expect(mockGetXConfig).toHaveBeenCalled();
  });

  it("getLinkedinConfig is called for every getSocialStatusLive check", async () => {
    mockGetLinkedinConfig.mockResolvedValue({});
    mockGetXConfig.mockResolvedValue({});
    interceptFetch();

    await getSocialStatusLive();

    expect(mockGetLinkedinConfig).toHaveBeenCalled();
  });

  it("getXConfig is called for every getSocialStatusLive check", async () => {
    mockGetLinkedinConfig.mockResolvedValue({});
    mockGetXConfig.mockResolvedValue({});
    interceptFetch();

    await getSocialStatusLive();

    expect(mockGetXConfig).toHaveBeenCalled();
  });
});
