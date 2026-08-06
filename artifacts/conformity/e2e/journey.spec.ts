/**
 * Compliance-journey UI regression test.
 *
 * The assessment header now carries a "compliance journey" (workflow progress)
 * alongside a readiness ring (answer quality) and a single "next best action"
 * nudge. The credibility rule for this feature is that the two gauges stay
 * DISTINCT: a fully-travelled journey with unmet blockers must never read as
 * "done", and the readiness ring must surface blockers rather than hide them
 * behind a healthy-looking score. This test locks that behaviour in.
 *
 * It drives the real page through the AuthGate (session mocked as admin) against
 * fully mocked API responses, asserting three representative states:
 *   - blocked mid-flow  → ring shows the grade AND its blocker count; the nudge
 *     is the blocker (urgent) and routes to the gap assessment.
 *   - ready for review  → journey at 100%, ring at a passing grade, nudge is the
 *     "ready for internal review" milestone (explicitly not a legal declaration).
 *   - not scored yet    → ring shows the unscored placeholder, nudge sends the
 *     user to the scoping wizard.
 *
 * Every API call is mocked, so the test is self-contained (no API server / DB).
 */

import { test, expect, type Page } from '@playwright/test';

const AUTHED_SESSION = { authenticated: true, username: 'admin' };

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

/** A detail payload with the scope/class/route stages already travelled. */
function detail(over: {
  currentStage: string;
  classKey: string | null;
  routeKey: string | null;
  counts: {
    evaluationsTotal: number;
    evaluationsMet: number;
    evaluationsNotMet: number;
    evidenceCount: number;
    openIncidents: number;
  };
}) {
  return {
    assessment: {
      id: 1,
      productId: 1,
      regulationKey: 'cra',
      status: 'active',
      currentStage: over.currentStage,
      scopeResult: 'in_scope',
      classKey: over.classKey,
      routeKey: over.routeKey,
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
    className: over.classKey ? 'Class I' : null,
    routeName: over.routeKey ? 'Internal control' : null,
    counts: over.counts,
  };
}

function grade(over: {
  overallScore: number;
  overallGrade: string;
  blockerCount: number;
  artifactCompleteness: number;
}) {
  return {
    overallScore: over.overallScore,
    overallGrade: over.overallGrade,
    blockerCount: over.blockerCount,
    perTheme: [{ themeKey: 'security', themeName: 'Security', score: over.overallScore, grade: over.overallGrade }],
    perArtifact: [{ artifactType: 'technical_documentation', completeness: over.artifactCompleteness }],
    computedAt: '2025-02-01T00:00:00Z',
  };
}

function evalItem(over: { id: number; status: string; requirementRefCode: string; title: string }) {
  return {
    id: over.id,
    assessmentId: 1,
    regulationKey: 'cra',
    requirementRefCode: over.requirementRefCode,
    status: over.status,
    implementationNote: '',
    riskRating: null,
    owner: '',
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

interface MockOpts {
  detail: ReturnType<typeof detail>;
  grades: unknown[];
  evaluations?: unknown[];
  incidents?: unknown[];
  artifacts?: unknown[];
}

async function installMocks(page: Page, opts: MockOpts) {
  const json = (body: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

  // Lowest priority: swallow any other /api/* call (Playwright matches LIFO).
  await page.route('**/api/**', (route) => route.fulfill(json([])));

  await page.route('**/api/admin/session', (route) => route.fulfill(json(AUTHED_SESSION)));
  await page.route('**/api/conformity/assessments/1', (route) => route.fulfill(json(opts.detail)));
  await page.route('**/api/conformity/assessments/1/grades', (route) =>
    route.fulfill(json(opts.grades)),
  );
  await page.route('**/api/conformity/assessments/1/evaluations', (route) =>
    route.fulfill(json(opts.evaluations ?? [])),
  );
  await page.route('**/api/conformity/assessments/1/incidents', (route) =>
    route.fulfill(json(opts.incidents ?? [])),
  );
  await page.route('**/api/conformity/assessments/1/artifacts', (route) =>
    route.fulfill(json(opts.artifacts ?? [])),
  );
}

async function gotoAssessment(page: Page) {
  await page.goto('/conformity/assessments/1');
  await page.waitForLoadState('networkidle');
}

// ── Blocked mid-flow ──────────────────────────────────────────────────────────

test.describe('journey — blocked mid-flow', () => {
  test.beforeEach(async ({ page }) => {
    await installMocks(page, {
      detail: detail({
        currentStage: 'gap_assessment',
        classKey: 'class_i',
        routeKey: 'internal_control',
        counts: {
          evaluationsTotal: 9,
          evaluationsMet: 3,
          evaluationsNotMet: 1,
          evidenceCount: 2,
          openIncidents: 0,
        },
      }),
      grades: [grade({ overallScore: 42, overallGrade: 'D', blockerCount: 2, artifactCompleteness: 40 })],
      evaluations: [
        evalItem({ id: 1, status: 'not_met', requirementRefCode: 'BLK-1', title: 'Blocker requirement' }),
        evalItem({ id: 2, status: 'in_progress', requirementRefCode: 'OP-1', title: 'Open requirement' }),
      ],
    });
  });

  test('readiness ring surfaces the grade AND the blocker count', async ({ page }) => {
    await gotoAssessment(page);
    // The ring's accessible name carries score, grade, and — crucially — the
    // blocker count, so a healthy-looking ring can never hide open blockers.
    await expect(
      page.getByRole('img', { name: 'Readiness score 42 out of 100, grade D, 2 blockers' }),
    ).toBeVisible();
  });

  test('journey shows partial progress at the current (blocked) stage', async ({ page }) => {
    await gotoAssessment(page);
    await expect(page.getByText('Compliance journey')).toBeVisible();
    // 5 of 8 stages done (scope, classify, route, requirements, evidence).
    await expect(page.getByText('Step 6 of 8: Close gaps')).toBeVisible();
    await expect(page.getByText('63%')).toBeVisible();
  });

  test('the next-best-action nudge is the blocker and routes to the gaps tab', async ({ page }) => {
    await gotoAssessment(page);
    await expect(page.getByText('Next best action')).toBeVisible();
    await expect(page.getByText('BLK-1 — Blocker requirement').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go to gap assessment' })).toBeVisible();
    await page.screenshot({ path: 'test-results/journey-blocked.png', fullPage: true });
  });
});

// ── Ready for review ──────────────────────────────────────────────────────────

test.describe('journey — ready for review', () => {
  test.beforeEach(async ({ page }) => {
    await installMocks(page, {
      detail: detail({
        currentStage: 'complete',
        classKey: 'class_i',
        routeKey: 'internal_control',
        counts: {
          evaluationsTotal: 5,
          evaluationsMet: 5,
          evaluationsNotMet: 0,
          evidenceCount: 4,
          openIncidents: 0,
        },
      }),
      grades: [grade({ overallScore: 88, overallGrade: 'B', blockerCount: 0, artifactCompleteness: 100 })],
      evaluations: [
        evalItem({ id: 1, status: 'met', requirementRefCode: 'MET-1', title: 'Met one' }),
        evalItem({ id: 2, status: 'met', requirementRefCode: 'MET-2', title: 'Met two' }),
      ],
      artifacts: [
        {
          id: 1,
          assessmentId: 1,
          artifactType: 'technical_documentation',
          label: 'Technical documentation',
          status: 'final',
          sections: [{ key: 'purpose', label: 'Product purpose', body: 'x', complete: true }],
          completeness: 100,
          version: 1,
          generatedAt: '2025-02-01T00:00:00Z',
        },
      ],
    });
  });

  test('journey reaches 100% and the ring shows a passing grade without blockers', async ({ page }) => {
    await gotoAssessment(page);
    await expect(
      page.getByRole('img', { name: 'Readiness score 88 out of 100, grade B' }),
    ).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();
  });

  test('the milestone nudge appears and is framed as review, not legal certification', async ({ page }) => {
    await gotoAssessment(page);
    await expect(page.getByText('Ready for internal review')).toBeVisible();
    await expect(page.getByText(/not a legal declaration/i)).toBeVisible();
    // Scope to the header nudge — the "all caught up" actions card below also
    // offers a (legitimate) "View readiness" button.
    await expect(page.locator('header').getByRole('button', { name: 'View readiness' })).toBeVisible();
    await page.screenshot({ path: 'test-results/journey-ready.png', fullPage: true });
  });
});

// ── Not scored yet ────────────────────────────────────────────────────────────

test('journey — unscored assessment shows the placeholder ring and wizard nudge', async ({ page }) => {
  await installMocks(page, {
    detail: detail({
      currentStage: 'scoping',
      classKey: null,
      routeKey: null,
      counts: {
        evaluationsTotal: 0,
        evaluationsMet: 0,
        evaluationsNotMet: 0,
        evidenceCount: 0,
        openIncidents: 0,
      },
    }),
    grades: [],
    evaluations: [],
  });
  await gotoAssessment(page);
  await expect(page.getByRole('img', { name: 'Readiness not scored yet' })).toBeVisible();
  await expect(page.getByText('Start with the scoping wizard')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open wizard' })).toBeVisible();
  await page.screenshot({ path: 'test-results/journey-unscored.png', fullPage: true });
});

// ── Open incident with every statutory deadline met ───────────────────────────
//
// The trap this guards against: a healthy grade (A, no blockers) plus completed
// requirements and documents would qualify for the "ready for review" milestone,
// yet an incident is still open. Because the incident's deadline tasks are all
// done, it produces no deadline item — so a naive worklist would read "all
// caught up" while the journey says "not ready". The journey and the panel must
// agree: the open incident stays actionable and readiness stays withheld.

test.describe('journey — open incident with every deadline met', () => {
  test.beforeEach(async ({ page }) => {
    await installMocks(page, {
      detail: detail({
        currentStage: 'complete',
        classKey: 'class_i',
        routeKey: 'internal_control',
        counts: {
          evaluationsTotal: 3,
          evaluationsMet: 3,
          evaluationsNotMet: 0,
          evidenceCount: 2,
          openIncidents: 1,
        },
      }),
      grades: [grade({ overallScore: 90, overallGrade: 'A', blockerCount: 0, artifactCompleteness: 100 })],
      evaluations: [
        evalItem({ id: 1, status: 'met', requirementRefCode: 'MET-1', title: 'Met one' }),
        evalItem({ id: 2, status: 'met', requirementRefCode: 'MET-2', title: 'Met two' }),
        evalItem({ id: 3, status: 'met', requirementRefCode: 'MET-3', title: 'Met three' }),
      ],
      artifacts: [
        {
          id: 1,
          assessmentId: 1,
          artifactType: 'technical_documentation',
          label: 'Technical documentation',
          status: 'final',
          sections: [{ key: 'purpose', label: 'Product purpose', body: 'x', complete: true }],
          completeness: 100,
          version: 1,
          generatedAt: '2025-02-01T00:00:00Z',
        },
      ],
      incidents: [
        {
          id: 1,
          assessmentId: 1,
          title: 'Firmware CVE-2025-0001',
          description: '',
          kind: 'exploited_vulnerability',
          severity: 'high',
          detectedAt: '2025-01-01T00:00:00Z',
          earlyWarningDueAt: '2025-01-02T00:00:00Z',
          earlyWarningDoneAt: '2025-01-02T00:00:00Z',
          notificationDueAt: '2025-01-05T00:00:00Z',
          notificationDoneAt: '2025-01-05T00:00:00Z',
          finalReportDueAt: '2025-01-10T00:00:00Z',
          finalReportDoneAt: '2025-01-10T00:00:00Z',
          correctiveAvailableAt: null,
          memberStates: '',
          suspectedMalicious: false,
          exploitNature: '',
          correctiveMeasures: '',
          userMitigations: '',
          threatActorInfo: '',
          sensitive: false,
          status: 'open',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
    });
  });

  test('does not read as ready, and the panel is not "all caught up"', async ({ page }) => {
    await gotoAssessment(page);
    // Grade alone would qualify (A, no blockers) — but the open incident means
    // the workflow is not done, so the milestone must stay hidden.
    await expect(page.getByText('Ready for internal review')).toHaveCount(0);
    await expect(page.getByText("You're all caught up.")).toHaveCount(0);
    // The open incident is surfaced as actionable work.
    await expect(page.getByRole('heading', { name: 'Open incidents', exact: true })).toBeVisible();
    await expect(page.getByText('Firmware CVE-2025-0001').first()).toBeVisible();
  });

  test('the nudge points the assessor at the open incident', async ({ page }) => {
    await gotoAssessment(page);
    await expect(
      page.locator('header').getByRole('button', { name: 'Go to incidents' }),
    ).toBeVisible();
    await page.screenshot({ path: 'test-results/journey-open-incident.png', fullPage: true });
  });
});
