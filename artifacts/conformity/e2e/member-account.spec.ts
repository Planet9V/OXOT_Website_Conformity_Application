/**
 * Member onboarding + profile regression tests.
 *
 * The contracts this locks in:
 *  - Auto-redirect to /onboarding happens ONLY for a member session that
 *    explicitly reports needsOnboarding === true, and NEVER under automation
 *    (navigator.webdriver) — so session fixtures that simply lack the field
 *    can never hijack another spec's navigation.
 *  - The demo role is never onboarded (even if a payload claims otherwise)
 *    and its profile is read-only.
 *  - "Skip for now" marks the browser session and must not bounce the user
 *    straight back (the no-loop rule).
 *  - The onboarding password step posts current+new password to
 *    /conformity/me/password; Finish stamps /conformity/me/onboarding.
 *  - Profile: members edit display name and password self-service; the
 *    session menu links there.
 *
 * Every API call is mocked, so the suite is self-contained (no API server).
 */

import { test, expect, type Page } from '@playwright/test';

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const MEMBER_SESSION = {
  authenticated: true,
  username: 'ana',
  role: 'member',
  displayName: 'Ana Costa',
  needsOnboarding: true,
};
const MEMBER_SESSION_ONBOARDED = { ...MEMBER_SESSION, needsOnboarding: false };
// A pre-onboarding-era fixture: no needsOnboarding field at all.
const MEMBER_SESSION_LEGACY = {
  authenticated: true,
  username: 'ana',
  role: 'member',
  displayName: 'Ana Costa',
};
const DEMO_SESSION = { authenticated: true, username: 'oxotdemo', role: 'demo' };

const MEMBER_PROFILE = {
  username: 'ana',
  displayName: 'Ana Costa',
  role: 'member',
  memberSince: '2026-06-01T00:00:00Z',
  needsOnboarding: true,
};
const DEMO_PROFILE = {
  username: 'oxotdemo',
  displayName: null,
  role: 'demo',
  memberSince: null,
  needsOnboarding: false,
};

/**
 * Playwright reports navigator.webdriver=true, which the app treats as "an
 * automated browser — never auto-start onboarding" (same rule as tours).
 * Redirect tests impersonate a human browser to exercise the auto path.
 */
async function impersonateHumanBrowser(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', {
      get: () => false,
      configurable: true,
    });
  });
}

/** Catch-all first — Playwright matches routes LIFO, specific routes later win. */
async function installMocks(
  page: Page,
  opts: { session?: unknown; profile?: unknown } = {},
) {
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) =>
    route.fulfill(json(opts.session ?? MEMBER_SESSION)),
  );
  await page.route('**/api/conformity/me', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill(json(opts.profile ?? MEMBER_PROFILE));
    }
    return route.fallback();
  });
}

test.describe('onboarding auto-redirect gating', () => {
  test('human member with needsOnboarding lands in onboarding from any page', async ({ page }) => {
    await impersonateHumanBrowser(page);
    await installMocks(page);
    await page.goto('/conformity/');
    await expect(page.getByTestId('onboarding-page')).toBeVisible();
    await expect(page).toHaveURL(/\/conformity\/onboarding$/);
    await expect(page.getByTestId('onboarding-step-welcome')).toBeVisible();
  });

  test('never auto-redirects under automation (webdriver)', async ({ page }) => {
    await installMocks(page); // no impersonation — webdriver stays true
    await page.goto('/conformity/');
    await expect(page.getByTestId('command-palette-trigger')).toBeVisible();
    await expect(page.getByTestId('onboarding-page')).toHaveCount(0);
  });

  test('a session payload without the needsOnboarding field never triggers it', async ({ page }) => {
    await impersonateHumanBrowser(page);
    await installMocks(page, { session: MEMBER_SESSION_LEGACY });
    await page.goto('/conformity/');
    await expect(page.getByTestId('command-palette-trigger')).toBeVisible();
    await expect(page.getByTestId('onboarding-page')).toHaveCount(0);
  });

  test('the demo role is never onboarded, even if a payload claims it', async ({ page }) => {
    await impersonateHumanBrowser(page);
    await installMocks(page, { session: { ...DEMO_SESSION, needsOnboarding: true } });
    await page.goto('/conformity/');
    await expect(page.getByTestId('command-palette-trigger')).toBeVisible();
    await expect(page.getByTestId('onboarding-page')).toHaveCount(0);
  });

  test('"Skip for now" returns to the app and does not bounce back (no-loop rule)', async ({ page }) => {
    await impersonateHumanBrowser(page);
    await installMocks(page);
    await page.goto('/conformity/');
    await expect(page.getByTestId('onboarding-page')).toBeVisible();
    await page.getByTestId('onboarding-skip').click();
    // Session still says needsOnboarding=true, but the skip mark must hold.
    await expect(page.getByTestId('command-palette-trigger')).toBeVisible();
    await expect(page.getByTestId('onboarding-page')).toHaveCount(0);
    await expect(page).not.toHaveURL(/onboarding/);
  });
});

test.describe('onboarding flow', () => {
  test('welcome → set password → orientation → finish stamps completion', async ({ page }) => {
    // Stateful mocks: completing onboarding flips the session/profile payloads,
    // exactly like the real server — otherwise the post-finish invalidation
    // would re-trigger the redirect and the test would flap.
    let onboarded = false;
    let passwordBody: unknown = null;
    await page.route('**/api/**', (route) => route.fulfill(json([])));
    await page.route('**/api/admin/session', (route) =>
      route.fulfill(json({ ...MEMBER_SESSION, needsOnboarding: !onboarded })),
    );
    await page.route('**/api/conformity/me', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill(json({ ...MEMBER_PROFILE, needsOnboarding: !onboarded }));
      }
      return route.fallback();
    });
    await page.route('**/api/conformity/me/password', (route) => {
      passwordBody = route.request().postDataJSON();
      return route.fulfill(json({ success: true }));
    });
    await page.route('**/api/conformity/me/onboarding', (route) => {
      onboarded = true;
      return route.fulfill(json({ ...MEMBER_PROFILE, needsOnboarding: false }));
    });

    await page.goto('/conformity/onboarding');
    await expect(page.getByTestId('onboarding-step-welcome')).toBeVisible();
    await expect(page.getByTestId('onboarding-display-name')).toHaveValue('Ana Costa');
    await page.getByTestId('onboarding-continue').click();

    await expect(page.getByTestId('onboarding-step-password')).toBeVisible();
    await page.getByTestId('onboarding-current-password').fill('handed-out-pass');
    await page.getByTestId('onboarding-new-password').fill('my-own-secret-1');
    await page.getByTestId('onboarding-confirm-password').fill('my-own-secret-1');
    await page.getByTestId('onboarding-set-password').click();

    await expect(page.getByTestId('onboarding-step-orient')).toBeVisible();
    expect(passwordBody).toEqual({
      currentPassword: 'handed-out-pass',
      newPassword: 'my-own-secret-1',
    });

    await page.getByTestId('onboarding-finish').click();
    await expect(page.getByTestId('onboarding-page')).toHaveCount(0);
    await expect(page).toHaveURL(/\/conformity\/$/);
    expect(onboarded).toBe(true);
  });

  test('mismatched passwords are caught client-side before any request', async ({ page }) => {
    await installMocks(page);
    await page.goto('/conformity/onboarding');
    await page.getByTestId('onboarding-continue').click();
    await page.getByTestId('onboarding-current-password').fill('handed-out-pass');
    await page.getByTestId('onboarding-new-password').fill('my-own-secret-1');
    await page.getByTestId('onboarding-confirm-password').fill('different');
    await page.getByTestId('onboarding-set-password').click();
    await expect(page.getByText("The new passwords don't match.")).toBeVisible();
    await expect(page.getByTestId('onboarding-step-password')).toBeVisible();
  });

  test('an already-onboarded member is bounced out of onboarding', async ({ page }) => {
    await installMocks(page, {
      session: MEMBER_SESSION_ONBOARDED,
      profile: { ...MEMBER_PROFILE, needsOnboarding: false },
    });
    await page.goto('/conformity/onboarding');
    await expect(page.getByTestId('command-palette-trigger')).toBeVisible();
    await expect(page.getByTestId('onboarding-page')).toHaveCount(0);
  });

  test('admin sessions are bounced out of onboarding (nothing to onboard)', async ({ page }) => {
    await installMocks(page, {
      session: { authenticated: true, username: 'admin', role: 'admin', needsOnboarding: false },
    });
    await page.goto('/conformity/onboarding');
    await expect(page.getByTestId('command-palette-trigger')).toBeVisible();
    await expect(page.getByTestId('onboarding-page')).toHaveCount(0);
  });
});

test.describe('profile page', () => {
  test('member edits display name self-service', async ({ page }) => {
    let patchBody: unknown = null;
    await page.route('**/api/**', (route) => route.fulfill(json([])));
    await page.route('**/api/admin/session', (route) =>
      route.fulfill(json(MEMBER_SESSION_ONBOARDED)),
    );
    await page.route('**/api/conformity/me', (route) => {
      if (route.request().method() === 'PATCH') {
        patchBody = route.request().postDataJSON();
        return route.fulfill(
          json({ ...MEMBER_PROFILE, displayName: 'Ana C. Silva', needsOnboarding: false }),
        );
      }
      return route.fulfill(json({ ...MEMBER_PROFILE, needsOnboarding: false }));
    });

    await page.goto('/conformity/profile');
    await expect(page.getByTestId('profile-page')).toBeVisible();
    await expect(page.getByTestId('profile-username')).toHaveText('ana');
    // Save is inert until the name actually changes.
    await expect(page.getByTestId('profile-save-name')).toBeDisabled();
    await page.getByTestId('profile-display-name').fill('Ana C. Silva');
    await page.getByTestId('profile-save-name').click();
    await expect.poll(() => patchBody).toEqual({ displayName: 'Ana C. Silva' });
  });

  test('member changes password; fields clear on success', async ({ page }) => {
    let passwordBody: unknown = null;
    await installMocks(page, {
      session: MEMBER_SESSION_ONBOARDED,
      profile: { ...MEMBER_PROFILE, needsOnboarding: false },
    });
    await page.route('**/api/conformity/me/password', (route) => {
      passwordBody = route.request().postDataJSON();
      return route.fulfill(json({ success: true }));
    });

    await page.goto('/conformity/profile');
    await page.getByTestId('profile-current-password').fill('old-pass-123');
    await page.getByTestId('profile-new-password').fill('new-pass-456');
    await page.getByTestId('profile-confirm-password').fill('new-pass-456');
    await page.getByTestId('profile-change-password').click();
    await expect.poll(() => passwordBody).toEqual({
      currentPassword: 'old-pass-123',
      newPassword: 'new-pass-456',
    });
    await expect(page.getByTestId('profile-current-password')).toHaveValue('');
    await expect(page.getByTestId('profile-new-password')).toHaveValue('');
  });

  test('member who skipped onboarding can resume it from the profile', async ({ page }) => {
    await installMocks(page); // profile still reports needsOnboarding: true
    await page.goto('/conformity/profile');
    await expect(page.getByTestId('profile-onboarding-card')).toBeVisible();
    await page.getByTestId('profile-resume-onboarding').click();
    await expect(page.getByTestId('onboarding-page')).toBeVisible();
  });

  test('demo profile is read-only: no editing, no password form', async ({ page }) => {
    await installMocks(page, { session: DEMO_SESSION, profile: DEMO_PROFILE });
    await page.goto('/conformity/profile');
    await expect(page.getByTestId('profile-page')).toBeVisible();
    await expect(page.getByTestId('profile-username')).toHaveText('oxotdemo');
    await expect(page.getByTestId('profile-role')).toHaveText('Demo user');
    await expect(page.getByTestId('profile-display-name')).toHaveCount(0);
    await expect(page.getByTestId('profile-change-password')).toHaveCount(0);
    await expect(page.getByTestId('profile-security-note')).toContainText('demo');
  });

  test('the session menu links to the profile', async ({ page }) => {
    await installMocks(page, {
      session: MEMBER_SESSION_ONBOARDED,
      profile: { ...MEMBER_PROFILE, needsOnboarding: false },
    });
    await page.goto('/conformity/');
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByTestId('menu-profile').click();
    await expect(page.getByTestId('profile-page')).toBeVisible();
  });
});
