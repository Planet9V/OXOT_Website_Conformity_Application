import { describe, expect, it } from "vitest";
import { chooseStorageBackend } from "../storageBackend";
import { LocalObjectStorageService } from "../objectStorageLocal";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * 10.1's no-regression guarantee, as a test: ONLY the explicit
 * OBJECT_STORAGE_BACKEND=local selects the local backend. Every other
 * environment — including the exact env shapes the Replit deployment runs
 * with today — keeps the Replit GCS sidecar backend.
 */
describe("storage backend chooser", () => {
  it("selects local ONLY on the explicit opt-in", () => {
    expect(chooseStorageBackend({ OBJECT_STORAGE_BACKEND: "local" } as NodeJS.ProcessEnv)).toBe("local");
  });

  it("keeps the Replit backend for every other environment shape", () => {
    const replitShapes: NodeJS.ProcessEnv[] = [
      {}, // nothing set
      { PRIVATE_OBJECT_DIR: "/bucket/private" }, // today's Replit env
      { PRIVATE_OBJECT_DIR: "/bucket/private", PUBLIC_OBJECT_SEARCH_PATHS: "/bucket/public" },
      { OBJECT_STORAGE_BACKEND: "" }, // set but empty
      { OBJECT_STORAGE_BACKEND: "gcs" }, // unknown value never flips silently
      { OBJECT_STORAGE_BACKEND: "LOCAL" }, // case-exact opt-in only
    ] as NodeJS.ProcessEnv[];
    for (const env of replitShapes) {
      expect(chooseStorageBackend(env)).toBe("replit-gcs");
    }
  });
});

describe("local backend upload lifecycle", () => {
  it("mints a one-time relative URL, stores bytes, and round-trips them", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "storage-test-"));
    process.env.OBJECT_STORAGE_DIR = dir;
    try {
      const svc = new LocalObjectStorageService();
      const uploadURL = await svc.getObjectEntityUploadURL();
      expect(uploadURL).toMatch(/^\/api\/storage\/uploads\/local\/[A-Za-z0-9-]+$/);

      const id = uploadURL.split("/").pop()!;
      const objectPath = svc.acceptLocalUpload(id, Buffer.from("probe-bytes"), "text/plain");
      expect(objectPath).toBe(`/objects/uploads/${id}`);
      expect(svc.normalizeObjectEntityPath(uploadURL)).toBe(objectPath);

      // One-time: the same id refuses a second upload.
      expect(svc.acceptLocalUpload(id, Buffer.from("again"), "text/plain")).toBeNull();

      const bytes = await svc.downloadToBuffer(objectPath!);
      expect(bytes.toString()).toBe("probe-bytes");
      expect(await svc.downloadToBufferIfWithin(objectPath!, 4)).toBeNull();

      const res = await svc.downloadObject(await svc.getObjectEntityFile(objectPath!));
      expect(res.headers.get("content-type")).toBe("text/plain");
      expect(Buffer.from(await res.arrayBuffer()).toString()).toBe("probe-bytes");

      // Traversal refuses.
      await expect(svc.getObjectEntityFile("/objects/../../etc/passwd")).rejects.toThrow();
    } finally {
      delete process.env.OBJECT_STORAGE_DIR;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
