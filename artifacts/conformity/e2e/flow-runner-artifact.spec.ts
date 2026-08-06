/**
 * Flow runner artifact-linking regression test.
 *
 * An artifact-type flow step must let the assessor act on its authored artifact
 * type from inside the run — not just read it. This test drives the run-side
 * Flow runner panel and asserts that:
 *   - an artifact step offers a "Create / link artifact" action;
 *   - triggering it persists the matching artifact's id onto the step state
 *     (FlowRunStepState.artifactId);
 *   - the linked artifact is then shown on the step with a link to it;
 *   - the step cannot be marked "done" until an artifact is linked.
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
    id: 'doc',
    type: 'artifact',
    title: 'Draft the declaration of conformity',
    config: { artifactType: 'eu_doc' },
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
    doc: { status: 'pending' },
  },
  createdAt: '2026-07-14T00:00:00Z',
  updatedAt: '2026-07-14T00:00:00Z',
};

const ARTIFACT = {
  id: 99,
  assessmentId: 8,
  artifactType: 'eu_doc',
  label: 'EU Declaration of Conformity',
  status: 'draft',
  sections: [],
  completeness: 100,
  version: 1,
  generatedAt: '2026-07-14T00:00:00Z',
};

type StepState = { status: string; artifactId?: number };

async function baseMocks(page: Page) {
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(ADMIN_SESSION)));
  await page.route('**/api/conformity/assessments/8', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );
  await page.route('**/api/conformity/assessments/8/flow-runs', (route) =>
    route.fulfill(json([RUN_SUMMARY])),
  );
  await page.route('**/api/conformity/assessments/8/artifacts', (route) =>
    route.fulfill(json([ARTIFACT])),
  );
}

test('an artifact step can create / link its expected artifact', async ({ page }) => {
  await baseMocks(page);

  // A single source of truth for the run's mutable doc-step state, so the GET
  // refetch after the PATCH reflects the newly-linked artifact.
  let docState: StepState = { status: 'pending' };
  const runDetail = () => ({
    run: { ...RUN_SUMMARY, stepStates: { doc: docState } },
    steps: STEPS,
  });

  await page.route('**/api/conformity/flow-runs/42', (route) => route.fulfill(json(runDetail())));

  let patched: StepState | null = null;
  await page.route('**/api/conformity/flow-runs/42/steps/doc', async (route) => {
    const body = route.request().postDataJSON() as StepState;
    patched = body;
    docState = { status: body.status, artifactId: body.artifactId };
    await route.fulfill(json(runDetail()));
  });

  await page.goto('/conformity/assessments/8');
  await page.waitForLoadState('networkidle');

  await page.getByTestId('tab-flows').click();
  await page.getByTestId('flow-run-card').click();

  // The authored artifact type is surfaced AND actionable.
  await expect(page.getByTestId('flow-step-artifact-type')).toContainText('eu_doc');

  // Before linking, the step cannot be completed.
  await page.getByTestId('flow-step-status').click();
  await expect(page.getByRole('option', { name: 'Done' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await page.keyboard.press('Escape');

  // Trigger the "Create / link artifact" action (pre-selected to the matching type).
  await page.getByTestId('flow-step-create-artifact').click();

  // The matching artifact id is persisted onto the step state.
  await expect.poll(() => patched?.artifactId).toBe(99);

  // The linked artifact is shown on the step, with a link to it.
  const linked = page.getByTestId('flow-step-linked-artifact');
  await expect(linked).toContainText('EU Declaration of Conformity');
  await expect(page.getByTestId('flow-step-artifact-link')).toBeVisible();

  // With an artifact linked, the step can now be completed.
  await page.getByTestId('flow-step-status').click();
  await expect(page.getByRole('option', { name: 'Done' })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  );
});

test('generating documents auto-links the matching artifact to the step', async ({ page }) => {
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(ADMIN_SESSION)));
  await page.route('**/api/conformity/assessments/8', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );
  await page.route('**/api/conformity/assessments/8/flow-runs', (route) =>
    route.fulfill(json([RUN_SUMMARY])),
  );

  // The assessment starts with no generated artifacts, so the runner offers to
  // generate them rather than link an existing one.
  let artifacts: unknown[] = [];
  await page.route('**/api/conformity/assessments/8/artifacts', (route) =>
    route.fulfill(json(artifacts)),
  );

  // Generating produces the DoC whose type matches the step's authored artifactType.
  let generated = false;
  await page.route('**/api/conformity/assessments/8/artifacts/generate', async (route) => {
    generated = true;
    artifacts = [ARTIFACT];
    await route.fulfill(json([ARTIFACT]));
  });

  let docState: StepState = { status: 'pending' };
  const runDetail = () => ({
    run: { ...RUN_SUMMARY, stepStates: { doc: docState } },
    steps: STEPS,
  });
  await page.route('**/api/conformity/flow-runs/42', (route) => route.fulfill(json(runDetail())));

  let patched: StepState | null = null;
  await page.route('**/api/conformity/flow-runs/42/steps/doc', async (route) => {
    const body = route.request().postDataJSON() as StepState;
    patched = body;
    docState = { status: body.status, artifactId: body.artifactId };
    await route.fulfill(json(runDetail()));
  });

  await page.goto('/conformity/assessments/8');
  await page.waitForLoadState('networkidle');

  await page.getByTestId('tab-flows').click();
  await page.getByTestId('flow-run-card').click();

  // No artifacts exist yet, so the action generates the documents.
  await page.getByTestId('flow-step-create-artifact').click();

  // Generation fired, and the artifact matching the authored type was auto-linked
  // without the assessor having to pick it manually.
  await expect.poll(() => generated).toBe(true);
  await expect.poll(() => patched?.artifactId).toBe(99);

  // The auto-linked artifact is shown on the step, with a link to it.
  const linked = page.getByTestId('flow-step-linked-artifact');
  await expect(linked).toContainText('EU Declaration of Conformity');
  await expect(page.getByTestId('flow-step-artifact-link')).toBeVisible();
});
