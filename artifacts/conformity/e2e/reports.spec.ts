/**
 * Executive reporting suite — UI behaviour against fully mocked APIs.
 *
 * Covers what the backend tests cannot: that the reports list, the report
 * workspace (TOC, deterministic HTML, AI cards, pending skeletons, failed
 * cards), the builder dialog, editing, finalising, polling and the
 * print-window export actually behave in a real browser, and that the
 * read-only demo role sees no authoring controls.
 *
 * Export uses the window.open-capture pattern (see pdf-export.spec.ts):
 * window.open is replaced before app scripts run, and every string written to
 * the fake document is recorded so we can assert on the raw exported HTML.
 */
import { test, expect, type Page } from '@playwright/test';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const ADMIN_SESSION = {
  authenticated: true,
  username: 'admin',
  role: 'admin',
  displayName: 'Admin',
};
const DEMO_SESSION = {
  authenticated: true,
  username: 'oxotdemo',
  role: 'demo',
  displayName: 'Demo explorer',
};

const NOW = '2026-07-20T09:00:00.000Z';

type SectionFixture = {
  key: string;
  heading: string;
  kind: 'deterministic' | 'ai';
  status: 'ready' | 'pending' | 'failed';
  html: string;
  contentMd: string;
  note?: string;
  editedBy?: string;
  editedAt?: string | null;
};

function section(partial: Partial<SectionFixture> & Pick<SectionFixture, 'key' | 'heading' | 'kind' | 'status'>): SectionFixture {
  return { html: '', contentMd: '', note: '', editedBy: '', editedAt: null, ...partial };
}

const CITATIONS = [
  { n: 1, key: 'reg:cra', label: 'Regulation (EU) 2024/2847 (Cyber Resilience Act)', kind: 'regulation' },
  { n: 2, key: 'std:en18031', label: 'EN 18031-1:2024', kind: 'standard' },
];

function report(over: Record<string, unknown>) {
  const sections = (over.sections as SectionFixture[]) ?? [];
  return {
    id: 0,
    scope: 'assessment',
    assessmentId: 1,
    productName: 'NovaGuard Smart Home Hub',
    title: 'Untitled report',
    reportType: 'briefing',
    audience: 'board',
    status: 'draft',
    sectionsTotal: sections.length,
    sectionsReady: sections.filter((s) => s.status === 'ready').length,
    sectionsPending: sections.filter((s) => s.status === 'pending').length,
    sectionsFailed: sections.filter((s) => s.status === 'failed').length,
    createdBy: 'admin:admin',
    createdAt: NOW,
    updatedAt: NOW,
    options: { includeAnnexes: true, includeEvidenceRegister: true, includeIncidentDetail: false },
    citations: CITATIONS,
    ...over,
    sections,
  };
}

const DET_SECTIONS: SectionFixture[] = [
  section({
    key: 'cover',
    heading: 'Cover',
    kind: 'deterministic',
    status: 'ready',
    html: '<p>Executive briefing prepared for the board.</p>',
  }),
  section({
    key: 'kpi_band',
    heading: 'Conformity posture at a glance',
    kind: 'deterministic',
    status: 'ready',
    html: '<table><tbody><tr><td>Readiness grade DETMARKER-D68</td></tr></tbody></table>',
  }),
];

const AI_READY = [
  section({
    key: 'executive_summary',
    heading: 'Executive summary',
    kind: 'ai',
    status: 'ready',
    html: '<p><strong>NovaGuard</strong> remains conditionally ready <sup>[1]</sup>.</p>',
    contentMd: '**NovaGuard** remains conditionally ready [1].',
  }),
  section({
    key: 'key_findings',
    heading: 'Key findings',
    kind: 'ai',
    status: 'ready',
    html: '<p>Three blockers dominate the gap profile.</p>',
    contentMd: 'Three blockers dominate the gap profile.',
    editedBy: 'member:sam.osei',
    editedAt: NOW,
  }),
];

// All-ready draft: edit/finalize/export flows.
const R_READY = report({
  id: 10,
  title: 'NovaGuard — Executive Briefing',
  sections: [...DET_SECTIONS, ...AI_READY],
});

// Draft with one failed AI section: finalize must be blocked.
const R_FAILED = report({
  id: 7,
  title: 'NovaGuard — Briefing (drafting hiccup)',
  sections: [
    ...DET_SECTIONS,
    ...AI_READY,
    section({
      key: 'risk_outlook',
      heading: 'Risk outlook',
      kind: 'ai',
      status: 'failed',
      note: 'Drafting failed: model unavailable',
    }),
  ],
});

// Finalised report: read-only.
const R_FINAL = report({
  id: 8,
  title: 'NovaGuard — Final Briefing',
  status: 'final',
  sections: [...DET_SECTIONS, ...AI_READY],
});

// Still generating: banner + skeletons + polling promotion to draft.
const R_GENERATING = report({
  id: 9,
  title: 'NovaGuard — Generating Briefing',
  status: 'generating',
  sections: [
    ...DET_SECTIONS,
    section({ key: 'executive_summary', heading: 'Executive summary', kind: 'ai', status: 'pending' }),
    section({ key: 'key_findings', heading: 'Key findings', kind: 'ai', status: 'pending' }),
  ],
});

const R_PORTFOLIO = report({
  id: 11,
  scope: 'portfolio',
  assessmentId: null,
  productName: null,
  title: 'Product Portfolio — Executive Briefing',
  status: 'final',
  sections: [...DET_SECTIONS, ...AI_READY],
});

function summaryOf(r: ReturnType<typeof report>) {
  const { sections: _s, options: _o, citations: _c, ...summary } = r as Record<string, unknown> & {
    sections: unknown;
    options: unknown;
    citations: unknown;
  };
  return summary;
}

// ── API mocking ──────────────────────────────────────────────────────────────

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

type MockOpts = {
  session?: typeof ADMIN_SESSION;
  reports?: ReturnType<typeof report>[];
  byId?: Record<number, ReturnType<typeof report> | (() => ReturnType<typeof report>)>;
};

async function mockApi(page: Page, opts: MockOpts = {}) {
  const reports = opts.reports ?? [];

  // Lowest priority first: Playwright checks the most recently registered
  // route first, so the catch-all must be registered before the specifics.
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/admin/session', (route) =>
    route.fulfill(json(opts.session ?? ADMIN_SESSION)),
  );
  await page.route(/\/api\/conformity\/reports(\?.*)?$/, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill(json({ reports: reports.map(summaryOf) }));
      return;
    }
    route.fallback();
  });
  await page.route(/\/api\/conformity\/reports\/(\d+)$/, (route) => {
    const id = Number(new URL(route.request().url()).pathname.split('/').pop());
    const hit = opts.byId?.[id];
    if (!hit) {
      route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"Report not found"}' });
      return;
    }
    route.fulfill(json({ report: typeof hit === 'function' ? hit() : hit }));
  });
}

async function installPrintCapture(page: Page) {
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__printCaptures = [];
    window.open = ((..._args: unknown[]) => {
      const cap = { html: '' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__printCaptures.push(cap);
      return {
        document: {
          open() {},
          write(s: string) {
            cap.html += s;
          },
          close() {},
        },
        focus() {},
        print() {},
      } as unknown as Window;
    }) as typeof window.open;
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

test.describe('reports list page', () => {
  test('nav entry, portfolio + assessment rows and status badges render', async ({ page }) => {
    await mockApi(page, {
      reports: [R_PORTFOLIO, R_READY, R_FINAL, R_GENERATING],
      byId: { [R_READY.id]: R_READY },
    });
    await page.goto('/conformity/reports');

    await expect(page.getByTestId('reports-page')).toBeVisible();
    await expect(page.getByTestId('nav-reports')).toBeVisible();

    for (const r of [R_PORTFOLIO, R_READY, R_FINAL, R_GENERATING]) {
      await expect(page.getByTestId(`report-card-${r.id}`)).toBeVisible();
    }
    // Assessment rows carry the product name; statuses surface as badges.
    await expect(
      page.getByTestId(`report-card-${R_READY.id}`).getByText('NovaGuard Smart Home Hub'),
    ).toBeVisible();
    await expect(page.getByTestId('report-status-generating')).toBeVisible();
    await expect(page.getByTestId('report-status-final')).toHaveCount(2); // portfolio + final

    // Card links into the workspace.
    await page.getByTestId(`report-open-${R_READY.id}`).click();
    await expect(page).toHaveURL(/\/reports\/10$/);
    await expect(page.getByTestId('report-workspace')).toBeVisible();
  });

  test('builder dialog posts the chosen scope/format/audience and navigates', async ({ page }) => {
    await mockApi(page, { reports: [], byId: { 99: report({ id: 99, scope: 'portfolio', assessmentId: null, productName: null, status: 'generating', title: 'Portfolio — Full report', sections: [...DET_SECTIONS] }) } });

    let createBody: Record<string, unknown> | null = null;
    await page.route(/\/api\/conformity\/reports$/, (route) => {
      if (route.request().method() !== 'POST') {
        route.fallback();
        return;
      }
      createBody = route.request().postDataJSON() as Record<string, unknown>;
      route.fulfill(json({ report: report({ id: 99, scope: 'portfolio', status: 'generating', sections: [] }) }));
    });

    await page.goto('/conformity/reports');
    await page.getByTestId('report-new-portfolio').click();
    await page.getByTestId('report-format-full').click();
    await page.getByTestId('report-audience-regulator').click();
    await page.getByTestId('report-title-input').fill('Portfolio deep dive');
    await page.getByTestId('report-builder-create').click();

    await expect(page).toHaveURL(/\/reports\/99$/);
    expect(createBody).not.toBeNull();
    expect(createBody).toMatchObject({
      scope: 'portfolio',
      reportType: 'full',
      audience: 'regulator',
      title: 'Portfolio deep dive',
    });
  });
});

test.describe('report workspace', () => {
  test('renders TOC, deterministic HTML, AI cards with edit stamp, failed card blocks finalize', async ({ page }) => {
    await mockApi(page, { byId: { [R_FAILED.id]: R_FAILED } });
    await page.goto('/conformity/reports/7');

    await expect(page.getByTestId('report-title')).toHaveText(R_FAILED.title as string);
    // Deterministic section HTML is injected as-is.
    await expect(page.getByText('DETMARKER-D68')).toBeVisible();
    // TOC lists every section heading.
    const toc = page.getByRole('navigation', { name: 'Report contents' });
    for (const s of R_FAILED.sections) await expect(toc.getByText(s.heading)).toBeVisible();
    // AI ready card + human edit attribution.
    await expect(page.getByTestId('report-section-executive_summary').getByText('conditionally ready')).toBeVisible();
    await expect(page.getByTestId('report-section-key_findings').getByText(/sam\.osei/)).toBeVisible();
    // Failed card shows the note; finalize is blocked while any AI section is not ready.
    await expect(page.getByTestId('section-failed-risk_outlook')).toBeVisible();
    await expect(page.getByTestId('section-failed-risk_outlook').getByText(/model unavailable/)).toBeVisible();
    await expect(page.getByTestId('report-finalize')).toBeDisabled();
  });

  test('editing a section PATCHes markdown and confirms with a toast', async ({ page }) => {
    await mockApi(page, { byId: { [R_READY.id]: R_READY } });
    let patchBody: Record<string, unknown> | null = null;
    await page.route('**/api/conformity/reports/10/sections/executive_summary', (route) => {
      patchBody = route.request().postDataJSON() as Record<string, unknown>;
      route.fulfill(json({ report: R_READY }));
    });

    await page.goto('/conformity/reports/10');
    await page.getByTestId('section-edit-executive_summary').click();

    const textarea = page.getByTestId('section-edit-textarea');
    await expect(textarea).toHaveValue('**NovaGuard** remains conditionally ready [1].');
    await textarea.fill('Revised **verdict** [2].');
    await page.getByTestId('section-edit-save').click();

    await expect(page.getByText('Section saved')).toBeVisible();
    expect(patchBody).toEqual({ contentMd: 'Revised **verdict** [2].' });
  });

  test('finalize confirms, POSTs and locks the workspace', async ({ page }) => {
    const R_FINAL_LOCKED = report({ ...R_READY, status: 'final' });
    let current = R_READY;
    await mockApi(page, { byId: { [R_READY.id]: () => current } });
    let finalized = false;
    await page.route('**/api/conformity/reports/10/finalize', (route) => {
      finalized = true;
      current = R_FINAL_LOCKED;
      route.fulfill(json({ report: R_FINAL_LOCKED }));
    });

    await page.goto('/conformity/reports/10');
    await expect(page.getByTestId('report-finalize')).toBeEnabled();
    await page.getByTestId('report-finalize').click();
    await page.getByTestId('report-finalize-confirm').click();

    await expect(page.getByText('Report finalised')).toBeVisible();
    expect(finalized).toBe(true);
    await expect(page.getByTestId('report-status-final').first()).toBeVisible();
    await expect(page.getByTestId('section-edit-executive_summary')).toHaveCount(0);
    await expect(page.getByTestId('report-finalize')).toHaveCount(0);
  });

  test('generating report shows banner + skeletons, then polls its way to draft', async ({ page }) => {
    let calls = 0;
    const drafted = report({
      ...R_GENERATING,
      status: 'draft',
      sections: [...DET_SECTIONS, ...AI_READY],
    });
    await mockApi(page, {
      byId: { [R_GENERATING.id]: () => (++calls >= 2 ? drafted : R_GENERATING) },
    });

    await page.goto('/conformity/reports/9');
    await expect(page.getByTestId('report-generating-banner')).toBeVisible();
    await expect(page.getByTestId('section-pending-executive_summary')).toBeVisible();

    // The workspace polls every 2.5s while generating; the second fetch flips to draft.
    await expect(page.getByTestId('report-generating-banner')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByTestId('report-section-executive_summary').getByText('conditionally ready')).toBeVisible();
  });

  test('export writes the composed HTML into the print window', async ({ page }) => {
    await installPrintCapture(page);
    await mockApi(page, { byId: { [R_FINAL.id]: R_FINAL } });
    const EXPORT_HTML = '<!DOCTYPE html><html><body><h1>EXPORT-SENTINEL</h1></body></html>';
    await page.route('**/api/conformity/reports/8/export', (route) =>
      route.fulfill(json({ title: R_FINAL.title, html: EXPORT_HTML })),
    );

    await page.goto('/conformity/reports/8');
    await page.getByTestId('report-export').click();

    await expect
      .poll(async () =>
        page.evaluate(() => ((window as any).__printCaptures as { html: string }[]).map((c) => c.html)),
      )
      .toEqual([EXPORT_HTML]);
  });

  test('blocked popup surfaces the toast instead of failing silently', async ({ page }) => {
    await page.addInitScript(() => {
      window.open = (() => null) as typeof window.open;
    });
    await mockApi(page, { byId: { [R_FINAL.id]: R_FINAL } });
    await page.route('**/api/conformity/reports/8/export', (route) =>
      route.fulfill(json({ title: R_FINAL.title, html: '<!DOCTYPE html><html></html>' })),
    );

    await page.goto('/conformity/reports/8');
    await page.getByTestId('report-export').click();
    await expect(page.getByText('Popup blocked')).toBeVisible();
  });
});

test.describe('demo role is read-only', () => {
  test('no builder on the list page, no authoring controls in the workspace', async ({ page }) => {
    await mockApi(page, {
      session: DEMO_SESSION,
      reports: [R_READY],
      byId: { [R_READY.id]: R_READY },
    });

    await page.goto('/conformity/reports');
    await expect(page.getByTestId('reports-page')).toBeVisible();
    await expect(page.getByTestId(`report-card-${R_READY.id}`)).toBeVisible();
    await expect(page.getByTestId('report-new-portfolio')).toHaveCount(0);

    await page.goto('/conformity/reports/10');
    await expect(page.getByTestId('report-workspace')).toBeVisible();
    await expect(page.getByTestId('section-edit-executive_summary')).toHaveCount(0);
    await expect(page.getByTestId('report-finalize')).toHaveCount(0);
    await expect(page.getByTestId('report-delete')).toHaveCount(0);
    // Export (a GET) stays available to demo users.
    await expect(page.getByTestId('report-export')).toBeVisible();
  });
});
