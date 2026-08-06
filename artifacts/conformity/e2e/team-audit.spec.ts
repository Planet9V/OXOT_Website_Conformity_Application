/**
 * Named assessors: team management, assignment, and the per-person audit trail.
 *
 * Task: per-person sign-in for the conformity workbench. This spec guards the
 * frontend half of that feature:
 *   - /team (admin): roster, create (username lowercased, password sent once),
 *     edit (blank password NOT sent — keeps the current one), deactivate with
 *     confirmation, reactivate.
 *   - Role gating: members get the "admin-only" card on /team and never see
 *     the Team nav item; the session menu shows their display name.
 *   - Assignment: the gap-worklist owner column and dialogs resolve member
 *     usernames to display names via the team directory, and saving an owner
 *     sends the USERNAME (the stable audit key), not the display name.
 *   - Next actions: "Assigned to me" is a render-only filter on the signed-in
 *     username; blockers with no owner carry an "Unassigned" badge.
 *   - Provenance: ledger rows show the acting person's display name, never the
 *     raw `member:<username>` actor key.
 *
 * Every API call is mocked, so the test is self-contained (no API server / DB).
 */

import { test, expect, type Page, type Route } from '@playwright/test';

// ── Sessions ─────────────────────────────────────────────────────────────────

const ADMIN_SESSION = {
  authenticated: true,
  username: 'Oxotadmin',
  role: 'admin',
  displayName: null,
};

const MEMBER_SESSION = {
  authenticated: true,
  username: 'priya.shah',
  role: 'member',
  displayName: 'Priya Shah',
};

// ── Team fixtures ────────────────────────────────────────────────────────────

/** Directory used by owner pickers (active members only, username+displayName). */
const TEAM_DIR = [
  { username: 'marco.bianchi', displayName: 'Marco Bianchi' },
  { username: 'priya.shah', displayName: 'Priya Shah' },
];

function adminTeamRows() {
  return [
    {
      id: 1,
      username: 'priya.shah',
      displayName: 'Priya Shah',
      active: true,
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z',
    },
    {
      id: 2,
      username: 'marco.bianchi',
      displayName: 'Marco Bianchi',
      active: true,
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z',
    },
  ];
}

// ── Assessment fixtures (mirrors next-actions.spec.ts shapes) ────────────────

const PRODUCT = {
  id: 1,
  name: 'Test Gateway',
  description: '',
  manufacturerName: 'Acme',
  manufacturerAddress: '',
  authorizedRep: '',
  productType: 'Hardware',
  version: '1.0',
  intendedUse: '',
  supportPeriodStart: null,
  supportPeriodEnd: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const ASSESSMENT_DETAIL = {
  assessment: {
    id: 1,
    productId: 1,
    regulationKey: 'cra',
    status: 'active',
    currentStage: 'gap_assessment',
    scopeResult: 'in_scope',
    classKey: null,
    routeKey: null,
    startedAt: '2025-01-01T00:00:00Z',
    completedAt: null,
    updatedAt: '2025-01-01T00:00:00Z',
  },
  product: PRODUCT,
  answers: [],
  scope: { result: 'in_scope', reasons: [], answered: true },
  classification: {},
  allowedRoutes: [],
  recommendedRouteKey: null,
  className: null,
  routeName: null,
  counts: {
    evaluationsTotal: 3,
    evaluationsMet: 0,
    evaluationsNotMet: 1,
    evidenceCount: 0,
    openIncidents: 0,
  },
};

function evalItem(over: {
  id: number;
  status: string;
  riskRating?: string | null;
  requirementRefCode: string;
  title: string;
  owner?: string;
}) {
  return {
    id: over.id,
    assessmentId: 1,
    regulationKey: 'cra',
    requirementRefCode: over.requirementRefCode,
    status: over.status,
    implementationNote: '',
    riskRating: over.riskRating ?? null,
    owner: over.owner ?? '',
    dueDate: null,
    title: over.title,
    description: '',
    themeKey: null,
    themeName: 'Security',
    obligationType: '',
    relatedMappings: [],
    evidenceCount: 0,
  };
}

const ACTIVITY = [
  {
    id: 3,
    entityType: 'evaluation',
    entityId: 7,
    action: 'updated',
    actor: 'member:priya.shah',
    actorDisplay: 'Priya Shah',
    source: 'ui',
    hash: '',
    summary: 'Updated requirement SEC-1: status not_met → met',
    createdAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 2,
    entityType: 'bom',
    entityId: 5,
    action: 'analyzed',
    actor: 'system',
    actorDisplay: 'System',
    source: 'system',
    hash: '',
    summary: 'Analyzed BOM "Firmware SBOM"',
    createdAt: '2026-07-14T10:00:00Z',
  },
];

// ── Mock installer ───────────────────────────────────────────────────────────

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

interface MockOpts {
  session?: unknown;
  evaluations?: unknown[];
  activity?: unknown[];
}

/**
 * Register the API mocks (Playwright matches LIFO: catch-all first, specific
 * mocks after). Returns capture arrays for mutation payload assertions plus
 * the mutable /admin/team roster the handlers serve.
 */
async function installMocks(page: Page, opts: MockOpts = {}) {
  const members = adminTeamRows();
  const teamPosts: Record<string, unknown>[] = [];
  const teamPatches: { id: number; body: Record<string, unknown> }[] = [];
  const evalUpdates: Record<string, unknown>[] = [];

  // Lowest priority: swallow any other /api/* call.
  await page.route('**/api/**', (route) => route.fulfill(json([])));

  await page.route('**/api/admin/session', (route) =>
    route.fulfill(json(opts.session ?? ADMIN_SESSION)),
  );
  await page.route('**/api/conformity/assessments/1', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );
  await page.route('**/api/conformity/assessments/1/evaluations', (route) =>
    route.fulfill(json(opts.evaluations ?? [])),
  );
  await page.route('**/api/conformity/assessments/1/activity', (route) =>
    route.fulfill(json(opts.activity ?? [])),
  );
  await page.route('**/api/conformity/team', (route) => route.fulfill(json(TEAM_DIR)));

  // Workspace activity feed: a 45-row ledger served with real limit/offset
  // paging so the "Show more" walk is exercised end to end.
  const workspaceLedger = Array.from({ length: 45 }, (_, i) => ({
    id: 1000 - i,
    entityType: 'product',
    entityId: i + 1,
    action: 'created',
    actor: 'admin:oxotadmin',
    actorDisplay: 'oxotadmin',
    source: 'ui',
    hash: '',
    summary: `Workspace event #${1000 - i}`,
    createdAt: '2026-07-01T00:00:00Z',
  }));
  await page.route('**/api/conformity/activity**', (route) => {
    const url = new URL(route.request().url());
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    return route.fulfill(
      json({
        entries: workspaceLedger.slice(offset, offset + limit),
        total: workspaceLedger.length,
      }),
    );
  });

  // Owner saves from the gap worklist dialog.
  await page.route('**/api/conformity/evaluations/*', async (route) => {
    const req = route.request();
    if (req.method() === 'GET') return route.fallback();
    const body = req.postDataJSON() as Record<string, unknown>;
    evalUpdates.push(body);
    await route.fulfill(json({ ...evalItem({ id: 1, status: 'not_met', requirementRefCode: 'SEC-1', title: 'x' }), ...body }));
  });

  // Admin roster: GET list, POST create (mutates the shared array so the
  // post-create refetch shows the new row).
  await page.route('**/api/admin/team', async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      const body = req.postDataJSON() as Record<string, unknown>;
      teamPosts.push(body);
      const row = {
        id: members.length + 1,
        username: String(body['username']),
        displayName: String(body['displayName']),
        active: true,
        createdAt: '2026-07-16T00:00:00Z',
        updatedAt: '2026-07-16T00:00:00Z',
      };
      members.push(row);
      await route.fulfill(json(row));
      return;
    }
    await route.fulfill(json(members));
  });

  await page.route('**/api/admin/team/*', async (route) => {
    const req = route.request();
    const id = Number(new URL(req.url()).pathname.split('/').pop());
    const body = req.postDataJSON() as Record<string, unknown>;
    teamPatches.push({ id, body });
    const m = members.find((x) => x.id === id)!;
    if (typeof body['displayName'] === 'string') m.displayName = body['displayName'];
    if (typeof body['active'] === 'boolean') m.active = body['active'];
    await route.fulfill(json(m));
  });

  return { members, teamPosts, teamPatches, evalUpdates };
}

// ── Team management page (admin) ─────────────────────────────────────────────

test.describe('team management (admin)', () => {
  test('admin sees the roster and the Team nav item', async ({ page }) => {
    await installMocks(page);
    await page.goto('/conformity/team');
    await expect(page.getByTestId('team-page')).toBeVisible();
    await expect(page.getByTestId('nav-team')).toBeVisible();
    const row = page.getByTestId('team-row-priya.shah');
    await expect(row).toContainText('Priya Shah');
    await expect(page.getByTestId('team-status-priya.shah')).toHaveText('Active');
    await expect(page.getByTestId('team-row-marco.bianchi')).toContainText('Marco Bianchi');
  });

  test('creating a member lowercases the username and shows the new row', async ({ page }) => {
    const { teamPosts } = await installMocks(page);
    await page.goto('/conformity/team');
    await page.getByTestId('team-create-button').click();
    await page.getByTestId('team-create-name').fill('Lena Novak');
    // Typed with capitals — the client must normalize before sending.
    await page.getByTestId('team-create-username').fill('Lena.Novak');
    await page.getByTestId('team-create-password').fill('a-long-password');
    await page.getByTestId('team-create-submit').click();

    await expect(page.getByTestId('team-row-lena.novak')).toBeVisible();
    expect(teamPosts).toHaveLength(1);
    expect(teamPosts[0]).toEqual({
      displayName: 'Lena Novak',
      username: 'lena.novak',
      password: 'a-long-password',
    });
  });

  test('renaming with a blank password never sends a password field', async ({ page }) => {
    const { teamPatches } = await installMocks(page);
    await page.goto('/conformity/team');
    await page.getByTestId('team-edit-priya.shah').click();
    await page.getByTestId('team-edit-name').fill('Priya Shah-Kaur');
    await page.getByTestId('team-edit-save').click();

    await expect(page.getByTestId('team-row-priya.shah')).toContainText('Priya Shah-Kaur');
    expect(teamPatches).toHaveLength(1);
    expect(teamPatches[0]!.id).toBe(1);
    expect(teamPatches[0]!.body).toEqual({ displayName: 'Priya Shah-Kaur' });
    expect('password' in teamPatches[0]!.body).toBe(false);
  });

  test('deactivation requires confirmation, then offers reactivate', async ({ page }) => {
    const { teamPatches } = await installMocks(page);
    await page.goto('/conformity/team');
    await page.getByTestId('team-deactivate-priya.shah').click();
    // Nothing sent until the confirm dialog is accepted.
    expect(teamPatches).toHaveLength(0);
    await page.getByTestId('team-deactivate-confirm-priya.shah').click();

    await expect(page.getByTestId('team-status-priya.shah')).toHaveText('Deactivated');
    await expect(page.getByTestId('team-activate-priya.shah')).toBeVisible();
    expect(teamPatches).toEqual([{ id: 1, body: { active: false } }]);
  });
  test('workspace activity pages through the full ledger with Show more', async ({ page }) => {
    await installMocks(page);
    await page.goto('/conformity/team');
    const rows = page.locator('[data-testid^="workspace-activity-row-"]');
    await expect(rows).toHaveCount(20);
    const more = page.getByTestId('workspace-activity-show-more');
    await expect(more).toContainText('20 of 45');
    await more.click();
    await expect(rows).toHaveCount(40);
    await expect(more).toContainText('40 of 45');
    await more.click();
    await expect(rows).toHaveCount(45);
    // Whole ledger loaded — nothing more to fetch.
    await expect(more).toHaveCount(0);
    await expect(page.getByTestId('workspace-activity-row-956')).toContainText('Workspace event #956');
  });
});

// ── Role gating ──────────────────────────────────────────────────────────────

test.describe('member role gating', () => {
  test('a member gets the admin-only card, no Team nav, and their name in the session menu', async ({
    page,
  }) => {
    await installMocks(page, { session: MEMBER_SESSION });
    await page.goto('/conformity/team');
    await expect(page.getByTestId('team-admin-only')).toBeVisible();
    await expect(page.getByTestId('team-page')).toHaveCount(0);
    await expect(page.getByTestId('nav-team')).toHaveCount(0);
    // The name sits inside the account dropdown — open it first.
    await page.getByRole('button', { name: 'Account menu' }).click();
    await expect(page.getByTestId('session-display-name')).toHaveText('Priya Shah');
  });
});

// ── Owner assignment in the gap worklist ─────────────────────────────────────

test.describe('gap worklist ownership', () => {
  test('owner column resolves usernames to display names; dialog assigns from the directory', async ({
    page,
  }) => {
    const { evalUpdates } = await installMocks(page, {
      evaluations: [
        evalItem({ id: 11, status: 'not_met', requirementRefCode: 'SEC-1', title: 'Secure boot', owner: 'marco.bianchi' }),
        evalItem({ id: 12, status: 'in_progress', requirementRefCode: 'SEC-2', title: 'Update channel' }),
      ],
    });
    await page.goto('/conformity/assessments/1');
    await page.getByRole('tab', { name: 'Gap assessment' }).click();

    // Stored value is the username; the UI must show the person's name.
    const ownedRow = page.getByRole('row').filter({ hasText: 'SEC-1' });
    await expect(ownedRow).toContainText('Marco Bianchi');
    await expect(ownedRow).not.toContainText('marco.bianchi');

    // Assign SEC-2 to Priya via the directory-backed picker.
    const openRow = page.getByRole('row').filter({ hasText: 'SEC-2' });
    await openRow.getByRole('button', { name: 'Update' }).click();
    await page.getByTestId('owner-select').click();
    await expect(page.getByRole('option', { name: 'Unassigned' })).toBeVisible();
    await page.getByRole('option', { name: 'Priya Shah' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    expect(evalUpdates).toHaveLength(1);
    // The audit-stable USERNAME is what goes over the wire.
    expect(evalUpdates[0]!['owner']).toBe('priya.shah');
  });
});

// ── "Assigned to me" filter + unassigned-blocker flag ────────────────────────

test.describe('next-actions mine filter', () => {
  const WORKLIST = [
    evalItem({ id: 1, status: 'not_met', requirementRefCode: 'BLK-MINE', title: 'My blocker', owner: 'priya.shah' }),
    evalItem({ id: 2, status: 'not_met', requirementRefCode: 'BLK-NOBODY', title: 'Orphan blocker' }),
    evalItem({ id: 3, status: 'in_progress', requirementRefCode: 'OP-MARCO', title: 'Marco task', owner: 'marco.bianchi' }),
  ];

  test('only ownerless blockers carry the Unassigned badge', async ({ page }) => {
    await installMocks(page, { session: MEMBER_SESSION, evaluations: WORKLIST });
    await page.goto('/conformity/assessments/1');
    await expect(page.getByTestId('unassigned-blk-2')).toBeVisible();
    await expect(page.getByTestId('unassigned-blk-1')).toHaveCount(0);
    // Open (non-blocker) items are never flagged, even without an owner.
    await expect(page.getByTestId('unassigned-prog-3')).toHaveCount(0);
  });

  test('the filter narrows every bucket to the signed-in person', async ({ page }) => {
    await installMocks(page, { session: MEMBER_SESSION, evaluations: WORKLIST });
    await page.goto('/conformity/assessments/1');
    // Scope to the worklist rows (buttons) — the page header's next-best-action
    // nudge also echoes the top item's title and is NOT subject to the filter.
    const row = (text: string) => page.getByRole('button', { name: text });
    await expect(row('BLK-MINE — My blocker')).toBeVisible();
    await expect(row('BLK-NOBODY — Orphan blocker')).toBeVisible();
    await expect(row('OP-MARCO — Marco task')).toBeVisible();

    await page.getByTestId('mine-filter').click();
    await expect(row('BLK-MINE — My blocker')).toBeVisible();
    await expect(row('BLK-NOBODY — Orphan blocker')).toHaveCount(0);
    await expect(row('OP-MARCO — Marco task')).toHaveCount(0);
  });

  test('shows the "nothing assigned to you" card when the filter matches nothing', async ({
    page,
  }) => {
    await installMocks(page, {
      session: MEMBER_SESSION,
      evaluations: [
        evalItem({ id: 9, status: 'not_met', requirementRefCode: 'BLK-M', title: 'Marco only', owner: 'marco.bianchi' }),
      ],
    });
    await page.goto('/conformity/assessments/1');
    const row = page.getByRole('button', { name: 'BLK-M — Marco only' });
    await expect(row).toBeVisible();
    await page.getByTestId('mine-filter').click();
    await expect(page.getByTestId('mine-empty')).toBeVisible();
    await expect(row).toHaveCount(0);
  });
});

// ── Provenance shows the acting person ───────────────────────────────────────

test.describe('audit trail attribution', () => {
  test('ledger rows show display names, never raw actor keys', async ({ page }) => {
    await installMocks(page, {
      activity: ACTIVITY,
      evaluations: [evalItem({ id: 1, status: 'met', requirementRefCode: 'MET-1', title: 'Met' })],
    });
    await page.goto('/conformity/assessments/1');
    await page.getByTestId('tab-provenance').click();

    const feed = page.getByTestId('provenance-feed');
    await expect(feed).toBeVisible();
    await expect(feed).toContainText('Priya Shah');
    await expect(feed).toContainText('System');
    await expect(feed).not.toContainText('member:priya.shah');
    await expect(feed).toContainText('Updated requirement SEC-1');
  });
});
