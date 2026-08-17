/**
 * The org obligations register over HTTP (task 11.1) — the act-generic engine:
 * obligations = requirements(declared regulations) × declared roles, with each
 * act speaking its own role vocabulary (termFor). Proves the RED seed lands
 * end-to-end: declaring red + manufacturer surfaces the Art 3(3) cyber
 * requirements with RED's own terms, and an undeclared act contributes
 * nothing. Declarations are global single-tenant state, so this suite records
 * what it found and puts it back (L46).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { adminCookie } from "./helpers/testAuth";

let server: Server;
let baseUrl: string;
let cookie: string;

// What the deployment had declared before this suite touched anything.
let priorRoles: { key: string; isDeclared: boolean }[] = [];
let priorRegs: { key: string; isDeclared: boolean }[] = [];

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  cookie = adminCookie();

  const profile = await api("GET", "/conformity/org/profile");
  priorRoles = profile.json.roles.map((r: any) => ({ key: r.key, isDeclared: r.isDeclared }));
  priorRegs = profile.json.regulations.map((r: any) => ({ key: r.key, isDeclared: r.isDeclared }));
});

afterAll(async () => {
  for (const r of priorRoles) {
    await api("PUT", `/conformity/org/roles/${r.key}`, { isDeclared: r.isDeclared });
  }
  for (const r of priorRegs) {
    await api("PUT", `/conformity/org/regulations/${r.key}`, { isDeclared: r.isDeclared });
  }
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

async function api(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; json: any }> {
  const headers: Record<string, string> = { cookie };
  if (body !== undefined) headers["content-type"] = "application/json";
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let json: any = {};
  try {
    json = await res.json();
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, json };
}

/** Declare exactly this set of roles and regulations, withdrawing the rest. */
async function declareExactly(roles: string[], regs: string[]) {
  for (const r of priorRoles) {
    await api("PUT", `/conformity/org/roles/${r.key}`, { isDeclared: roles.includes(r.key) });
  }
  for (const r of priorRegs) {
    await api("PUT", `/conformity/org/regulations/${r.key}`, { isDeclared: regs.includes(r.key) });
  }
}

describe("GET /conformity/org/obligations", () => {
  it("names the missing declaration instead of rendering zero as clean", async () => {
    await declareExactly([], []);
    const res = await api("GET", "/conformity/org/obligations");
    expect(res.status).toBe(200);
    expect(res.json.total).toBe(0);
    expect(res.json.incomplete).toBe("no_roles_or_regulations_declared");
  });

  it("surfaces the RED cyber requirements for a declared manufacturer, in RED's own terms", async () => {
    await declareExactly(["manufacturer"], ["red"]);
    const res = await api("GET", "/conformity/org/obligations");
    expect(res.status).toBe(200);
    const byRef = new Map(res.json.obligations.map((o: any) => [o.refCode, o]));

    // The three Art 3(3) cyber essential requirements are present.
    for (const ref of ["Art 3(3)(d)", "Art 3(3)(e)", "Art 3(3)(f)"]) {
      const o = byRef.get(ref) as any;
      expect(o, `${ref} missing from the RED obligation set`).toBeDefined();
      expect(o.regulationKey).toBe("red");
      // RED calls this role "manufacturer" — the act's own vocabulary travels.
      expect(o.roleTerms).toContain("manufacturer");
    }

    // Importer/distributor duties do NOT apply to a manufacturer-only org…
    expect(byRef.has("Art 12(1)")).toBe(false);
    expect(byRef.has("Art 13(2)")).toBe(false);
    // …but the all-operator traceability duty (Art 15) does.
    expect(byRef.has("Art 15")).toBe(true);
  });

  it("gives a declared operator the AI Act deployer duties, in the Act's own word", async () => {
    await declareExactly(["operator"], ["ai_act"]);
    const res = await api("GET", "/conformity/org/obligations");
    expect(res.status).toBe(200);
    const art26 = res.json.obligations.find((o: any) => o.refCode === "Art 26");
    expect(art26, "Art 26 deployer duties missing for the operator").toBeDefined();
    expect(art26.roleTerms).toContain("deployer");
    // Provider-only duties stay off an operator-only declaration.
    expect(res.json.obligations.some((o: any) => o.refCode === "Art 17")).toBe(false);
  });

  it("serves the machinery seed at its corrected statutory addresses", async () => {
    await declareExactly(["manufacturer"], ["machinery"]);
    const res = await api("GET", "/conformity/org/obligations");
    expect(res.status).toBe(200);
    const refCodes = new Set(
      res.json.obligations.filter((o: any) => o.regulationKey === "machinery").map((o: any) => o.refCode),
    );
    // The cyber EHSRs at their real section numbers (11.3 fixed three misnumbered rows).
    for (const ref of ["Annex III 1.1.9", "Annex III 1.2.1", "Annex III 1.2.1(d)", "Annex III 1.2.1(f)"]) {
      expect(refCodes.has(ref), `${ref} missing`).toBe(true);
    }
    // The DoC lives in Art 21 — Annex II is the safety-components list, not an obligation.
    expect(refCodes.has("Art 21")).toBe(true);
    expect(refCodes.has("Annex II")).toBe(false);
    expect(refCodes.has("Annex III 1.2.1(a)")).toBe(false);
  });

  it("names a declared act that has no seeded requirement content", async () => {
    await declareExactly(["manufacturer"], ["gdpr", "red"]);
    const res = await api("GET", "/conformity/org/obligations");
    expect(res.status).toBe(200);
    // GDPR is a known regulation with zero requirement rows — named, not silent.
    expect(res.json.regulationsWithoutSeededContent).toEqual(["gdpr"]);
    // RED has content, so it is not in the list and its rows are served.
    expect(res.json.obligations.some((o: any) => o.regulationKey === "red")).toBe(true);
  });

  it("contributes nothing from an act that is not declared", async () => {
    await declareExactly(["manufacturer"], ["cra"]);
    const res = await api("GET", "/conformity/org/obligations");
    expect(res.status).toBe(200);
    expect(res.json.obligations.some((o: any) => o.regulationKey === "red")).toBe(false);
    expect(res.json.obligations.some((o: any) => o.regulationKey === "cra")).toBe(true);
  });
});
