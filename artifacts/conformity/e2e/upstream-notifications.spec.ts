/**
 * Upstream component-vulnerability notifications (CRA Art 13(6)) — UI walk.
 *
 * Every API call is mocked (no API server / DB needed). The notification
 * endpoints are stubbed STATEFULLY inside the page routes so the walk covers:
 *  - the "Upstream notifications (Art 13(6))" list on the BOM vault tab, with
 *    status chip + who recorded it;
 *  - the inline status chip on a tracked vulnerability finding;
 *  - tracking a new notification from an untracked finding (dialog → POST);
 *  - the copy-draft action producing text that names the product, the
 *    component@version and the vulnerability id (clipboard captured via an
 *    init-script override — nothing is ever auto-sent);
 *  - re-analysis resilience: analyze regenerates findings with NEW row ids,
 *    and the tracked chip still re-attaches (records are keyed by component
 *    identity + vulnerability, not by finding id).
 */

import { test, expect, type Page } from '@playwright/test';

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

// Mutation flows under test require a writable role — demo is read-only, so
// the track/update controls would be hidden entirely.
const DEMO_SESSION = { authenticated: true, username: 'admin', role: 'admin' };

const PRODUCT = {
  id: 1,
  name: 'NovaGuard Smart Home Hub',
  description: 'Connected home hub',
  manufacturerName: 'NovaGuard Labs',
  manufacturerAddress: '',
  authorizedRep: '',
  productType: 'Hardware',
  version: '2.4.0',
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

const COMPONENTS = [
  {
    id: 91,
    bomId: 5,
    name: 'lodash',
    version: '4.17.11',
    componentType: 'library',
    purl: 'pkg:npm/lodash@4.17.11',
    supplier: 'OpenJS Foundation',
    licenses: ['MIT'],
    hashes: {},
    cryptoProperties: null,
    findingCount: 1,
  },
  {
    id: 92,
    bomId: 5,
    name: 'axios',
    version: '0.21.0',
    componentType: 'library',
    purl: 'pkg:npm/axios@0.21.0',
    supplier: '',
    licenses: ['MIT'],
    hashes: {},
    cryptoProperties: null,
    findingCount: 1,
  },
];

const findingsAt = (idBase: number) => [
  {
    id: idBase,
    bomId: 5,
    componentId: 91,
    findingType: 'vulnerability',
    identifier: 'CVE-2019-10744',
    severity: 'high',
    title: 'CVE-2019-10744',
    description: 'Prototype pollution in lodash before 4.17.12.',
    source: 'osv',
    detail: {},
    createdAt: '2026-07-12T00:00:00Z',
  },
  {
    id: idBase + 1,
    bomId: 5,
    componentId: 92,
    findingType: 'vulnerability',
    identifier: 'CVE-2020-28168',
    severity: 'medium',
    title: 'CVE-2020-28168',
    description: 'Axios SSRF via redirect.',
    source: 'osv',
    detail: {},
    createdAt: '2026-07-12T00:00:00Z',
  },
];

const bomWith = (findingIdBase: number) => ({
  bom: {
    id: 5,
    assessmentId: 8,
    bomType: 'sbom',
    format: 'cyclonedx',
    name: 'NovaGuard firmware SBOM (v2.4.0)',
    fileName: 'novaguard-2.4.0.cdx.json',
    componentCount: 2,
    findingCount: 2,
    status: 'analyzed',
    checklist: [],
    createdAt: '2026-07-12T00:00:00Z',
    updatedAt: '2026-07-12T00:00:00Z',
  },
  components: COMPONENTS,
  findings: findingsAt(findingIdBase),
});

const TRACKED = {
  id: 301,
  assessmentId: 8,
  componentKey: 'pkg:npm/lodash@4.17.11',
  componentName: 'lodash',
  componentVersion: '4.17.11',
  purl: 'pkg:npm/lodash@4.17.11',
  vulnerabilityId: 'CVE-2019-10744',
  status: 'notified',
  maintainerContact: 'security@openjsf.org',
  method: 'email',
  notifiedAt: '2026-07-18T00:00:00Z',
  notes: 'Reported upstream; fix in 4.17.21.',
  recordedBy: 'member:priya.shah',
  createdAt: '2026-07-18T00:00:00Z',
  updatedAt: '2026-07-18T00:00:00Z',
};

type Notification = typeof TRACKED;

async function setupMocks(page: Page, notifications: Notification[]) {
  // Stateful in-memory store shared by the routes below.
  const store = { notifications: [...notifications], findingIdBase: 1, nextId: 500 };

  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(DEMO_SESSION)));
  await page.route('**/api/conformity/assessments/8', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );
  await page.route('**/api/conformity/assessments/8/boms', (route) =>
    route.fulfill(json([bomWith(store.findingIdBase).bom])),
  );
  await page.route('**/api/conformity/boms/5', (route) =>
    route.fulfill(json(bomWith(store.findingIdBase))),
  );
  // Re-analysis regenerates findings with FRESH row ids — the tracked record
  // must re-attach purely by natural key.
  await page.route('**/api/conformity/boms/5/analyze', (route) => {
    store.findingIdBase += 100;
    return route.fulfill(json(bomWith(store.findingIdBase)));
  });
  // Derived Art 13(6) gap list — vulnerability findings whose maintainer has
  // NOT been notified yet: untracked, or tracked but still pending. Matched by
  // componentKey + vulnerability id (same rule as the inline chips).
  await page.route('**/api/conformity/assessments/8/bom-notification-gaps', (route) => {
    const componentById = new Map(COMPONENTS.map((c) => [c.id, c]));
    const resolved = new Set(['notified', 'acknowledged', 'not_required']);
    const statusByKey = new Map(
      store.notifications.map((n) => [`${n.componentKey}::${n.vulnerabilityId}`, n.status]),
    );
    const gaps = findingsAt(store.findingIdBase)
      .map((f) => {
        const c = componentById.get(f.componentId)!;
        return {
          findingId: f.id,
          trackedStatus: statusByKey.get(`${c.purl}::${f.identifier}`) ?? '',
          bomId: f.bomId,
          bomName: 'NovaGuard firmware SBOM (v2.4.0)',
          componentKey: c.purl,
          componentName: c.name,
          componentVersion: c.version,
          purl: c.purl,
          vulnerabilityId: f.identifier,
          severity: f.severity,
        };
      })
      .filter((g) => !resolved.has(g.trackedStatus));
    return route.fulfill(json(gaps));
  });
  await page.route('**/api/conformity/assessments/8/bom-notifications', (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, string>;
      const created: Notification = {
        ...TRACKED,
        id: store.nextId++,
        componentKey: body.purl || `${body.componentName}@${body.componentVersion}`,
        componentName: body.componentName ?? '',
        componentVersion: body.componentVersion ?? '',
        purl: body.purl ?? '',
        vulnerabilityId: body.vulnerabilityId,
        status: body.status ?? 'pending',
        maintainerContact: body.maintainerContact ?? '',
        method: body.method ?? '',
        notifiedAt: body.notifiedAt ?? null,
        notes: body.notes ?? '',
        recordedBy: 'demo:oxotdemo',
      } as Notification;
      store.notifications.push(created);
      return route.fulfill(json(created));
    }
    return route.fulfill(json(store.notifications));
  });

  return store;
}

async function gotoBomTab(page: Page) {
  await page.goto('/conformity/assessments/8');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('assistant-open')).toBeVisible();
  await page.getByTestId('tab-boms').click();
}

test.describe('upstream notifications (CRA Art 13(6))', () => {
  test('the Art 13(6) list shows tracked notifications with status and recorder', async ({
    page,
  }) => {
    await setupMocks(page, [TRACKED]);
    await gotoBomTab(page);

    const card = page.getByTestId('upstream-notifications');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Upstream notifications (Art 13(6))');
    const row = page.getByTestId('upstream-notification-row');
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('lodash@4.17.11');
    await expect(row).toContainText('CVE-2019-10744');
    await expect(row).toContainText('Notified');
    await expect(row).toContainText('priya.shah');
  });

  test('a tracked finding shows its status inline; tracking a new one POSTs and lists it', async ({
    page,
  }) => {
    await setupMocks(page, [TRACKED]);
    await gotoBomTab(page);
    await page.getByTestId('bom-card').click();

    // Inline chip on the tracked lodash finding only.
    const chips = page.getByTestId('finding-notification-status');
    await expect(chips).toHaveCount(1);
    await expect(chips).toContainText('Notified');

    // Track the untracked axios finding.
    const trackButtons = page.getByTestId('finding-track-notification');
    await expect(trackButtons).toHaveCount(2);
    await trackButtons.nth(1).click();
    await expect(page.getByText('Track upstream notification')).toBeVisible();
    await page.getByTestId('notification-contact').fill('security@axios.dev');
    await page.getByTestId('notification-save').click();

    // The new record re-renders as an inline chip and in the Art 13(6) list.
    await expect(page.getByTestId('finding-notification-status')).toHaveCount(2);
    await page.getByRole('button', { name: /All BOMs/ }).click();
    await expect(page.getByTestId('upstream-notification-row')).toHaveCount(2);
    await expect(page.getByTestId('upstream-notifications')).toContainText('axios@0.21.0');
  });

  test('copy draft produces ready-to-send text naming product, component and vulnerability', async ({
    page,
  }) => {
    await setupMocks(page, [TRACKED]);
    // Capture clipboard writes — headless Chromium blocks the real clipboard.
    await page.addInitScript(() => {
      (window as unknown as { __copied: string[] }).__copied = [];
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: (t: string) => {
            (window as unknown as { __copied: string[] }).__copied.push(t);
            return Promise.resolve();
          },
        },
        configurable: true,
      });
    });
    await gotoBomTab(page);

    await page
      .getByRole('button', { name: /Copy notification draft for lodash@4\.17\.11/ })
      .click();
    const copied = await page.evaluate(
      () => (window as unknown as { __copied: string[] }).__copied,
    );
    expect(copied).toHaveLength(1);
    expect(copied[0]).toContain('NovaGuard Smart Home Hub');
    expect(copied[0]).toContain('lodash@4.17.11');
    expect(copied[0]).toContain('CVE-2019-10744');
    expect(copied[0]).toContain('coordinated disclosure');
  });

  test('Report incident from a finding pre-fills the Article 14 content, still editable', async ({
    page,
  }) => {
    await setupMocks(page, [TRACKED]);
    await gotoBomTab(page);
    await page.getByTestId('bom-card').click();

    // Each vulnerability finding offers a "Report incident" shortcut.
    const reportButtons = page.getByTestId('finding-report-incident');
    await expect(reportButtons).toHaveCount(2);
    await reportButtons.first().click();

    await expect(page.getByRole('heading', { name: 'Report an incident' })).toBeVisible();
    // Title/description seeded from the CVE + component (no manual transcription).
    await expect(page.getByLabel('Title')).toHaveValue('CVE-2019-10744 in lodash@4.17.11');
    await expect(page.getByLabel('Description')).toHaveValue('CVE-2019-10744');

    // The Art 14 report-content section is auto-expanded with the exploit
    // nature composed from the finding: CVE id, component (+purl), summary.
    const content = page.getByTestId('incident-create-report-content');
    await expect(content).toBeVisible();
    const nature = content.locator('textarea').first();
    await expect(nature).toHaveValue(/CVE-2019-10744/);
    await expect(nature).toHaveValue(/lodash@4\.17\.11 \(pkg:npm\/lodash@4\.17\.11\)/);
    await expect(nature).toHaveValue(/Prototype pollution in lodash before 4\.17\.12\./);

    // Everything stays editable.
    await nature.fill('Edited exploit nature');
    await expect(nature).toHaveValue('Edited exploit nature');
  });

  test('the gap banner counts untracked vulnerability findings and tracks one inline', async ({
    page,
  }) => {
    await setupMocks(page, [TRACKED]);
    await gotoBomTab(page);

    // One of the two vulnerability findings (axios) has no tracked record.
    const banner = page.getByTestId('notification-gaps');
    await expect(banner).toBeVisible();
    await expect(page.getByTestId('notification-gaps-count')).toContainText(
      "1 vulnerability finding where the maintainer hasn't been notified yet",
    );

    // Expand the untracked list and track straight from the gap row.
    await page.getByTestId('notification-gaps-toggle').click();
    const gapRow = page.getByTestId('notification-gap-row');
    await expect(gapRow).toHaveCount(1);
    await expect(gapRow).toContainText('axios@0.21.0');
    await expect(gapRow).toContainText('CVE-2020-28168');
    await page.getByTestId('notification-gap-track').click();
    await expect(page.getByText('Track upstream notification')).toBeVisible();
    await page.getByTestId('notification-contact').fill('security@axios.dev');
    // A pending record would still be a gap — mark it actually notified.
    await page.getByTestId('notification-status').click();
    await page.getByRole('option', { name: 'Notified' }).click();
    await page.getByTestId('notification-save').click();

    // Gap resolves: green all-notified state, and the record joins the list.
    await expect(page.getByTestId('notification-gaps-count')).toContainText(
      "Every vulnerability finding's maintainer has been notified",
    );
    await expect(page.getByTestId('upstream-notification-row')).toHaveCount(2);
  });

  test('a tracked-but-pending notification still counts as a gap until notified', async ({
    page,
  }) => {
    // lodash is notified; axios is tracked but still pending → still a gap.
    const PENDING = {
      ...TRACKED,
      id: 302,
      componentKey: 'pkg:npm/axios@0.21.0',
      componentName: 'axios',
      componentVersion: '0.21.0',
      purl: 'pkg:npm/axios@0.21.0',
      vulnerabilityId: 'CVE-2020-28168',
      status: 'pending',
      notifiedAt: null,
    } as Notification;
    await setupMocks(page, [TRACKED, PENDING]);
    await gotoBomTab(page);

    await expect(page.getByTestId('notification-gaps-count')).toContainText(
      "1 vulnerability finding where the maintainer hasn't been notified yet",
    );
    await page.getByTestId('notification-gaps-toggle').click();
    const gapRow = page.getByTestId('notification-gap-row');
    await expect(gapRow).toHaveCount(1);
    await expect(gapRow).toContainText('axios@0.21.0');
    // The pending state is shown and the action offers an update, not a new record.
    await expect(page.getByTestId('notification-gap-status')).toContainText('Pending');
    await expect(page.getByTestId('notification-gap-track')).toContainText('Update');
    await page.getByTestId('notification-gap-track').click();
    await expect(page.getByText('Update upstream notification')).toBeVisible();
  });

  test('email maintainer opens a mailto: pre-filled with the draft subject and body', async ({
    page,
  }) => {
    await setupMocks(page, [TRACKED]);
    // Capture mailto anchor clicks — headless Chromium has no mail client.
    await page.addInitScript(() => {
      (window as unknown as { __mailto: string[] }).__mailto = [];
      const origClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
        if (this.href.startsWith('mailto:')) {
          (window as unknown as { __mailto: string[] }).__mailto.push(this.href);
          return;
        }
        return origClick.call(this);
      };
    });
    await gotoBomTab(page);

    await page.getByRole('button', { name: /Email maintainer of lodash@4\.17\.11/ }).click();
    const opened = await page.evaluate(
      () => (window as unknown as { __mailto: string[] }).__mailto,
    );
    expect(opened).toHaveLength(1);
    const url = new URL(opened[0]);
    expect(decodeURIComponent(url.pathname)).toBe('security@openjsf.org');
    const params = new URLSearchParams(url.search);
    expect(params.get('subject')).toContain('lodash@4.17.11');
    expect(params.get('subject')).toContain('CVE-2019-10744');
    const body = params.get('body') ?? '';
    expect(body).toContain('NovaGuard Smart Home Hub');
    expect(body).toContain('coordinated disclosure');
    expect(body).not.toContain('Subject:');
  });

  test('the dialog offers Email maintainer once the typed contact is an email', async ({
    page,
  }) => {
    await setupMocks(page, [TRACKED]);
    await page.addInitScript(() => {
      (window as unknown as { __mailto: string[] }).__mailto = [];
      const origClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
        if (this.href.startsWith('mailto:')) {
          (window as unknown as { __mailto: string[] }).__mailto.push(this.href);
          return;
        }
        return origClick.call(this);
      };
    });
    await gotoBomTab(page);
    await page.getByTestId('bom-card').click();

    // Open the dialog for the untracked axios finding — no contact yet.
    await page.getByTestId('finding-track-notification').nth(1).click();
    await expect(page.getByText('Track upstream notification')).toBeVisible();
    const emailBtn = page.getByTestId('notification-email-maintainer');
    await expect(emailBtn).toHaveCount(0);

    // A non-email contact keeps it hidden; a real email reveals it.
    await page.getByTestId('notification-contact').fill('https://github.com/axios/axios/issues');
    await expect(emailBtn).toHaveCount(0);
    await page.getByTestId('notification-contact').fill('security@axios.dev');
    await expect(emailBtn).toBeVisible();

    await emailBtn.click();
    const opened = await page.evaluate(
      () => (window as unknown as { __mailto: string[] }).__mailto,
    );
    expect(opened).toHaveLength(1);
    const url = new URL(opened[0]);
    expect(decodeURIComponent(url.pathname)).toBe('security@axios.dev');
    const params = new URLSearchParams(url.search);
    expect(params.get('subject')).toContain('axios@0.21.0');
    expect(params.get('subject')).toContain('CVE-2020-28168');
    expect(params.get('body') ?? '').toContain('NovaGuard Smart Home Hub');
  });

  test('no email action when the recorded contact is not an email address', async ({ page }) => {
    await setupMocks(page, [
      { ...TRACKED, maintainerContact: 'https://github.com/lodash/lodash/issues' },
    ]);
    await gotoBomTab(page);

    const row = page.getByTestId('upstream-notification-row');
    await expect(row).toHaveCount(1);
    await expect(page.getByTestId('notification-email-maintainer')).toHaveCount(0);
    // Copy draft remains available regardless.
    await expect(
      page.getByRole('button', { name: /Copy notification draft for lodash@4\.17\.11/ }),
    ).toBeVisible();
  });

  test('re-analysis regenerates finding rows but the tracked record re-attaches', async ({
    page,
  }) => {
    await setupMocks(page, [TRACKED]);
    await gotoBomTab(page);
    await page.getByTestId('bom-card').click();
    await expect(page.getByTestId('finding-notification-status')).toHaveCount(1);

    // Analyze → fresh finding ids from the mock.
    await page.getByTestId('bom-analyze').click();
    await expect(page.getByTestId('bom-finding').first()).toBeVisible();
    // The chip persists because matching is by component identity + vuln id.
    await expect(page.getByTestId('finding-notification-status')).toHaveCount(1);
    await expect(page.getByTestId('finding-notification-status')).toContainText('Notified');
  });
});
