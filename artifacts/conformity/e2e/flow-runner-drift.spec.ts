/**
 * Flow runner drift-notice + "Adopt latest steps" regression test.
 *
 * When a flow definition changes after a run started, the run detail must
 * surface a drift notice ("This flow has been updated since this run
 * started"), and admins — only admins — get an "Adopt latest steps" action
 * that re-snapshots the run and refetches it. This spec asserts:
 *   - notice shown when the run detail says flowUpdated=true;
 *   - notice hidden when flowUpdated=false;
 *   - adopt button rendered for admin sessions only;
 *   - clicking adopt POSTs to the adopt endpoint and the refetched run
 *     (flowUpdated=false) makes the notice disappear.
 *
 * Every API call is mocked (no API server / DB required).
 */

import { test, expect, type Page } from '@playwright/test';

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const ADMIN_SESSION = { authenticated: true, username: 'admin', role: 'admin' };
const MEMBER_SESSION = { authenticated: true, username: 'sam', role: 'member' };

const PRODUCT = {
  id: 1,
  name: 'NovaGuard Smart Home Hub',
  description: 'Connected home hub',
  manufacturerName: 'NovaGuard Labs',
  manufacturerAddress: '',
  authorizedRep: '',
  productType: 'Hardware',
  version: '2.0',
  intendedUse: '',
  supportPeriodStart: null,
  supportPeriodEnd: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const ASSESSMENT = {
  id: 8,
  productId: 1,
  regulationKey: 'cra',
  status: 'active',
  currentStage: 'gap_assessment',
  scopeResult: 'in_scope',
  classKey: 'default',
  routeKey: null,
  startedAt: '2025-01-01T00:00:00Z',
  completedAt: null,
  updatedAt: '2025-01-01T00:00:00Z',
};

const ASSESSMENT_DETAIL = {
  assessment: ASSESSMENT,
  product: PRODUCT,
  answers: [],
  scope: { result: 'in_scope', reasons: [], answered: true },
  classification: {},
  allowedRoutes: [],
  recommendedRouteKey: null,
  className: null,
  routeName: null,
  counts: {
    evaluationsTotal: 19,
    evaluationsMet: 10,
    evaluationsNotMet: 1,
    evidenceCount: 3,
    openIncidents: 1,
  },
};

const STEPS = [
  { id: 'kickoff', type: 'activity', title: 'Kickoff activity' },
  { id: 'doc', type: 'artifact', title: 'Draft the declaration of conformity' },
];

const RUN_SUMMARY = {
  id: 42,
  flowId: 7,
  assessmentId: 8,
  flowName: 'CRA default process',
  status: 'active',
  assignee: '',
  stepStates: {
    kickoff: { status: 'done', completedAt: '2026-07-15T00:00:00Z' },
    doc: { status: 'pending' },
  },
  createdAt: '2026-07-14T00:00:00Z',
  updatedAt: '2026-07-14T00:00:00Z',
};

async function baseMocks(page: Page, opts: { session: unknown; flowUpdated: boolean }) {
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(opts.session)));
  await page.route('**/api/conformity/assessments/8', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );
  await page.route('**/api/conformity/assessments/8/flow-runs', (route) =>
    route.fulfill(json([RUN_SUMMARY])),
  );
  await page.route('**/api/conformity/flow-runs/42', (route) =>
    route.fulfill(json({ run: RUN_SUMMARY, steps: STEPS, flowUpdated: opts.flowUpdated })),
  );
}

async function openRunDetail(page: Page) {
  await page.goto('/conformity/assessments/8');
  await page.waitForLoadState('networkidle');
  await page.getByTestId('tab-flows').click();
  await page.getByTestId('flow-run-card').click();
  await expect(page.getByTestId('flow-steps')).toBeVisible();
}

test('drift notice is shown when the flow changed, with the admin adopt action', async ({
  page,
}) => {
  await baseMocks(page, { session: ADMIN_SESSION, flowUpdated: true });
  await openRunDetail(page);

  await expect(page.getByTestId('flow-run-drift-notice')).toBeVisible();
  await expect(page.getByTestId('flow-run-drift-notice')).toContainText(
    'updated since this run started',
  );
  await expect(page.getByTestId('flow-run-adopt-steps')).toBeVisible();
});

test('no drift notice when the run matches the current flow', async ({ page }) => {
  await baseMocks(page, { session: ADMIN_SESSION, flowUpdated: false });
  await openRunDetail(page);

  await expect(page.getByTestId('flow-run-drift-notice')).toHaveCount(0);
  await expect(page.getByTestId('flow-run-adopt-steps')).toHaveCount(0);
});

test('non-admin members see the notice but never the adopt action', async ({ page }) => {
  await baseMocks(page, { session: MEMBER_SESSION, flowUpdated: true });
  await openRunDetail(page);

  await expect(page.getByTestId('flow-run-drift-notice')).toBeVisible();
  await expect(page.getByTestId('flow-run-adopt-steps')).toHaveCount(0);
});

test('adopting the latest steps POSTs the mutation and the refetched run clears the notice', async ({
  page,
}) => {
  await baseMocks(page, { session: ADMIN_SESSION, flowUpdated: true });

  // After adopt succeeds, the run detail refetch reports no more drift.
  let adopted = false;
  let adoptCalls = 0;
  await page.route('**/api/conformity/flow-runs/42', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill(json({ run: RUN_SUMMARY, steps: STEPS, flowUpdated: !adopted }));
    }
    return route.fallback();
  });
  await page.route('**/api/conformity/flow-runs/42/adopt-steps', (route) => {
    adoptCalls += 1;
    adopted = true;
    return route.fulfill(json({ run: RUN_SUMMARY, steps: STEPS, flowUpdated: false }));
  });

  await openRunDetail(page);
  await expect(page.getByTestId('flow-run-drift-notice')).toBeVisible();

  await page.getByTestId('flow-run-adopt-steps').click();

  // The mutation fired once, the run was refetched, and the notice is gone.
  await expect(page.getByTestId('flow-run-drift-notice')).toHaveCount(0);
  expect(adoptCalls).toBe(1);
});
