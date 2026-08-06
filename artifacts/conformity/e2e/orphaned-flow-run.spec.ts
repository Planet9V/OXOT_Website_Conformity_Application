/**
 * Orphaned flow-run rendering regression test.
 *
 * The API keeps a flow run alive after its flow definition is deleted:
 * `run.flowId` becomes null (ON DELETE SET NULL) and the run renders purely
 * from its own frozen snapshot (`flowName` + `steps` + `stepStates`). The
 * API side is covered by tests, but the UI must also prove it never reaches
 * back to the (now missing) live flow. This test mocks such an "orphaned"
 * run and asserts:
 *   - the run card and run detail render the frozen flowName;
 *   - every snapshotted step is shown, in order, with its recorded state;
 *   - recorded progress is computed from the snapshot (2 of 3 closed = 67%);
 *   - the start-flow control stays usable even though the originating flow
 *     no longer appears in the available-flows list.
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

// The frozen step snapshot the run carries. The flow definition that authored
// these steps has been deleted — the run must render entirely from this.
const STEPS = [
  { id: 'scope', type: 'activity', title: 'Confirm scope & classification' },
  {
    id: 'harmonised',
    type: 'question',
    title: 'Are harmonised standards fully applied?',
    config: { options: ['yes', 'partially', 'no'] },
  },
  { id: 'signoff', type: 'checkpoint', title: 'Management sign-off' },
];

// Orphaned run: flowId is null, name + steps come from the snapshot.
const ORPHANED_RUN = {
  id: 42,
  flowId: null,
  assessmentId: 8,
  flowName: 'Retired CRA process',
  status: 'active',
  assignee: '',
  stepStates: {
    scope: { status: 'done', completedAt: '2026-07-15T00:00:00Z' },
    harmonised: { status: 'skipped' },
    signoff: { status: 'pending' },
  },
  createdAt: '2026-07-14T00:00:00Z',
  updatedAt: '2026-07-15T00:00:00Z',
};

// A different, still-live flow: the run's originating flow is absent from the
// available-flows list, but starting new flows must keep working.
const OTHER_FLOW = {
  id: 9,
  key: 'other-flow',
  name: 'Replacement CRA process',
  description: 'The flow that superseded the retired one.',
  appliesTo: { regulationKeys: ['cra'] },
  steps: [{ id: 's1', type: 'activity', title: 'Kick off' }],
  isTemplate: true,
  sortOrder: 0,
  createdAt: '2026-07-13T00:00:00Z',
  updatedAt: '2026-07-13T00:00:00Z',
};

async function baseMocks(page: Page, flows: unknown[]) {
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(ADMIN_SESSION)));
  await page.route('**/api/conformity/assessments/8', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );
  await page.route('**/api/conformity/flows', (route) => route.fulfill(json(flows)));
  await page.route('**/api/conformity/assessments/8/flow-runs', (route) =>
    route.fulfill(json([ORPHANED_RUN])),
  );
  await page.route('**/api/conformity/flow-runs/42', (route) =>
    route.fulfill(json({ run: ORPHANED_RUN, steps: STEPS })),
  );
}

async function gotoFlowsTab(page: Page) {
  await page.goto('/conformity/assessments/8');
  await page.waitForLoadState('networkidle');
  await page.getByTestId('tab-flows').click();
}

test.describe('orphaned flow run (flow definition deleted)', () => {
  test('renders the frozen name, snapshotted steps and recorded progress', async ({ page }) => {
    await baseMocks(page, [OTHER_FLOW]);
    await gotoFlowsTab(page);

    // Run card shows the frozen name and snapshot-derived progress.
    const runCard = page.getByTestId('flow-run-card');
    await expect(runCard).toContainText('Retired CRA process');
    await expect(runCard).toContainText('2/3 steps');

    // Open the run detail — it must render from the snapshot without errors.
    await runCard.click();
    await expect(page.getByRole('heading', { name: 'Retired CRA process' })).toBeVisible();
    await expect(page.getByText('67% complete')).toBeVisible();

    // All three snapshotted steps render, in order.
    const steps = page.getByTestId('flow-steps');
    await expect(steps).toBeVisible();
    const titles = steps.locator('li span.font-medium');
    await expect(titles).toHaveCount(3);
    await expect(titles.nth(0)).toHaveText('Confirm scope & classification');
    await expect(titles.nth(1)).toHaveText('Are harmonised standards fully applied?');
    await expect(titles.nth(2)).toHaveText('Management sign-off');

    // Recorded per-step states survive: the done step shows its completion
    // stamp and the step status selects reflect the snapshot.
    await expect(steps.getByText(/^done /)).toBeVisible();
    const statuses = page.getByTestId('flow-step-status');
    await expect(statuses.nth(0)).toContainText('Done');
    await expect(statuses.nth(1)).toContainText('Skipped');
    await expect(statuses.nth(2)).toContainText('Pending');

    // The frozen question step still executes its authored options.
    await page.getByTestId('flow-step-answer').click();
    await expect(page.getByRole('option', { name: 'partially' })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('the start-flow control stays usable when the originating flow is gone', async ({
    page,
  }) => {
    await baseMocks(page, [OTHER_FLOW]);
    await gotoFlowsTab(page);

    // The orphaned run still lists alongside a fully functional start control.
    await expect(page.getByTestId('flow-run-card')).toContainText('Retired CRA process');

    const select = page.getByTestId('flow-select');
    await expect(select).toBeVisible();
    await select.click();
    // Only the live flow is offered; the deleted one is simply absent.
    await expect(page.getByRole('option', { name: 'Replacement CRA process' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Retired CRA process' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    // Start stays disabled until a flow is chosen — no crash, no phantom option.
    await expect(page.getByTestId('flow-start')).toBeDisabled();
  });

  test('the orphaned run still renders when no flows remain at all', async ({ page }) => {
    await baseMocks(page, []);
    await gotoFlowsTab(page);

    // Empty available-flows list degrades to the explanatory message while the
    // orphaned run remains fully browsable.
    await expect(
      page.getByText('No flow templates are available for this assessment yet.'),
    ).toBeVisible();
    const runCard = page.getByTestId('flow-run-card');
    await expect(runCard).toContainText('Retired CRA process');
    await runCard.click();
    await expect(page.getByRole('heading', { name: 'Retired CRA process' })).toBeVisible();
    await expect(page.getByTestId('flow-steps')).toBeVisible();
  });
});
