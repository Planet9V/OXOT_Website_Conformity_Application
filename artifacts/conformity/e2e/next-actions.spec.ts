/**
 * Next-actions bucketing regression test.
 *
 * The assessment "Next actions" tab (the default view) computes its priority
 * buckets entirely client-side from evaluations + incidents + generated
 * documents. It is a compliance tool, so a silent "you're all caught up" while
 * real work remains is a serious failure. Two subtle bugs were already fixed —
 * "partial" evaluations being dropped, and rounded-day math misfiling incident
 * deadlines near the overdue / 14-day boundaries — but nothing locked the
 * behaviour in. This test does.
 *
 * It drives the real component through the AuthGate (session mocked as an
 * admin) and asserts, against fully mocked API responses:
 *   - status → bucket mapping (not_met → Blockers; high/critical + open →
 *     High-risk gaps; in_progress / partial / not_started → Open requirements;
 *     met & not_applicable never appear anywhere).
 *   - incident deadlines classify correctly at the boundaries (overdue by a few
 *     hours → Overdue, ~14.5 days out → NOT due soon) and lists sort by urgency.
 *   - when any of the three queries errors, the dedicated error card renders
 *     instead of the "no requirements" / "all caught up" states.
 *
 * Every API call is mocked, so the test is self-contained (no API server / DB).
 */

import { test, expect, type Page, type Route } from '@playwright/test';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();
const FAR_FUTURE = iso(365 * DAY);

// ── Fixtures ─────────────────────────────────────────────────────────────────

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

const ASSESSMENT_DETAIL = {
  assessment: {
    id: 1,
    productId: 1,
    regulationKey: 'cra',
    status: 'active',
    currentStage: 'gap_assessment',
    scopeResult: 'in_scope',
    classKey: null,
    routeKey: null,
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
  className: null,
  routeName: null,
  counts: {
    evaluationsTotal: 9,
    evaluationsMet: 1,
    evaluationsNotMet: 1,
    evidenceCount: 0,
    openIncidents: 0,
  },
};

function evalItem(over: {
  id: number;
  status: string;
  riskRating?: string | null;
  requirementRefCode: string;
  title: string;
}) {
  return {
    id: over.id,
    assessmentId: 1,
    regulationKey: 'cra',
    requirementRefCode: over.requirementRefCode,
    status: over.status,
    implementationNote: '',
    riskRating: over.riskRating ?? null,
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

/**
 * Build an incident whose *next pending* stage is the early-warning
 * notification, due at `dueOffsetMs` from now. The later stages are pushed far
 * into the future so the early-warning stage is unambiguously the next one.
 */
function incidentDue(id: number, title: string, dueOffsetMs: number, status = 'open') {
  return {
    id,
    assessmentId: 1,
    title,
    description: '',
    kind: 'exploited_vulnerability',
    severity: 'high',
    detectedAt: iso(-30 * DAY),
    earlyWarningDueAt: iso(dueOffsetMs),
    earlyWarningDoneAt: null,
    notificationDueAt: FAR_FUTURE,
    notificationDoneAt: null,
    finalReportDueAt: FAR_FUTURE,
    finalReportDoneAt: null,
    correctiveAvailableAt: null,
    memberStates: '',
    suspectedMalicious: false,
    exploitNature: '',
    correctiveMeasures: '',
    userMitigations: '',
    threatActorInfo: '',
    sensitive: false,
    status,
    createdAt: iso(-30 * DAY),
    updatedAt: iso(-30 * DAY),
  };
}

/**
 * Build a generated document (artifact) with the given sections. `complete`
 * on each section drives whether it counts toward the "Documentation to
 * finish" bucket.
 */
function artifactItem(over: {
  id: number;
  label: string;
  sections: { key: string; label: string; complete: boolean }[];
}) {
  return {
    id: over.id,
    assessmentId: 1,
    artifactType: 'technical_documentation',
    label: over.label,
    status: 'draft',
    sections: over.sections.map((s) => ({ body: '', ...s })),
    completeness: 0,
    version: 1,
    generatedAt: iso(-1 * DAY),
  };
}

interface MockOpts {
  evaluations?: unknown[];
  incidents?: unknown[];
  artifacts?: unknown[];
  /** Force a 500 on one of the three list endpoints. */
  errorOn?: 'evaluations' | 'incidents' | 'artifacts';
}

async function installMocks(page: Page, opts: MockOpts) {
  const json = (body: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
  const fail = (route: Route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"boom"}' });

  // Lowest priority: swallow any other /api/* call (Playwright matches LIFO).
  await page.route('**/api/**', (route) => route.fulfill(json([])));

  await page.route('**/api/admin/session', (route) => route.fulfill(json(AUTHED_SESSION)));
  await page.route('**/api/conformity/assessments/1', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );

  await page.route('**/api/conformity/assessments/1/evaluations', (route) =>
    opts.errorOn === 'evaluations' ? fail(route) : route.fulfill(json(opts.evaluations ?? [])),
  );
  await page.route('**/api/conformity/assessments/1/incidents', (route) =>
    opts.errorOn === 'incidents' ? fail(route) : route.fulfill(json(opts.incidents ?? [])),
  );
  await page.route('**/api/conformity/assessments/1/artifacts', (route) =>
    opts.errorOn === 'artifacts' ? fail(route) : route.fulfill(json(opts.artifacts ?? [])),
  );
}

/** Locate a bucket card by its heading, so assertions are scoped to one group. */
function group(page: Page, label: string) {
  return page.locator('div.overflow-hidden', {
    has: page.getByRole('heading', { name: label, exact: true }),
  });
}

async function gotoActions(page: Page) {
  await page.goto('/conformity/assessments/1');
  await page.waitForLoadState('networkidle');
}

// ── Status → bucket mapping ───────────────────────────────────────────────────

test.describe('status → bucket mapping', () => {
  test.beforeEach(async ({ page }) => {
    await installMocks(page, {
      evaluations: [
        evalItem({ id: 1, status: 'not_met', requirementRefCode: 'BLK-1', title: 'Blocker requirement' }),
        evalItem({ id: 2, status: 'in_progress', riskRating: 'high', requirementRefCode: 'HR-1', title: 'High risk open' }),
        evalItem({ id: 3, status: 'partial', riskRating: 'critical', requirementRefCode: 'HR-2', title: 'Critical partial' }),
        evalItem({ id: 4, status: 'in_progress', requirementRefCode: 'OP-1', title: 'Open in progress' }),
        evalItem({ id: 5, status: 'partial', requirementRefCode: 'OP-2', title: 'Open partial' }),
        evalItem({ id: 6, status: 'not_started', requirementRefCode: 'OP-3', title: 'Open not started' }),
        evalItem({ id: 7, status: 'met', requirementRefCode: 'MET-1', title: 'Met requirement' }),
        evalItem({ id: 8, status: 'not_applicable', requirementRefCode: 'NA-1', title: 'NA requirement' }),
        // high risk BUT terminal — terminal wins, must not surface anywhere.
        evalItem({ id: 9, status: 'met', riskRating: 'critical', requirementRefCode: 'HRMET-1', title: 'High risk but met' }),
      ],
    });
  });

  test('not_met lands in Blockers', async ({ page }) => {
    await gotoActions(page);
    const g = group(page, 'Blockers');
    await expect(g).toBeVisible();
    await expect(g.getByText('BLK-1 — Blocker requirement')).toBeVisible();
    await expect(g.getByRole('button')).toHaveCount(1);
  });

  test('high/critical + still-open land in High-risk gaps', async ({ page }) => {
    await gotoActions(page);
    const g = group(page, 'High-risk gaps');
    await expect(g).toBeVisible();
    await expect(g.getByText('HR-1 — High risk open')).toBeVisible();
    await expect(g.getByText('HR-2 — Critical partial')).toBeVisible();
    await expect(g.getByRole('button')).toHaveCount(2);
  });

  test('in_progress / partial / not_started (low risk) land in Open requirements', async ({ page }) => {
    await gotoActions(page);
    const g = group(page, 'Open requirements');
    await expect(g).toBeVisible();
    await expect(g.getByText('OP-1 — Open in progress')).toBeVisible();
    await expect(g.getByText('OP-2 — Open partial')).toBeVisible();
    await expect(g.getByText('OP-3 — Open not started')).toBeVisible();
    await expect(g.getByRole('button')).toHaveCount(3);
  });

  test('met & not_applicable never appear anywhere (incl. high-risk-but-met)', async ({ page }) => {
    await gotoActions(page);
    // Wait for the list to render so these assertions run against real content.
    await expect(group(page, 'Blockers')).toBeVisible();
    await expect(page.getByText('MET-1 — Met requirement')).toHaveCount(0);
    await expect(page.getByText('NA-1 — NA requirement')).toHaveCount(0);
    await expect(page.getByText('HRMET-1 — High risk but met')).toHaveCount(0);
    // And the all-caught-up state must NOT show while work remains.
    await expect(page.getByText("You're all caught up.")).toHaveCount(0);
  });
});

// ── Incident deadline boundaries + sort order ─────────────────────────────────

test.describe('incident deadline boundaries', () => {
  test.beforeEach(async ({ page }) => {
    await installMocks(page, {
      // One met evaluation keeps the list non-empty without contributing a group.
      evaluations: [evalItem({ id: 100, status: 'met', requirementRefCode: 'MET-9', title: 'Met' })],
      incidents: [
        incidentDue(1, 'Overdue hours', -3 * HOUR), // overdue by a few hours
        incidentDue(2, 'Overdue days', -2 * DAY), // more overdue
        incidentDue(3, 'Boundary out', 14.5 * DAY), // just past 14 days → NOT due soon
        incidentDue(4, 'Due soon near', 5 * DAY),
        incidentDue(5, 'Due soon far', 10 * DAY),
        incidentDue(6, 'Resolved', -1 * DAY, 'resolved'), // skipped entirely
      ],
    });
  });

  test('an item overdue by a few hours lands in Overdue (not "due in 0 days")', async ({ page }) => {
    await gotoActions(page);
    const g = group(page, 'Overdue deadlines');
    await expect(g).toBeVisible();
    // The row (button) for this incident must read "Overdue by ..." in its
    // detail line — never "Due in 0 days".
    const row = g.getByRole('button').filter({ hasText: 'Overdue hours' });
    await expect(row).toBeVisible();
    await expect(row).toContainText('Overdue by');
    await expect(row).not.toContainText('Due in 0 day');
  });

  test('~14.5 days out is NOT due soon, but still surfaces as an open incident', async ({ page }) => {
    await gotoActions(page);
    await expect(group(page, 'Deadlines due soon')).toBeVisible();
    // Too far out for the deadline bucket...
    await expect(page.getByText('Early-warning notification — Boundary out')).toHaveCount(0);
    // ...yet the incident is still open, so it must appear as open work — an open
    // incident is never allowed to silently drop out of the worklist.
    const open = group(page, 'Open incidents');
    await expect(open).toBeVisible();
    await expect(open.getByText('Boundary out')).toBeVisible();
  });

  test('overdue list sorts most-overdue first', async ({ page }) => {
    await gotoActions(page);
    const titles = await group(page, 'Overdue deadlines')
      .locator('.text-sm.font-medium')
      .allInnerTexts();
    expect(titles).toEqual([
      'Early-warning notification — Overdue days', // -2 days (most overdue)
      'Early-warning notification — Overdue hours', // -3 hours
    ]);
  });

  test('due-soon list sorts soonest first, resolved excluded', async ({ page }) => {
    await gotoActions(page);
    const titles = await group(page, 'Deadlines due soon')
      .locator('.text-sm.font-medium')
      .allInnerTexts();
    expect(titles).toEqual([
      'Early-warning notification — Due soon near', // +5 days
      'Early-warning notification — Due soon far', // +10 days
    ]);
    await expect(page.getByText('Early-warning notification — Resolved')).toHaveCount(0);
  });
});

// ── Error precedence over empty / all-caught-up ───────────────────────────────

test.describe('query errors surface the error card', () => {
  for (const errorOn of ['evaluations', 'incidents', 'artifacts'] as const) {
    test(`${errorOn} query failure renders the error card, not "all caught up"`, async ({ page }) => {
      await installMocks(page, { errorOn });
      await gotoActions(page);
      await expect(page.getByText("Couldn't load the action list.")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText("You're all caught up.")).toHaveCount(0);
      await expect(page.getByText('No requirements to act on yet.')).toHaveCount(0);
    });
  }
});

// ── Documentation-to-finish bucket ────────────────────────────────────────────

test.describe('documentation-to-finish bucket', () => {
  test.beforeEach(async ({ page }) => {
    await installMocks(page, {
      // A single terminal evaluation keeps the requirement list non-empty (so we
      // never hit the "no requirements — run the wizard" prompt) while
      // contributing no actionable group of its own.
      evaluations: [evalItem({ id: 200, status: 'met', requirementRefCode: 'MET-D', title: 'Met' })],
      artifacts: [
        artifactItem({
          id: 1,
          label: 'Technical documentation',
          sections: [
            { key: 'purpose', label: 'Product purpose', complete: true },
            { key: 'risk', label: 'Risk assessment', complete: false },
            { key: 'sbom', label: 'Software bill of materials', complete: false },
          ],
        }),
        artifactItem({
          id: 2,
          label: 'EU declaration of conformity',
          sections: [
            { key: 'decl', label: 'Declaration statement', complete: true },
            { key: 'sig', label: 'Authorised signature', complete: true },
          ],
        }),
      ],
    });
  });

  test('a document with incomplete sections shows the count and section labels', async ({ page }) => {
    await gotoActions(page);
    const g = group(page, 'Documentation to finish');
    await expect(g).toBeVisible();
    const row = g.getByRole('button').filter({ hasText: 'Technical documentation' });
    await expect(row).toBeVisible();
    // Two of the three sections are incomplete → correct count, and the detail
    // line lists exactly those two section labels.
    await expect(row).toContainText('2 sections to complete');
    await expect(row).toContainText('Risk assessment');
    await expect(row).toContainText('Software bill of materials');
    // Only the incomplete document produces a row (no "+N more" button).
    await expect(g.getByRole('button')).toHaveCount(1);
  });

  test('a fully-complete document never appears in the bucket', async ({ page }) => {
    await gotoActions(page);
    // Wait for the bucket to render so this assertion runs against real content.
    await expect(group(page, 'Documentation to finish')).toBeVisible();
    await expect(page.getByText('EU declaration of conformity')).toHaveCount(0);
  });

  test('shows the docs bucket (not "all caught up") when only doc work remains', async ({ page }) => {
    await gotoActions(page);
    await expect(group(page, 'Documentation to finish')).toBeVisible();
    // No evaluation/incident buckets exist, but real doc work remains, so the
    // "all caught up" clear-state must NOT appear.
    await expect(page.getByText("You're all caught up.")).toHaveCount(0);
    await expect(group(page, 'Blockers')).toHaveCount(0);
    await expect(group(page, 'Open requirements')).toHaveCount(0);
    await expect(group(page, 'Overdue deadlines')).toHaveCount(0);
  });
});

// ── Genuinely clear state (only met / not_applicable, no incidents) ───────────

test('all-caught-up shows only when nothing is actionable', async ({ page }) => {
  await installMocks(page, {
    evaluations: [
      evalItem({ id: 1, status: 'met', requirementRefCode: 'MET-1', title: 'Met' }),
      evalItem({ id: 2, status: 'not_applicable', requirementRefCode: 'NA-1', title: 'NA' }),
    ],
  });
  await gotoActions(page);
  await expect(page.getByText("You're all caught up.")).toBeVisible();
});
