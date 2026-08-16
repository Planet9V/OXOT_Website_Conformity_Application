/**
 * Product CRUD lifecycle over HTTP — authenticated (task 8.1 / issue #62).
 *
 * The previous version of this file asserted that mutations SUCCEED WITHOUT
 * a session ("allows product creation without auth cookie") — the exact
 * behaviour the auth guards exist to prevent, and the reason the suite went
 * red the day the guards landed. It now authenticates like a real client,
 * and asserts the guard too: the same mutation without a cookie is a 401.
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

async function requestApi(
  method: string,
  path: string,
  body?: unknown,
  withAuth = true,
): Promise<{ status: number; json: any }> {
  const headers: Record<string, string> = {};
  if (withAuth) headers["cookie"] = cookie;
  if (body !== undefined) headers["content-type"] = "application/json";
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
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

describe("Conformity product editing & lifecycle (authenticated)", () => {
  let createdProductId: number;

  it("rejects an unauthenticated product creation (401)", async () => {
    const res = await requestApi(
      "POST",
      "/conformity/products",
      { name: "Should Not Exist" },
      false,
    );
    expect(res.status).toBe(401);
  });

  it("POST /conformity/products creates with an admin session", async () => {
    const res = await requestApi("POST", "/conformity/products", {
      name: "Test Smart Gateway v100",
      productType: "hardware",
      version: "1.0.0",
      manufacturerName: "Acme Industrial Cyber",
      intendedUse: "Edge security and CRA compliance testing",
      description: "Test product created during vitest execution",
    });
    expect(res.status).toBe(200);
    expect(res.json.id).toBeDefined();
    expect(res.json.name).toBe("Test Smart Gateway v100");
    createdProductId = res.json.id;
  });

  it("GET /conformity/products/:id retrieves the product", async () => {
    const res = await requestApi("GET", `/conformity/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.json.product.id).toBe(createdProductId);
    expect(res.json.product.name).toBe("Test Smart Gateway v100");
  });

  it("PUT /conformity/products/:id updates the product", async () => {
    const res = await requestApi("PUT", `/conformity/products/${createdProductId}`, {
      name: "Test Smart Gateway v200 Updated",
      productType: "hardware",
      version: "2.0.0",
      manufacturerName: "Acme Cyber Tech B.V.",
      authorizedRep: "Acme EU Rep GmbH",
      manufacturerAddress: "Tech Park 42, Amsterdam",
      intendedUse: "Statutory CRA regulation compliance",
      description: "Updated description via unit test",
    });
    expect(res.status).toBe(200);
    expect(res.json.name).toBe("Test Smart Gateway v200 Updated");
    expect(res.json.version).toBe("2.0.0");
    expect(res.json.authorizedRep).toBe("Acme EU Rep GmbH");
  });

  it("GET confirms the updated fields persisted", async () => {
    const res = await requestApi("GET", `/conformity/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.json.product.name).toBe("Test Smart Gateway v200 Updated");
    expect(res.json.product.authorizedRep).toBe("Acme EU Rep GmbH");
  });

  it("DELETE /conformity/products/:id removes it (then 404)", async () => {
    const res = await requestApi("DELETE", `/conformity/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
    const getRes = await requestApi("GET", `/conformity/products/${createdProductId}`);
    expect(getRes.status).toBe(404);
  });
});
