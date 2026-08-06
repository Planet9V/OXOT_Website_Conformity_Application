/**
 * Smoke test: Documents tab "Export PDF" produces a complete, correctly
 * formatted document package.
 *
 * The export path (printArtifacts in src/lib/print.ts) opens a blank window,
 * writes a branded HTML document into it and triggers window.print(). It was
 * only reviewed structurally, never runtime-verified with real artifacts, so a
 * completeness or formatting regression (a dropped section, a wrong chip, an
 * unescaped `<`) would ship unnoticed. This is the artifact assessors hand to
 * auditors, so correctness matters.
 *
 * Rather than drive a real print dialog (which blocks headless Chromium), we
 * override window.open with a fake window that records every string passed to
 * document.write. That gives us the exact raw HTML the browser would print, so
 * we can assert on structure AND escaping (a serialized DOM would re-escape
 * text and hide escaping bugs). A second override returns null to exercise the
 * popup-blocked fallback.
 *
 * Every API call is mocked so the test is self-contained (no API server / DB).
 */

import { test, expect, type Page } from '@playwright/test';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const AUTHED_SESSION = { authenticated: true, username: 'admin' };

const PRODUCT_NAME = 'ACME IoT Gateway';

// Section body deliberately packed with the four characters esc() must handle:
// < > & "  — if any leak raw into the HTML, escaping regressed.
const UNSAFE_BODY = 'Risk <assessment> flagged & "notes" pending';
const UNSAFE_SECTION_LABEL = 'Risk <analysis> & "review"';

const ARTIFACT_TECH = {
  id: 101,
  assessmentId: 1,
  artifactType: 'technical_documentation',
  label: 'Technical Documentation',
  status: 'draft',
  completeness: 50,
  version: 3,
  generatedAt: '2026-01-02T10:00:00Z',
  sections: [
    {
      key: 'product-description',
      label: 'Product description',
      body: 'A connected industrial gateway.',
      complete: true,
    },
    {
      key: 'risk-analysis',
      label: UNSAFE_SECTION_LABEL,
      body: UNSAFE_BODY,
      complete: false,
    },
  ],
};

const ARTIFACT_DOC = {
  id: 102,
  assessmentId: 1,
  artifactType: 'declaration_of_conformity',
  label: 'EU Declaration of Conformity',
  status: 'ready',
  completeness: 100,
  version: 1,
  generatedAt: '2026-01-02T10:05:00Z',
  sections: [
    {
      key: 'declaration',
      label: 'Declaration statement',
      body: 'We declare conformity under our sole responsibility.',
      complete: true,
    },
  ],
};

const ARTIFACTS = [ARTIFACT_TECH, ARTIFACT_DOC];

const ASSESSMENT_DETAIL = {
  assessment: {
    id: 1,
    productId: 1,
    regulationKey: 'cra',
    status: 'active',
    currentStage: 'artifacts',
    scopeResult: 'in_scope',
    classKey: 'class-ii',
    routeKey: 'module-h',
    startedAt: '2026-01-01T00:00:00Z',
    completedAt: null,
    updatedAt: '2026-01-02T00:00:00Z',
  },
  product: {
    id: 1,
    name: PRODUCT_NAME,
    description: '',
    manufacturerName: 'ACME',
    manufacturerAddress: '',
    authorizedRep: '',
    productType: 'Hardware',
    version: '1.0',
    intendedUse: '',
    supportPeriodStart: null,
    supportPeriodEnd: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  answers: [],
  scope: { result: 'in_scope', reasons: [], answered: true },
  classification: { classKey: 'class-ii', classLabel: '', citation: '', matched: [] },
  allowedRoutes: [],
  recommendedRouteKey: null,
  className: 'Class II',
  routeName: 'Module H',
  counts: {
    evaluationsTotal: 5,
    evaluationsMet: 3,
    evaluationsNotMet: 2,
    evidenceCount: 4,
    openIncidents: 0,
  },
};

// ── API mocking ──────────────────────────────────────────────────────────────

async function mockApi(page: Page) {
  const json = (body: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

  // Lowest priority: swallow any other /api/* call with an empty array.
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );

  await page.route('**/api/admin/session', (route) => route.fulfill(json(AUTHED_SESSION)));
  await page.route('**/api/conformity/assessments/1', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );
  await page.route('**/api/conformity/assessments/1/artifacts', (route) =>
    route.fulfill(json(ARTIFACTS)),
  );
}

/**
 * Replace window.open with a fake window that records everything written to it.
 * Captured raw HTML lands on window.__printCaptures for the test to read.
 * Must be added BEFORE app scripts so the override is in place at click time.
 */
async function installPrintCapture(page: Page) {
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__printCaptures = [];
    window.open = ((..._args: unknown[]) => {
      const cap = { html: '' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__printCaptures.push(cap);
      const doc = {
        open() {},
        write(s: string) {
          cap.html += s;
        },
        close() {},
      };
      return {
        document: doc,
        focus() {},
        print() {},
      } as unknown as Window;
    }) as typeof window.open;
  });
}

async function getCaptures(page: Page): Promise<{ html: string }[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return page.evaluate(() => (window as any).__printCaptures as { html: string }[]);
}

async function openDocumentsTab(page: Page) {
  await page.goto('/conformity/assessments/1');
  await page.waitForLoadState('networkidle');
  await page.getByRole('tab', { name: 'Documents' }).click();
  // Export PDF button only renders once artifacts have loaded.
  await expect(page.getByRole('button', { name: 'Export PDF' })).toBeVisible();
}

// ── Tests ────────────────────────────────────────────────────────────────────

test.describe('Documents PDF export', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await installPrintCapture(page);
  });

  test('package export contains every artifact, every section and the right chips', async ({
    page,
  }) => {
    await openDocumentsTab(page);
    await page.getByRole('button', { name: 'Export PDF' }).click();

    const captures = await getCaptures(page);
    expect(captures).toHaveLength(1);
    const html = captures[0].html;

    // Cover page: brand + product name + regulation/class/route/stage metadata.
    expect(html).toContain('OXOT Conformity');
    expect(html).toContain(PRODUCT_NAME);
    expect(html).toContain('CRA');
    expect(html).toContain('Class II');
    expect(html).toContain('Module H');
    expect(html).toContain('Artifacts'); // stageLabel('artifacts')
    expect(html).toContain('Conformity document package');
    expect(html).toContain('Exported ');

    // Every artifact present.
    expect(html).toContain('Technical Documentation');
    expect(html).toContain('EU Declaration of Conformity');

    // Every section present (unsafe label appears escaped — see escaping test).
    expect(html).toContain('Product description');
    expect(html).toContain('Declaration statement');

    // Chips: the incomplete section must be flagged Incomplete, complete ones Complete.
    expect(html).toContain('chip chip-gap">Incomplete');
    expect(html).toContain('chip chip-ok">Complete');
    // Two complete sections + one incomplete across the package.
    expect(html.match(/chip-ok">Complete/g) ?? []).toHaveLength(2);
    expect(html.match(/chip-gap">Incomplete/g) ?? []).toHaveLength(1);
  });

  test('per-document export includes only that one document', async ({ page }) => {
    await openDocumentsTab(page);

    // The per-row icon button carries the accessible title.
    await page.getByRole('button', { name: 'Export this document as PDF' }).first().click();

    const captures = await getCaptures(page);
    expect(captures).toHaveLength(1);
    const html = captures[0].html;

    // Only the first artifact, and its label used as the heading.
    expect(html).toContain('Technical Documentation');
    expect(html).not.toContain('EU Declaration of Conformity');
    expect(html).not.toContain('Conformity document package');
  });

  test('HTML escaping holds for < > & " in artifact/section content', async ({ page }) => {
    await openDocumentsTab(page);
    await page.getByRole('button', { name: 'Export PDF' }).click();

    const html = (await getCaptures(page))[0].html;

    // Escaped forms present …
    expect(html).toContain('Risk &lt;assessment&gt; flagged &amp; &quot;notes&quot; pending');
    expect(html).toContain('Risk &lt;analysis&gt; &amp; &quot;review&quot;');
    // … and the raw, unescaped payload absent (would be an injection / render bug).
    expect(html).not.toContain('Risk <assessment>');
    expect(html).not.toContain('Risk <analysis>');
  });

  test('popup-blocked surfaces the toast instead of failing silently', async ({ page }) => {
    // Override window.open to simulate a blocked popup (returns null).
    await page.addInitScript(() => {
      window.open = (() => null) as typeof window.open;
    });

    await openDocumentsTab(page);
    await page.getByRole('button', { name: 'Export PDF' }).click();

    await expect(page.getByText('Allow pop-ups for this site')).toBeVisible();
  });
});
