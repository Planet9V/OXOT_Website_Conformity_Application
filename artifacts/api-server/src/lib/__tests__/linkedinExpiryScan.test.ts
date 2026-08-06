/**
 * Unit tests for the scheduled LinkedIn token expiry scan.
 *
 * Contract under test:
 *  - Uses the LIVE LinkedIn validation (getLinkedinStatusLive), not just the
 *    stored expiresAt.
 *  - Emails when < 7 days remain, or when the token is already invalid.
 *  - Dedupe: one email per (phase, expiry) key — a repeat run with the same
 *    key sends nothing; a new token (new expiry) or phase change re-alerts.
 *  - Claim-then-send: the key is claimed before sending and released when the
 *    send fails, so the next run retries.
 *  - Never claims/sends when no alert recipient is configured.
 */

import { describe, it, expect, vi, beforeEach, type MockedFunction } from "vitest";

vi.mock("../integrationSettings", () => ({
  getLinkedinConfig: vi.fn(),
  getAlertRecipient: vi.fn(),
  claimLinkedinExpiryWarning: vi.fn(),
  releaseLinkedinExpiryWarning: vi.fn().mockResolvedValue(undefined),
  recordIntegrationEvent: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../social", () => ({
  getLinkedinStatusLive: vi.fn(),
}));
vi.mock("../mailer", () => ({
  sendEmail: vi.fn(),
  isMailConfigured: vi.fn().mockResolvedValue(true),
}));

import {
  getLinkedinConfig,
  getAlertRecipient,
  claimLinkedinExpiryWarning,
  releaseLinkedinExpiryWarning,
} from "../integrationSettings";
import { getLinkedinStatusLive } from "../social";
import { sendEmail } from "../mailer";
import { runLinkedinExpiryScan } from "../linkedinExpiryScan";

const mockConfig = getLinkedinConfig as MockedFunction<typeof getLinkedinConfig>;
const mockRecipient = getAlertRecipient as MockedFunction<typeof getAlertRecipient>;
const mockClaim = claimLinkedinExpiryWarning as MockedFunction<
  typeof claimLinkedinExpiryWarning
>;
const mockRelease = releaseLinkedinExpiryWarning as MockedFunction<
  typeof releaseLinkedinExpiryWarning
>;
const mockStatus = getLinkedinStatusLive as MockedFunction<typeof getLinkedinStatusLive>;
const mockSend = sendEmail as MockedFunction<typeof sendEmail>;

const NOW = Date.parse("2026-07-21T12:00:00Z");
const DAY = 86_400_000;

function liveStatus(expiresAtMs: number | null, valid: boolean | null) {
  return {
    configured: true,
    checked: true,
    valid,
    expiresAt: expiresAtMs != null ? new Date(expiresAtMs).toISOString() : null,
    expiresInDays:
      expiresAtMs != null ? Math.max(0, Math.floor((expiresAtMs - NOW) / DAY)) : null,
    error: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockConfig.mockResolvedValue({ enabled: true, accessToken: "tok" });
  mockRecipient.mockResolvedValue("admin@example.com");
  mockClaim.mockResolvedValue(true);
  mockSend.mockResolvedValue({ delivered: true });
});

describe("runLinkedinExpiryScan", () => {
  it("skips without a live call when no token is configured", async () => {
    mockConfig.mockResolvedValue({});
    const r = await runLinkedinExpiryScan(NOW);
    expect(r.checked).toBe(false);
    expect(mockStatus).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("does not email when the token is healthy (> 7 days left)", async () => {
    mockStatus.mockResolvedValue(liveStatus(NOW + 30 * DAY, true));
    const r = await runLinkedinExpiryScan(NOW);
    expect(r.checked).toBe(true);
    expect(r.warned).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("emails when fewer than 7 days remain, claiming the key BEFORE sending", async () => {
    const exp = NOW + 3 * DAY;
    mockStatus.mockResolvedValue(liveStatus(exp, true));
    const r = await runLinkedinExpiryScan(NOW);
    expect(r.warned).toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].subject).toContain("expires in 3 day");
    expect(mockClaim).toHaveBeenCalledWith(`expiring:${exp}`, NOW);
    expect(mockClaim.mock.invocationCallOrder[0]).toBeLessThan(
      mockSend.mock.invocationCallOrder[0],
    );
  });

  it("emails an 'expired' alert when the live check says the token is invalid", async () => {
    mockStatus.mockResolvedValue(liveStatus(null, false));
    const r = await runLinkedinExpiryScan(NOW);
    expect(r.warned).toBe(true);
    expect(mockSend.mock.calls[0][0].subject).toContain("expired");
    expect(mockClaim).toHaveBeenCalledWith("invalid:unknown", NOW);
  });

  it("deduplicates: same key already recorded means no email", async () => {
    const exp = NOW + 3 * DAY;
    mockConfig.mockResolvedValue({
      enabled: true,
      accessToken: "tok",
      lastExpiryWarningKey: `expiring:${exp}`,
    });
    mockStatus.mockResolvedValue(liveStatus(exp, true));
    const r = await runLinkedinExpiryScan(NOW);
    expect(r.warned).toBe(false);
    expect(r.skipped).toContain("already alerted");
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockClaim).not.toHaveBeenCalled();
  });

  it("re-alerts when the phase worsens from expiring to invalid", async () => {
    const exp = NOW - DAY;
    mockConfig.mockResolvedValue({
      enabled: true,
      accessToken: "tok",
      lastExpiryWarningKey: `expiring:${exp}`,
    });
    mockStatus.mockResolvedValue(liveStatus(exp, false));
    const r = await runLinkedinExpiryScan(NOW);
    expect(r.warned).toBe(true);
    expect(mockClaim).toHaveBeenCalledWith(`invalid:${exp}`, NOW);
  });

  it("releases the claim (restores previous key) when the send fails", async () => {
    const exp = NOW + 2 * DAY;
    mockStatus.mockResolvedValue(liveStatus(exp, true));
    mockSend.mockResolvedValue({ delivered: false, error: "smtp down" });
    const r = await runLinkedinExpiryScan(NOW);
    expect(r.warned).toBe(false);
    expect(r.error).toBe("smtp down");
    expect(mockClaim).toHaveBeenCalledWith(`expiring:${exp}`, NOW);
    expect(mockRelease).toHaveBeenCalledWith(`expiring:${exp}`, null);
  });

  it("does not send when another run already won the atomic claim", async () => {
    mockStatus.mockResolvedValue(liveStatus(NOW + 2 * DAY, true));
    mockClaim.mockResolvedValue(false);
    const r = await runLinkedinExpiryScan(NOW);
    expect(r.warned).toBe(false);
    expect(r.skipped).toContain("already claimed");
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it("concurrency: two parallel scans for the same key send exactly one email", async () => {
    const exp = NOW + 2 * DAY;
    mockStatus.mockResolvedValue(liveStatus(exp, true));
    // Simulate the DB's conditional UPDATE: first caller wins, second loses.
    let claimedKey: string | null = null;
    mockClaim.mockImplementation(async (key) => {
      if (claimedKey === key) return false;
      claimedKey = key;
      return true;
    });
    const [a, b] = await Promise.all([
      runLinkedinExpiryScan(NOW),
      runLinkedinExpiryScan(NOW),
    ]);
    expect([a.warned, b.warned].filter(Boolean)).toHaveLength(1);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("never claims or sends when no alert recipient is configured", async () => {
    mockRecipient.mockResolvedValue(null);
    mockStatus.mockResolvedValue(liveStatus(NOW + DAY, true));
    const r = await runLinkedinExpiryScan(NOW);
    expect(r.warned).toBe(false);
    expect(r.skipped).toContain("no alert recipient");
    expect(mockClaim).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("falls back to the stored expiresAt when introspection can't report expiry", async () => {
    mockConfig.mockResolvedValue({
      enabled: true,
      accessToken: "tok",
      expiresAt: NOW + 4 * DAY,
    });
    mockStatus.mockResolvedValue({
      configured: true,
      checked: true,
      valid: true,
      expiresAt: null,
      expiresInDays: null,
      error: "expiry can't be tracked",
    });
    const r = await runLinkedinExpiryScan(NOW);
    expect(r.warned).toBe(true);
    expect(mockClaim).toHaveBeenCalledWith(`expiring:${NOW + 4 * DAY}`, NOW);
  });
});
