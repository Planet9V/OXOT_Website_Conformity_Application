/**
 * The Art. 14(8) product-user register and notification record (task 10.2),
 * over HTTP. Proves the tri-state derivation split (exact recorded-version
 * match / version-not-recorded cannot be ruled out / no-match needs manual
 * verification), that absent facts stay absent, and that a notification is
 * recorded as the ORGANISATION'S stated act with session provenance.
 * Fixtures are owned: created here, deleted here (L46).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { adminCookie } from "./helpers/testAuth";

let server: Server;
let baseUrl: string;
let cookie: string;
let productId: number;
let advisoryId: number;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  cookie = adminCookie();

  const product = await api("POST", "/conformity/products", {
    name: "Art148 Register Probe",
    productType: "software",
  });
  productId = product.json.id;

  const advisory = await api("POST", "/conformity/advisories", {
    productId,
    title: "Probe advisory for impacted-user derivation",
    severity: "high",
    affectedVersions: "1.2.0, 1.3.0",
    fixedVersions: "1.3.1",
  });
  advisoryId = advisory.json.advisory?.id ?? advisory.json.id;
});

afterAll(async () => {
  // Own the fixtures fully (L46): the advisory would otherwise SURVIVE the
  // product delete by design (frozen name, productId set null) and leak
  // into later suites' expectations.
  if (advisoryId) await api("DELETE", `/conformity/advisories/${advisoryId}`);
  if (productId) await api("DELETE", `/conformity/products/${productId}`);
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

async function api(
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

describe("Art. 14(8) product-user register", () => {
  it("refuses unauthenticated access (401)", async () => {
    const res = await api("GET", `/conformity/products/${productId}/users`, undefined, false);
    expect(res.status).toBe(401);
  });

  it("registers users; absent facts stay absent; provenance names the actor", async () => {
    const impacted = await api("POST", `/conformity/products/${productId}/users`, {
      name: "Fleet A",
      deployedVersion: "1.2.0",
      contact: "ciso@fleet-a.example",
    });
    expect(impacted.status).toBe(200);
    expect(impacted.json.deployedVersion).toBe("1.2.0");
    expect(impacted.json.registeredBy).toMatch(/^admin:/);

    const unknown = await api("POST", `/conformity/products/${productId}/users`, {
      name: "Fleet B (version unknown)",
    });
    expect(unknown.status).toBe(200);
    expect(unknown.json.deployedVersion).toBe(""); // absent, never invented
    expect(unknown.json.contact).toBe("");

    const other = await api("POST", `/conformity/products/${productId}/users`, {
      name: "Fleet C",
      deployedVersion: "2.0.0",
    });
    expect(other.status).toBe(200);

    const list = await api("GET", `/conformity/products/${productId}/users`);
    expect(list.json.users).toHaveLength(3);
  });

  it("derives the tri-state impacted split and states its rule", async () => {
    const res = await api("GET", `/conformity/advisories/${advisoryId}/impacted-users`);
    expect(res.status).toBe(200);
    expect(res.json.rule).toContain("free text");
    expect(res.json.affectedVersionTokens).toEqual(["1.2.0", "1.3.0"]);
    expect(res.json.impacted.map((u: any) => u.name)).toEqual(["Fleet A"]);
    expect(res.json.versionNotRecorded.map((u: any) => u.name)).toEqual([
      "Fleet B (version unknown)",
    ]);
    expect(res.json.noRecordedMatch.map((u: any) => u.name)).toEqual(["Fleet C"]);
  });

  it("records a notification as the org's stated act, with provenance", async () => {
    const bad = await api("POST", `/conformity/products/${productId}/user-notifications`, {
      scope: "impacted_users",
      statedAt: "not-a-date",
      method: "e-mail to registered contacts",
    });
    expect(bad.status).toBe(400);

    const res = await api("POST", `/conformity/products/${productId}/user-notifications`, {
      advisoryId,
      scope: "impacted_users",
      statedAt: "2026-08-16T12:00:00Z",
      method: "e-mail to registered contacts",
      measuresSummary: "Upgrade to 1.3.1; isolate management port until then.",
      machineReadableFormat: "CSAF",
    });
    expect(res.status).toBe(200);
    expect(res.json.recordedBy).toMatch(/^admin:/);
    expect(res.json.statedAt).toBe("2026-08-16T12:00:00.000Z");
    expect(res.json.scope).toBe("impacted_users");

    const list = await api("GET", `/conformity/products/${productId}/user-notifications`);
    expect(list.json.notifications).toHaveLength(1);
    expect(list.json.notifications[0].advisoryId).toBe(advisoryId);
  });

  it("cascade: deleting the product removes register and notifications", async () => {
    const probe = await api("POST", "/conformity/products", {
      name: "Cascade Probe 148",
      productType: "software",
    });
    await api("POST", `/conformity/products/${probe.json.id}/users`, { name: "Temp user" });
    await api("POST", `/conformity/products/${probe.json.id}/user-notifications`, {
      scope: "all_users",
      statedAt: "2026-08-16T12:00:00Z",
      method: "portal notice",
    });
    await api("DELETE", `/conformity/products/${probe.json.id}`);
    const after = await api("GET", `/conformity/products/${probe.json.id}/users`);
    expect(after.status).toBe(404);
  });
});
