import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 10.2 — the Art. 14(8) product-user register, live:
 *
 *   1. the product file shows the register panel; a user with a version and
 *      one WITHOUT are registered through the dialog (absence stays absence);
 *   2. an advisory's "Impacted users" view on Incidents shows the tri-state
 *      split WITH its rule;
 *   3. recording a notification through the dialog persists the org's
 *      stated act with provenance, and it appears in the product file;
 *   4. regression: the psirt panel's existing pieces still render.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_product_users_102_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'http://localhost:8088/api';
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'product_users_102');
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const failures = [];
  const login = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  });
  const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
  const jsonHeaders = { 'Content-Type': 'application/json', cookie };

  // Fixtures: manufacturer product + advisory naming affected versions.
  const product = await (await fetch(`${API}/conformity/products`, {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ name: 'G6 Art148 Probe', productType: 'software', orgRole: 'manufacturer' }),
  })).json();
  const advisory = await (await fetch(`${API}/conformity/advisories`, {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({
      productId: product.id, title: 'G6 probe advisory', severity: 'high',
      affectedVersions: '2.4.0', fixedVersions: '2.4.1',
    }),
  })).json();

  const pw = await import(path.join(__dirname, '..', 'artifacts/conformity/node_modules/@playwright/test/index.js'));
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

  // 1. Register two users through the product-file dialog.
  await page.goto(`${BASE}/products/${product.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const panel = page.locator('[data-testid="product-users-panel"]');
  await panel.scrollIntoViewIfNeeded().catch(() => {});
  console.log(`  ${(await panel.count()) ? 'PASS' : 'FAIL'}  register panel renders in the product file`);
  if (!(await panel.count())) failures.push('panel missing');

  for (const u of [
    { name: 'Fleet Impacted BV', version: '2.4.0' },
    { name: 'Fleet Unknown GmbH', version: '' },
  ]) {
    await page.locator('[data-testid="product-user-add"]').click();
    await page.waitForTimeout(300);
    await page.getByLabel('Name *').fill(u.name);
    if (u.version) await page.getByLabel('Deployed version (if known)').fill(u.version);
    await page.locator('[data-testid="product-user-confirm"]').click();
    await page.waitForTimeout(800);
  }
  const absence = await page.getByText('version not recorded').count();
  console.log(`  ${absence ? 'PASS' : 'FAIL'}  absent version renders as absence`);
  if (!absence) failures.push('absence not rendered');
  await page.screenshot({ path: path.join(OUT, 'register_panel.png'), fullPage: false });

  // 2. Impacted-users view from Incidents.
  await page.goto(`${BASE}/incidents`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.locator(`[data-testid="impacted-users-${advisory.id}"]`).scrollIntoViewIfNeeded();
  await page.locator(`[data-testid="impacted-users-${advisory.id}"]`).click();
  await page.waitForTimeout(1000);
  const rule = await page.getByText('free text', { exact: false }).count();
  const impactedShown = await page.getByText('Fleet Impacted BV').count();
  const unknownShown = await page.getByText('Fleet Unknown GmbH').count();
  console.log(`  ${rule ? 'PASS' : 'FAIL'}  the derivation rule is stated verbatim`);
  console.log(`  ${impactedShown && unknownShown ? 'PASS' : 'FAIL'}  tri-state split renders both fleets`);
  if (!rule) failures.push('rule missing');
  if (!impactedShown || !unknownShown) failures.push('split incomplete');
  await page.screenshot({ path: path.join(OUT, 'impacted_split.png'), fullPage: false });

  // 3. Record the notification through the dialog.
  await page.locator('[data-testid="record-notification-open"]').click();
  await page.waitForTimeout(300);
  await page.locator('input[type="datetime-local"]').fill('2026-08-16T12:00');
  await page.getByPlaceholder('e.g. e-mail to registered contacts').fill('e-mail to registered contacts');
  await page.locator('[data-testid="record-notification-confirm"]').click();
  await page.waitForTimeout(1200);

  const acts = await (await fetch(`${API}/conformity/products/${product.id}/user-notifications`, { headers: { cookie } })).json();
  const recorded = acts.notifications?.length === 1 && /:/.test(acts.notifications[0].recordedBy);
  console.log(`  ${recorded ? 'PASS' : 'FAIL'}  notification recorded with provenance (${acts.notifications?.[0]?.recordedBy})`);
  if (!recorded) failures.push(`notifications: ${JSON.stringify(acts).slice(0, 120)}`);

  await page.goto(`${BASE}/products/${product.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.locator('[data-testid="product-users-panel"]').scrollIntoViewIfNeeded();
  const actShown = await page.getByText('recorded by', { exact: false }).count();
  console.log(`  ${actShown ? 'PASS' : 'FAIL'}  the recorded act renders in the product file`);
  if (!actShown) failures.push('act not shown in product file');
  await page.screenshot({ path: path.join(OUT, 'notification_recorded.png'), fullPage: false });

  // 4. Regression: existing psirt pieces still render.
  await page.goto(`${BASE}/incidents`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const psirtOk =
    (await page.getByText('Security advisories').count()) &&
    (await page.getByText('Vulnerability reports', { exact: false }).count());
  console.log(`  ${psirtOk ? 'PASS' : 'FAIL'}  regression: psirt panel sections render`);
  if (!psirtOk) failures.push('psirt regression');

  // Clean up (cascade removes register + notifications; advisory keeps its
  // frozen name with productId set null — the designed survival behavior).
  await fetch(`${API}/conformity/products/${product.id}`, { method: 'DELETE', headers: { cookie } });

  await browser.close();
  if (failures.length) {
    console.error(`\nPRODUCT USERS 10.2 G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nPRODUCT USERS 10.2 G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
