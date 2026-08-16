import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 9.1 — bulk import on Products, live; the portfolio donor retired.
 *
 *   1. the Import dialog parses pasted CSV honestly: named rows ready, the
 *      nameless row shown as rejected, absent cells rendered as absence;
 *   2. committing persists the named rows in the real registry (API
 *      read-back), with absent fields EMPTY (never invented) and NO
 *      assessment created;
 *   3. /product-portfolio redirects to /products (bookmarks survive).
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_products_import_91_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'http://localhost:8088/api';
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'products_import_91');
fs.mkdirSync(OUT, { recursive: true });

const CSV = [
  'name,type,version,manufacturer',
  'G6 Import Probe Gateway,Hardware,3.1,Probe GmbH',
  ',Software,1.0,Nameless Row BV',
  'G6 Import Probe Sensor,,,',
].join('\n');

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

  // 1. The Import dialog, parsed preview.
  await page.goto(`${BASE}/products`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Import' }).first().click();
  await page.waitForTimeout(400);
  await page.locator('textarea').fill(CSV);
  await page.waitForTimeout(400);
  const readyLine = await page.getByText('2 rows ready; 1 without a name').count();
  console.log(`  ${readyLine > 0 ? 'PASS' : 'FAIL'}  preview: 2 ready, 1 nameless shown as rejected`);
  if (!readyLine) failures.push('preview did not report 2 ready / 1 nameless');
  await page.screenshot({ path: path.join(OUT, 'import_preview.png'), fullPage: false });

  // 2. Commit and read the registry back.
  await page.getByRole('button', { name: 'Import 2 products' }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'after_import.png'), fullPage: false });

  const products = await (await fetch(`${API}/conformity/products`, { headers: { cookie } })).json();
  const gateway = products.find((p) => p.name === 'G6 Import Probe Gateway');
  const sensor = products.find((p) => p.name === 'G6 Import Probe Sensor');
  const nameless = products.find((p) => (p.manufacturerName || '') === 'Nameless Row BV');
  console.log(`  ${gateway ? 'PASS' : 'FAIL'}  gateway row persisted`);
  console.log(`  ${sensor ? 'PASS' : 'FAIL'}  sensor row persisted`);
  console.log(`  ${!nameless ? 'PASS' : 'FAIL'}  nameless row NOT created`);
  if (!gateway) failures.push('gateway missing');
  if (!sensor) failures.push('sensor missing');
  if (nameless) failures.push('nameless row was created');

  if (gateway) {
    const okFields = gateway.productType === 'Hardware' && gateway.version === '3.1' && gateway.manufacturerName === 'Probe GmbH';
    console.log(`  ${okFields ? 'PASS' : 'FAIL'}  provided fields persisted as given`);
    if (!okFields) failures.push(`gateway fields: ${JSON.stringify(gateway)}`);
  }
  if (sensor) {
    const okAbsent = sensor.productType === '' && sensor.version === '' && sensor.manufacturerName === '';
    console.log(`  ${okAbsent ? 'PASS' : 'FAIL'}  absent fields stayed absent (never invented)`);
    if (!okAbsent) failures.push(`sensor fields invented: ${JSON.stringify(sensor)}`);
    const detail = await (await fetch(`${API}/conformity/products/${sensor.id}`, { headers: { cookie } })).json();
    const okNoAssessment = (detail.assessments?.length ?? -1) === 0;
    console.log(`  ${okNoAssessment ? 'PASS' : 'FAIL'}  no assessment created (Art. 32 stays explicit)`);
    if (!okNoAssessment) failures.push(`assessments: ${JSON.stringify(detail.assessments)}`);
  }

  // 3. The donor's path redirects.
  await page.goto(`${BASE}/product-portfolio`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const redirected = page.url().includes('/products');
  console.log(`  ${redirected ? 'PASS' : 'FAIL'}  /product-portfolio redirects to /products (${page.url()})`);
  if (!redirected) failures.push(`redirect landed on ${page.url()}`);
  await page.screenshot({ path: path.join(OUT, 'portfolio_redirect.png'), fullPage: false });

  // Clean up the probes.
  for (const p of [gateway, sensor].filter(Boolean)) {
    await fetch(`${API}/conformity/products/${p.id}`, { method: 'DELETE', headers: { cookie } });
  }

  await browser.close();
  if (failures.length) {
    console.error(`\nPRODUCTS IMPORT 9.1 G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nPRODUCTS IMPORT 9.1 G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
