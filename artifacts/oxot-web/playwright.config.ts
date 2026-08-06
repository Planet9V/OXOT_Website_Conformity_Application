import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for browser-level smoke tests.
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
const TEST_PORT = 5299;

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
    // Chromium's default headless UA contains "HeadlessChrome", which the site's
    // SEO middleware (vite-seo-plugin.ts) classifies as a crawler. When a dev
    // domain is reachable it then serves crawler meta HTML instead of the SPA,
    // so every page loads blank. Present a normal desktop-Chrome UA so the tests
    // exercise the real human SPA path.
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
    url: `http://localhost:${TEST_PORT}`,
    timeout: 60_000,
    // Always start a fresh instance so the port is predictable.
    reuseExistingServer: false,
    env: {
      PORT: String(TEST_PORT),
      BASE_PATH: '/',
      // Keep Vite quiet about the cartographer plugin in test mode.
      NODE_ENV: 'test',
    },
  },
});
