/**
 * The supplier register over HTTP (task 21.1) — the operator/asset-owner
 * shape's foundation. What matters here:
 *   - a supplier is a business-relationship record with a product count,
 *   - linking a product validates the supplier exists (400, never a 500),
 *   - deleting a supplier UNLINKS its products and never deletes them —
 *     the equipment register outlives any one business relationship.
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

describe("The supplier register (operator shape, 21.1)", () => {
  let supplierId: number;
  let productId: number;

  afterAll(async () => {
    if (productId) await api("DELETE", `/conformity/products/${productId}`);
    if (supplierId) await api("DELETE", `/conformity/suppliers/${supplierId}`);
  });

  it("rejects unauthenticated access (401)", async () => {
    expect((await api("GET", "/conformity/suppliers", undefined, false)).status).toBe(401);
    expect(
      (await api("POST", "/conformity/suppliers", { name: "NoAuth GmbH" }, false)).status,
    ).toBe(401);
  });

  it("registers a supplier and lists it with a zero product count", async () => {
    const created = await api("POST", "/conformity/suppliers", {
      name: "Vitest Automation GmbH",
      contact: "psirt@vitest-automation.example",
      notes: "Test supplier",
    });
    expect(created.status).toBe(200);
    expect(created.json.productCount).toBe(0);
    supplierId = created.json.id;

    const list = await api("GET", "/conformity/suppliers");
    expect(list.status).toBe(200);
    const row = list.json.suppliers.find((s: any) => s.id === supplierId);
    expect(row, "registered supplier missing from the list").toBeDefined();
    expect(row.productCount).toBe(0);
  });

  it("refuses a duplicate name and a blank name (400)", async () => {
    expect(
      (await api("POST", "/conformity/suppliers", { name: "Vitest Automation GmbH" })).status,
    ).toBe(400);
    expect((await api("POST", "/conformity/suppliers", { name: "   " })).status).toBe(400);
  });

  it("links a product to the supplier and the count follows", async () => {
    const product = await api("POST", "/conformity/products", {
      name: "Vitest Purchased PLC",
      productType: "hardware",
      orgRole: "operator",
      supplierId,
    });
    expect(product.status).toBe(200);
    expect(product.json.supplierId).toBe(supplierId);
    productId = product.json.id;

    const list = await api("GET", "/conformity/suppliers");
    const row = list.json.suppliers.find((s: any) => s.id === supplierId);
    expect(row.productCount).toBe(1);
  });

  it("rejects linking to a supplier that does not exist (400, not 500)", async () => {
    const res = await api("PUT", `/conformity/products/${productId}`, {
      name: "Vitest Purchased PLC",
      supplierId: 99999999,
    });
    expect(res.status).toBe(400);
  });

  it("deleting the supplier unlinks the product but never deletes it", async () => {
    const del = await api("DELETE", `/conformity/suppliers/${supplierId}`);
    expect(del.status).toBe(200);
    supplierId = 0;

    const product = await api("GET", `/conformity/products/${productId}`);
    expect(product.status).toBe(200);
    expect(product.json.product.name).toBe("Vitest Purchased PLC");
    expect(product.json.product.supplierId).toBeNull();
  });
});

describe("The procurement check (operator shape, 21.2)", () => {
  let productId: number;

  beforeAll(async () => {
    const product = await api("POST", "/conformity/products", {
      name: "Vitest Procured Gateway",
      orgRole: "operator",
    });
    productId = product.json.id;
  });

  afterAll(async () => {
    if (productId) await api("DELETE", `/conformity/products/${productId}`);
  });

  it("starts with every fact unanswered — nothing is defaulted", async () => {
    const res = await api("GET", `/conformity/products/${productId}/procurement-check`);
    expect(res.status).toBe(200);
    expect(res.json.posture.unanswered).toBe(res.json.posture.items.length);
    expect(Object.values(res.json.facts).every((v) => v === null)).toBe(true);
  });

  it("upserts tri-state facts; omitted fields stay put; explicit null withdraws", async () => {
    const first = await api("PUT", `/conformity/products/${productId}/procurement-check`, {
      docOnFile: true,
      supportPeriodStated: false,
    });
    expect(first.status).toBe(200);
    expect(first.json.facts.docOnFile).toBe(true);
    expect(first.json.facts.supportPeriodStated).toBe(false);
    expect(first.json.posture.onFile).toBe(1);
    expect(first.json.posture.notProvided).toBe(1);

    // A PUT that names only another field leaves the recorded answers alone…
    const second = await api("PUT", `/conformity/products/${productId}/procurement-check`, {
      ceMarkingSighted: true,
    });
    expect(second.json.facts.docOnFile).toBe(true);
    expect(second.json.facts.supportPeriodStated).toBe(false);

    // …and an explicit null withdraws an answer back to unanswered.
    const third = await api("PUT", `/conformity/products/${productId}/procurement-check`, {
      supportPeriodStated: null,
    });
    expect(third.json.facts.supportPeriodStated).toBeNull();
    expect(third.json.posture.notProvided).toBe(0);
  });

  it("anchors every statutory item to a manufacturer-side citation on the wire", async () => {
    const res = await api("GET", `/conformity/products/${productId}/procurement-check`);
    for (const item of res.json.posture.items) {
      if (item.kind === "statutory") expect(item.anchor).toMatch(/^CRA Art 13/);
      else expect(item.anchor).toBe("contractual");
    }
  });

  it("404s for a product that does not exist", async () => {
    expect((await api("GET", "/conformity/products/99999999/procurement-check")).status).toBe(404);
  });
});

describe("The supplier posture board (operator shape, 21.3)", () => {
  let supplierId: number;
  let productId: number;
  let unlinkedId: number;

  beforeAll(async () => {
    supplierId = (
      await api("POST", "/conformity/suppliers", { name: "Vitest Posture GmbH" })
    ).json.id;
    productId = (
      await api("POST", "/conformity/products", {
        name: "Vitest Posture PLC",
        orgRole: "operator",
        supplierId,
        supportPeriodEnd: "2027-03-31",
      })
    ).json.id;
    unlinkedId = (
      await api("POST", "/conformity/products", {
        name: "Vitest Unlinked Device",
        orgRole: "operator",
      })
    ).json.id;
    await api("PUT", `/conformity/products/${productId}/procurement-check`, {
      docOnFile: true,
      supportPeriodStated: true,
    });
  });

  afterAll(async () => {
    if (productId) await api("DELETE", `/conformity/products/${productId}`);
    if (unlinkedId) await api("DELETE", `/conformity/products/${unlinkedId}`);
    if (supplierId) await api("DELETE", `/conformity/suppliers/${supplierId}`);
  });

  it("rolls the supplier's products up with counts and the support horizon", async () => {
    const res = await api("GET", "/conformity/suppliers/posture");
    expect(res.status).toBe(200);
    const row = res.json.suppliers.find((s: any) => s.id === supplierId);
    expect(row, "posture row missing").toBeDefined();
    expect(row.productCount).toBe(1);
    expect(row.statutoryOnFile).toBe(2);
    expect(row.earliestSupportEnd).toBe("2027-03-31");
    const p = row.products.find((x: any) => x.id === productId);
    expect(p.statutoryOnFile).toBe(2);
    expect(p.unanswered).toBeGreaterThan(0);
  });

  it("NAMES the unlinked operator products instead of omitting them", async () => {
    const res = await api("GET", "/conformity/suppliers/posture");
    expect(res.json.unlinkedProductCount).toBeGreaterThanOrEqual(1);
  });
});

describe("Supplier documents + the door (operator shape, 21.4)", () => {
  let supplierId: number;
  let productId: number;

  beforeAll(async () => {
    supplierId = (
      await api("POST", "/conformity/suppliers", { name: "Vitest Door GmbH" })
    ).json.id;
    productId = (
      await api("POST", "/conformity/products", {
        name: "Vitest Door Device",
        orgRole: "operator",
        supplierId,
      })
    ).json.id;
  });

  afterAll(async () => {
    if (productId) await api("DELETE", `/conformity/products/${productId}`);
    if (supplierId) await api("DELETE", `/conformity/suppliers/${supplierId}`);
  });

  it("records and lists an internally-added supplier document", async () => {
    const added = await api("POST", `/conformity/products/${productId}/supplier-documents`, {
      docType: "declaration_of_conformity",
      title: "DoC v1 (from supplier portal download)",
      url: "https://supplier.example/doc-v1.pdf",
    });
    expect(added.status).toBe(200);
    expect(added.json.submittedVia).toBe("internal_upload");

    const list = await api("GET", `/conformity/products/${productId}/supplier-documents`);
    expect(list.json.documents).toHaveLength(1);
  });

  it("refuses an ask when the product has no supplier recorded (400)", async () => {
    const orphan = await api("POST", "/conformity/products", {
      name: "Vitest No-Supplier Device",
      orgRole: "operator",
    });
    const ask = await api(
      "POST",
      `/conformity/products/${orphan.json.id}/supplier-requests`,
      { docType: "sbom" },
    );
    expect(ask.status).toBe(400);
    await api("DELETE", `/conformity/products/${orphan.json.id}`);
  });

  it("runs the full door flow: ask → workspace → submit → fulfilled document", async () => {
    const ask = await api("POST", `/conformity/products/${productId}/supplier-requests`, {
      docType: "support_period_statement",
      message: "Please state the support end date for this device.",
    });
    expect(ask.status).toBe(200);
    const token = ask.json.accessToken;
    expect(token).toHaveLength(64);

    // The door is public — no cookie.
    const ws = await api(
      "GET",
      `/conformity/supplier-portal/workspace?token=${token}`,
      undefined,
      false,
    );
    expect(ws.status).toBe(200);
    expect(ws.json.productName).toBe("Vitest Door Device");
    expect(ws.json.supplierName).toBe("Vitest Door GmbH");

    const submit = await api(
      "POST",
      "/conformity/supplier-portal/submit",
      { token, url: "https://supplier.example/support-statement.pdf", note: "Ends 2030-06." },
      false,
    );
    expect(submit.status).toBe(200);

    // The ask is fulfilled and the document carries door provenance.
    const asks = await api("GET", `/conformity/products/${productId}/supplier-requests`);
    expect(asks.json.requests.find((r: any) => r.id === ask.json.id).status).toBe("fulfilled");
    const docs = await api("GET", `/conformity/products/${productId}/supplier-documents`);
    const doorDoc = docs.json.documents.find((d: any) => d.submittedVia === "supplier_token");
    expect(doorDoc, "door-submitted document missing").toBeDefined();
    expect(doorDoc.docType).toBe("support_period_statement");

    // A fulfilled ask cannot be answered twice.
    const again = await api(
      "POST",
      "/conformity/supplier-portal/submit",
      { token, note: "second answer" },
      false,
    );
    expect(again.status).toBe(400);
  });

  it("a withdrawn ask's token answers exactly like an unknown one (401)", async () => {
    const ask = await api("POST", `/conformity/products/${productId}/supplier-requests`, {
      docType: "sbom",
    });
    await api("POST", `/conformity/supplier-requests/${ask.json.id}/withdraw`);
    const withdrawn = await api(
      "GET",
      `/conformity/supplier-portal/workspace?token=${ask.json.accessToken}`,
      undefined,
      false,
    );
    const unknown = await api(
      "GET",
      "/conformity/supplier-portal/workspace?token=deadbeef",
      undefined,
      false,
    );
    expect(withdrawn.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(withdrawn.json).toEqual(unknown.json);
  });

  it("an empty submission is refused — a fulfilment must carry something", async () => {
    const ask = await api("POST", `/conformity/products/${productId}/supplier-requests`, {
      docType: "other",
    });
    const res = await api(
      "POST",
      "/conformity/supplier-portal/submit",
      { token: ask.json.accessToken },
      false,
    );
    expect(res.status).toBe(400);
  });
});
