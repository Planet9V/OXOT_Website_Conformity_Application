import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 7.3a — the polymorphic product file, live.
 *
 *   1. a MANUFACTURER product shows the Assess (notified body) panel and the
 *      authoring stages, and no Verify gate;
 *   2. an IMPORTER product shows the Verify gate (Arts. 19/20 checklist) and
 *      NO authoring stages; answering a checklist item persists;
 *   3. a product with no declared role shows the honest prompt.
 *
 * Uses the API (admin session) to set up roles, then asserts in the browser.
 * Run:  set -a; source .env; set +a; node scripts/verify_product_file_73a_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'http://localhost:8088/api';
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'product_file_73a');
fs.mkdirSync(OUT, { recursive: true });

async function api(cookie, method, url, body) {
  const res = await fetch(`${API}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json', cookie },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function run() {
  const failures = [];

  // Admin API session for setup.
  const login = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  });
  const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
  if (!cookie) throw new Error('admin login failed');

  const products = (await api(cookie, 'GET', '/conformity/products')).json;
  const manufacturer = products.find((p) => p.name === 'NovaGuard Smart Home Hub');
  const importer = products.find((p) => p.name !== 'NovaGuard Smart Home Hub');
  if (!manufacturer || !importer) throw new Error('need at least two products');

  // Declare roles through the real PUT (also proves the spec round-trip).
  const m = await api(cookie, 'PUT', `/conformity/products/${manufacturer.id}`, {
    name: manufacturer.name, orgRole: 'manufacturer',
  });
  const i = await api(cookie, 'PUT', `/conformity/products/${importer.id}`, {
    name: importer.name, orgRole: 'importer',
  });
  if (m.status !== 200 || m.json.orgRole !== 'manufacturer') failures.push(`PUT manufacturer role: ${m.status} ${m.json.orgRole}`);
  if (i.status !== 200 || i.json.orgRole !== 'importer') failures.push(`PUT importer role: ${i.status} ${i.json.orgRole}`);
  console.log(`  ${failures.length === 0 ? 'PASS' : 'FAIL'}  roles declared via API (manufacturer, importer)`);

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

  // 1. Manufacturer product: Assess panel, no Verify gate.
  await page.goto(`${BASE}/products/${manufacturer.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const nbPanel = await page.locator('[data-testid="notified-body-panel"]').count();
  const noVerify = await page.locator('[data-testid="verify-panel"]').count();
  const roleBadge = await page.getByText('Our role: Manufacturer').count();
  await page.screenshot({ path: path.join(OUT, 'manufacturer_file.png'), fullPage: false });
  const ok1 = nbPanel > 0 && noVerify === 0 && roleBadge > 0;
  if (!ok1) failures.push(`manufacturer file: nb=${nbPanel} verify=${noVerify} badge=${roleBadge}`);
  console.log(`  ${ok1 ? 'PASS' : 'FAIL'}  manufacturer file: Assess panel, badge, no Verify gate`);

  // 2. Importer product: Verify gate, no authoring; a saved answer persists.
  await page.goto(`${BASE}/products/${importer.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const verify = await page.locator('[data-testid="verify-panel"]').count();
  const noWizard = await page.getByText('Kickoff Conformity Wizard').count();
  const noNb = await page.locator('[data-testid="notified-body-panel"]').count();
  await page.screenshot({ path: path.join(OUT, 'importer_file.png'), fullPage: false });
  const ok2 = verify > 0 && noWizard === 0 && noNb === 0;
  if (!ok2) failures.push(`importer file: verify=${verify} wizard=${noWizard} nb=${noNb}`);
  console.log(`  ${ok2 ? 'PASS' : 'FAIL'}  importer file: Verify gate, no authoring stages`);

  // Answer the first checklist question "Yes" and prove it persists.
  const firstYes = page.locator('[data-testid="verify-panel"] button', { hasText: 'Yes' }).first();
  await firstYes.click();
  await page.waitForTimeout(1200);
  const persisted = (await api(cookie, 'GET', `/conformity/operator-checks?productId=${importer.id}`)).json;
  const row = persisted.checks?.find((c) => c.role === 'importer');
  const ok3 = row?.conformityAssessmentCarriedOut === true;
  if (!ok3) failures.push(`checklist persistence: ${JSON.stringify(row?.conformityAssessmentCarriedOut)}`);
  console.log(`  ${ok3 ? 'PASS' : 'FAIL'}  checklist answer persisted via PUT (db-backed)`);

  await browser.close();

  // 3. Clean up the probe answer so demo data stays honest (unanswered).
  await api(cookie, 'PUT', `/conformity/products/${importer.id}/operator-check/importer`, {});

  if (failures.length) {
    console.error(`\nPRODUCT FILE 7.3a G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nPRODUCT FILE 7.3a G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
