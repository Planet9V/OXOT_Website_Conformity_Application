/**
 * Product → assessment → portfolio rollup lifecycle — against the CURRENT
 * contract (rewritten in task 8.1 / issue #62; the previous version asserted
 * a /conformity/portfolio/rollup route and a flat shape that never shipped,
 * and authenticated with nothing on a guarded API).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { adminCookie } from "./helpers/testAuth";

let server: Server;
let baseUrl: string;
let cookie: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  cookie = adminCookie();
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

async function api(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; json: any }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      cookie,
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let json: any = {};
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }
  return { status: res.status, json };
}

describe("Portfolio & product cascade (current contract)", () => {
  let createdProductId: number;

  it("POST /conformity/products creates a product (authenticated)", async () => {
    const res = await api("POST", "/conformity/products", {
      name: "Portfolio Diagnostic Smart Switch X9",
      productType: "hardware",
      version: "9.1.0",
      manufacturerName: "OXOT Diagnostics B.V.",
      intendedUse: "Commercial smart grid energy control",
      description: "Automated test product for portfolio cascades",
    });
    expect(res.status).toBe(200);
    expect(res.json.id).toBeDefined();
    createdProductId = res.json.id;
  });

  it("POST /conformity/assessments couples an assessment to the product", async () => {
    const res = await api("POST", "/conformity/assessments", {
      productId: createdProductId,
      regulationKey: "cra",
    });
    expect(res.status).toBe(200);
    expect(res.json.assessment).toBeDefined();
    expect(res.json.assessment.productId).toBe(createdProductId);
    expect(res.json.assessment.regulationKey).toBe("cra");
  });

  it("GET /conformity/portfolio aggregates totals and risk", async () => {
    const res = await api("GET", "/conformity/portfolio");
    expect(res.status).toBe(200);
    expect(res.json.totals.products).toBeGreaterThan(0);
    expect(res.json.totals.assessments).toBeGreaterThan(0);
    expect(res.json.risk).toBeDefined();
    expect(typeof res.json.risk.openBlockers).toBe("number");
    expect(Array.isArray(res.json.products)).toBe(true);
  });

  it("DELETE /conformity/products/:id cascades cleanly", async () => {
    const delRes = await api("DELETE", `/conformity/products/${createdProductId}`);
    expect(delRes.status).toBe(200);
    const getRes = await api("GET", `/conformity/products/${createdProductId}`);
    expect(getRes.status).toBe(404);
  });
});
