/**
 * Workspace activity feed on the Team page.
 *
 * Task: confirm the feed shows product changes end to end. The feed (GET
 * /api/conformity/activity) lists workspace-level events — product
 * created/renamed/deleted — with a resolved actorDisplay, and is readable by
 * every signed-in role: admins see it under the roster, the read-only demo
 * role sees it under the "admin-only" card.
 *
 * Every API call is mocked per the gated-page pattern (mock /api/admin/session
 * as authed), so the spec is self-contained (no API server / DB).
 */

import { test, expect, type Page } from '@playwright/test';

const ADMIN_SESSION = {
  authenticated: true,
  username: 'Oxotadmin',
  role: 'admin',
  displayName: null,
};

const DEMO_SESSION = {
  authenticated: true,
  username: 'oxotdemo',
  role: 'demo',
  displayName: null,
};

const WORKSPACE_ACTIVITY = [
  {
    id: 31,
    entityType: 'product',
    entityId: 9,
    action: 'deleted',
    actor: 'admin:Oxotadmin',
    actorDisplay: 'Oxotadmin',
    source: 'ui',
    hash: '',
    summary: 'Product "Legacy Sensor" deleted',
    createdAt: '2026-07-20T09:15:00Z',
  },
  {
    id: 30,
    entityType: 'product',
    entityId: 7,
    action: 'updated',
    actor: 'member:priya.shah',
    actorDisplay: 'Priya Shah',
    source: 'ui',
    hash: '',
    summary: 'Product "Edge Gateway" updated (renamed from "Gateway")',
    createdAt: '2026-07-19T14:00:00Z',
  },
  {
    id: 29,
    entityType: 'product',
    entityId: 7,
    action: 'created',
    actor: '',
    actorDisplay: 'System',
    source: 'seed',
    hash: '',
    summary: 'Product "Gateway" created',
    createdAt: '2026-07-18T08:00:00Z',
  },
];

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

async function installMocks(
  page: Page,
  opts: { session?: unknown; activity?: unknown[] | 'error' } = {},
) {
  // Lowest priority: swallow any other /api/* call.
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) =>
    route.fulfill(json(opts.session ?? ADMIN_SESSION)),
  );
  // The feed endpoint is paged ({ entries, total }) and called with
  // ?limit/offset query params, so match with a trailing wildcard.
  await page.route('**/api/conformity/activity**', (route) => {
    if (opts.activity === 'error') {
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'boom' }),
      });
    }
    const entries = opts.activity ?? WORKSPACE_ACTIVITY;
    return route.fulfill(json({ entries, total: entries.length }));
  });
}

test.describe('workspace activity feed (admin)', () => {
  test('renders product created/renamed/deleted entries with actor names, never raw actor keys', async ({
    page,
  }) => {
    await installMocks(page);
    await page.goto('/conformity/team');

    const feed = page.getByTestId('workspace-activity');
    await expect(feed).toBeVisible();

    // Deleted product, by the admin.
    const deleted = page.getByTestId('workspace-activity-row-31');
    await expect(deleted).toContainText('Product "Legacy Sensor" deleted');
    await expect(deleted).toContainText('by Oxotadmin');

    // Rename, resolved to the member's display name — never member:username.
    const renamed = page.getByTestId('workspace-activity-row-30');
    await expect(renamed).toContainText('renamed from "Gateway"');
    await expect(renamed).toContainText('by Priya Shah');
    await expect(feed).not.toContainText('member:priya.shah');

    // Seed/system rows read as "System".
    const created = page.getByTestId('workspace-activity-row-29');
    await expect(created).toContainText('Product "Gateway" created');
    await expect(created).toContainText('by System');
  });

  test('shows the empty card when there are no workspace-level events', async ({ page }) => {
    await installMocks(page, { activity: [] });
    await page.goto('/conformity/team');
    await expect(page.getByTestId('workspace-activity-empty')).toBeVisible();
  });
});

test.describe('workspace activity feed (demo role)', () => {
  test('demo sees the feed below the admin-only card', async ({ page }) => {
    await installMocks(page, { session: DEMO_SESSION });
    await page.goto('/conformity/team');

    // Demo is NOT an admin: no roster, admin-only card instead…
    await expect(page.getByTestId('team-admin-only')).toBeVisible();
    await expect(page.getByTestId('team-page')).toHaveCount(0);

    // …but the workspace feed still renders with its entries.
    const feed = page.getByTestId('workspace-activity');
    await expect(feed).toBeVisible();
    await expect(page.getByTestId('workspace-activity-row-31')).toContainText(
      'Product "Legacy Sensor" deleted',
    );
  });
});
