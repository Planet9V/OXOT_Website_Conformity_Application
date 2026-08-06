/**
 * "User Information & Instructions (Annex II)" document — honest checklist e2e.
 *
 * The seventh generated artifact compiles the user-facing information CRA
 * Annex II obliges the manufacturer to ship with the product. This spec drives
 * the Documents tab and asserts that:
 *   - bulk-generate produces the Annex II document alongside the others;
 *   - its Annex II sections render with explicit "To complete:" markers where
 *     the workbench lacks the data (support end date here);
 *   - after the driving field is filled and the documents regenerated, the
 *     marker resolves, the section flips to complete, and the version bumps —
 *     i.e. it versions and renders exactly like the existing artifact types.
 *
 * Every API call is mocked (no API server / DB required); the section fixtures
 * mirror the server builder's real output shape for the two product states.
 */

import { test, expect, type Page } from '@playwright/test';

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const AUTHED_SESSION = { authenticated: true, username: 'admin', role: 'admin' };

const ASSESSMENT_DETAIL = {
  assessment: {
    id: 1,
    productId: 1,
    regulationKey: 'cra',
    status: 'active',
    currentStage: 'artifacts',
    scopeResult: 'in_scope',
    classKey: 'default',
    routeKey: 'module_a',
    startedAt: '2026-01-01T00:00:00Z',
    completedAt: null,
    updatedAt: '2026-01-02T00:00:00Z',
  },
  product: {
    id: 1,
    name: 'ACME IoT Gateway',
    description: 'Connected industrial gateway',
    manufacturerName: 'ACME',
    manufacturerAddress: 'Main St 1',
    authorizedRep: '',
    productType: 'hardware_with_software',
    version: '1.0',
    intendedUse: 'Industrial telemetry',
    supportPeriodStart: null,
    supportPeriodEnd: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  answers: [],
  scope: { result: 'in_scope', reasons: [], answered: true },
  classification: {},
  allowedRoutes: [],
  recommendedRouteKey: null,
  className: 'Default',
  routeName: 'Module A',
  counts: {
    evaluationsTotal: 30,
    evaluationsMet: 10,
    evaluationsNotMet: 2,
    evidenceCount: 1,
    openIncidents: 0,
  },
};

/** Annex II artifact as the server builder emits it BEFORE the support end date is set. */
const userInfoArtifact = (opts: { supportEndSet: boolean; version: number }) => ({
  id: 700,
  assessmentId: 1,
  artifactType: 'user_information',
  label: 'User Information & Instructions (Annex II)',
  status: 'draft',
  completeness: opts.supportEndSet ? 40 : 30,
  version: opts.version,
  generatedAt: '2026-07-20T10:00:00Z',
  sections: [
    {
      key: 'scope',
      label: 'About this document (CRA Annex II)',
      body: 'This document compiles the information and instructions that must accompany ACME IoT Gateway to the user under CRA Annex II — tracked as requirement "Annex II" in the gap assessment.',
      complete: true,
    },
    {
      key: 'manufacturer_contact',
      label: 'Manufacturer identity and contact (Annex II(1))',
      body: 'ACME\nMain St 1',
      complete: true,
    },
    {
      key: 'support_period',
      label: 'Technical security support and end of the support period (Annex II(7))',
      body: opts.supportEndSet
        ? 'Vulnerability handling and security updates are provided until 2031-07-15. The end date of the support period must be indicated at the time of purchase.'
        : 'To complete: set the support period end date on the product — it must be indicated to users at the time of purchase.',
      complete: opts.supportEndSet,
    },
    {
      key: 'vulnerability_contact',
      label: 'Vulnerability reporting contact and CVD policy (Annex II(2))',
      body: 'To complete: record the single point of contact for vulnerability reports in the note of requirement "Annex I Part II(5)" (shared with the CVD Policy document).',
      complete: false,
    },
  ],
});

const otherArtifact = {
  id: 701,
  assessmentId: 1,
  artifactType: 'eu_doc',
  label: 'EU Declaration of Conformity',
  status: 'draft',
  completeness: 80,
  version: 1,
  generatedAt: '2026-07-20T10:00:00Z',
  sections: [
    { key: 'identification', label: '1. Product identification', body: 'ACME IoT Gateway', complete: true },
  ],
};

test('Annex II document generates, shows honest markers, and resolves them on regenerate', async ({
  page,
}) => {
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(AUTHED_SESSION)));
  await page.route('**/api/conformity/assessments/1', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );

  // Mutable server state: no artifacts → generate v1 (no support end) →
  // regenerate v2 (support end date now set on the product).
  let artifacts: unknown[] = [];
  let generateCount = 0;
  await page.route('**/api/conformity/assessments/1/artifacts', (route) =>
    route.fulfill(json(artifacts)),
  );
  await page.route('**/api/conformity/assessments/1/artifacts/generate', async (route) => {
    generateCount += 1;
    artifacts = [
      otherArtifact,
      userInfoArtifact({ supportEndSet: generateCount > 1, version: generateCount }),
    ];
    await route.fulfill(json(artifacts));
  });

  await page.goto('/conformity/assessments/1');
  await page.waitForLoadState('networkidle');
  await page.getByRole('tab', { name: 'Documents' }).click();

  // Bulk-generate produces the Annex II document alongside the others.
  await page.getByRole('button', { name: 'Generate documents' }).click();
  await expect(
    page.getByText('User Information & Instructions (Annex II)'),
  ).toBeVisible();
  await expect(page.getByText('EU Declaration of Conformity')).toBeVisible();
  await expect(page.getByText('v1', { exact: true }).first()).toBeVisible();

  // Open the Annex II sections and assert the honest checklist.
  await page.getByText('Technical security support and end of the support period (Annex II(7))').click();
  await expect(
    page.getByText('To complete: set the support period end date on the product', {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByText('About this document (CRA Annex II)').click();
  await expect(
    page.getByText('tracked as requirement "Annex II" in the gap assessment', { exact: false }),
  ).toBeVisible();

  // "Fill" the driving field (support end date) and regenerate: the marker
  // resolves and the document versions like every other artifact type.
  await page.getByRole('button', { name: 'Regenerate' }).click();
  await expect(page.getByText('v2', { exact: true })).toBeVisible();
  await page.getByText('Technical security support and end of the support period (Annex II(7))').click();
  await expect(
    page.getByText('Vulnerability handling and security updates are provided until 2031-07-15', { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText('To complete: set the support period end date on the product', {
      exact: false,
    }),
  ).toBeHidden();
});
