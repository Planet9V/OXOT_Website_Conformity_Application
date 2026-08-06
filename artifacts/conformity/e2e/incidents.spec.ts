/**
 * CRA Article 14 two-track incident workbench — UI regression test.
 *
 * The credibility rule under test: the workbench must tell the LEGALLY correct
 * deadline story per track. An actively exploited vulnerability anchors its
 * final report on the corrective-measure-available date (+14 days); a severe
 * incident anchors on the submitted 72h notification (+1 calendar month). The clock
 * chips must explain their anchor, marking the notification done must visibly
 * shift the severe final-report deadline, and the exported report package must
 * flag uncaptured Art 14 content with explicit "To complete:" markers instead
 * of inventing text.
 *
 * Every API call is mocked (self-contained, Date.now-relative fixtures). The
 * PUT handler recomputes the final-report deadline exactly like the server
 * does, and the refreshed list serves the updated row, so the UI's
 * invalidate-and-refetch loop is exercised for real. The export path overrides
 * window.open and asserts on the RAW document.write payload (a serialized DOM
 * would re-escape and hide escaping bugs).
 */

import { test, expect, type Page } from '@playwright/test';

const AUTHED_SESSION = { authenticated: true, username: 'admin' };

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = Date.now();
const iso = (offsetMs: number) => new Date(NOW + offsetMs).toISOString();

const DETECTED_VULN = iso(-10 * HOUR);
const DETECTED_SEVERE = iso(-20 * HOUR);

type Incident = Record<string, unknown> & {
  id: number;
  kind: string;
  detectedAt: string;
  notificationDoneAt: string | null;
  correctiveAvailableAt: string | null;
  finalReportDueAt: string;
};

function baseIncident(over: Partial<Incident> & { id: number; kind: string; title: string; detectedAt: string }): Incident {
  const t = new Date(over.detectedAt).getTime();
  return {
    assessmentId: 1,
    description: '',
    severity: 'high',
    owner: '',
    earlyWarningDueAt: new Date(t + 24 * HOUR).toISOString(),
    earlyWarningDoneAt: null,
    notificationDueAt: new Date(t + 72 * HOUR).toISOString(),
    notificationDoneAt: null,
    finalReportDueAt:
      over.kind === 'severe_incident'
        ? new Date(t + 72 * HOUR + 30 * DAY).toISOString()
        : new Date(t + 14 * DAY).toISOString(),
    finalReportDoneAt: null,
    correctiveAvailableAt: null,
    memberStates: '',
    suspectedMalicious: false,
    exploitNature: '',
    correctiveMeasures: '',
    userMitigations: '',
    threatActorInfo: '',
    sensitive: false,
    status: 'open',
    createdAt: over.detectedAt,
    updatedAt: over.detectedAt,
    ...over,
  } as Incident;
}

/**
 * Exact calendar-month arithmetic (EU Reg 1182/71): same day-of-month one
 * month later, clamped to that month's last day. Mirrors the server.
 */
function addCalendarMonth(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getUTCDate();
  const target = new Date(d);
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString();
}

/** Server-faithful recompute of the track-aware final-report deadline. */
function recomputeFinal(i: Incident): string {
  const t = new Date(i.detectedAt).getTime();
  if (i.kind === 'severe_incident') {
    return i.notificationDoneAt
      ? addCalendarMonth(i.notificationDoneAt as string)
      : addCalendarMonth(new Date(t + 72 * HOUR).toISOString());
  }
  return i.correctiveAvailableAt
    ? new Date(new Date(i.correctiveAvailableAt).getTime() + 14 * DAY).toISOString()
    : new Date(t + 14 * DAY).toISOString();
}

const DETAIL = {
  assessment: {
    id: 1,
    productId: 1,
    regulationKey: 'cra',
    status: 'active',
    currentStage: 'evaluate',
    scopeResult: 'in_scope',
    classKey: 'default',
    routeKey: 'module_a',
    startedAt: iso(-40 * DAY),
    completedAt: null,
    updatedAt: iso(-1 * DAY),
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
    createdAt: iso(-40 * DAY),
    updatedAt: iso(-40 * DAY),
  },
  answers: [],
  scope: { result: 'in_scope', reasons: [], answered: true },
  classification: {},
  allowedRoutes: [],
  recommendedRouteKey: null,
  className: 'Class I',
  routeName: 'Internal control',
  counts: {
    evaluationsTotal: 0,
    evaluationsMet: 0,
    evaluationsNotMet: 0,
    evidenceCount: 0,
    openIncidents: 2,
  },
};

async function installMocks(page: Page, incidents: Incident[]) {
  const json = (body: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(AUTHED_SESSION)));
  await page.route('**/api/conformity/assessments/1', (route) => route.fulfill(json(DETAIL)));
  await page.route('**/api/conformity/assessments/1/incidents', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      const created = baseIncident({
        id: incidents.length + 100,
        kind: String(body.kind),
        title: String(body.title),
        detectedAt: String(body.detectedAt),
      });
      incidents.push(created);
      await route.fulfill(json(created));
      return;
    }
    await route.fulfill(json(incidents));
  });
  // Article 14 submission proofs: POST stamps the stage's DoneAt on the
  // incident and re-anchors the final report, exactly like the server.
  await page.route('**/api/conformity/incidents/*/submissions', async (route) => {
    const id = Number(route.request().url().split('/').slice(-2)[0]);
    const incident = incidents.find((i) => i.id === id)!;
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      const stampField =
        body.stage === 'early_warning'
          ? 'earlyWarningDoneAt'
          : body.stage === 'notification'
            ? 'notificationDoneAt'
            : 'finalReportDoneAt';
      incident[stampField] = body.submittedAt;
      incident.finalReportDueAt = recomputeFinal(incident);
      await route.fulfill(
        json({ id: 1, incidentId: id, supersedes: null, createdAt: body.submittedAt, ...body }),
      );
      return;
    }
    await route.fulfill(json([]));
  });
  await page.route('**/api/conformity/incidents/*', async (route) => {
    const id = Number(route.request().url().split('/').pop());
    const incident = incidents.find((i) => i.id === id)!;
    const patch = route.request().postDataJSON() as Record<string, unknown>;
    Object.assign(incident, patch);
    incident.finalReportDueAt = recomputeFinal(incident);
    await route.fulfill(json(incident));
  });
}

async function gotoIncidents(page: Page) {
  await page.goto('/conformity/assessments/1');
  await page.getByRole('tab', { name: 'Incidents' }).click();
}

test('a vulnerability incident shows its track badge and anchor-explaining clock chips', async ({ page }) => {
  const vuln = baseIncident({
    id: 1,
    kind: 'exploited_vulnerability',
    title: 'Exploited CVE-2026-77',
    detectedAt: DETECTED_VULN,
  });
  await installMocks(page, [vuln]);
  await gotoIncidents(page);

  const card = page.getByTestId('incident-card-1');
  await expect(card.getByTestId('incident-kind-1')).toHaveText('Actively exploited vulnerability');
  // Conservative anchor note: fix date not yet known.
  await expect(card.getByTestId('incident-final-report-1')).toContainText(
    '14 days after fix available',
  );
  await expect(card.getByTestId('incident-final-report-1')).toContainText('conservative');
  // The vulnerability track exposes the corrective-available control.
  await expect(card.getByTestId('incident-corrective-available-1')).toBeVisible();
});

test('a corrective-available date before detection shows an inline warning and never reaches the server', async ({ page }) => {
  const vuln = baseIncident({
    id: 1,
    kind: 'exploited_vulnerability',
    title: 'Exploited CVE-2026-77',
    detectedAt: DETECTED_VULN,
  });
  await installMocks(page, [vuln]);
  const puts: string[] = [];
  page.on('request', (r) => {
    if (r.method() === 'PUT' && r.url().includes('/api/conformity/incidents/')) puts.push(r.url());
  });
  await gotoIncidents(page);

  const card = page.getByTestId('incident-card-1');
  const input = card.getByTestId('incident-corrective-available-1');
  const before = new Date(new Date(DETECTED_VULN).getTime() - 2 * DAY);
  const pad = (n: number) => String(n).padStart(2, '0');
  const local = `${before.getFullYear()}-${pad(before.getMonth() + 1)}-${pad(before.getDate())}T${pad(before.getHours())}:${pad(before.getMinutes())}`;
  await input.fill(local);

  const err = card.getByTestId('incident-corrective-available-error-1');
  await expect(err).toContainText('before the incident was detected');
  await expect(err).toContainText('final-report deadline was not changed');
  expect(puts).toHaveLength(0);

  // Correcting the date clears the warning and sends the update.
  const after = new Date(new Date(DETECTED_VULN).getTime() + 1 * DAY);
  const localOk = `${after.getFullYear()}-${pad(after.getMonth() + 1)}-${pad(after.getDate())}T${pad(after.getHours())}:${pad(after.getMinutes())}`;
  await input.fill(localOk);
  await expect(err).not.toBeVisible();
  await expect.poll(() => puts.length).toBeGreaterThan(0);
});

test('creating an incident requires picking a track (selector present, default vulnerability)', async ({ page }) => {
  await installMocks(page, []);
  await gotoIncidents(page);

  await page.getByRole('button', { name: 'Report incident' }).click();
  const kindSelect = page.getByTestId('incident-create-kind');
  await expect(kindSelect).toContainText('Actively exploited vulnerability');
  await kindSelect.click();
  await page.getByRole('option', { name: 'Severe incident' }).click();
  await expect(
    page.getByText('Final report due 1 calendar month after the 72h notification is submitted.'),
  ).toBeVisible();

  // Labels aren't htmlFor-associated in this dialog — locate by placeholder.
  await page.getByPlaceholder('Short incident title').fill('New severe outage');
  await page.getByRole('button', { name: 'Report', exact: true }).click();
  const card = page.getByTestId('incident-card-100');
  await expect(card.getByTestId('incident-kind-100')).toHaveText('Severe incident');
});

test('the create dialog captures Art 14 report content and sends it on the create call', async ({ page }) => {
  await installMocks(page, []);

  // Capture the raw POST body — the contract under test is what gets SENT.
  let createBody: Record<string, unknown> | null = null;
  const created: Incident[] = [];
  await page.route('**/api/conformity/assessments/1/incidents', async (route) => {
    if (route.request().method() === 'POST') {
      createBody = route.request().postDataJSON() as Record<string, unknown>;
      const incident = baseIncident({
        id: 100,
        kind: String(createBody.kind),
        title: String(createBody.title),
        detectedAt: String(createBody.detectedAt),
        ...createBody,
      });
      created.push(incident);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(incident),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(created),
    });
  });

  await gotoIncidents(page);
  await page.getByRole('button', { name: 'Report incident' }).click();
  await page.getByPlaceholder('Short incident title').fill('Exploited CVE with content');

  // The optional report-content section starts collapsed; suspected-malicious
  // is severe-track-only and must NOT appear on the vulnerability track.
  await expect(page.getByTestId('incident-create-report-content')).not.toBeVisible();
  await page.getByTestId('incident-create-toggle-content').click();
  const content = page.getByTestId('incident-create-report-content');
  await expect(content).toBeVisible();
  await expect(page.getByTestId('incident-create-suspected-malicious')).toHaveCount(0);
  await expect(content).toContainText('Nature of the exploit and the vulnerability');

  await content.getByPlaceholder("e.g. NL, DE, FR — or 'all'").fill('NL, DE');
  await content.getByPlaceholder('Where available').fill('APT-000');
  const textareas = content.locator('textarea');
  await textareas.nth(0).fill('SQLi actively exploited');
  await textareas.nth(1).fill('Hotfix 1.0.1 rolled out');
  await textareas.nth(2).fill('Disable the affected endpoint');
  await content.getByText('Information is highly sensitive').click();

  // Switching to the severe track surfaces the suspected-malicious flag with
  // the severe-specific nature label.
  await page.getByTestId('incident-create-kind').click();
  await page.getByRole('option', { name: 'Severe incident' }).click();
  await expect(page.getByTestId('incident-create-suspected-malicious')).toBeVisible();
  await expect(content).toContainText('Nature of the incident (incl. severity and impact)');
  // ...and back: the flag disappears again.
  await page.getByTestId('incident-create-kind').click();
  await page.getByRole('option', { name: 'Actively exploited vulnerability' }).click();
  await expect(page.getByTestId('incident-create-suspected-malicious')).toHaveCount(0);

  await page.getByRole('button', { name: 'Report', exact: true }).click();
  await expect(page.getByTestId('incident-card-100')).toBeVisible();

  expect(createBody).not.toBeNull();
  const body = createBody as unknown as Record<string, unknown>;
  expect(body.memberStates).toBe('NL, DE');
  expect(body.threatActorInfo).toBe('APT-000');
  expect(body.exploitNature).toBe('SQLi actively exploited');
  expect(body.correctiveMeasures).toBe('Hotfix 1.0.1 rolled out');
  expect(body.userMitigations).toBe('Disable the affected endpoint');
  expect(body.sensitive).toBe(true);
  // Non-severe track must never send a suspected-malicious flag as true.
  expect(body.suspectedMalicious).toBe(false);
});

test("marking a severe incident's notification done shifts the final report to +30 days", async ({ page }) => {
  const severe = baseIncident({
    id: 2,
    kind: 'severe_incident',
    title: 'Severe outage',
    detectedAt: DETECTED_SEVERE,
  });
  await installMocks(page, [severe]);
  await gotoIncidents(page);

  const finalChip = page.getByTestId('incident-final-report-2');
  // Conservative fallback before submission.
  await expect(finalChip).toContainText('conservative');
  const beforeDue = severe.finalReportDueAt;

  // Record the 72h notification's submission proof — marking a stage done is
  // gated on a proof, and recording one re-anchors the final-report deadline.
  await page
    .getByTestId('incident-card-2')
    .locator('div', { hasText: /^Notification \(72h\)/ })
    .getByRole('button', { name: 'Record submission…' })
    .first()
    .click();
  await expect(page.getByText('Record submission proof')).toBeVisible();
  await page.getByTestId('incident-submission-save-2').click();

  // Wait out react-query's refetch: the anchor note flips off "conservative".
  await expect(finalChip).toContainText('1 calendar month after notification');
  await expect(finalChip).not.toContainText('conservative');
  expect(severe.finalReportDueAt).not.toBe(beforeDue);
  expect(severe.finalReportDueAt).toBe(addCalendarMonth(severe.notificationDoneAt as string));
});

test('an overdue stage shows reminders sent vs cap, and flags exhausted alerting', async ({ page }) => {
  // Detected 5 days ago: early warning (+24h) and notification (+72h) are
  // breached; the final report (+14d) is still in the future.
  const vuln = baseIncident({
    id: 4,
    kind: 'exploited_vulnerability',
    title: 'Long-overdue CVE',
    detectedAt: iso(-5 * DAY),
  });
  await installMocks(page, [vuln]);
  await page.route('**/api/conformity/assessments/1/incident-alert-history', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        alertsEnabled: true,
        reminderIntervalHours: 24,
        maxReminders: 5,
        stages: [
          {
            incidentId: 4,
            stage: 'early_warning',
            breachAlertedAt: iso(-4 * DAY),
            reminderCount: 3,
            lastAlertAt: iso(-6 * HOUR),
            remindersExhausted: false,
          },
          {
            incidentId: 4,
            stage: 'notification',
            breachAlertedAt: iso(-2 * DAY),
            reminderCount: 5,
            lastAlertAt: iso(-1 * HOUR),
            remindersExhausted: true,
          },
        ],
      }),
    }),
  );
  await gotoIncidents(page);

  // Still-active reminders: count vs cap + when the next nudge lands.
  const early = page.getByTestId('incident-early-warning-4-alerts');
  await expect(early).toContainText('Reminder 3 of 5 sent');
  await expect(early).toContainText('next in ~24h');

  // Exhausted stage must say alerting has STOPPED, not just show a count.
  const notif = page.getByTestId('incident-notification-4-alerts');
  await expect(notif).toContainText('Alerts exhausted');
  await expect(notif).toContainText('5 of 5 reminders sent');
  await expect(notif).toContainText('Nobody will be nudged again');

  // The final report is not overdue — no alert line there.
  await expect(page.getByTestId('incident-final-report-4-alerts')).toHaveCount(0);
});

test('export report package writes the three stages with "To complete:" markers', async ({ page }) => {
  const vuln = baseIncident({
    id: 3,
    kind: 'exploited_vulnerability',
    title: 'Exploited CVE-2026-88',
    detectedAt: DETECTED_VULN,
    memberStates: 'NL, DE',
  });
  await installMocks(page, [vuln]);
  await page.route('**/api/conformity/incidents/3/report-package', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        incidentId: 3,
        assessmentId: 1,
        title: 'Exploited CVE-2026-88',
        productName: 'Test Gateway',
        kind: 'exploited_vulnerability',
        kindLabel: 'Actively exploited vulnerability',
        deadlineNote:
          'Final report due 14 days after a corrective or mitigating measure became available; until that date is recorded a conservative detection + 14 days applies.',
        generatedAt: iso(0),
        sections: [
          {
            stage: 'early_warning',
            label: 'Early warning (24h)',
            articleRef: 'Art 14(2) CRA',
            dueAt: iso(14 * HOUR),
            doneAt: null,
            fields: [
              { label: 'Product concerned', value: 'Test Gateway', missing: false, citation: 'Art 14(2)(a)' },
              { label: 'EU member states affected', value: 'NL, DE', missing: false, citation: 'Art 14(2)(b)' },
            ],
          },
          {
            stage: 'notification',
            label: 'Notification (72h)',
            articleRef: 'Art 14(3)(a) CRA',
            dueAt: iso(62 * HOUR),
            doneAt: null,
            fields: [
              { label: 'Corrective or mitigating measures taken', value: '', missing: true, citation: 'Art 14(3)(a)' },
            ],
          },
          {
            stage: 'final_report',
            label: 'Final report (14 days after corrective measure available)',
            articleRef: 'Art 14(3)(b) CRA',
            dueAt: iso(14 * DAY - 10 * HOUR),
            doneAt: null,
            fields: [
              { label: 'Corrective or mitigating measures users can apply', value: '', missing: true, citation: 'Art 14(3)(b)' },
            ],
          },
        ],
      }),
    }),
  );

  // Capture raw document.write payloads from the export window.
  await page.addInitScript(() => {
    (window as unknown as { __writes: string[] }).__writes = [];
    window.open = () => {
      const writes = (window as unknown as { __writes: string[] }).__writes;
      return {
        document: {
          open: () => undefined,
          write: (html: string) => writes.push(html),
          close: () => undefined,
        },
        focus: () => undefined,
        print: () => undefined,
      } as unknown as Window;
    };
  });

  await gotoIncidents(page);
  await page.getByTestId('incident-export-3').click();

  await expect
    .poll(async () =>
      page.evaluate(() => (window as unknown as { __writes: string[] }).__writes.length),
    )
    .toBeGreaterThan(0);
  const html = await page.evaluate(
    () => (window as unknown as { __writes: string[] }).__writes.join(''),
  );

  expect(html).toContain('Article 14 report package — Actively exploited vulnerability');
  expect(html).toContain('Early warning (24h)');
  expect(html).toContain('Notification (72h)');
  expect(html).toContain('Final report (14 days after corrective measure available)');
  // Captured content renders; uncaptured content gets an explicit marker.
  expect(html).toContain('NL, DE');
  expect(html).toContain('To complete: Corrective or mitigating measures taken');
  expect(html).toContain('To complete: Corrective or mitigating measures users can apply');
});
