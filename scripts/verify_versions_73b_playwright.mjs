import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 7.3b — recording a product version, live.
 *
 *   1. the statutory file shows the "no versions recorded" gap first;
 *   2. recording a version through the dialog persists it (API read-back)
 *      and the per-version retention clock renders;
 *   3. recording the same version again is refused with the natural-key 409.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_versions_73b_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'http://localhost:8088/api';
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'versions_73b');
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const failures = [];
  const login = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  });
  const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
  const products = await (await fetch(`${API}/conformity/products`, { headers: { cookie } })).json();
  const product = products.find((p) => p.name === 'NovaGuard Smart Home Hub');
  if (!product) throw new Error('demo product missing');

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

  await page.goto(`${BASE}/products/${product.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // Only meaningful on a clean slate — earlier runs may have recorded versions.
  const pre = await (await fetch(`${API}/conformity/products/${product.id}/statutory-file`, { headers: { cookie } })).json();
  if ((pre.versions?.length ?? 0) === 0) {
    const gapBefore = await page.getByText('No versions recorded').count();
    console.log(`  ${gapBefore > 0 ? 'PASS' : 'FAIL'}  gap shown before recording`);
    if (!gapBefore) failures.push('gap not shown before recording');
  } else {
    console.log('  SKIP  gap check (versions already recorded by an earlier run)');
  }

  // Record v2.4.1 placed 2026-08-01 through the dialog.
  await page.locator('[data-testid="record-version"]').click();
  await page.waitForTimeout(400);
  await page.getByPlaceholder('2.1.0').fill('2.4.1');
  await page.locator('input[type="date"]').first().fill('2026-08-01');
  await page.getByRole('button', { name: 'Record version' }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'version_recorded.png'), fullPage: false });

  const file = await (await fetch(`${API}/conformity/products/${product.id}/statutory-file`, { headers: { cookie } })).json();
  const v = file.versions?.find((x) => x.label === '2.4.1');
  const okPersist = Boolean(v && v.placedOnMarket === '2026-08-01');
  const okRetention = Boolean(v?.technicalDocumentationRetention?.until);
  console.log(`  ${okPersist ? 'PASS' : 'FAIL'}  version persisted with placing date (${v?.placedOnMarket})`);
  console.log(`  ${okRetention ? 'PASS' : 'FAIL'}  per-version retention resolves (until ${v?.technicalDocumentationRetention?.until})`);
  if (!okPersist) failures.push(`persist: ${JSON.stringify(v)}`);
  if (!okRetention) failures.push('retention did not resolve');

  // The rendered file must now show the version rather than the gap.
  const shows = await page.getByText('2.4.1').count();
  console.log(`  ${shows > 0 ? 'PASS' : 'FAIL'}  version renders in the statutory file`);
  if (!shows) failures.push('version not rendered');

  // Natural key: same version again -> 409.
  const dup = await fetch(`${API}/conformity/products/${product.id}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ version: '2.4.1' }),
  });
  console.log(`  ${dup.status === 409 ? 'PASS' : 'FAIL'}  duplicate refused (HTTP ${dup.status})`);
  if (dup.status !== 409) failures.push(`duplicate got ${dup.status}`);

  await browser.close();
  if (failures.length) {
    console.error(`\nVERSIONS 7.3b G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nVERSIONS 7.3b G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
