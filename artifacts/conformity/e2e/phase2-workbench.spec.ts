/**
 * Phase 2 workbench regression test.
 *
 * Phase 2 (xBOM vault, flow engine, provenance ledger) is only useful if the
 * workbench actually surfaces it. This test walks the demo path a visitor takes —
 * demo session → workbench → open each new cockpit tab — and asserts the three
 * panels render the seeded content they are wired to:
 *   - BOM vault: the ingested SBOM shows up as a card with its status;
 *   - Flow runner: the in-flight CRA run shows up as a card, and drilling in
 *     renders its typed steps;
 *   - Provenance: the chain-of-custody ledger renders its feed.
 *
 * Every API call is mocked (no API server / DB required); the specific Phase 2
 * endpoints are stubbed with realistic DTOs shaped like the generated schemas.
 */

import { test, expect, type Page } from '@playwright/test';

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const DEMO_SESSION = { authenticated: true, username: 'oxotdemo', role: 'demo' };

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

const BOM = {
  id: 5,
  assessmentId: 8,
  bomType: 'sbom',
  format: 'cyclonedx',
  name: 'NovaGuard firmware SBOM (v2.4.0)',
  fileName: 'novaguard-2.4.0.cdx.json',
  componentCount: 11,
  findingCount: 44,
  status: 'analyzed',
  checklist: [{ key: 'inventory', label: 'Component inventory complete', done: true }],
  createdAt: '2026-07-12T00:00:00Z',
  updatedAt: '2026-07-12T00:00:00Z',
};

const BOM_DETAIL = {
  bom: BOM,
  components: [
    {
      id: 91,
      bomId: 5,
      name: 'openssl',
      version: '1.1.1k',
      componentType: 'library',
      purl: 'pkg:generic/openssl@1.1.1k',
      supplier: 'OpenSSL Project',
      licenses: ['Apache-2.0'],
      hashes: {},
      cryptoProperties: null,
      findingCount: 2,
    },
    {
      id: 92,
      bomId: 5,
      name: 'MD5',
      version: '1.0',
      componentType: 'cryptographic-asset',
      purl: '',
      supplier: '',
      licenses: [],
      hashes: {},
      cryptoProperties: { assetType: 'algorithm' },
      findingCount: 1,
    },
  ],
  findings: [
    {
      id: 1,
      bomId: 5,
      componentId: 92,
      findingType: 'crypto',
      identifier: 'CRYPTO-WEAK-HASH',
      severity: 'high',
      title: 'Weak hash algorithm MD5',
      description: 'MD5 is cryptographically broken and must not be used.',
      source: 'crypto-heuristics',
      detail: {},
      createdAt: '2026-07-12T00:00:00Z',
    },
  ],
};

const BOM_CATALOG = {
  sbom: {
    label: 'Software Bill of Materials',
    description: 'The software components that make up the product.',
    checklist: [{ key: 'inventory', label: 'Component inventory complete' }],
  },
  cbom: {
    label: 'Cryptography Bill of Materials',
    description: 'The cryptographic assets the product relies on.',
    checklist: [{ key: 'crypto-inventory', label: 'Crypto inventory complete' }],
  },
};

const FLOW = {
  id: 1,
  key: 'cra-default',
  name: 'CRA conformity flow',
  description: 'The default end-to-end process for a CRA self-assessment.',
  appliesTo: { regulationKeys: ['cra'] },
  steps: [
    { id: 'scope', type: 'activity', title: 'Confirm scope & classification' },
    { id: 'harmonised', type: 'question', title: 'Are harmonised standards fully applied?' },
    { id: 'bom', type: 'investigation', title: 'Ingest & analyze the SBOM/CBOM' },
  ],
  isTemplate: true,
  sortOrder: 0,
  createdAt: '2026-07-01T00:00:00Z',
  updatedAt: '2026-07-01T00:00:00Z',
};

const FLOW_RUN = {
  id: 12,
  flowId: 1,
  assessmentId: 8,
  flowName: 'CRA conformity flow',
  status: 'active',
  assignee: 'Lena Novak (Compliance)',
  stepStates: {
    scope: { status: 'done' },
    harmonised: { status: 'done', answer: 'yes' },
    bom: { status: 'in_progress' },
  },
  createdAt: '2026-07-13T00:00:00Z',
  updatedAt: '2026-07-14T00:00:00Z',
};

const FLOW_RUN_DETAIL = { run: FLOW_RUN, steps: FLOW.steps };

const ACTIVITY = [
  {
    id: 30,
    entityType: 'flow_run',
    entityId: 12,
    action: 'created',
    actor: 'demo:oxotdemo',
    source: 'ui',
    hash: '',
    summary: 'Started flow "CRA conformity flow"',
    createdAt: '2026-07-13T00:00:00Z',
  },
  {
    id: 20,
    entityType: 'bom',
    entityId: 5,
    action: 'analyzed',
    actor: 'system',
    source: 'system',
    hash: '',
    summary: 'Analyzed BOM "NovaGuard firmware SBOM (v2.4.0)" (44 findings)',
    createdAt: '2026-07-12T01:00:00Z',
  },
  {
    id: 10,
    entityType: 'bom',
    entityId: 5,
    action: 'created',
    actor: 'demo:oxotdemo',
    source: 'seed',
    hash: 'a1b2c3',
    summary: 'Ingested SBOM "NovaGuard firmware SBOM (v2.4.0)" (11 components)',
    createdAt: '2026-07-12T00:00:00Z',
  },
];

async function baseMocks(page: Page) {
  // Lowest priority catch-all (Playwright matches LIFO).
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(DEMO_SESSION)));
  await page.route('**/api/conformity/assessments/8', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );
  // Phase 2 endpoints.
  await page.route('**/api/conformity/assessments/8/boms', (route) => route.fulfill(json([BOM])));
  await page.route('**/api/conformity/bom-catalog', (route) => route.fulfill(json(BOM_CATALOG)));
  await page.route('**/api/conformity/boms/5', (route) => route.fulfill(json(BOM_DETAIL)));
  await page.route('**/api/conformity/flows', (route) => route.fulfill(json([FLOW])));
  await page.route('**/api/conformity/assessments/8/flow-runs', (route) =>
    route.fulfill(json([FLOW_RUN])),
  );
  await page.route('**/api/conformity/flow-runs/12', (route) => route.fulfill(json(FLOW_RUN_DETAIL)));
  await page.route('**/api/conformity/assessments/8/activity', (route) =>
    route.fulfill(json(ACTIVITY)),
  );
}

async function gotoWorkbench(page: Page) {
  await page.goto('/conformity/assessments/8');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('assistant-open')).toBeVisible();
}

test.describe('phase 2 workbench panels', () => {
  test('BOM vault surfaces the seeded SBOM and its analysis', async ({ page }) => {
    await baseMocks(page);
    await gotoWorkbench(page);

    await page.getByTestId('tab-boms').click();
    const card = page.getByTestId('bom-card');
    await expect(card).toBeVisible();
    await expect(card).toContainText('NovaGuard firmware SBOM (v2.4.0)');
    await expect(card).toContainText('analyzed');

    // Drilling into the BOM shows its parsed components + findings.
    await card.click();
    await expect(page.getByText(/Weak hash algorithm MD5/)).toBeVisible();
    await expect(page.getByText('Components (2)')).toBeVisible();
    await expect(page.getByRole('cell', { name: /pkg:generic\/openssl/ })).toBeVisible();
  });

  test('Flow runner surfaces the in-flight CRA run and its steps', async ({ page }) => {
    await baseMocks(page);
    await gotoWorkbench(page);

    await page.getByTestId('tab-flows').click();
    const runCard = page.getByTestId('flow-run-card');
    await expect(runCard).toBeVisible();
    await expect(runCard).toContainText('CRA conformity flow');

    // Drilling in renders the typed steps.
    await runCard.click();
    await expect(page.getByTestId('flow-steps')).toBeVisible();
    await expect(page.getByText('Confirm scope & classification')).toBeVisible();
    await expect(page.getByText('Are harmonised standards fully applied?')).toBeVisible();
  });

  test('Provenance renders the chain-of-custody ledger', async ({ page }) => {
    await baseMocks(page);
    await gotoWorkbench(page);

    await page.getByTestId('tab-provenance').click();
    const feed = page.getByTestId('provenance-feed');
    await expect(feed).toBeVisible();
    await expect(feed).toContainText('Ingested SBOM');
    await expect(feed).toContainText('Analyzed BOM');
    await expect(feed).toContainText('Started flow');
  });
});
