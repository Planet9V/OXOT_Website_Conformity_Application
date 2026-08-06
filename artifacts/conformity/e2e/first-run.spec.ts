/**
 * First-run guidance regression test: getting-started path, guided tour,
 * glossary.
 *
 * The credibility rules this locks in:
 *   - An empty workspace explains the path (product → assessment → wizard)
 *     with deep links and live progress, instead of a dead-end empty card.
 *     The command-center empty state keeps its "No assessments yet" contract.
 *   - The workbench tour auto-starts ONCE per browser for humans, is NEVER
 *     forced on the shared demo role, and NEVER auto-starts under automation
 *     (navigator.webdriver) — that last rule is what keeps every other spec in
 *     this suite deterministic. Manual replay from the Help menu always works.
 *   - The glossary is reachable from the header Help menu and from inline term
 *     affordances, and it separates statutory CRA concepts (with citations)
 *     from workbench concepts.
 *
 * Every API call is mocked, so the test is self-contained (no API server / DB).
 */

import { test, expect, type Page } from '@playwright/test';

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const ADMIN_SESSION = { authenticated: true, username: 'admin' };
const DEMO_SESSION = { authenticated: true, username: 'demo', role: 'demo' };
const MEMBER_SESSION = {
  authenticated: true,
  username: 'alice',
  role: 'member',
  displayName: 'Alice',
  needsOnboarding: false,
};

const memberProfile = (toursSeen: string[]) => ({
  username: 'alice',
  displayName: 'Alice',
  role: 'member',
  memberSince: '2025-01-01T00:00:00Z',
  needsOnboarding: false,
  toursSeen,
});

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
    classKey: 'class_i',
    routeKey: 'internal_control',
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
  className: 'Class I',
  routeName: 'Internal control',
  counts: {
    evaluationsTotal: 9,
    evaluationsMet: 3,
    evaluationsNotMet: 1,
    evidenceCount: 2,
    openIncidents: 0,
  },
};

const EMPTY_PORTFOLIO = {
  generatedAt: new Date().toISOString(),
  totals: { products: 0, assessments: 0, notStarted: 0, inProgress: 0, blocked: 0, readyForReview: 0 },
  risk: { openBlockers: 0, highRiskGaps: 0, openIncidents: 0, overdueDeadlines: 0, dueSoonDeadlines: 0 },
  evidence: {
    requirementCoverage: null,
    evidenceCoverage: null,
    documentationCoverage: null,
    totalRequirements: 0,
    resolvedRequirements: 0,
    applicableRequirements: 0,
    evidencedRequirements: 0,
    totalSections: 0,
    completeSections: 0,
  },
  grades: [],
  deadlines: [],
  products: [],
};

const TOUR_KEY = 'oxot-conformity-tour:workbench';

/** Overview-page mocks. Playwright matches routes LIFO, so catch-all first. */
async function installOverviewMocks(
  page: Page,
  opts: { products: unknown[]; productDetail?: unknown; session?: unknown },
) {
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) =>
    route.fulfill(json(opts.session ?? ADMIN_SESSION)),
  );
  await page.route('**/api/conformity/products', (route) => route.fulfill(json(opts.products)));
  if (opts.productDetail !== undefined) {
    await page.route('**/api/conformity/products/1', (route) =>
      route.fulfill(json(opts.productDetail)),
    );
  }
}

/** Assessment-workbench mocks (same pattern as journey.spec.ts). */
async function installAssessmentMocks(page: Page, session: unknown = ADMIN_SESSION) {
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(session)));
  await page.route('**/api/conformity/assessments/1', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );
}

/**
 * Playwright reports navigator.webdriver=true, which the app treats as "an
 * automated browser — never auto-start a tour". These tests impersonate a
 * human browser to exercise the auto-start path.
 */
async function impersonateHumanBrowser(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', {
      get: () => false,
      configurable: true,
    });
  });
}

// ── Getting-started path (overview) ──────────────────────────────────────────

test.describe('getting started — empty workspace', () => {
  test('no products: step 1 is active and deep-links to products', async ({ page }) => {
    await installOverviewMocks(page, { products: [] });
    await page.goto('/conformity/overview');

    await expect(page.getByTestId('getting-started')).toBeVisible();
    await expect(page.getByTestId('gs-step-1')).toHaveAttribute('data-state', 'active');
    await expect(page.getByTestId('gs-step-2')).toHaveAttribute('data-state', 'upcoming');
    await expect(page.getByTestId('gs-step-3')).toHaveAttribute('data-state', 'upcoming');

    const cta = page.getByTestId('gs-step-1-cta');
    await expect(cta).toContainText('Add your first product');
    await expect(cta).toHaveAttribute('href', '/conformity/products');

    // The path is explained in statutory terms, not app jargon alone.
    await expect(page.getByText(/Annex VII technical documentation/)).toBeVisible();

    // The glossary is one click away for first-time vocabulary.
    await page.getByTestId('getting-started-glossary').click();
    await expect(page.getByTestId('glossary-dialog')).toBeVisible();
  });

  test('product but no assessment: step 1 done, step 2 deep-links to the product', async ({
    page,
  }) => {
    await installOverviewMocks(page, {
      products: [PRODUCT],
      productDetail: { ...PRODUCT, assessments: [] },
    });
    await page.goto('/conformity/overview');

    await expect(page.getByTestId('gs-step-1')).toHaveAttribute('data-state', 'done');
    await expect(page.getByTestId('gs-step-2')).toHaveAttribute('data-state', 'active');

    const cta = page.getByTestId('gs-step-2-cta');
    await expect(cta).toContainText('Open Test Gateway');
    await expect(cta).toHaveAttribute('href', '/conformity/products/1');
  });
});

test.describe('getting started — command center empty state', () => {
  test('keeps the "No assessments yet" contract and shows the steps', async ({ page }) => {
    await page.route('**/api/**', (route) => route.fulfill(json([])));
    await page.route('**/api/admin/session', (route) => route.fulfill(json(ADMIN_SESSION)));
    await page.route('**/api/conformity/portfolio', (route) =>
      route.fulfill(json(EMPTY_PORTFOLIO)),
    );
    await page.goto('/conformity/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('No assessments yet')).toBeVisible();
    await expect(page.getByTestId('getting-started')).toBeVisible();
    await expect(page.getByTestId('gs-step-1')).toHaveAttribute('data-state', 'active');
    await expect(page.getByTestId('triage-board')).toHaveCount(0);
  });
});

// ── Guided tour ───────────────────────────────────────────────────────────────

test.describe('workbench tour', () => {
  test('auto-starts once for a human browser, never again after dismissal', async ({ page }) => {
    await impersonateHumanBrowser(page);
    await installAssessmentMocks(page);
    await page.goto('/conformity/assessments/1');

    // Auto-start fires shortly after the workbench content is on screen.
    const popover = page.locator('.driver-popover');
    await expect(popover).toBeVisible({ timeout: 10_000 });
    await expect(popover).toContainText('Journey, grade, next best action');

    // Walk one step to prove the sequence advances and stays CRA-grounded.
    await page.locator('.driver-popover-next-btn').click();
    await expect(popover).toContainText('One tab per CRA duty');
    await page.screenshot({ path: '/tmp/screenshots/conformity-tour-step2.png' });

    // Dismissing counts as "seen"...
    await page.locator('.driver-popover-close-btn').click();
    await expect(popover).toHaveCount(0);
    expect(await page.evaluate((k) => localStorage.getItem(k), TOUR_KEY)).toBe('done');

    // ...so a reload never nags again.
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await expect(popover).toHaveCount(0);
  });

  test('never auto-starts under automation (navigator.webdriver)', async ({ page }) => {
    // No impersonation: Playwright's real webdriver flag stays on. This is the
    // guarantee that keeps the rest of this suite tour-free.
    await installAssessmentMocks(page);
    await page.goto('/conformity/assessments/1');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Compliance journey')).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.locator('.driver-popover')).toHaveCount(0);
  });

  test('demo role: never forced, but available from the Help menu', async ({ page }) => {
    await impersonateHumanBrowser(page);
    await installAssessmentMocks(page, DEMO_SESSION);
    await page.goto('/conformity/assessments/1');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Compliance journey')).toBeVisible();

    // Not forced on the shared demo account...
    await page.waitForTimeout(1500);
    await expect(page.locator('.driver-popover')).toHaveCount(0);

    // ...but one click away when wanted.
    await page.getByTestId('help-menu').click();
    await page.getByTestId('help-tour').click();
    await expect(page.locator('.driver-popover')).toBeVisible();
    await expect(page.locator('.driver-popover')).toContainText(
      'Journey, grade, next best action',
    );
  });

  test('member: account-side "seen" suppresses auto-start on a fresh device', async ({
    page,
  }) => {
    // Fresh browser (empty localStorage), but the account already saw the
    // tour on another machine → never nag again.
    await impersonateHumanBrowser(page);
    await installAssessmentMocks(page, MEMBER_SESSION);
    await page.route('**/api/conformity/me', (route) =>
      route.fulfill(json(memberProfile(['workbench']))),
    );
    await page.goto('/conformity/assessments/1');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Compliance journey')).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.locator('.driver-popover')).toHaveCount(0);
  });

  test("member: a colleague's localStorage never hides the tour, and seeing it is recorded on the account", async ({
    page,
  }) => {
    await impersonateHumanBrowser(page);
    // Simulate a colleague's machine where the tour was already dismissed.
    await page.addInitScript(
      (k) => localStorage.setItem(k, 'done'),
      TOUR_KEY,
    );
    await installAssessmentMocks(page, MEMBER_SESSION);
    await page.route('**/api/conformity/me', (route) =>
      route.fulfill(json(memberProfile([]))),
    );
    let recordedTourId: string | null = null;
    await page.route('**/api/conformity/me/tours', (route) => {
      recordedTourId = (route.request().postDataJSON() as { tourId: string }).tourId;
      return route.fulfill(json(memberProfile(['workbench'])));
    });
    await page.goto('/conformity/assessments/1');

    // The account says "not seen" → auto-starts despite stale localStorage...
    const popover = page.locator('.driver-popover');
    await expect(popover).toBeVisible({ timeout: 10_000 });
    // ...and the open is persisted to the account, not just this browser.
    await expect.poll(() => recordedTourId).toBe('workbench');
  });

  test('demo role with a slow session lookup: still never auto-starts', async ({ page }) => {
    await impersonateHumanBrowser(page);
    await page.route('**/api/**', (route) => route.fulfill(json([])));
    await page.route('**/api/admin/session', async (route) => {
      // Session resolves well after the assessment data: the demo gate must
      // hold even while the role is still unknown.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill(json(DEMO_SESSION));
    });
    await page.route('**/api/conformity/assessments/1', (route) =>
      route.fulfill(json(ASSESSMENT_DETAIL)),
    );
    await page.goto('/conformity/assessments/1');
    await expect(page.getByText('Compliance journey')).toBeVisible({ timeout: 15_000 });

    // Wait past session resolution + the auto-start delay: still nothing.
    await page.waitForTimeout(2000);
    await expect(page.locator('.driver-popover')).toHaveCount(0);
  });
});

test.describe('portfolio tour', () => {
  const PORTFOLIO_WITH_WORK = {
    ...EMPTY_PORTFOLIO,
    totals: { products: 1, assessments: 1, notStarted: 0, inProgress: 1, blocked: 0, readyForReview: 0 },
    products: [
      {
        assessmentId: 1,
        productId: 1,
        productName: 'Test Gateway',
        manufacturerName: 'Acme',
        regulationKey: 'cra',
        readiness: 'in_progress',
        journeyStage: 'Gap assessment',
        journeyPct: 37,
        journeyDone: 3,
        journeyTotal: 8,
        grade: null,
        score: null,
        blockers: 0,
        highRiskGaps: 0,
        openRequirements: 2,
        openIncidents: 0,
        overdueDeadlines: 0,
        dueSoonDeadlines: 0,
        nextDeadlineAt: null,
        evidenceCoverage: 50,
        urgencyScore: 100,
        headline: '2 requirements open',
      },
    ],
  };

  async function installPortfolioMocks(page: Page, session: unknown) {
    await page.route('**/api/**', (route) => route.fulfill(json([])));
    await page.route('**/api/admin/session', (route) => route.fulfill(json(session)));
    await page.route('**/api/conformity/portfolio', (route) =>
      route.fulfill(json(PORTFOLIO_WITH_WORK)),
    );
  }

  test('replays from the Help menu on the command center', async ({ page }) => {
    // webdriver stays on → no auto-start; the Help menu must still work.
    await installPortfolioMocks(page, ADMIN_SESSION);
    await page.goto('/conformity/');
    await expect(page.getByTestId('triage-board')).toBeVisible();

    await page.getByTestId('help-menu').click();
    await page.getByTestId('help-tour').click();
    const popover = page.locator('.driver-popover');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('Portfolio posture');
  });

  test('demo role: never forced on the command center, but replayable', async ({ page }) => {
    await impersonateHumanBrowser(page);
    await installPortfolioMocks(page, DEMO_SESSION);
    await page.goto('/conformity/');
    await expect(page.getByTestId('triage-board')).toBeVisible();

    // Not forced on the shared demo account...
    await page.waitForTimeout(1500);
    await expect(page.locator('.driver-popover')).toHaveCount(0);

    // ...but manual replay from the Help menu always works.
    await page.getByTestId('help-menu').click();
    await page.getByTestId('help-tour').click();
    await expect(page.locator('.driver-popover')).toContainText('Portfolio posture');
  });
});

// ── Glossary ──────────────────────────────────────────────────────────────────

test.describe('glossary', () => {
  test('opens from the Help menu and separates statutory from workbench terms', async ({
    page,
  }) => {
    await installAssessmentMocks(page);
    await page.goto('/conformity/assessments/1');
    await expect(page.getByText('Compliance journey')).toBeVisible();

    await page.getByTestId('help-menu').click();
    await page.getByTestId('help-glossary').click();

    const dialog = page.getByTestId('glossary-dialog');
    await expect(dialog).toBeVisible();
    // Statutory terms carry their CRA citations.
    await expect(dialog.getByText('Statutory concepts')).toBeVisible();
    await expect(dialog.getByTestId('glossary-entry-incident-clocks')).toContainText('CRA Art. 14');
    // Workbench concepts are labelled as the app's own.
    await expect(dialog.getByText('Workbench concepts')).toBeVisible();
    await expect(dialog.getByTestId('glossary-entry-grade')).toContainText(
      'Answer quality, not workflow progress',
    );

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('inline term affordance explains journey vs grade and links to the full glossary', async ({
    page,
  }) => {
    await installAssessmentMocks(page);
    await page.goto('/conformity/assessments/1');

    await page.getByTestId('term-hint-journey').click();
    // Both sides of the journey-vs-grade distinction, inline.
    await expect(page.getByText(/Workflow position: how far this assessment/)).toBeVisible();
    await expect(page.getByText(/Answer quality, not workflow progress/)).toBeVisible();

    await page.getByTestId('term-hint-open-glossary').click();
    await expect(page.getByTestId('glossary-dialog')).toBeVisible();
  });

  test('readiness-ring hint explains grade + readiness and links to the full glossary', async ({
    page,
  }) => {
    await installAssessmentMocks(page);
    await page.goto('/conformity/assessments/1');

    await page.getByTestId('term-hint-grade').click();
    // Grade = answer quality; readiness = internal milestone, never a legal claim.
    await expect(page.getByText(/Answer quality, not workflow progress: an A–F score/)).toBeVisible();
    await expect(page.getByText(/it is not a legal declaration of conformity/)).toBeVisible();

    await page.getByTestId('term-hint-open-glossary').click();
    await expect(page.getByTestId('glossary-dialog')).toBeVisible();
  });

  test('scope and route badges in the assessment header explain their statutory terms', async ({
    page,
  }) => {
    await installAssessmentMocks(page);
    await page.goto('/conformity/assessments/1');

    // Class badge → scope & classification, with its CRA citation.
    await page.getByTestId('term-hint-scope').click();
    await expect(page.getByText(/product with digital elements/)).toBeVisible();
    await expect(page.getByText('CRA Art. 2 · Art. 7 & Annex III')).toBeVisible();
    await page.getByTestId('term-hint-open-glossary').click();
    await expect(page.getByTestId('glossary-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('glossary-dialog')).toHaveCount(0);
    await page.keyboard.press('Escape'); // close the popover too

    // Route badge → conformity route, with its CRA citation.
    await page.getByTestId('term-hint-route').click();
    await expect(page.getByText(/Module A \(internal control/)).toBeVisible();
    await expect(page.getByText('CRA Art. 32')).toBeVisible();
    await page.getByTestId('term-hint-open-glossary').click();
    await expect(page.getByTestId('glossary-dialog')).toBeVisible();
  });
});
