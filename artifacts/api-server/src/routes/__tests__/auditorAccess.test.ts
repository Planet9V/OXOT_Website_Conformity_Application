/**
 * The auditor track, end to end (task 9.3b) — the door AND its key.
 *
 * Before 9.3b the external portal endpoints existed but nothing could ever
 * insert into conformity_auditor_access, so no token could exist and the
 * track was unreachable in practice. This suite proves the whole loop:
 * admin issues an expiring token -> the token opens the portal workspace ->
 * the auditor submits an RFI -> the organisation sees it in its inbox and
 * answers -> the answer is visible through the portal -> revocation closes
 * the door. Fixtures are owned: created here, deleted here (L46).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { adminCookie, demoCookie } from "./helpers/testAuth";

let server: Server;
let baseUrl: string;
let cookie: string;

let productId: number;
let assessmentId: number;
let accessId: number;
let accessToken: string;
let rfiId: number;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  cookie = adminCookie();

  const product = await api("POST", "/conformity/products", {
    name: "Auditor Track Probe Device",
    productType: "hardware",
  });
  productId = product.json.id;
  const assessment = await api("POST", "/conformity/assessments", {
    productId,
    regulationKey: "cra",
  });
  assessmentId = assessment.json.assessment?.id ?? assessment.json.id;
});

afterAll(async () => {
  if (productId) await api("DELETE", `/conformity/products/${productId}`);
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

async function api(
  method: string,
  path: string,
  body?: unknown,
  cookieHeader: string | null = null,
): Promise<{ status: number; json: any }> {
  const headers: Record<string, string> = {};
  if (cookieHeader !== "") headers["cookie"] = cookieHeader ?? cookie;
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

describe("Auditor access lifecycle (9.3b)", () => {
  it("refuses issuance without a session (401) and for the demo role (403)", async () => {
    const anon = await api("POST", `/conformity/assessments/${assessmentId}/auditor-access`, {
      auditorEmail: "a@nb.example",
      notifiedBodyName: "NB",
      notifiedBodyNumber: "1",
      expiresInDays: 5,
    }, "");
    expect(anon.status).toBe(401);
    const demo = await api("POST", `/conformity/assessments/${assessmentId}/auditor-access`, {
      auditorEmail: "a@nb.example",
      notifiedBodyName: "NB",
      notifiedBodyNumber: "1",
      expiresInDays: 5,
    }, demoCookie());
    expect(demo.status).toBe(403);
  });

  it("admin issues an expiring token scoped to the assessment", async () => {
    const res = await api("POST", `/conformity/assessments/${assessmentId}/auditor-access`, {
      auditorEmail: "auditor@tuv.example",
      notifiedBodyName: "TUV Probe",
      notifiedBodyNumber: "0123",
      expiresInDays: 30,
    });
    expect(res.status).toBe(200);
    expect(res.json.assessmentId).toBe(assessmentId);
    expect(res.json.isActive).toBe(true);
    expect(res.json.accessToken).toBeTruthy();
    accessId = res.json.id;
    accessToken = res.json.accessToken;

    const list = await api("GET", `/conformity/assessments/${assessmentId}/auditor-access`);
    expect(list.status).toBe(200);
    expect(list.json.access.some((g: any) => g.id === accessId)).toBe(true);
  });

  it("the token opens the portal workspace", async () => {
    const res = await api("GET", `/conformity/auditor/workspace?token=${accessToken}`, undefined, "");
    expect(res.status).toBe(200);
  });

  it("an RFI submitted through the portal lands in the organisation's inbox", async () => {
    const submitted = await api("POST", "/conformity/auditor/rfis", {
      token: accessToken,
      question: "Provide the risk assessment for requirement 1.1",
      severity: "rfi",
    }, "");
    expect(submitted.status).toBe(200);
    rfiId = submitted.json.rfi.id;

    const inbox = await api("GET", `/conformity/assessments/${assessmentId}/auditor-rfis`);
    expect(inbox.status).toBe(200);
    const rfi = inbox.json.rfis.find((r: any) => r.id === rfiId);
    expect(rfi).toBeTruthy();
    expect(rfi.status).toBe("open");
  });

  it("answering records the response; the auditor sees it through the portal", async () => {
    const res = await api("POST", `/conformity/auditor-rfis/${rfiId}/respond`, {
      response: "Risk assessment attached as evidence item E-1.",
    });
    expect(res.status).toBe(200);
    expect(res.json.status).toBe("answered");
    expect(res.json.respondedAt).toBeTruthy();

    const workspace = await api("GET", `/conformity/auditor/workspace?token=${accessToken}`, undefined, "");
    const seen = (workspace.json.rfis ?? []).find((r: any) => r.id === rfiId);
    expect(seen?.manufacturerResponse).toBe("Risk assessment attached as evidence item E-1.");
  });

  it("revocation closes the door (403 on the workspace)", async () => {
    const revoked = await api("POST", `/conformity/auditor-access/${accessId}/revoke`);
    expect(revoked.status).toBe(200);
    expect(revoked.json.isActive).toBe(false);

    const res = await api("GET", `/conformity/auditor/workspace?token=${accessToken}`, undefined, "");
    expect(res.status).toBe(403);
  });
});
