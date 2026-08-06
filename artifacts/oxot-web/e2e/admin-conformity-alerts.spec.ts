/**
 * Browser-level test: "CRA deadline alerts" card on Admin → Integrations.
 *
 * The card's behaviour is covered by API tests, but nothing verified the
 * browser wiring — that saved values round-trip into the form, that Save
 * posts to the right endpoint and surfaces the success toast, and that
 * "Run check now" renders the last-check summary banner.
 *
 * All API calls are mocked (established gated-page pattern: mock
 * /api/admin/session as an authenticated admin), so the spec is fully
 * self-contained and does not need the API server running.
 */

import { test, expect } from '@playwright/test';

// ── Mock data ────────────────────────────────────────────────────────────────

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
    enabled: false,
    autoPublish: false,
    profileUrl: '',
    authorUrn: '',
    accessTokenSet: false,
    expiresAt: null,
    clientId: '',
    clientSecretSet: false,
    health: HEALTH_SNAPSHOT,
  },
  x: {
    enabled: false,
    autoPublish: false,
    username: '',
    apiKeySet: false,
    apiSecretSet: false,
    accessTokenSet: false,
    accessSecretSet: false,
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

const INTEGRATIONS_HEALTH = {
  email: HEALTH_ENTRY,
  linkedin: HEALTH_ENTRY,
  x: HEALTH_ENTRY,
};

/** Response for POST /api/admin/settings/conformity-alerts/run */
const RUN_RESULT = {
  ranAt: new Date().toISOString(),
  enabled: true,
  emailConfigured: true,
  incidentsChecked: 3,
  alertsSent: 2,
  alertsFailed: 0,
  digestSent: true,
};

// ── Intercept API calls before every test ────────────────────────────────────
//
// Playwright matches routes in LIFO order (last-registered wins). Register the
// broad catch-all FIRST, then the specific mocks.

test.beforeEach(async ({ page }) => {
  // Lowest priority: swallow any other /api/* calls (nav, pages, activity, …)
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

  // Authenticated admin session — the gated admin page renders only for role=admin.
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
      body: JSON.stringify(INTEGRATIONS_HEALTH),
    }),
  );

  await page.route('**/api/admin/integration-settings', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(INTEGRATION_SETTINGS),
    }),
  );
});

// ── Tests ────────────────────────────────────────────────────────────────────

// The Field wrapper associates its <Label> with the input via htmlFor/id, so
// inputs are addressed by their accessible name with getByLabel.

test('card renders with the saved values from integration settings', async ({ page }) => {
  await page.goto('/admin/integrations');

  await expect(page.getByRole('heading', { name: 'CRA deadline alerts' })).toBeVisible();

  // Saved values round-trip into the form controls.
  await expect(page.getByLabel('Recipient', { exact: true })).toHaveValue('compliance@oxot.eu');
  await expect(page.getByLabel('Lead time (hours)')).toHaveValue('12');
  await expect(page.getByLabel('Reminder interval (hours)')).toHaveValue('48');
  await expect(page.getByLabel('Max reminders')).toHaveValue('3');
  await expect(page.getByLabel(/daily digest of overdue/i)).toBeChecked();

  // Effective recipient hint surfaces the resolved delivery address.
  await expect(page.getByText('Currently delivering to compliance@oxot.eu.')).toBeVisible();
});

test('Save posts to the conformity-alerts endpoint and shows the success toast', async ({
  page,
}) => {
  let savedBody: unknown = null;
  await page.route('**/api/admin/settings/conformity-alerts', (route) => {
    expect(route.request().method()).toBe('PUT');
    savedBody = route.request().postDataJSON() as Record<string, unknown>;
    // The real endpoint echoes the full settings object with the saved values.
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...INTEGRATION_SETTINGS,
        conformityAlerts: {
          ...INTEGRATION_SETTINGS.conformityAlerts,
          ...(savedBody as Record<string, unknown>),
        },
      }),
    });
  });

  await page.goto('/admin/integrations');
  const recipient = page.getByLabel('Recipient', { exact: true });
  await expect(recipient).toHaveValue('compliance@oxot.eu');

  // Edit the form, then save.
  await recipient.fill('security@oxot.eu');
  await page.getByLabel('Lead time (hours)').fill('24');
  await page.getByLabel('Reminder interval (hours)').fill('72');
  await page.getByLabel('Max reminders').fill('7');
  await page.getByRole('button', { name: 'Save alert settings' }).click();

  // { exact: true } avoids the duplicate aria-live announcement span.
  await expect(page.getByText('Deadline alert settings saved', { exact: true })).toBeVisible();
  expect(savedBody).toMatchObject({
    enabled: true,
    recipient: 'security@oxot.eu',
    leadTimeHours: 24,
    digestEnabled: true,
    reminderIntervalHours: 72,
    maxReminders: 7,
  });
});

test('Run check now renders the last-check summary banner from the response', async ({
  page,
}) => {
  await page.route('**/api/admin/settings/conformity-alerts/run', (route) => {
    expect(route.request().method()).toBe('POST');
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(RUN_RESULT),
    });
  });

  await page.goto('/admin/integrations');
  await expect(page.getByRole('heading', { name: 'CRA deadline alerts' })).toBeVisible();

  await page.getByRole('button', { name: 'Run check now' }).click();

  // Summary banner (role=status) reflects the run result.
  const banner = page.getByRole('status').filter({ hasText: 'Last check' });
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('3 open incident(s) checked');
  await expect(banner).toContainText('2 alert(s) sent');
  await expect(banner).toContainText('0 failed');
  await expect(banner).toContainText('digest sent');

  // Success toast summarises the same outcome.
  await expect(page.getByText('Checked 3 open incident(s)', { exact: true })).toBeVisible();
});

test('failed save shows the destructive error toast and keeps the form editable', async ({
  page,
}) => {
  await page.route('**/api/admin/settings/conformity-alerts', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal server error' }),
    }),
  );

  await page.goto('/admin/integrations');
  const recipient = page.getByLabel('Recipient', { exact: true });
  await expect(recipient).toHaveValue('compliance@oxot.eu');

  await recipient.fill('security@oxot.eu');
  await page.getByRole('button', { name: 'Save alert settings' }).click();

  // Destructive error toast, not silence.
  await expect(
    page.getByText('Could not save deadline alert settings', { exact: true }),
  ).toBeVisible();

  // The form stays editable so the admin can retry: the edited value is
  // preserved and the inputs/save button remain enabled.
  await expect(recipient).toHaveValue('security@oxot.eu');
  await expect(recipient).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Save alert settings' })).toBeEnabled();
  await recipient.fill('retry@oxot.eu');
  await expect(recipient).toHaveValue('retry@oxot.eu');
});

test('failed run-now check shows the destructive error toast and no summary banner', async ({
  page,
}) => {
  await page.route('**/api/admin/settings/conformity-alerts/run', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Bad request' }),
    }),
  );

  await page.goto('/admin/integrations');
  await expect(page.getByRole('heading', { name: 'CRA deadline alerts' })).toBeVisible();

  await page.getByRole('button', { name: 'Run check now' }).click();

  await expect(page.getByText('Could not run the deadline check', { exact: true })).toBeVisible();

  // No stale/false summary banner is rendered for a failed run.
  await expect(page.getByRole('status').filter({ hasText: 'Last check' })).toHaveCount(0);

  // The button recovers so the admin can retry.
  await expect(page.getByRole('button', { name: 'Run check now' })).toBeEnabled();
});

test('out-of-range numbers are adjusted on save and the form shows the actual saved values', async ({
  page,
}) => {
  // Values the server actually stores after clamping 500/500/99 to the
  // allowed ranges (1–168 hours, 0–30 reminders).
  const SAVED_ALERTS = {
    ...INTEGRATION_SETTINGS.conformityAlerts,
    leadTimeHours: 168,
    reminderIntervalHours: 168,
    maxReminders: 30,
  };

  let savedBody: Record<string, unknown> | null = null;
  await page.route('**/api/admin/settings/conformity-alerts', (route) => {
    expect(route.request().method()).toBe('PUT');
    savedBody = route.request().postDataJSON();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...INTEGRATION_SETTINGS, conformityAlerts: SAVED_ALERTS }),
    });
  });

  await page.goto('/admin/integrations');
  const leadTime = page.getByLabel('Lead time (hours)');
  await expect(leadTime).toHaveValue('12');

  // Type out-of-range numbers.
  await leadTime.fill('500');
  await page.getByLabel('Reminder interval (hours)').fill('500');
  await page.getByLabel('Max reminders').fill('99');

  // After save, the refetched settings must also reflect the stored values so
  // the form doesn't snap back to the stale pre-save snapshot.
  await page.route('**/api/admin/integration-settings', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...INTEGRATION_SETTINGS, conformityAlerts: SAVED_ALERTS }),
    }),
  );

  await page.getByRole('button', { name: 'Save alert settings' }).click();

  // Success toast explicitly calls out the adjusted values.
  await expect(page.getByText('Deadline alert settings saved', { exact: true })).toBeVisible();
  await expect(
    page.getByText(/Out-of-range values were adjusted to the allowed range/, { exact: false }).first(),
  ).toContainText('lead time → 168h');

  // The form now reflects what was actually saved — not the typed 500/500/99.
  await expect(leadTime).toHaveValue('168');
  await expect(page.getByLabel('Reminder interval (hours)')).toHaveValue('168');
  await expect(page.getByLabel('Max reminders')).toHaveValue('30');

  // The request itself was already clamped client-side before hitting the API.
  expect(savedBody).toMatchObject({
    leadTimeHours: 168,
    reminderIntervalHours: 168,
    maxReminders: 30,
  });
});

test('run result for disabled alerts explains that nothing was sent', async ({ page }) => {
  await page.route('**/api/admin/settings/conformity-alerts/run', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...RUN_RESULT, enabled: false, incidentsChecked: 0, alertsSent: 0 }),
    }),
  );

  await page.goto('/admin/integrations');
  await page.getByRole('button', { name: 'Run check now' }).click();

  await expect(page.getByRole('status').filter({ hasText: 'Last check' })).toContainText(
    'alerts are disabled — nothing sent',
  );
});
