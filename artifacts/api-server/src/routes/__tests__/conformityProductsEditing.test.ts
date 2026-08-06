/**
 * Unit tests for Product Creation, Editing (PUT), and Deletion (DELETE)
 * ensuring unauthenticated and demo sessions succeed without 401 errors.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
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

async function requestApi(
  method: string,
  path: string,
  body?: unknown,
  cookie?: string,
): Promise<{ status: number; json: any }> {
  const headers: Record<string, string> = {};
  if (cookie) headers["cookie"] = cookie;
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

describe("Conformity Product Editing & Lifecycle API", () => {
  let createdProductId: number;

  it("POST /api/conformity/products - allows product creation without auth cookie", async () => {
    const res = await requestApi("POST", "/conformity/products", {
      name: "Test Smart Gateway v100",
      productType: "Hardware",
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

  it("GET /api/conformity/products/:id - retrieves product details", async () => {
    const res = await requestApi("GET", `/conformity/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.json.product).toBeDefined();
    expect(res.json.product.id).toBe(createdProductId);
    expect(res.json.product.name).toBe("Test Smart Gateway v100");
  });

  it("PUT /api/conformity/products/:id - updates product details without 401 Unauthorized", async () => {
    const res = await requestApi("PUT", `/conformity/products/${createdProductId}`, {
      name: "Test Smart Gateway v200 Updated",
      productType: "IoT Hardware",
      version: "2.0.0",
      manufacturerName: "Acme Cyber Tech B.V.",
      authorizedRep: "Acme EU Rep GmbH",
      manufacturerAddress: "Tech Park 42, Amsterdam",
      intendedUse: "Statutory CRA Regulation Compliance",
      description: "Updated description via unit test",
    });

    expect(res.status).toBe(200);
    expect(res.json.name).toBe("Test Smart Gateway v200 Updated");
    expect(res.json.version).toBe("2.0.0");
    expect(res.json.authorizedRep).toBe("Acme EU Rep GmbH");
  });

  it("GET /api/conformity/products/:id - confirms updated fields persisted", async () => {
    const res = await requestApi("GET", `/conformity/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.json.product.name).toBe("Test Smart Gateway v200 Updated");
    expect(res.json.product.version).toBe("2.0.0");
    expect(res.json.product.authorizedRep).toBe("Acme EU Rep GmbH");
  });

  it("DELETE /api/conformity/products/:id - deletes product without 401 Unauthorized", async () => {
    const res = await requestApi("DELETE", `/conformity/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);

    const getRes = await requestApi("GET", `/conformity/products/${createdProductId}`);
    expect(getRes.status).toBe(404);
  });
});
