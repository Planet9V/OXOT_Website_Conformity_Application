/**
 * Wizard state-isolation regression test.
 *
 * The app uses wouter: navigating /assessments/1 → /assessments/2 keeps the
 * Assessment page component MOUNTED and only swaps the :id param. The Wizard
 * child seeds its useState from server props once, so the only thing standing
 * between "works" and "silently posts assessment 1's answers to assessment 2"
 * is the `key={detail.assessment.id}` remount guard on <Wizard>. Nothing
 * tested that guard until now.
 *
 * The dangerous path is the CACHED one: react-query's 5-minute staleTime means
 * revisiting an already-loaded assessment renders instantly (no skeleton, no
 * child unmount), so the key prop is the sole guard. This test therefore:
 *   1. warms assessment 2's cache,
 *   2. answers + saves assessment 1's scoping questions,
 *   3. swaps the URL param back to assessment 2 (in-place, no remount of the
 *      page) and asserts the wizard starts BLANK — pressing "Save scoping"
 *      must not fire any request,
 *   4. answers assessment 2 differently and asserts the POST goes to
 *      /assessments/2/answers with ONLY assessment 2's own answers.
 *
 * Every API call is mocked with a small stateful per-assessment answer store,
 * so the test is self-contained (no API server / DB).
 */

import { test, expect, type Page } from '@playwright/test';

const AUTHED_SESSION = { authenticated: true, username: 'admin' };

// ── Fixtures ─────────────────────────────────────────────────────────────────

function product(id: number, name: string) {
  return {
    id,
    name,
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
}

const PRODUCTS: Record<number, ReturnType<typeof product>> = {
  1: product(1, 'Alpha Router'),
  2: product(2, 'Beta Camera'),
};

/** Minimal two-question CRA flow so the wizard renders a tiny questionnaire. */
const FLOW = {
  regulationKey: 'cra',
  regulationName: 'Cyber Resilience Act',
  scoping: {
    title: 'Scoping',
    description: 'Confirm the CRA applies to this product.',
    questions: [
      {
        key: 'is_pde',
        title: 'Is this a product with digital elements?',
        help: '',
        citation: 'Art 3(1)',
        inScopeWhen: true,
      },
      {
        key: 'made_available_eu',
        title: 'Will the product be made available on the EU market?',
        help: '',
        citation: 'Art 2(1)',
        inScopeWhen: true,
      },
    ],
  },
  classification: {
    title: 'Classification',
    description: 'Pick applicable categories.',
    defaultClassKey: 'default',
    defaultClassLabel: 'Default',
    defaultCitation: 'Art 32(1)',
    groups: [
      {
        classKey: 'important_class_i',
        classLabel: 'Important — Class I',
        citation: 'Annex III',
        options: [{ value: 'firewall', label: 'Firewalls' }],
      },
    ],
  },
  route: {
    title: 'Route',
    description: 'Choose the conformity route.',
    forkQuestion: {
      key: 'applies_harmonised_standards',
      title: 'Do you apply harmonised standards in full?',
      help: '',
      citation: 'Art 27',
    },
  },
};

type Answer = { questionKey: string; value: { bool?: boolean; options?: string[] } };

// ── Stateful mock API ─────────────────────────────────────────────────────────

/** Per-assessment answer store — the mock server's "database". */
const answerStore: Record<number, Answer[]> = { 1: [], 2: [] };
/** Every answers POST the app makes, in order. */
const answerPosts: Array<{ id: number; answers: Answer[] }> = [];

function detail(id: number) {
  const answers = answerStore[id];
  const bool = (key: string) => answers.find((a) => a.questionKey === key)?.value.bool;
  const scopeAnswered = FLOW.scoping.questions.every((q) => typeof bool(q.key) === 'boolean');
  const inScope = scopeAnswered && FLOW.scoping.questions.every((q) => bool(q.key) === true);
  return {
    assessment: {
      id,
      productId: id,
      regulationKey: 'cra',
      status: 'active',
      currentStage: 'scoping',
      scopeResult: scopeAnswered ? (inScope ? 'in_scope' : 'out_of_scope') : null,
      classKey: null,
      routeKey: null,
      startedAt: '2025-01-01T00:00:00Z',
      completedAt: null,
      updatedAt: '2025-01-01T00:00:00Z',
      appliedStandards: [],
    },
    product: PRODUCTS[id],
    answers,
    scope: {
      result: scopeAnswered ? (inScope ? 'in_scope' : 'out_of_scope') : 'unknown',
      reasons: [],
      answered: scopeAnswered,
    },
    classification: {
      classKey: 'default',
      classLabel: 'Default',
      citation: 'Art 32(1)',
      matched: [],
    },
    allowedRoutes: [],
    recommendedRouteKey: null,
    className: null,
    routeName: null,
    counts: {
      evaluationsTotal: 0,
      evaluationsMet: 0,
      evaluationsNotMet: 0,
      evidenceCount: 0,
      openIncidents: 0,
    },
  };
}

async function installMocks(page: Page) {
  const json = (body: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

  // Lowest priority: swallow any other /api/* call (Playwright matches LIFO).
  await page.route('**/api/**', (route) => route.fulfill(json([])));

  await page.route('**/api/admin/session', (route) => route.fulfill(json(AUTHED_SESSION)));
  await page.route('**/api/conformity/flow/cra', (route) => route.fulfill(json(FLOW)));

  // Detail GET + answers POST for both assessments, backed by answerStore.
  await page.route(/\/api\/conformity\/assessments\/(\d+)(\/answers)?$/, (route) => {
    const url = route.request().url();
    const m = url.match(/\/assessments\/(\d+)(\/answers)?$/)!;
    const id = Number(m[1]);
    if (m[2] && route.request().method() !== 'GET') {
      const body = route.request().postDataJSON() as { answers: Answer[] };
      answerPosts.push({ id, answers: body.answers });
      for (const a of body.answers) {
        answerStore[id] = answerStore[id].filter((x) => x.questionKey !== a.questionKey);
        answerStore[id].push(a);
      }
      return route.fulfill(json(detail(id)));
    }
    return route.fulfill(json(detail(id)));
  });

  // Secondary per-assessment collections the page loads.
  await page.route(/\/api\/conformity\/assessments\/\d+\/(grades|evaluations|incidents|artifacts)$/, (route) =>
    route.fulfill(json([])),
  );
}

/**
 * Swap the :id URL param IN PLACE — exactly what wouter Links do. The page
 * component stays mounted and only params change, which is the scenario the
 * key={assessment.id} guard exists for. (wouter patches history.pushState to
 * emit a "pushState" event; dispatch it too in case the patch isn't applied.)
 */
async function swapAssessmentParam(page: Page, id: number) {
  await page.evaluate((target) => {
    history.pushState(null, '', `/conformity/assessments/${target}`);
    dispatchEvent(new Event('pushState'));
  }, id);
}

// ── The regression ────────────────────────────────────────────────────────────

test('switching assessments never leaks answers to the wrong one', async ({ page }) => {
  await installMocks(page);

  const q1 = FLOW.scoping.questions[0].title;
  const q2 = FLOW.scoping.questions[1].title;
  const row = (title: string) =>
    page.locator('div.flex.items-start.justify-between', { hasText: title });

  // 1) Warm assessment 2's react-query cache so the later return visit renders
  //    from cache with no skeleton (the child never unmounts → key is the guard).
  await page.goto('/conformity/assessments/2');
  await expect(page.getByRole('heading', { name: 'Beta Camera' })).toBeVisible();

  // 2) Swap in place to assessment 1 and answer its scoping wizard.
  await swapAssessmentParam(page, 1);
  await expect(page.getByRole('heading', { name: 'Alpha Router' })).toBeVisible();
  await page.getByRole('tab', { name: 'Wizard' }).click();

  await row(q1).getByRole('button', { name: 'Yes' }).click();
  await row(q2).getByRole('button', { name: 'Yes' }).click();
  await page.getByRole('button', { name: 'Save scoping' }).click();

  await expect(page.getByText('In scope of the Cyber Resilience Act')).toBeVisible();
  expect(answerPosts).toHaveLength(1);
  expect(answerPosts[0].id).toBe(1);
  expect(answerPosts[0].answers).toEqual([
    { questionKey: 'is_pde', value: { bool: true } },
    { questionKey: 'made_available_eu', value: { bool: true } },
  ]);

  // 3) Swap in place to assessment 2 — served instantly from cache. The wizard
  //    must start BLANK: no scope verdict, and "Save scoping" must be a no-op
  //    (the wizard only posts questions that hold a boolean in local state, so
  //    any request here means assessment 1's answers leaked across).
  await swapAssessmentParam(page, 2);
  await expect(page.getByRole('heading', { name: 'Beta Camera' })).toBeVisible();
  await expect(page.getByText('In scope of the Cyber Resilience Act')).not.toBeVisible();

  await page.getByRole('button', { name: 'Save scoping' }).click();
  await page.waitForTimeout(500); // give a leaked request time to surface
  expect(answerPosts, 'Save scoping on a blank wizard must not post anything').toHaveLength(1);
  expect(answerStore[2]).toEqual([]);

  // 4) Answer assessment 2 with a DIFFERENT answer set and save: the POST must
  //    target assessment 2 and carry only its own answers.
  await row(q1).getByRole('button', { name: 'No' }).click();
  await row(q2).getByRole('button', { name: 'Yes' }).click();
  await page.getByRole('button', { name: 'Save scoping' }).click();

  await expect(page.getByLabel('Wizard').getByText('Out of scope')).toBeVisible();
  expect(answerPosts).toHaveLength(2);
  expect(answerPosts[1].id).toBe(2);
  expect(answerPosts[1].answers).toEqual([
    { questionKey: 'is_pde', value: { bool: false } },
    { questionKey: 'made_available_eu', value: { bool: true } },
  ]);

  // Assessment 1's stored answers are untouched.
  expect(answerStore[1]).toEqual([
    { questionKey: 'is_pde', value: { bool: true } },
    { questionKey: 'made_available_eu', value: { bool: true } },
  ]);
});
