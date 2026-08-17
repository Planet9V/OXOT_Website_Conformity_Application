/**
 * Evidence file attach → reopen round-trip + download-route gating.
 *
 * Evidence file upload is a multi-step flow: the client requests a presigned
 * URL, PUTs the bytes straight to object storage, then POSTs an evidence row
 * carrying the normalized objectPath/fileName; assessors later reopen the file
 * through the admin-gated `GET /conformity/evidence/:id/download` route. No
 * test exercised the chain end-to-end, so a regression in any step (auth on
 * the download route, objectPath normalization, DTO field passthrough) would
 * silently strand assessors' documentation.
 *
 * Boots the real Express app against the real dev DB + real object storage on
 * an ephemeral port and walks the whole flow over HTTP:
 *  1. request-url → PUT bytes to the presigned URL (the exact client path).
 *  2. POST evidence with the returned objectPath → DTO echoes objectPath,
 *     fileName and a correct sha256 fileHash.
 *  3. Evidence list passes the file fields through.
 *  4. Authed download streams back the exact bytes with the original filename.
 *  5. Gating: anonymous download → 401 (never bytes); unknown id → 404;
 *     link-only (no objectPath) evidence → 404; bad id → 400.
 *
 * Embeddings are stubbed so the best-effort auto-embed never hits the network.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

vi.mock("../../lib/embeddings", () => ({
  embedText: vi.fn(async () => Array.from({ length: 1536 }, () => 0)),
  embedTexts: vi.fn(async (texts: string[]) =>
    texts.map(() => Array.from({ length: 1536 }, () => 0)),
  ),
}));

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
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("evidence-admin")}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

type Json = Record<string, unknown>;

async function api(
  method: string,
  path: string,
  body?: unknown,
  cookie: string = adminCookie,
): Promise<{ status: number; json: Json }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let json: Json = {};
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text) as Json;
    } catch {
      json = { __raw: text };
    }
  }
  return { status: res.status, json };
}

const FILE_NAME = "pen-test-report.pdf";
const FILE_BYTES = Buffer.from(
  `%PDF-1.4 evidence round-trip ${Date.now()}\nSection 1: findings…`,
  "utf8",
);
const FILE_SHA256 = createHash("sha256").update(FILE_BYTES).digest("hex");

/**
 * Environment-dependent: the presigned-URL round-trip uploads REAL bytes via
 * the object-storage sidecar (PRIVATE_OBJECT_DIR + the Replit GCS bridge).
 * Where that environment is absent (CI, plain local runs) the suite SKIPS
 * with this stated reason rather than failing on infrastructure it cannot
 * reach — and runs in full wherever storage is configured.
 */
const storageAvailable = Boolean(
  process.env.PRIVATE_OBJECT_DIR || process.env.OBJECT_STORAGE_BACKEND === "local",
);
describe.skipIf(!storageAvailable)("conformity evidence files — attach & reopen round-trip", () => {
  it("uploads via presigned URL, links evidence, and downloads the same bytes back", async () => {
    // ---- scaffold a product + assessment via the real endpoints ------------
    const product = await api("POST", "/conformity/products", {
      name: `Evidence Test Product ${Date.now()}`,
      productType: "software",
    });
    expect(product.status, JSON.stringify(product.json)).toBe(200);
    const productId = (product.json as { id: number }).id;

    const assessment = await api("POST", "/conformity/assessments", {
      productId,
      regulationKey: "cra",
    });
    expect(assessment.status, JSON.stringify(assessment.json)).toBe(200);
    const assessmentId = (assessment.json as { assessment: { id: number } })
      .assessment.id;

    try {
      // ---- 1. presigned upload (the exact client path in lib/upload.ts) ----
      const reqUrl = await api("POST", "/storage/uploads/request-url", {
        name: FILE_NAME,
        size: FILE_BYTES.byteLength,
        contentType: "application/pdf",
      });
      expect(reqUrl.status, JSON.stringify(reqUrl.json)).toBe(200);
      const { uploadURL, objectPath } = reqUrl.json as {
        uploadURL: string;
        objectPath: string;
      };
      // The normalized path is what the client stores on the evidence row.
      expect(objectPath).toMatch(/^\/objects\//);

      // A presigned GCS URL is absolute; the local backend returns a
      // RELATIVE authenticated URL (the browser client sends the session
      // cookie automatically same-origin — here we attach it explicitly).
      const putUrl = uploadURL.startsWith("http")
        ? uploadURL
        : `${baseUrl.replace(/\/api$/, "")}${uploadURL}`;
      const put = await fetch(putUrl, {
        method: "PUT",
        headers: { "content-type": "application/pdf", cookie: adminCookie },
        body: FILE_BYTES,
      });
      expect(put.ok, `PUT to presigned URL failed: ${put.status}`).toBe(true);

      // ---- 2. link the evidence row (add-evidence DTO passthrough) ---------
      const added = await api(
        "POST",
        `/conformity/assessments/${assessmentId}/evidence`,
        {
          requirementRefCode: "CRA-ER-01",
          title: "Pen-test report",
          evidenceType: "test_report",
          url: "",
          objectPath,
          fileName: FILE_NAME,
          note: "Round-trip test attachment",
        },
      );
      expect(added.status, JSON.stringify(added.json)).toBe(200);
      const evidence = added.json as {
        id: number;
        objectPath: string;
        fileName: string;
        fileHash: string;
        requirementRefCode: string;
      };
      expect(evidence.objectPath).toBe(objectPath);
      expect(evidence.fileName).toBe(FILE_NAME);
      expect(evidence.requirementRefCode).toBe("CRA-ER-01");
      // The server fingerprints the STORED bytes — proves the PUT landed where
      // the download route will later read from.
      expect(evidence.fileHash).toBe(FILE_SHA256);

      // ---- 3. the list an assessor reopens shows the file attachment -------
      const list = await api(
        "GET",
        `/conformity/assessments/${assessmentId}/evidence`,
      );
      expect(list.status).toBe(200);
      const listed = (list.json as unknown as Json[]).find(
        (e) => e.id === evidence.id,
      );
      expect(listed).toBeDefined();
      expect(listed!.objectPath).toBe(objectPath);
      expect(listed!.fileName).toBe(FILE_NAME);

      // ---- 4. authed download streams the exact bytes back ------------------
      const download = await fetch(
        `${baseUrl}/conformity/evidence/${evidence.id}/download`,
        { headers: { cookie: adminCookie } },
      );
      expect(download.status).toBe(200);
      expect(download.headers.get("content-disposition")).toContain(
        encodeURIComponent(FILE_NAME),
      );
      const body = Buffer.from(await download.arrayBuffer());
      expect(body.equals(FILE_BYTES)).toBe(true);

      // ---- 5. gating ---------------------------------------------------------
      // Anonymous → 401, and never the file bytes.
      const anon = await fetch(
        `${baseUrl}/conformity/evidence/${evidence.id}/download`,
      );
      expect(anon.status).toBe(401);
      const anonText = await anon.text();
      expect(anonText).not.toContain("evidence round-trip");

      // Unknown id → 404.
      const missing = await api("GET", "/conformity/evidence/999999999/download");
      expect(missing.status).toBe(404);

      // Malformed id → 400, not a crash.
      const bad = await api("GET", "/conformity/evidence/not-a-number/download");
      expect(bad.status).toBe(400);

      // Link-only evidence (no objectPath) → 404 from the download route.
      const linkOnly = await api(
        "POST",
        `/conformity/assessments/${assessmentId}/evidence`,
        {
          requirementRefCode: "CRA-ER-01",
          title: "External policy link",
          evidenceType: "policy",
          url: "https://example.com/policy",
          objectPath: "",
          fileName: "",
          note: "",
        },
      );
      expect(linkOnly.status, JSON.stringify(linkOnly.json)).toBe(200);
      const linkOnlyId = (linkOnly.json as { id: number }).id;
      const linkOnlyDownload = await api(
        "GET",
        `/conformity/evidence/${linkOnlyId}/download`,
      );
      expect(linkOnlyDownload.status).toBe(404);
    } finally {
      // Deleting the assessment cascades evidence rows; delete product last.
      await api("DELETE", `/conformity/assessments/${assessmentId}`);
      await api("DELETE", `/conformity/products/${productId}`);
    }
  }, 60_000);

  /**
   * Storage GC (task 14.1): deleting the evidence row removes the stored
   * FILE too — proven on the local backend by watching the disk, which the
   * GCS sidecar path shares via the same seam method. Also proves the bulk
   * path: an assessment deletion cascades its evidence rows AND their files.
   */
  it.skipIf(process.env.OBJECT_STORAGE_BACKEND !== "local")(
    "removes the stored file when its evidence row is deleted",
    async () => {
      const { default: fs } = await import("node:fs");
      const { default: path } = await import("node:path");
      const storageDir = process.env.OBJECT_STORAGE_DIR!;
      const absOf = (objectPath: string) =>
        path.join(storageDir, "private", ...objectPath.replace(/^\/objects\//, "").split("/"));

      const product = await api("POST", "/conformity/products", {
        name: `Evidence GC Product ${Date.now()}`,
        productType: "software",
      });
      const productId = (product.json as { id: number }).id;
      const assessment = await api("POST", "/conformity/assessments", {
        productId,
        regulationKey: "cra",
      });
      const assessmentId = (assessment.json as { assessment: { id: number } }).assessment.id;

      const uploadOnce = async () => {
        const reqUrl = await api("POST", "/storage/uploads/request-url", {
          name: FILE_NAME,
          size: FILE_BYTES.byteLength,
          contentType: "application/pdf",
        });
        const { uploadURL, objectPath } = reqUrl.json as { uploadURL: string; objectPath: string };
        const putUrl = uploadURL.startsWith("http")
          ? uploadURL
          : `${baseUrl.replace(/\/api$/, "")}${uploadURL}`;
        const put = await fetch(putUrl, {
          method: "PUT",
          headers: { "content-type": "application/pdf", cookie: adminCookie },
          body: FILE_BYTES,
        });
        expect(put.ok).toBe(true);
        const added = await api("POST", `/conformity/assessments/${assessmentId}/evidence`, {
          requirementRefCode: "CRA-ER-01",
          title: "GC probe",
          evidenceType: "test_report",
          url: "",
          objectPath,
          fileName: FILE_NAME,
          note: "",
        });
        expect(added.status, JSON.stringify(added.json)).toBe(200);
        return { evidenceId: (added.json as { id: number }).id, objectPath };
      };

      try {
        // Direct evidence deletion removes the row AND the stored file + sidecar.
        const a = await uploadOnce();
        expect(fs.existsSync(absOf(a.objectPath))).toBe(true);
        const del = await api("DELETE", `/conformity/evidence/${a.evidenceId}`);
        expect(del.status).toBe(200);
        expect(fs.existsSync(absOf(a.objectPath))).toBe(false);
        expect(fs.existsSync(`${absOf(a.objectPath)}.acl.json`)).toBe(false);

        // Bulk path: assessment deletion cascades the rows and GCs the files.
        const b = await uploadOnce();
        expect(fs.existsSync(absOf(b.objectPath))).toBe(true);
        const delAssessment = await api("DELETE", `/conformity/assessments/${assessmentId}`);
        expect(delAssessment.status).toBe(200);
        expect(fs.existsSync(absOf(b.objectPath))).toBe(false);
      } finally {
        await api("DELETE", `/conformity/assessments/${assessmentId}`);
        await api("DELETE", `/conformity/products/${productId}`);
      }
    },
    60_000,
  );
});
