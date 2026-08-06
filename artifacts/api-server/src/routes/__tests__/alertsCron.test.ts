/**
 * Auth contract for the external cron trigger POST /api/cron/conformity-alerts.
 *
 * This endpoint exists so an OUTSIDE scheduler can run the CRA deadline alert
 * scan against the published autoscale app (which has no always-on process).
 * It must never run unauthenticated:
 *  - secret env unset      -> 503 (endpoint disabled)
 *  - missing/wrong bearer  -> 401
 *  - correct bearer        -> runs the scan and returns its JSON result
 *
 * Boots the real Express app on an ephemeral port (same strategy as
 * conformityAuth.test.ts) against the real dev database. The happy-path run is
 * safe: alerts are only sent when enabled + SMTP configured in admin settings,
 * and dedupe lives in conformity_alert_state.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

let server: Server;
let baseUrl: string;

const PATH = "/api/cron/conformity-alerts";
const ORIGINAL_SECRET = process.env.CONFORMITY_ALERTS_CRON_SECRET;

beforeAll(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  if (ORIGINAL_SECRET === undefined) delete process.env.CONFORMITY_ALERTS_CRON_SECRET;
  else process.env.CONFORMITY_ALERTS_CRON_SECRET = ORIGINAL_SECRET;
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

describe("POST /api/cron/conformity-alerts", () => {
  it("returns 503 when the cron secret is not configured", async () => {
    delete process.env.CONFORMITY_ALERTS_CRON_SECRET;
    const res = await fetch(baseUrl + PATH, { method: "POST" });
    expect(res.status).toBe(503);
  });

  it("returns 401 without a bearer token when the secret is configured", async () => {
    process.env.CONFORMITY_ALERTS_CRON_SECRET = "test-cron-secret";
    const res = await fetch(baseUrl + PATH, { method: "POST" });
    expect(res.status).toBe(401);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).not.toHaveProperty("ranAt");
  });

  it("returns 401 with a wrong bearer token", async () => {
    process.env.CONFORMITY_ALERTS_CRON_SECRET = "test-cron-secret";
    const res = await fetch(baseUrl + PATH, {
      method: "POST",
      headers: { Authorization: "Bearer wrong-token" },
    });
    expect(res.status).toBe(401);
  });

  it("runs the scan with the correct bearer token and returns the result", async () => {
    process.env.CONFORMITY_ALERTS_CRON_SECRET = "test-cron-secret";
    const res = await fetch(baseUrl + PATH, {
      method: "POST",
      headers: { Authorization: "Bearer test-cron-secret" },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    // Shape of AlertScanResult — proves the scan actually ran.
    expect(body).toHaveProperty("ranAt");
    expect(body).toHaveProperty("enabled");
    expect(body).toHaveProperty("alertsSent");
    expect(body).toHaveProperty("alertsFailed");
  });
});
