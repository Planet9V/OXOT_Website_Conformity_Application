/**
 * Accessible-name sweep over every admin page.
 *
 * Admin forms associate every label with its control via the shared `Field`
 * wrapper (src/components/admin/field.tsx). Nothing structurally prevents a
 * future edit from rendering a bare <Label> sibling again, which would
 * silently break screen-reader announcements (and getByLabel locators).
 *
 * This spec visits each admin route with a mocked authenticated session and
 * asserts that every visible form control has an accessible name — via a
 * `label[for]`/wrapping label, aria-label, aria-labelledby, or title. If any
 * control is unlabeled, the test fails and prints an identifying snippet of
 * the offending element.
 *
 * All API calls are mocked (established gated-page pattern), so the spec is
 * self-contained and does not need the API server running.
 */

import { test, expect, type Page } from '@playwright/test';

const SESSION = { authenticated: true, username: 'admin', role: 'admin' };

const HEALTH_SNAPSHOT = {
  lastCheckedAt: null,
  lastSuccessAt: null,
  lastFailureAt: null,
  lastError: null,
};

const INTEGRATION_SETTINGS = {
  email: {
    enabled: true,
    fromName: 'OXOT',
    fromEmail: 'news@oxot.eu',
    smtpHost: 'smtp.example.com',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: 'mailer@oxot.eu',
    smtpPasswordSet: true,
    alertEmail: 'alerts@oxot.eu',
    health: HEALTH_SNAPSHOT,
  },
  linkedin: {
    enabled: true,
    autoPublish: false,
    profileUrl: 'https://www.linkedin.com/company/oxot',
    authorUrn: 'urn:li:organization:1',
    accessTokenSet: true,
    expiresAt: null,
    clientId: 'client',
    clientSecretSet: true,
    health: HEALTH_SNAPSHOT,
  },
  x: {
    enabled: true,
    autoPublish: false,
    username: 'oxot',
    apiKeySet: true,
    apiSecretSet: true,
    accessTokenSet: true,
    accessSecretSet: true,
    health: HEALTH_SNAPSHOT,
  },
  conformityAlerts: {
    enabled: true,
    recipient: 'compliance@oxot.eu',
    leadTimeHours: 12,
    digestEnabled: true,
    reminderIntervalHours: 48,
    maxReminders: 3,
    effectiveRecipient: 'compliance@oxot.eu',
  },
};

const HEALTH_ENTRY = {
  enabled: false,
  configured: false,
  connected: null,
  lastCheckedAt: null,
  lastSuccessAt: null,
  lastFailureAt: null,
  lastError: null,
  tokenExpiresAt: null,
  recentSuccessCount: 0,
  recentFailureCount: 0,
};

/** Mocks shared by every admin page: session + broad fallbacks. */
async function mockAdminApi(page: Page) {
  // Lowest priority: any unmocked /api/* call gets an empty list/object.
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );

  await page.route('**/api/site/*/settings', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        siteName: 'OXOT',
        tagline: '',
        footerText: '',
        logoUrl: null,
        primaryColor: null,
        accentColor: null,
      }),
    }),
  );

  await page.route('**/api/admin/session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(SESSION),
    }),
  );

  await page.route('**/api/admin/integrations/health', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ email: HEALTH_ENTRY, linkedin: HEALTH_ENTRY, x: HEALTH_ENTRY }),
    }),
  );

  // Recommendations panel must get an object (crashes on a bare []).
  await page.route('**/api/admin/analytics/recommendations**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ contentIdeas: [], placementIdeas: [], generatedAt: null }),
    }),
  );

  // Analytics overview must be an object (page crashes on a bare []).
  await page.route('**/api/admin/analytics/overview**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalViews: 0,
        uniqueVisitors: 0,
        totalClicks: 0,
        viewsByDay: [],
        topPages: [],
        topReferrers: [],
        deviceBreakdown: [],
        linkPerformance: [],
        contentIdeas: [],
        placementIdeas: [],
      }),
    }),
  );

  await page.route('**/api/admin/integration-settings', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(INTEGRATION_SETTINGS),
    }),
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
 * Admin routes swept for unlabeled form controls. `minControls` guards
 * against vacuous passes: if the page failed to render its form (e.g. a
 * mock-shape change breaks it), the sweep must fail loudly rather than
 * "pass" over an empty page.
 */
const ADMIN_PAGES: { path: string; heading: RegExp; minControls: number }[] = [
  { path: '/admin/login', heading: /sign in|log ?in|admin/i, minControls: 2 },
  { path: '/admin', heading: /dashboard|overview|admin/i, minControls: 0 },
  { path: '/admin/pages', heading: /pages/i, minControls: 0 },
  { path: '/admin/menus', heading: /menu|nav/i, minControls: 0 },
  { path: '/admin/carousel', heading: /carousel/i, minControls: 0 },
  { path: '/admin/leads', heading: /leads/i, minControls: 0 },
  { path: '/admin/ai', heading: /ai|assistant/i, minControls: 1 },
  { path: '/admin/seo', heading: /seo/i, minControls: 0 },
  { path: '/admin/analytics', heading: /analytics/i, minControls: 0 },
  { path: '/admin/newsletter', heading: /newsletter/i, minControls: 0 },
  // NOTE: /admin/settings is a bare redirect to /admin/integrations — no page of its own.
  { path: '/admin/integrations', heading: /integrations/i, minControls: 5 },
];

test.describe('admin form controls have accessible names', () => {
  test.beforeEach(async ({ page }) => {
    await mockAdminApi(page);
  });

  for (const { path, heading, minControls } of ADMIN_PAGES) {
    test(`no unlabeled form control on ${path}`, async ({ page }) => {
      await page.goto(path);

      // The page actually rendered (not a blank crash), so the sweep below
      // is meaningful.
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
        `Form controls without an accessible name on ${path} — wrap them in the shared <Field> (components/admin/field.tsx) or add aria-label:\n${offenders.join('\n')}`,
      ).toEqual([]);
    });
  }
});
