/**
 * Regression guard: a malformed request must produce a clear 400 "invalid
 * input" response, never a 500 "Internal server error".
 *
 * Routes call `Schema.parse(req.body)` directly; the resulting ZodError (and
 * body-parser's SyntaxError for unparseable JSON) is mapped to 400 by the app
 * error middleware. Before that mapping existed, a string `value` in the
 * answers payload surfaced as 500 and polluted error monitoring.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { eq } from "drizzle-orm";
import {
  db,
  conformityProductsTable,
  conformityAssessmentsTable,
} from "@workspace/db";
import app from "../../app";
import { ADMIN_COOKIE, createSessionToken } from "../../lib/adminAuth";

let server: Server;
let baseUrl: string;
let adminCookie: string;
let productId: number;
let assessmentId: number;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}/api`;
  const username = process.env["ADMIN_USERNAME"] ?? "admin";
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken(username)}`;

  // Real fixtures so the valid-body control case exercises the full handler.
  const [product] = await db
    .insert(conformityProductsTable)
    .values({ name: "CI Validation Product" })
    .returning();
  productId = product!.id;
  const [assessment] = await db
    .insert(conformityAssessmentsTable)
    .values({ productId, regulationKey: "cra" })
    .returning();
  assessmentId = assessment!.id;
});

afterAll(async () => {
  await db
    .delete(conformityAssessmentsTable)
    .where(eq(conformityAssessmentsTable.id, assessmentId));
  await db.delete(conformityProductsTable).where(eq(conformityProductsTable.id, productId));
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

function putAnswers(body: string) {
  return fetch(`${baseUrl}/conformity/assessments/${assessmentId}/answers`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body,
  });
}

describe("malformed request bodies", () => {
  it("schema-invalid body -> 400 with readable message (not 500)", async () => {
    // `value` must be an object; a string fails zod validation inside the handler.
    const res = await putAnswers(
      JSON.stringify({ answers: [{ questionKey: "q1", value: "yes" }] }),
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toMatch(/invalid input/i);
    // Message names the invalid path so the user can fix the payload.
    expect(json.error).toContain("answers.0.value");
    expect(json.error).not.toMatch(/internal server error/i);
  });

  it("unparseable JSON body -> 400 (not 500)", async () => {
    const res = await putAnswers("{not json");
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toMatch(/invalid input/i);
  });

  it("valid body still works", async () => {
    const res = await putAnswers(
      JSON.stringify({
        answers: [{ questionKey: "has_digital_element", value: { bool: true } }],
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { assessment: { id: number } };
    expect(json.assessment.id).toBe(assessmentId);
  });
});
