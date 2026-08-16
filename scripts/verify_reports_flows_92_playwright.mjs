import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 9.2 — reports re-homed onto Home, flows onto Settings, live.
 *
 *   1. Home renders the Reports section (portfolio rollups + assessment
 *      reports, with the portfolio builder for a writable session);
 *   2. /reports redirects to Home; a report document still opens in the
 *      /reports/:id workspace;
 *   3. /settings/flows renders the flow-authoring page under the Settings
 *      sub-navigation; /flows redirects there;
 *   4. the More menu no longer lists Reports or Flows.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_reports_flows_92_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'http://localhost:8088/api';
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'reports_flows_92');
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const failures = [];
  const login = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  });
  const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';

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

  // 1. The Reports section on Home.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const section = page.locator('[data-testid="reports-section"]');
  const hasSection = await section.count();
  console.log(`  ${hasSection ? 'PASS' : 'FAIL'}  Home renders the Reports section`);
  if (!hasSection) failures.push('reports section missing on Home');
  if (hasSection) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const builder = await page.locator('[data-testid="report-new-portfolio"]').count();
    console.log(`  ${builder ? 'PASS' : 'FAIL'}  portfolio report builder present`);
    if (!builder) failures.push('portfolio builder missing');
    await page.screenshot({ path: path.join(OUT, 'home_reports_section.png'), fullPage: false });
  }

  // 2. /reports redirects to Home; a document still opens in the workspace.
  await page.goto(`${BASE}/reports`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const reportsRedirect = new URL(page.url()).pathname.replace(/\/$/, '') === '/conformity';
  console.log(`  ${reportsRedirect ? 'PASS' : 'FAIL'}  /reports redirects to Home (${page.url()})`);
  if (!reportsRedirect) failures.push(`/reports landed on ${page.url()}`);

  const list = await (await fetch(`${API}/conformity/reports`, { headers: { cookie } })).json();
  const existing = list.reports?.[0];
  if (existing) {
    await page.goto(`${BASE}/reports/${existing.id}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const stillWorkspace = page.url().includes(`/reports/${existing.id}`);
    console.log(`  ${stillWorkspace ? 'PASS' : 'FAIL'}  /reports/:id workspace still opens (report ${existing.id})`);
    if (!stillWorkspace) failures.push('workspace route broken');
    await page.screenshot({ path: path.join(OUT, 'report_workspace.png'), fullPage: false });
  } else {
    console.log('  SKIP  workspace open (no report exists to open)');
  }

  // 3. Flows under Settings; /flows redirects.
  await page.goto(`${BASE}/settings/flows`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const flowsHeading = await page.getByRole('heading', { name: 'Flows' }).count();
  const settingsTabs = await page.getByRole('navigation', { name: 'Settings sections' }).count();
  console.log(`  ${flowsHeading ? 'PASS' : 'FAIL'}  /settings/flows renders the flows page`);
  console.log(`  ${settingsTabs ? 'PASS' : 'FAIL'}  Settings sub-navigation present`);
  if (!flowsHeading) failures.push('flows page missing at /settings/flows');
  if (!settingsTabs) failures.push('settings sub-nav missing');
  await page.screenshot({ path: path.join(OUT, 'settings_flows.png'), fullPage: false });

  await page.goto(`${BASE}/flows`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const flowsRedirect = page.url().includes('/settings/flows');
  console.log(`  ${flowsRedirect ? 'PASS' : 'FAIL'}  /flows redirects to /settings/flows (${page.url()})`);
  if (!flowsRedirect) failures.push(`/flows landed on ${page.url()}`);

  // 4. The More menu no longer lists Reports or Flows.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /More/ }).first().click().catch(() => {});
  await page.waitForTimeout(500);
  const staleReports = await page.getByRole('menuitem', { name: 'Reports' }).count();
  const staleFlows = await page.getByRole('menuitem', { name: 'Flows' }).count();
  console.log(`  ${staleReports === 0 && staleFlows === 0 ? 'PASS' : 'FAIL'}  More menu holds neither Reports nor Flows`);
  if (staleReports || staleFlows) failures.push('stale More entries remain');
  await page.screenshot({ path: path.join(OUT, 'more_menu.png'), fullPage: false });

  await browser.close();
  if (failures.length) {
    console.error(`\nREPORTS/FLOWS 9.2 G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nREPORTS/FLOWS 9.2 G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
