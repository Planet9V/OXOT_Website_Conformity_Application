import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for browser-level smoke tests of the conformity
 * workbench.
 *
 * Chromium is supplied by the Nix store — no `playwright install` needed.
 * The webServer spins up a dedicated Vite instance on a fixed port so the
 * test never interferes with the live dev workflow.
 */

/**
 * Path to the full Chromium binary provided by Nix.
 * We bypass Playwright's own browser-management (PLAYWRIGHT_BROWSERS_PATH)
 * entirely and point executablePath straight at the binary so no download is
 * needed and version mismatches don't matter.
 */
const CHROMIUM_EXECUTABLE =
  '/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome';

/** Dedicated port for the test Vite instance — avoids clashing with dev workflow */
const TEST_PORT = 5399;

/**
 * The conformity app is served under the `/conformity/` base path in every
 * environment, so the test exercises the real prefixed URLs (matching how the
 * preview and production route the SPA).
 */
const BASE_PATH = '/conformity/';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  reporter: 'list',

  use: {
    baseURL: `http://localhost:${TEST_PORT}`,
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    // Chromium's default headless UA contains "HeadlessChrome", which crawler
    // heuristics classify as a bot. Present a normal desktop-Chrome UA so the
    // tests exercise the real human SPA path.
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.105 Safari/537.36',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        // Use the full Chromium from Nix — NOT headless-shell (different binary).
        // Explicitly omit devices spread so Playwright doesn't override executablePath.
        browserName: 'chromium',
        executablePath: CHROMIUM_EXECUTABLE,
      },
    },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: `http://localhost:${TEST_PORT}${BASE_PATH}`,
    timeout: 60_000,
    // Reuse a server already listening on the port (e.g. a leftover vite
    // process from a previous test run); avoids "port already in use" crashes
    // when validation runs back-to-back without a clean teardown in between.
    reuseExistingServer: true,
    env: {
      PORT: String(TEST_PORT),
      BASE_PATH,
      // Keep Vite quiet about the cartographer plugin in test mode.
      NODE_ENV: 'test',
    },
  },
});
