/**
 * Module 2: Portfolio & Product Cascades Diagnostic Unit Test Suite
 *
 * Tests product registration, assessment coupling, CRA stage progress tracking,
 * grade distribution rollups, and statutory deadline horizons.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";

let server: Server;
let baseUrl: string;
let adminCookie: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("portfolio-admin-test")}`;
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
      cookie: adminCookie,
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

describe("Module 2: Portfolio & Product Cascades Diagnostic Suite", () => {
  let createdProductId: number;
  let createdAssessmentId: number;

  it("POST /api/conformity/products - creates product dossier", async () => {
    const res = await api("POST", "/conformity/products", {
      name: "Portfolio Diagnostic Smart Switch X9",
      productType: "Hardware / IoT",
      version: "9.1.0",
      manufacturerName: "OXOT Diagnostics B.V.",
      intendedUse: "Commercial Smart Grid Energy Control",
      description: "Automated test product for portfolio cascades",
    });

    expect(res.status).toBe(200);
    expect(res.json.id).toBeDefined();
    expect(res.json.name).toBe("Portfolio Diagnostic Smart Switch X9");
    createdProductId = res.json.id;
  });

  it("GET /api/conformity/products/:id - fetches product details", async () => {
    const res = await api("GET", `/conformity/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.json.product).toBeDefined();
    expect(res.json.product.id).toBe(createdProductId);
  });

  it("POST /api/conformity/assessments - couples CRA assessment to product", async () => {
    const res = await api("POST", "/conformity/assessments", {
      productId: createdProductId,
      regulationKey: "cra",
    });

    expect(res.status).toBe(200);
    expect(res.json.id).toBeDefined();
    expect(res.json.productId).toBe(createdProductId);
    expect(res.json.regulationKey).toBe("cra");
    createdAssessmentId = res.json.id;
  });

  it("GET /api/conformity/portfolio/rollup - aggregates portfolio metrics and grades", async () => {
    const res = await api("GET", "/conformity/portfolio/rollup");
    expect(res.status).toBe(200);
    expect(res.json.totalProducts).toBeGreaterThan(0);
    expect(res.json.totalAssessments).toBeGreaterThan(0);
    expect(res.json.overallGrade).toBeDefined();
    expect(Array.isArray(res.json.gradeDistribution)).toBe(true);
    expect(Array.isArray(res.json.deadlines)).toBe(true);
  });

  it("DELETE /api/conformity/products/:id - cascades deletion cleanly", async () => {
    const delRes = await api("DELETE", `/conformity/products/${createdProductId}`);
    expect(delRes.status).toBe(200);
    expect(delRes.json.success).toBe(true);

    const getRes = await api("GET", `/conformity/products/${createdProductId}`);
    expect(getRes.status).toBe(404);
  });
});
