/**
 * Portfolio command-center regression test.
 *
 * The dashboard is dual-purpose: authenticated admins get the operational
 * command center (a portfolio rollup ranked by urgency); everyone else gets the
 * public reference overview. The command center is a compliance triage surface,
 * so the credibility rules matter:
 *   - triage is ordered most-urgent-first and "ready" sinks to the bottom;
 *   - blockers / overdue statutory deadlines are surfaced, never hidden;
 *   - journey progress (posture) is shown separately from grade (answer quality);
 *   - coverage with no denominator reads "n/a", never a fabricated 0% / 100%;
 *   - on a failed rollup the view shows an error, never stale or guessed numbers.
 *
 * Every API call is mocked, so the test is self-contained (no API server / DB).
 * The portfolio endpoint is admin-only, so the authed-session mock is what makes
 * the command center render at all.
 */

import { test, expect, type Page } from '@playwright/test';

const DAY = 24 * 60 * 60 * 1000;
const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();

const AUTHED_SESSION = { authenticated: true, username: 'admin' };
const ANON_SESSION = { authenticated: false };

// Products are returned already ranked by the server (most urgent first). Delta
// (ready) must trail everything despite being "complete"; Epsilon (not started)
// sits above it but below all active work.
const PORTFOLIO = {
  generatedAt: iso(0),
  totals: { products: 5, assessments: 5, notStarted: 1, inProgress: 1, blocked: 2, readyForReview: 1 },
  risk: { openBlockers: 1, highRiskGaps: 1, openIncidents: 2, overdueDeadlines: 1, dueSoonDeadlines: 1, silencedDeadlines: 1 },
  evidence: {
    requirementCoverage: 60,
    evidenceCoverage: 40,
    documentationCoverage: null, // nothing drafted → must render "n/a"
    totalRequirements: 20,
    resolvedRequirements: 12,
    applicableRequirements: 15,
    evidencedRequirements: 6,
    totalSections: 0,
    completeSections: 0,
  },
  grades: [
    { grade: 'A', count: 1 },
    { grade: 'F', count: 1 },
    { grade: 'ungraded', count: 3 },
  ],
  deadlines: [
    {
      assessmentId: 2,
      productId: 2,
      productName: 'Beta Router',
      regulationKey: 'cra',
      incidentTitle: 'Exploited CVE-2026-1',
      incidentKind: 'exploited_vulnerability',
      severity: 'critical',
      kind: 'early_warning',
      dueAt: iso(-3 * DAY),
      overdue: true,
      alertsSilenced: true, // reminders exhausted — nobody will be nudged again
    },
    {
      assessmentId: 4,
      productId: 4,
      productName: 'Gamma Sensor',
      regulationKey: 'machinery',
      incidentTitle: 'Field failure',
      incidentKind: 'severe_incident',
      severity: 'high',
      kind: 'notification',
      dueAt: iso(5 * DAY),
      overdue: false,
      alertsSilenced: false,
    },
  ],
  products: [
    {
      assessmentId: 2,
      productId: 2,
      productName: 'Beta Router',
      manufacturerName: 'Beta Co',
      regulationKey: 'cra',
      readiness: 'blocked',
      journeyStage: 'Evidence',
      journeyPct: 50,
      journeyDone: 4,
      journeyTotal: 8,
      grade: null,
      score: null,
      blockers: 0,
      highRiskGaps: 0,
      openRequirements: 0,
      openIncidents: 1,
      overdueDeadlines: 1,
      dueSoonDeadlines: 0,
      silencedDeadlines: 1,
      nextDeadlineAt: iso(-3 * DAY),
      evidenceCoverage: 20,
      urgencyScore: 1080,
      headline: '1 statutory deadline overdue — alerting stopped on 1',
    },
    {
      assessmentId: 1,
      productId: 1,
      productName: 'Alpha Gateway',
      manufacturerName: 'Alpha Inc',
      regulationKey: 'ai_act',
      readiness: 'blocked',
      journeyStage: 'Gap assessment',
      journeyPct: 37,
      journeyDone: 3,
      journeyTotal: 8,
      grade: null,
      score: null,
      blockers: 1,
      highRiskGaps: 1,
      openRequirements: 2,
      openIncidents: 0,
      overdueDeadlines: 0,
      dueSoonDeadlines: 0,
      silencedDeadlines: 0,
      nextDeadlineAt: null,
      evidenceCoverage: 50,
      urgencyScore: 224,
      headline: '1 blocker to resolve',
    },
    {
      assessmentId: 4,
      productId: 4,
      productName: 'Gamma Sensor',
      manufacturerName: 'Gamma Ltd',
      regulationKey: 'machinery',
      readiness: 'in_progress',
      journeyStage: 'Requirements',
      journeyPct: 62,
      journeyDone: 5,
      journeyTotal: 8,
      grade: 'F',
      score: 35,
      blockers: 0,
      highRiskGaps: 0,
      openRequirements: 1,
      openIncidents: 1,
      overdueDeadlines: 0,
      dueSoonDeadlines: 1,
      silencedDeadlines: 0,
      nextDeadlineAt: iso(5 * DAY),
      evidenceCoverage: null,
      urgencyScore: 122,
      headline: '1 statutory deadline due soon',
    },
    {
      assessmentId: 6,
      productId: 6,
      productName: 'Epsilon Meter',
      manufacturerName: 'Epsilon SA',
      regulationKey: 'nis2',
      readiness: 'not_started',
      journeyStage: 'Scope',
      journeyPct: 0,
      journeyDone: 0,
      journeyTotal: 8,
      grade: null,
      score: null,
      blockers: 0,
      highRiskGaps: 0,
      openRequirements: 0,
      openIncidents: 0,
      overdueDeadlines: 0,
      dueSoonDeadlines: 0,
      silencedDeadlines: 0,
      nextDeadlineAt: null,
      evidenceCoverage: null,
      urgencyScore: 0,
      headline: 'Not started',
    },
    {
      assessmentId: 5,
      productId: 5,
      productName: 'Delta Hub',
      manufacturerName: 'Delta GmbH',
      regulationKey: 'iec_62443',
      readiness: 'ready',
      journeyStage: 'Ready for review',
      journeyPct: 100,
      journeyDone: 8,
      journeyTotal: 8,
      grade: 'A',
      score: 95,
      blockers: 0,
      highRiskGaps: 0,
      openRequirements: 0,
      openIncidents: 0,
      overdueDeadlines: 0,
      dueSoonDeadlines: 0,
      silencedDeadlines: 0,
      nextDeadlineAt: null,
      evidenceCoverage: 100,
      urgencyScore: -1000,
      headline: 'Ready for internal review',
    },
  ],
};

const SUMMARY = {
  regulationCount: 5,
  requirementCount: 100,
  themeCount: 8,
  mappingCount: 40,
  regulations: [{ key: 'cra', name: 'Cyber Resilience Act', shortName: 'CRA', requirementCount: 40 }],
  keyDates: [{ date: '2026-12-11', label: 'CRA main obligations apply', regulationKey: 'cra' }],
};

const json = (body: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

async function installMocks(
  page: Page,
  opts: { session?: unknown; portfolio?: unknown; portfolioStatus?: number } = {},
) {
  // Lowest priority catch-all (Playwright matches LIFO).
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(opts.session ?? AUTHED_SESSION)));
  await page.route('**/api/conformity/summary', (route) => route.fulfill(json(SUMMARY)));
  await page.route('**/api/conformity/portfolio', (route) => {
    if (opts.portfolioStatus && opts.portfolioStatus !== 200) {
      return route.fulfill({ status: opts.portfolioStatus, contentType: 'application/json', body: '{"error":"boom"}' });
    }
    return route.fulfill(json(opts.portfolio ?? PORTFOLIO));
  });
}

async function gotoDashboard(page: Page) {
  await page.goto('/conformity/');
  await page.waitForLoadState('networkidle');
}

// ── Authed command center ─────────────────────────────────────────────────────

test.describe('authed command center', () => {
  test.beforeEach(async ({ page }) => {
    await installMocks(page);
    await gotoDashboard(page);
    await expect(page.getByRole('heading', { name: 'Conformity operations' })).toBeVisible();
  });

  test('metric strip reflects the rollup (needs-action = overdue + blockers)', async ({ page }) => {
    const strip = page.locator('div', { has: page.getByText('Active assessments', { exact: true }) }).first();
    await expect(page.getByText('Active assessments')).toBeVisible();
    await expect(strip).toContainText('5');
    // Needs action now = 1 overdue + 1 blocker = 2.
    const needs = page.locator('div').filter({ hasText: /^Needs action now/ }).first();
    await expect(needs).toContainText('2');
    await expect(page.getByText('1 overdue · 1 blocker')).toBeVisible();
    // Evidence coverage headline metric.
    await expect(page.getByText('Evidence coverage').first()).toBeVisible();
  });

  test('posture band counts each readiness state', async ({ page }) => {
    for (const [label, count] of [
      ['Blocked', '2'],
      ['In progress', '1'],
      ['Not started', '1'],
      ['Ready', '1'],
    ] as const) {
      const seg = page.locator('div.flex.items-center.gap-2', { hasText: label }).first();
      await expect(seg).toContainText(count);
    }
  });

  test('deadline horizon shows one bead per open incident, overdue + due-soon summarised', async ({ page }) => {
    await expect(page.getByTestId('deadline-bead')).toHaveCount(2);
    const horizon = page.getByTestId('deadline-horizon');
    await expect(horizon.getByText('1 overdue')).toBeVisible();
    await expect(horizon.getByText('1 due within 14 days')).toBeVisible();
    await expect(horizon.getByText('2 live clocks')).toBeVisible();
  });

  test('overdue clocks with exhausted reminders are flagged "alerting stopped"', async ({ page }) => {
    // Rollup legend: exactly the silenced count, sourced from the API flag.
    const horizon = page.getByTestId('deadline-horizon');
    await expect(horizon.getByTestId('silenced-count')).toContainText('1 alerting stopped');
    // Triage row for the silenced assessment carries the chip + headline suffix.
    const top = page.getByTestId('triage-row').nth(0);
    await expect(top).toContainText('alerting stopped on 1');
  });

  test('triage board ranks most-urgent-first and ready sinks last', async ({ page }) => {
    const rows = page.getByTestId('triage-row');
    await expect(rows).toHaveCount(5);
    const names = await rows.locator('h3').allInnerTexts();
    expect(names).toEqual(['Beta Router', 'Alpha Gateway', 'Gamma Sensor', 'Epsilon Meter', 'Delta Hub']);

    // Top row = the overdue-deadline assessment; carries its data-derived headline.
    await expect(rows.nth(0)).toContainText('1 statutory deadline overdue');
    await expect(rows.nth(0)).toContainText('1 overdue');
    await expect(rows.nth(0)).toHaveAttribute('href', /\/assessments\/2$/);

    // Bottom row = ready; explicitly an internal-review milestone, not certification.
    await expect(rows.nth(4)).toContainText('Ready for internal review');
    await expect(rows.nth(4)).toContainText('Ready for review');
  });

  test('grade (quality) is shown separately from journey (progress)', async ({ page }) => {
    const rows = page.getByTestId('triage-row');
    // Delta is graded A; Beta is ungraded → shows the em dash, never a fake grade.
    await expect(rows.nth(4)).toContainText('A');
    await expect(rows.nth(0)).toContainText('—');
    // The grade panel labels itself as answer quality, distinct from progress.
    await expect(page.getByText(/grade reflects answer quality, not workflow progress/i)).toBeVisible();
  });

  test('deadline-horizon title hint explains the horizon + statutory clocks, links to the glossary', async ({ page }) => {
    await page.getByTestId('term-hint-deadline-horizon').click();
    // The workbench visualisation and the underlying Art. 14 legal duty, together.
    await expect(page.getByText(/plotted around 'now' — anything left of now is overdue/)).toBeVisible();
    await expect(page.getByText(/early warning within 24 hours of awareness/)).toBeVisible();
    await expect(page.getByText('CRA Art. 14', { exact: true })).toBeVisible();

    await page.getByTestId('term-hint-open-glossary').click();
    await expect(page.getByTestId('glossary-dialog')).toBeVisible();
  });

  test('posture-band labels explain readiness states and link to the glossary', async ({ page }) => {
    // Non-ready segments (Blocked / In progress / Not started) share the posture hint.
    await page.getByTestId('term-hint-posture').first().click();
    await expect(page.getByText(/Blocked \(open blockers or overdue statutory deadlines\)/)).toBeVisible();
    await page.getByTestId('term-hint-open-glossary').click();
    await expect(page.getByTestId('glossary-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('glossary-dialog')).toHaveCount(0);
    await page.keyboard.press('Escape'); // close the popover too

    // The Ready segment leads with the readiness milestone definition.
    await page.getByTestId('term-hint-readiness').click();
    await expect(page.getByText(/it is not a legal declaration of conformity/)).toBeVisible();
    await page.getByTestId('term-hint-open-glossary').click();
    await expect(page.getByTestId('glossary-dialog')).toBeVisible();
  });

  test('coverage with no denominator renders n/a, never a fabricated number', async ({ page }) => {
    // Documentation coverage has 0 sections → "n/a" + honest empty subtext.
    await expect(page.getByText('No document sections drafted yet')).toBeVisible();
    // Gamma has no applicable requirements evidenced → its row evidence reads n/a.
    await expect(page.getByTestId('triage-row').nth(2)).toContainText('n/a');
  });
});

// ── Unauthed public overview ──────────────────────────────────────────────────

test('unauthenticated visitors get the public overview + sign-in prompt, not the command center', async ({ page }) => {
  await installMocks(page, { session: ANON_SESSION });
  await gotoDashboard(page);

  await expect(page.getByRole('heading', { name: 'Portfolio Overview' })).toBeVisible();
  await expect(page.getByText('Operational command center')).toBeVisible();
  // The operational view and its triage board must NOT be exposed to anon users.
  await expect(page.getByRole('heading', { name: 'Conformity operations' })).toHaveCount(0);
  await expect(page.getByTestId('triage-board')).toHaveCount(0);
});

// ── Failure honesty ───────────────────────────────────────────────────────────

test('a failed rollup shows an error card, never stale or guessed numbers', async ({ page }) => {
  await installMocks(page, { portfolioStatus: 500 });
  await gotoDashboard(page);

  await expect(page.getByText("Couldn't load the command center")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('triage-board')).toHaveCount(0);
  await expect(page.getByText('Conformity operations')).toHaveCount(0);
});

test('an empty portfolio shows an honest empty state', async ({ page }) => {
  await installMocks(page, {
    portfolio: {
      ...PORTFOLIO,
      totals: { products: 0, assessments: 0, notStarted: 0, inProgress: 0, blocked: 0, readyForReview: 0 },
      products: [],
      deadlines: [],
      grades: [],
    },
  });
  await gotoDashboard(page);

  await expect(page.getByText('No assessments yet')).toBeVisible();
  await expect(page.getByTestId('triage-board')).toHaveCount(0);
});
