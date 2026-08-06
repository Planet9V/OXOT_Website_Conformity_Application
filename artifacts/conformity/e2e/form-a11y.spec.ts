/**
 * Accessible-name sweep over the main Conformity workbench pages.
 *
 * Mirrors artifacts/oxot-web/e2e/admin-form-a11y.spec.ts: each route is
 * visited with a mocked authenticated admin session (established gated-page
 * pattern), and every visible form control must expose an accessible name —
 * via label[for]/wrapping label, aria-label, aria-labelledby, or title.
 * A bare <Label> sibling or an unlabeled Radix Switch/SelectTrigger fails
 * the sweep and prints an identifying snippet.
 *
 * Each route also asserts a heading and a minimum control count so a crashed
 * (blank) page can't pass vacuously.
 */

import { test, expect, type Page } from '@playwright/test';

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const ADMIN_SESSION = { authenticated: true, username: 'oxotadmin', role: 'admin' };

/** Mocks shared by every page: session + broad fallbacks. */
async function mockApi(page: Page) {
  // Lowest priority: any unmocked /api/* call gets an empty list.
  await page.route('**/api/**', (route) => route.fulfill(json([])));

  await page.route('**/api/admin/session', (route) => route.fulfill(json(ADMIN_SESSION)));

  // Object-shaped endpoints that crash on a bare [].
  // Paged workspace activity feed on /team ({ entries, total }).
  await page.route('**/api/conformity/activity**', (route) =>
    route.fulfill(json({ entries: [], total: 0 })),
  );

  await page.route('**/api/conformity/summary', (route) =>
    route.fulfill(
      json({
        regulationCount: 2,
        requirementCount: 10,
        themeCount: 3,
        mappingCount: 4,
        regulations: [],
        keyDates: [],
      }),
    ),
  );

  // Portfolio rollup for the authed command center on "/".
  await page.route('**/api/conformity/portfolio', (route) =>
    route.fulfill(
      json({
        generatedAt: '2026-01-01T00:00:00Z',
        totals: {
          products: 1,
          assessments: 1,
          notStarted: 0,
          inProgress: 1,
          blocked: 0,
          readyForReview: 0,
        },
        risk: {
          openBlockers: 0,
          highRiskGaps: 0,
          openIncidents: 0,
          overdueDeadlines: 0,
          dueSoonDeadlines: 0,
        },
        evidence: {
          requirementCoverage: 50,
          evidenceCoverage: 50,
          documentationCoverage: 50,
          totalRequirements: 10,
          resolvedRequirements: 5,
          applicableRequirements: 10,
          evidencedRequirements: 5,
          totalSections: 4,
          completeSections: 2,
        },
        grades: [],
        deadlines: [],
        products: [],
      }),
    ),
  );

  // Paged workspace feed on the Team page — the catch-all [] would crash it.
  await page.route('**/api/conformity/activity*', (route) =>
    route.fulfill(json({ entries: [], total: 0 })),
  );

  await page.route('**/api/conformity/mappings', (route) =>
    route.fulfill(json({ themes: [], regulations: [], cells: [] })),
  );

  await page.route('**/api/conformity/reports**', (route) =>
    route.fulfill(json({ reports: [] })),
  );

  // Paged workspace activity feed on /team (object shape — the catch-all []
  // would crash the card, since [].entries is the Array method, not a list).
  await page.route('**/api/conformity/activity**', (route) =>
    route.fulfill(json({ entries: [], total: 0 })),
  );

  // Member profile so /profile renders its fullest form (name + password).
  await page.route('**/api/conformity/me', (route) =>
    route.fulfill(
      json({
        username: 'assessor',
        displayName: 'Assessor One',
        role: 'member',
        memberSince: '2026-01-01T00:00:00Z',
        needsOnboarding: false,
        toursSeen: [],
      }),
    ),
  );
}

/**
 * Returns descriptions of visible form controls that have NO accessible name.
 * Mirrors the parts of the accname algorithm that matter for form fields:
 * aria-labelledby > aria-label > associated <label> > title.
 */
async function findUnlabeledControls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const selector = [
      'input:not([type="hidden"])',
      'textarea',
      'select',
      '[role="combobox"]',
      '[role="checkbox"]',
      '[role="switch"]',
      '[role="radio"]',
      '[role="slider"]',
      '[role="spinbutton"]',
      '[role="textbox"]',
      '[role="searchbox"]',
    ].join(', ');

    const isVisible = (el: Element): boolean => {
      const node = el as HTMLElement;
      if (node.getClientRects().length === 0) return false;
      const style = window.getComputedStyle(node);
      return style.visibility !== 'hidden' && style.display !== 'none';
    };

    const isAriaHidden = (el: Element): boolean => {
      let cur: Element | null = el;
      while (cur) {
        if (cur.getAttribute('aria-hidden') === 'true') return true;
        cur = cur.parentElement;
      }
      return false;
    };

    const hasAccessibleName = (el: Element): boolean => {
      const labelledby = el.getAttribute('aria-labelledby');
      if (labelledby) {
        const text = labelledby
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
          .join(' ')
          .trim();
        if (text) return true;
      }
      if (el.getAttribute('aria-label')?.trim()) return true;
      const id = el.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (label?.textContent?.trim()) return true;
      }
      const wrapping = el.closest('label');
      if (wrapping?.textContent?.trim()) return true;
      if (el.getAttribute('title')?.trim()) return true;
      return false;
    };

    const offenders: string[] = [];
    for (const el of Array.from(document.querySelectorAll(selector))) {
      if (!isVisible(el) || isAriaHidden(el)) continue;
      if (hasAccessibleName(el)) continue;
      const attrs = ['type', 'name', 'placeholder', 'role', 'id', 'class']
        .map((a) => {
          const v = el.getAttribute(a);
          return v ? `${a}="${v.slice(0, 60)}"` : null;
        })
        .filter(Boolean)
        .join(' ');
      offenders.push(`<${el.tagName.toLowerCase()} ${attrs}>`);
    }
    return offenders;
  });
}

/**
 * Routes swept for unlabeled form controls. `minControls` guards against
 * vacuous passes: if a page fails to render (mock-shape crash), the sweep
 * must fail loudly rather than "pass" over an empty page.
 */
const PAGES: { path: string; heading: RegExp; minControls: number }[] = [
  { path: '/conformity/', heading: /conformity operations|portfolio overview/i, minControls: 0 },
  { path: '/conformity/regulations', heading: /regulations/i, minControls: 0 },
  { path: '/conformity/themes', heading: /cross-cutting themes/i, minControls: 0 },
  { path: '/conformity/requirements', heading: /requirements explorer/i, minControls: 1 },
  { path: '/conformity/mappings', heading: /cross-regulation matrix/i, minControls: 0 },
  { path: '/conformity/sources', heading: /source library/i, minControls: 0 },
  { path: '/conformity/products', heading: /products/i, minControls: 0 },
  { path: '/conformity/flows', heading: /flows/i, minControls: 0 },
  { path: '/conformity/reports', heading: /reports/i, minControls: 0 },
  { path: '/conformity/profile', heading: /your account/i, minControls: 1 },
  { path: '/conformity/team', heading: /team/i, minControls: 0 },
  { path: '/conformity/welcome', heading: /./, minControls: 0 },
];

test.describe('conformity form controls have accessible names', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  for (const { path, heading, minControls } of PAGES) {
    test(`no unlabeled form control on ${path}`, async ({ page }) => {
      await page.goto(path);

      // Page actually rendered (not a blank crash) — sweep is meaningful.
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
      await page.waitForLoadState('networkidle');

      const controlCount = await page.evaluate(
        () =>
          document.querySelectorAll(
            'input:not([type="hidden"]), textarea, select, [role="combobox"], [role="checkbox"], [role="switch"]',
          ).length,
      );
      expect(
        controlCount,
        `expected at least ${minControls} form control(s) on ${path} — the page may have failed to render its form`,
      ).toBeGreaterThanOrEqual(minControls);

      const offenders = await findUnlabeledControls(page);
      expect(
        offenders,
        `Form controls without an accessible name on ${path} — associate a label or add aria-label:\n${offenders.join('\n')}`,
      ).toEqual([]);
    });
  }
});
