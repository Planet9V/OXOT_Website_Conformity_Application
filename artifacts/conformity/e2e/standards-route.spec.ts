/**
 * Art 32 standards tracking — route-validity advisory + applied-standards editor.
 *
 * A Class I important product may only self-assess (Module A) when at least one
 * harmonised standard / common specification / certification scheme is recorded
 * as applied IN FULL (Art 32(2)). The server computes one advisory string on the
 * assessment detail; this spec locks the two client surfaces that consume it:
 *
 *   - the Next Actions panel surfaces a "Route validity" bucket that deep-links
 *     to the wizard tab,
 *   - the wizard's route step shows the advisory alert and the standards editor,
 *   - saving a fully-applied standard PUTs the normalised ledger and — once the
 *     detail refetch returns the cleared advisory — both surfaces stand down.
 *
 * Every API call is mocked (stateful detail mock flips on PUT), so the spec is
 * self-contained: no API server or DB.
 */

import { test, expect, type Page } from '@playwright/test';

const AUTHED_SESSION = { authenticated: true, username: 'admin' };

const ADVISORY =
  "Module A (self-assessment) is selected for a Class I important product, but no applied standards are recorded yet. Art 32(2) requires harmonised standards, common specifications or a European cybersecurity certification scheme (assurance level at least 'substantial') to fully cover the applicable essential requirements — record at least one standard as applied in full, or switch to a third-party route (Module B+C or Module H).";

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

function detailFixture(over: {
  appliedStandards: unknown[];
  standardsAdvisory: string | null;
}) {
  return {
    assessment: {
      id: 1,
      productId: 1,
      regulationKey: 'cra',
      status: 'active',
      currentStage: 'gap_assessment',
      scopeResult: 'in_scope',
      classKey: 'important_class_i',
      routeKey: 'module_a',
      appliedStandards: over.appliedStandards,
      startedAt: '2025-01-01T00:00:00Z',
      completedAt: null,
      updatedAt: '2025-01-01T00:00:00Z',
    },
    product: PRODUCT,
    answers: [],
    scope: { result: 'in_scope', reasons: [], answered: true },
    classification: {
      classKey: 'important_class_i',
      classLabel: 'Important — Class I',
      citation: 'Annex III',
      matched: [],
    },
    allowedRoutes: [
      {
        key: 'module_a',
        name: 'Module A — Internal control',
        description: 'Self-assessment under internal production control.',
        thirdPartyRequired: false,
      },
      {
        key: 'module_b_c',
        name: 'Module B + C',
        description: 'EU-type examination by a notified body.',
        thirdPartyRequired: true,
      },
    ],
    recommendedRouteKey: 'module_a',
    className: 'Important — Class I',
    routeName: 'Module A — Internal control',
    standardsAdvisory: over.standardsAdvisory,
    counts: {
      evaluationsTotal: 0,
      evaluationsMet: 0,
      evaluationsNotMet: 0,
      evidenceCount: 0,
      openIncidents: 0,
    },
  };
}

const FLOW = {
  regulationKey: 'cra',
  scoping: { title: 'Scoping', description: 'Is the product in scope?', questions: [] },
  classification: { title: 'Classification', description: 'Classify the product', groups: [] },
  route: {
    title: 'Conformity route',
    description: 'Pick the assessment route',
    forkQuestion: {
      key: 'applies_harmonised_standards',
      title: 'Are harmonised standards fully applied?',
      help: '',
      citation: 'Art 32(2)',
    },
  },
};

/**
 * Stateful mocks: GET detail serves `current`; a PUT to /standards captures the
 * body, flips `current` to the cleared-advisory fixture, and echoes it — exactly
 * the contract of the real endpoint (respond with the fresh detail).
 */
async function installMocks(page: Page, capture: { putBody: unknown }) {
  const json = (body: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

  let current = detailFixture({ appliedStandards: [], standardsAdvisory: ADVISORY });

  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(AUTHED_SESSION)));
  await page.route('**/api/conformity/flow/cra', (route) => route.fulfill(json(FLOW)));
  // At least one evaluation must exist: with none, the panel honestly shows the
  // "build the requirement checklist" prompt instead of priority buckets.
  await page.route('**/api/conformity/assessments/1/evaluations', (route) =>
    route.fulfill(
      json([
        {
          id: 1,
          assessmentId: 1,
          regulationKey: 'cra',
          requirementRefCode: 'OP-1',
          status: 'in_progress',
          implementationNote: '',
          riskRating: null,
          owner: '',
          dueDate: null,
          title: 'Open requirement',
          description: '',
          themeKey: null,
          themeName: 'Security',
          obligationType: '',
          relatedMappings: [],
          evidenceCount: 0,
        },
      ]),
    ),
  );
  await page.route('**/api/conformity/assessments/1/incidents', (route) =>
    route.fulfill(json([])),
  );
  await page.route('**/api/conformity/assessments/1/artifacts', (route) =>
    route.fulfill(json([])),
  );
  await page.route('**/api/conformity/assessments/1', (route) =>
    route.fulfill(json(current)),
  );
  await page.route('**/api/conformity/assessments/1/standards', async (route) => {
    capture.putBody = route.request().postDataJSON();
    current = detailFixture({
      appliedStandards: [{ reference: 'EN 18031-1:2024', coverage: 'full' }],
      standardsAdvisory: null,
    });
    await route.fulfill(json(current));
  });
}

test('route-validity advisory: worklist bucket → wizard alert → recording a full standard clears both', async ({
  page,
}) => {
  const capture: { putBody: unknown } = { putBody: null };
  await installMocks(page, capture);

  await page.goto('/conformity/assessments/1');
  await page.waitForLoadState('networkidle');

  // 1. Next Actions (default tab) surfaces the Route validity bucket with the
  //    server's advisory as the item detail — no client-side re-derivation.
  const bucket = page.locator('div.overflow-hidden', {
    has: page.getByRole('heading', { name: 'Route validity', exact: true }),
  });
  await expect(bucket).toBeVisible();
  const item = bucket.getByRole('button', {
    name: /Back the Module A route with a fully-applied standard/,
  });
  await expect(item).toBeVisible();
  await expect(bucket.getByText(/Art 32\(2\)/).first()).toBeVisible();

  // 2. The item deep-links to the wizard tab, where the same advisory renders
  //    as an alert on the route step (one server-computed source of truth).
  await item.click();
  const advisory = page.getByTestId('standards-advisory');
  await expect(advisory).toBeVisible();
  await expect(advisory).toContainText('Art 32(2)');

  // 3. Record one standard as applied in full and save.
  const editor = page.getByTestId('standards-editor');
  await expect(editor).toBeVisible();
  await expect(editor.getByText('No standards on record yet.')).toBeVisible();
  await page.getByTestId('standards-add').click();
  // Nothing typed yet → reference is empty → save must be blocked, honestly.
  await expect(page.getByTestId('standards-save')).toBeDisabled();
  await expect(editor.getByText('Every standard needs a reference before saving.')).toBeVisible();
  await page.getByTestId('standard-reference-0').fill('  EN 18031-1:2024  ');
  await expect(page.getByTestId('standards-save')).toBeEnabled();
  await page.getByTestId('standards-save').click();

  // The PUT carries the normalised ledger: trimmed reference, no empty
  // optional fields, coverage defaulting to "full".
  await expect
    .poll(() => capture.putBody, { message: 'standards PUT should have fired' })
    .toEqual({ standards: [{ reference: 'EN 18031-1:2024', coverage: 'full' }] });

  // 4. The refetched detail carries the cleared advisory → the alert stands
  //    down and the Route validity bucket is gone from Next Actions.
  await expect(advisory).not.toBeVisible();
  await page.getByRole('tab', { name: 'Next actions' }).click();
  await expect(page.getByRole('heading', { name: 'Route validity' })).toHaveCount(0);
});

test('standards typeahead: suggestions filter, picking fills reference + title, free text still allowed', async ({
  page,
}) => {
  const capture: { putBody: unknown } = { putBody: null };
  await installMocks(page, capture);

  await page.goto('/conformity/assessments/1');
  await page.waitForLoadState('networkidle');
  await page.getByRole('tab', { name: 'Wizard' }).click();

  const editor = page.getByTestId('standards-editor');
  await expect(editor).toBeVisible();
  await page.getByTestId('standards-add').click();

  // Focusing the empty reference field shows the full curated catalogue.
  const ref = page.getByTestId('standard-reference-0');
  await ref.click();
  const list = page.getByTestId('standard-suggestions-0');
  await expect(list).toBeVisible();
  await expect(list.getByRole('option').first()).toBeVisible();

  // Typing filters by reference or title.
  await ref.pressSequentially('303 645');
  await expect(list.getByRole('option')).toHaveCount(1);
  await expect(list).toContainText('ETSI EN 303 645');

  // Picking a suggestion fills reference AND title.
  await list.getByRole('option').first().getByRole('button').click();
  await expect(ref).toHaveValue('ETSI EN 303 645 V2.1.1');
  await expect(page.getByTestId('standard-title-0')).toHaveValue(
    'Cyber Security for Consumer Internet of Things: Baseline Requirements',
  );
  await expect(list).not.toBeVisible();

  // Free text that matches nothing is still accepted — no list, save enabled.
  await ref.fill('MY-INTERNAL-SPEC 1.0');
  await expect(list).not.toBeVisible();
  await expect(page.getByTestId('standards-save')).toBeEnabled();
});
