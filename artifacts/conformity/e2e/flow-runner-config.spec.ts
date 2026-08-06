/**
 * Flow runner config-surfacing regression test.
 *
 * Admins can author per-step config in the flow builder (question answer
 * "options", artifact "artifactType"). The whole point of authoring that config
 * is that it must actually reach the person executing the run — otherwise the
 * builder quietly lies. This test drives the run-side Flow runner panel and
 * asserts that:
 *   - a question step with authored options is executed as a fixed set of
 *     choices (a select), not a free-text box that ignores them;
 *   - an artifact step surfaces its authored artifact type to the runner.
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

const STEPS = [
  {
    id: 'harmonised',
    type: 'question',
    title: 'Are harmonised standards fully applied?',
    config: { options: ['yes', 'partially', 'no'] },
  },
  {
    id: 'doc',
    type: 'artifact',
    title: 'Draft the declaration of conformity',
    config: { artifactType: 'declaration_of_conformity' },
  },
];

const RUN_SUMMARY = {
  id: 42,
  flowId: 7,
  assessmentId: 8,
  flowName: 'CRA default process',
  status: 'active',
  assignee: '',
  stepStates: {
    harmonised: { status: 'pending' },
    doc: { status: 'pending' },
  },
  createdAt: '2026-07-14T00:00:00Z',
  updatedAt: '2026-07-14T00:00:00Z',
};

async function baseMocks(page: Page) {
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(ADMIN_SESSION)));
  await page.route('**/api/conformity/assessments/8', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );
  await page.route('**/api/conformity/assessments/8/flow-runs', (route) =>
    route.fulfill(json([RUN_SUMMARY])),
  );
  await page.route('**/api/conformity/flow-runs/42', (route) =>
    route.fulfill(json({ run: RUN_SUMMARY, steps: STEPS })),
  );
}

test('the runner executes authored per-step config instead of ignoring it', async ({ page }) => {
  await baseMocks(page);

  await page.goto('/conformity/assessments/8');
  await page.waitForLoadState('networkidle');

  await page.getByTestId('tab-flows').click();

  // Open the run detail from its card.
  await page.getByTestId('flow-run-card').click();

  // Question step: authored options are executed as choices, not free text.
  const answer = page.getByTestId('flow-step-answer');
  await expect(answer).toBeVisible();
  await answer.click();
  await expect(page.getByRole('option', { name: 'yes' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'partially' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'no' })).toBeVisible();
  await page.keyboard.press('Escape');

  // Artifact step: the authored artifact type is surfaced to the runner.
  await expect(page.getByTestId('flow-step-artifact-type')).toContainText(
    'declaration_of_conformity',
  );
});
