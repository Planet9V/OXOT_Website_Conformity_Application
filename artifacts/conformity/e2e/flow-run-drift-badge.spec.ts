/**
 * Runs-list drift indicator.
 *
 * The list endpoint now exposes `flowUpdated` on each run summary so an
 * assessor scanning the runs list can spot which runs have drifted from the
 * live flow definition without opening each one. This test mocks two runs —
 * one drifted, one current — and asserts the "updated" badge renders on
 * exactly the drifted card.
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

const ASSESSMENT_DETAIL = {
  assessment: {
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
  },
  product: {
    id: 1,
    name: 'NovaGuard Smart Home Hub',
    description: '',
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
  },
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

const runBase = {
  assessmentId: 8,
  status: 'active',
  assignee: '',
  stepStates: { s1: { status: 'pending' } },
  createdAt: '2026-07-14T00:00:00Z',
  updatedAt: '2026-07-15T00:00:00Z',
};

// Drifted: the live flow's steps no longer match this run's frozen snapshot.
const DRIFTED_RUN = { ...runBase, id: 41, flowId: 9, flowName: 'CRA process (drifted)', flowUpdated: true };
// Current: snapshot still matches the live flow.
const CURRENT_RUN = { ...runBase, id: 42, flowId: 9, flowName: 'CRA process (current)', flowUpdated: false };

async function mocks(page: Page) {
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(ADMIN_SESSION)));
  await page.route('**/api/conformity/assessments/8', (route) => route.fulfill(json(ASSESSMENT_DETAIL)));
  await page.route('**/api/conformity/flows', (route) => route.fulfill(json([])));
  await page.route('**/api/conformity/assessments/8/flow-runs', (route) =>
    route.fulfill(json([DRIFTED_RUN, CURRENT_RUN])),
  );
}

test.describe('runs list drift indicator', () => {
  test('shows the "updated" badge only on runs whose snapshot drifted', async ({ page }) => {
    await mocks(page);
    await page.goto('/conformity/assessments/8');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('tab-flows').click();

    const cards = page.getByTestId('flow-run-card');
    await expect(cards).toHaveCount(2);

    const drifted = cards.filter({ hasText: 'CRA process (drifted)' });
    const current = cards.filter({ hasText: 'CRA process (current)' });
    await expect(drifted.getByTestId('flow-run-updated-badge')).toBeVisible();
    await expect(drifted.getByTestId('flow-run-updated-badge')).toHaveText('updated');
    await expect(current.getByTestId('flow-run-updated-badge')).toHaveCount(0);
  });
});
