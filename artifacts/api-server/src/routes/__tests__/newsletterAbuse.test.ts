/**
 * Regression guard for newsletter signup abuse protections.
 *
 * POST /api/newsletter/subscribe triggers a confirmation email, so without
 * these guards an attacker could email-bomb arbitrary inboxes:
 *  - per-IP fixed-window limit (10 / 15 min) → 429 on the burst overflow
 *  - per-email fixed-window limit (5 / hour, across IPs) → 429 on overflow
 *  - non-empty `website` honeypot → generic success but NO subscribe/email
 *
 * The newsletter lib is mocked so no emails are sent and no DB rows are
 * written; the real router + rateLimit middleware are exercised over HTTP.
 * `trust proxy` is enabled (matching the real app) so each test can pick its
 * own client IP via X-Forwarded-For without colliding with other tests.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import express from "express";

vi.mock("../../lib/newsletter", () => ({
  subscribe: vi.fn(async () => undefined),
  confirmSubscription: vi.fn(async () => true),
  unsubscribe: vi.fn(async () => true),
  recordOpen: vi.fn(async () => undefined),
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
}));

import newsletterRouter from "../newsletter";
import { subscribe } from "../../lib/newsletter";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = express();
  app.set("trust proxy", true); // same as the real app; lets tests choose req.ip
  app.use(express.json());
  app.use((req, _res, next) => {
    // Minimal pino-http stand-in; the router only uses req.log.warn.
    (req as unknown as { log: { warn: () => void } }).log = { warn: vi.fn() };
    next();
  });
  app.use("/api", newsletterRouter);
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

beforeEach(() => {
  vi.mocked(subscribe).mockClear();
});

async function postSubscribe(
  body: Record<string, unknown>,
  ip: string,
): Promise<Response> {
  return fetch(`${baseUrl}/newsletter/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("newsletter subscribe abuse protection", () => {
  it("accepts a legitimate single signup", async () => {
    const res = await postSubscribe({ email: "legit-user@example.com" }, "10.1.0.1");
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ email: "legit-user@example.com" }),
    );
  });

  it("returns 429 for a burst beyond the per-IP limit", async () => {
    const ip = "10.2.0.1";
    // Distinct emails so only the IP limiter is in play (email limit is 5).
    for (let i = 0; i < 10; i++) {
      const res = await postSubscribe({ email: `ip-burst-${i}@example.com` }, ip);
      expect(res.status).toBe(200);
    }
    const blocked = await postSubscribe({ email: "ip-burst-over@example.com" }, ip);
    expect(blocked.status).toBe(429);
    const json = (await blocked.json()) as { error?: string };
    expect(json.error).toMatch(/too many signup attempts/i);
    // The overflow request never reached the handler → no email enqueued.
    expect(subscribe).toHaveBeenCalledTimes(10);
  });

  it("returns 429 when one email is targeted beyond the per-email limit, even across IPs", async () => {
    const email = "victim@example.com";
    for (let i = 0; i < 5; i++) {
      const res = await postSubscribe({ email }, `10.3.0.${i + 1}`);
      expect(res.status).toBe(200);
    }
    const blocked = await postSubscribe({ email }, "10.3.0.100");
    expect(blocked.status).toBe(429);
    expect(subscribe).toHaveBeenCalledTimes(5);
  });

  it("normalizes the email key (case/whitespace) so variants can't dodge the limit", async () => {
    const base = "cased-victim@example.com";
    const variants = [
      base,
      base.toUpperCase(),
      "CASED-victim@example.com",
      "Cased-Victim@Example.com",
      base,
    ];
    for (const [i, email] of variants.entries()) {
      const res = await postSubscribe({ email }, `10.5.0.${i + 1}`);
      expect(res.status).toBe(200);
    }
    const blocked = await postSubscribe({ email: base.toUpperCase() }, "10.5.0.100");
    expect(blocked.status).toBe(429);
  });

  it("silently drops honeypot submissions: generic success, no subscription/email", async () => {
    const res = await postSubscribe(
      { email: "bot@example.com", website: "http://spam.example" },
      "10.4.0.1",
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; message: string };
    // Indistinguishable from the real success response, so the bot learns nothing.
    expect(json.ok).toBe(true);
    expect(json.message).toMatch(/check your inbox/i);
    expect(subscribe).not.toHaveBeenCalled();
  });
});
