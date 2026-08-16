import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 9.3 — the transitional "More" menu is gone; the auditor portal
 * stands alone as the external notified-body door.
 *
 *   1. the authenticated shell's navigation contains NO "More" menu —
 *      desktop and mobile;
 *   2. /auditor-portal still renders, outside the shell, and REFUSES
 *      without a token (401/403 from the workspace endpoint);
 *   3. the workspace endpoint refuses a garbage token (403), so the door
 *      is real, not decorative.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_shell_93_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'http://localhost:8088/api';
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'shell_93');
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const failures = [];

  const pw = await import(
    path.join(__dirname, '..', 'artifacts/conformity/node_modules/@playwright/test/index.js')
  );
  const chromium = pw.chromium || pw.default?.chromium;
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  if (await page.locator('input[type="password"]').count()) {
    await page.fill('input[type="text"], input[name="username"], input[id*="user"]', process.env.ADMIN_USERNAME);
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
  }

  // 1. No "More" menu, desktop.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const moreDesktop = await page.locator('[data-testid="nav-transitional"]').count();
  console.log(`  ${moreDesktop === 0 ? 'PASS' : 'FAIL'}  desktop nav has no More menu`);
  if (moreDesktop) failures.push('More menu still in desktop nav');
  await page.screenshot({ path: path.join(OUT, 'nav_no_more.png'), fullPage: false });

  // 1b. No "Being re-homed" section in the mobile drawer.
  await page.setViewportSize({ width: 420, height: 900 });
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.waitForTimeout(600);
  const rehomed = await page.getByText('Being re-homed').count();
  console.log(`  ${rehomed === 0 ? 'PASS' : 'FAIL'}  mobile drawer has no re-homed section`);
  if (rehomed) failures.push('mobile drawer still lists transitional surfaces');
  await page.screenshot({ path: path.join(OUT, 'mobile_drawer.png'), fullPage: false });
  await page.setViewportSize({ width: 1440, height: 900 });

  // 2. The external door renders and refuses without a token.
  await page.goto(`${BASE}/auditor-portal`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const portalRenders = new URL(page.url()).pathname.includes('/auditor-portal');
  console.log(`  ${portalRenders ? 'PASS' : 'FAIL'}  /auditor-portal renders outside the shell (${page.url()})`);
  if (!portalRenders) failures.push(`portal route landed on ${page.url()}`);
  await page.screenshot({ path: path.join(OUT, 'auditor_portal.png'), fullPage: false });

  // 3. The workspace endpoint refuses garbage tokens.
  const noToken = await fetch(`${API}/conformity/auditor/workspace`);
  const badToken = await fetch(`${API}/conformity/auditor/workspace?token=not-a-real-token`);
  console.log(`  ${noToken.status === 401 ? 'PASS' : 'FAIL'}  workspace without token -> 401 (got ${noToken.status})`);
  console.log(`  ${badToken.status === 403 ? 'PASS' : 'FAIL'}  workspace with bad token -> 403 (got ${badToken.status})`);
  if (noToken.status !== 401) failures.push(`no-token got ${noToken.status}`);
  if (badToken.status !== 403) failures.push(`bad-token got ${badToken.status}`);

  await browser.close();
  if (failures.length) {
    console.error(`\nSHELL 9.3 G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nSHELL 9.3 G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
