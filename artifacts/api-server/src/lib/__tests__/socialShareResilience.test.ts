/**
 * scheduleSocialShare resilience contract.
 *
 * recordSocialOutcomes is best-effort observability: a logging/DB failure must
 * never throw out of the fire-and-forget scheduleSocialShare path (which has
 * no request context to surface an error to). These tests mock @workspace/db
 * so the outcome insert rejects, and assert:
 *  - recordSocialOutcomes swallows the error (returns []) and logs it
 *  - scheduleSocialShare produces no unhandled rejection when the insert fails
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loggerError = vi.hoisted(() => vi.fn());

vi.mock("../logger", () => ({
  logger: {
    error: loggerError,
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// DB whose insert path always rejects — simulates the outcome-log write dying.
const insertReturning = vi.hoisted(() =>
  vi.fn().mockRejectedValue(new Error("db is down")),
);
vi.mock("@workspace/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({ returning: insertReturning }),
    }),
    select: vi.fn(),
  },
  socialPostsTable: {},
}));

vi.mock("../integrationSettings", () => ({
  getLinkedinConfig: vi.fn().mockResolvedValue({
    enabled: true,
    autoPublish: true,
    accessToken: "T",
    authorUrn: "urn:li:member:t",
  }),
  getXConfig: vi.fn().mockResolvedValue({ enabled: false }),
  getAlertRecipient: vi.fn().mockResolvedValue(null),
  recordIntegrationHealth: vi.fn().mockResolvedValue(undefined),
  recordIntegrationEvent: vi.fn().mockResolvedValue(undefined),
}));

import { recordSocialOutcomes, scheduleSocialShare } from "../social";

const unhandled: unknown[] = [];
const onUnhandled = (reason: unknown) => {
  unhandled.push(reason);
};

beforeEach(() => {
  unhandled.length = 0;
  process.on("unhandledRejection", onUnhandled);
  // The LinkedIn post itself fails too (worst case: post AND log both fail).
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("boom", { status: 500 })),
  );
});

afterEach(() => {
  process.off("unhandledRejection", onUnhandled);
  vi.unstubAllGlobals();
  loggerError.mockClear();
});

async function flush(): Promise<void> {
  for (let i = 0; i < 25; i++) await new Promise((r) => setImmediate(r));
}

describe("recordSocialOutcomes — DB failure is swallowed", () => {
  it("returns [] and logs instead of throwing when the insert rejects", async () => {
    const rows = await recordSocialOutcomes(
      [{ platform: "linkedin", success: false, error: "x" }],
      "some text",
      "publish",
    );
    expect(rows).toEqual([]);
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(Error) }),
      "Failed to record social post outcomes",
    );
  });
});

describe("scheduleSocialShare — never throws out of the background path", () => {
  it("completes without an unhandled rejection when the outcome insert fails", async () => {
    expect(() => scheduleSocialShare("publish text", ["linkedin"])).not.toThrow();
    await flush();

    // The insert was attempted and rejected...
    expect(insertReturning).toHaveBeenCalled();
    // ...but nothing escaped the fire-and-forget wrapper.
    expect(unhandled).toEqual([]);
    // And the failure was recorded in the log stream, not swallowed silently.
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(Error) }),
      "Failed to record social post outcomes",
    );
  });
});
