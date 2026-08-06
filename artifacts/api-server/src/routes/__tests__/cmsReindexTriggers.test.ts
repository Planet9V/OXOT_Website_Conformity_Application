/**
 * Assistant-index freshness contract — publish/delete must auto-reindex.
 *
 * The on-site AI assistant answers from `content_chunks`, which only reflects
 * PUBLISHED content. To keep answers fresh with no manual reindex step, the
 * CMS routes must trigger a background reindex on exactly the mutations that
 * change public copy:
 *  - POST /admin/pages/:id/publish  → scheduleReindex()   (content went live)
 *  - DELETE /admin/pages/:id (page was published) → scheduleReindex()
 *  - DELETE /admin/pages/:id (page was draft-only) → NO reindex (index
 *    never contained it; a rebuild would be wasted embedding spend)
 *  - PUT /admin/pages/:id/draft → NO reindex (drafts are not in the index)
 *
 * Strategy: boot the real app against the dev DB on an ephemeral port, but
 * replace `scheduleReindex` with a spy (keeping the rest of lib/rag intact) so
 * the test asserts the trigger contract without spending embedding calls.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

const scheduleReindexSpy = vi.hoisted(() => vi.fn());

vi.mock("../../lib/rag", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/rag")>();
  return { ...actual, scheduleReindex: scheduleReindexSpy };
});

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
  adminCookie = `${ADMIN_COOKIE}=${createSessionToken("reindex-test-admin")}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

beforeEach(() => {
  scheduleReindexSpy.mockClear();
});

async function api(method: string, path: string, body?: unknown): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      cookie: adminCookie,
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

const uniqueSlug = () => `reindex-trigger-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

async function createPage(): Promise<number> {
  const res = await api("POST", "/admin/pages", {
    slug: uniqueSlug(),
    locale: "en",
    title: "Reindex Trigger Test Page",
  });
  expect(res.status).toBe(200);
  const page = (await res.json()) as { id: number };
  return page.id;
}

async function savePublishableDraft(id: number): Promise<void> {
  const res = await api("PUT", `/admin/pages/${id}/draft`, {
    title: "Reindex Trigger Test Page",
    sections: [
      {
        type: "hero",
        order: 0,
        data: { title: "Ephemeral test hero", subtitle: "Content for publish validation" },
      },
    ],
  });
  expect(res.status).toBe(200);
}

describe("CMS mutations keep the assistant index fresh automatically", () => {
  it("publish triggers a background reindex; draft edits do not", async () => {
    const id = await createPage();
    try {
      await savePublishableDraft(id);
      // Draft save must NOT reindex — drafts never enter the index.
      expect(scheduleReindexSpy).not.toHaveBeenCalled();

      const res = await api("POST", `/admin/pages/${id}/publish`, {});
      expect(res.status).toBe(200);
      expect(scheduleReindexSpy).toHaveBeenCalledTimes(1);
    } finally {
      await api("DELETE", `/admin/pages/${id}`);
    }
  });

  it("deleting a published page triggers a reindex (content must drop out of answers)", async () => {
    const id = await createPage();
    await savePublishableDraft(id);
    const pub = await api("POST", `/admin/pages/${id}/publish`, {});
    expect(pub.status).toBe(200);
    scheduleReindexSpy.mockClear();

    const res = await api("DELETE", `/admin/pages/${id}`);
    expect(res.status).toBe(200);
    expect(scheduleReindexSpy).toHaveBeenCalledTimes(1);
  });

  it("deleting a draft-only page does NOT trigger a reindex", async () => {
    const id = await createPage();
    const res = await api("DELETE", `/admin/pages/${id}`);
    expect(res.status).toBe(200);
    expect(scheduleReindexSpy).not.toHaveBeenCalled();
  });
});
