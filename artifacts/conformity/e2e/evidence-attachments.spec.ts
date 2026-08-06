/**
 * Evidence attachments — assessors attach a file to a gap-worklist requirement,
 * see it listed as a file attachment, and reopen (download) it.
 *
 * The client flow under test (gap-worklist EvidenceDialog + lib/upload.ts):
 *   pick file → POST /api/storage/uploads/request-url → PUT bytes to the
 *   presigned URL → POST evidence with { objectPath, fileName } → the list
 *   renders a download link to /api/conformity/evidence/:id/download.
 *
 * Every API call is mocked (stateful evidence store; the presigned PUT target
 * is intercepted) so the spec is self-contained: no API server, DB, or real
 * object storage. The real storage/auth round-trip is covered separately by
 * the API-server integration test (conformityEvidenceFiles.test.ts).
 */

import { test, expect, type Page } from '@playwright/test';

const AUTHED_SESSION = { authenticated: true, username: 'admin' };

const FILE_NAME = 'pen-test-report.pdf';
const FILE_CONTENT = '%PDF-1.4 fake pen-test report body';
const OBJECT_PATH = '/objects/uploads/test-object-id.pdf';
const UPLOAD_URL = 'https://storage.example.test/presigned/test-object-id';

const EVALUATION = {
  id: 11,
  assessmentId: 1,
  regulationKey: 'cra',
  requirementRefCode: 'CRA-ER-01',
  status: 'in_progress',
  implementationNote: '',
  riskRating: null,
  owner: '',
  dueDate: null,
  title: 'Secure by default configuration',
  description: '',
  themeKey: null,
  themeName: 'Security',
  obligationType: '',
  relatedMappings: [],
  evidenceCount: 0,
};

const DETAIL = {
  assessment: {
    id: 1,
    productId: 1,
    regulationKey: 'cra',
    status: 'active',
    currentStage: 'gap_assessment',
    scopeResult: 'in_scope',
    classKey: 'default',
    routeKey: 'module_a',
    appliedStandards: [],
    startedAt: '2025-01-01T00:00:00Z',
    completedAt: null,
    updatedAt: '2025-01-01T00:00:00Z',
  },
  product: {
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
  },
  answers: [],
  scope: { result: 'in_scope', reasons: [], answered: true },
  classification: { classKey: 'default', classLabel: 'Default', citation: '', matched: [] },
  allowedRoutes: [],
  recommendedRouteKey: null,
  className: 'Default',
  routeName: 'Module A — Internal control',
  standardsAdvisory: null,
  counts: {
    evaluationsTotal: 1,
    evaluationsMet: 0,
    evaluationsNotMet: 0,
    evidenceCount: 0,
    openIncidents: 0,
  },
};

interface EvidenceRow {
  id: number;
  assessmentId: number;
  requirementRefCode: string | null;
  title: string;
  evidenceType: string;
  url: string;
  objectPath: string;
  fileName: string;
  fileHash: string;
  note: string;
  createdAt: string;
}

async function installMocks(page: Page) {
  const json = (body: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

  // Stateful evidence store — the POST appends, the GET reflects it, exactly
  // like the server would.
  const evidence: EvidenceRow[] = [];
  let uploadPut: { method: string; contentType: string | null } | null = null;

  // Lowest priority: swallow any other /api/* call (Playwright matches LIFO).
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(AUTHED_SESSION)));
  await page.route('**/api/conformity/assessments/1', (route) => route.fulfill(json(DETAIL)));
  await page.route('**/api/conformity/assessments/1/evaluations', (route) =>
    route.fulfill(json([{ ...EVALUATION, evidenceCount: evidence.length }])),
  );

  // Presigned-URL handshake (client lib/upload.ts).
  await page.route('**/api/storage/uploads/request-url', (route) =>
    route.fulfill(json({ uploadURL: UPLOAD_URL, objectPath: OBJECT_PATH })),
  );
  // The direct-to-storage PUT: capture the raw uploaded bytes.
  await page.route(`${UPLOAD_URL}*`, async (route) => {
    // NOTE: Playwright can't expose the raw Blob body of a fetch PUT, so we
    // record the request shape; byte-level round-trip integrity is covered by
    // the API-server integration test against real object storage.
    uploadPut = {
      method: route.request().method(),
      contentType: await route.request().headerValue('content-type'),
    };
    await route.fulfill({ status: 200, body: '' });
  });

  await page.route('**/api/conformity/assessments/1/evidence', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Partial<EvidenceRow>;
      const row: EvidenceRow = {
        id: evidence.length + 1,
        assessmentId: 1,
        requirementRefCode: body.requirementRefCode ?? null,
        title: body.title ?? '',
        evidenceType: body.evidenceType ?? 'document',
        url: body.url ?? '',
        objectPath: body.objectPath ?? '',
        fileName: body.fileName ?? '',
        fileHash: 'a'.repeat(64),
        note: body.note ?? '',
        createdAt: '2025-06-01T12:00:00Z',
      };
      evidence.push(row);
      await route.fulfill(json(row));
      return;
    }
    await route.fulfill(json(evidence));
  });

  // The download route the attachment link points at.
  await page.route('**/api/conformity/evidence/*/download', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/pdf',
      headers: {
        'content-disposition': `inline; filename*=UTF-8''${encodeURIComponent(FILE_NAME)}`,
      },
      body: FILE_CONTENT,
    }),
  );

  return {
    evidence,
    getUploadPut: () => uploadPut,
  };
}

test('assessor attaches a file to a requirement, sees it listed, and reopens it', async ({
  page,
}) => {
  const mocks = await installMocks(page);

  await page.goto('/conformity/assessments/1');
  await page.getByRole('tab', { name: /gap assessment/i }).click();

  // Open the evidence dialog for the requirement row.
  await page.getByRole('button', { name: /evidence/i }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('CRA-ER-01', { exact: false })).toBeVisible();
  await expect(dialog.getByText('No evidence linked yet.')).toBeVisible();

  // Pick a file — triggers request-url + presigned PUT.
  await dialog.locator('input[type="file"]').setInputFiles({
    name: FILE_NAME,
    mimeType: 'application/pdf',
    buffer: Buffer.from(FILE_CONTENT, 'utf8'),
  });

  // The picked file chip appears and the title auto-fills from the filename.
  await expect(dialog.getByText(FILE_NAME).first()).toBeVisible();
  await expect(dialog.getByPlaceholder(/Title/)).toHaveValue(FILE_NAME);

  // The upload actually went to the presigned URL as a typed PUT, not the API.
  expect(mocks.getUploadPut()).toEqual({ method: 'PUT', contentType: 'application/pdf' });

  // Attach it.
  await dialog.getByRole('button', { name: /attach evidence/i }).click();

  // It now appears in the evidence list as a FILE attachment (download link,
  // not an external URL) pointing at the admin-gated download route.
  const fileLink = dialog.getByRole('link', { name: FILE_NAME });
  await expect(fileLink).toBeVisible();
  await expect(fileLink).toHaveAttribute('href', '/api/conformity/evidence/1/download');
  // The sha256 fingerprint from the server row is surfaced.
  await expect(dialog.getByText(/^sha256:/)).toBeVisible();

  // The stored row carries the normalized objectPath + fileName the server
  // needs to serve the file back.
  expect(mocks.evidence).toHaveLength(1);
  expect(mocks.evidence[0]).toMatchObject({
    requirementRefCode: 'CRA-ER-01',
    objectPath: OBJECT_PATH,
    fileName: FILE_NAME,
  });

  // Reopen: the link opens in a new tab; the download route serves the file.
  const [popup] = await Promise.all([page.waitForEvent('popup'), fileLink.click()]);
  await popup.waitForLoadState('domcontentloaded');
  expect(popup.url()).toContain('/api/conformity/evidence/1/download');
});

test('a failed upload surfaces an error and never links broken evidence', async ({ page }) => {
  await installMocks(page);
  // Make the presigned handshake fail like an expired session would.
  await page.route('**/api/storage/uploads/request-url', (route) =>
    route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"unauthorized"}' }),
  );

  await page.goto('/conformity/assessments/1');
  await page.getByRole('tab', { name: /gap assessment/i }).click();
  await page.getByRole('button', { name: /evidence/i }).first().click();
  const dialog = page.getByRole('dialog');

  await dialog.locator('input[type="file"]').setInputFiles({
    name: FILE_NAME,
    mimeType: 'application/pdf',
    buffer: Buffer.from(FILE_CONTENT, 'utf8'),
  });

  await expect(
    dialog.getByText('Could not start the upload. Please sign in again and retry.'),
  ).toBeVisible();
  // No file chip: the form won't submit a dangling objectPath.
  await expect(dialog.getByRole('button', { name: /remove file/i })).toHaveCount(0);
});
