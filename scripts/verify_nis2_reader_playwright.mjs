import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for the NIS2 reader (repeatable home for the Phase-12 ad-hoc check):
 *
 *   1. /library/nis2 renders with the directive banner (transposition
 *      caveat naming the two loaded national measures);
 *   2. Art. 23 renders its verbatim reporting-obligations text;
 *   3. the Annexes tab serves Annex I WITH the entity-definition column
 *      that Phase 12's parity work restored ("Electricity undertakings as
 *      defined in Article 2, point (57), of Directive (EU) 2019/944");
 *   4. screenshots for review.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_nis2_reader_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'nis2_reader');
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const failures = [];
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

  await page.goto(`${BASE}/library/nis2`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // 1. Directive banner.
  const banner = await page.getByText('NIS2 is a directive.').count();
  console.log(`  ${banner ? 'PASS' : 'FAIL'}  directive banner with the transposition caveat`);
  if (!banner) failures.push('banner missing');

  // 2. Art. 23 verbatim.
  await page.locator('button', { hasText: 'Art. 23' }).first().click();
  await page.waitForTimeout(600);
  const art23 = await page
    .getByText('an early warning', { exact: false })
    .count();
  console.log(`  ${art23 ? 'PASS' : 'FAIL'}  Art. 23 renders its verbatim reporting text`);
  if (!art23) failures.push('Art 23 text missing');
  await page.screenshot({ path: path.join(OUT, 'nis2_art23.png'), fullPage: false });

  // 3. Annex I entity column (restored by Phase 12).
  await page.locator('button', { hasText: 'Annexes' }).first().click();
  await page.waitForTimeout(800);
  const entity = await page
    .getByText('Electricity undertakings as defined in Article 2, point (57), of Directive (EU) 2019/944', { exact: false })
    .count();
  console.log(`  ${entity ? 'PASS' : 'FAIL'}  Annex I serves the entity-definition column`);
  if (!entity) failures.push('entity column missing');
  await page.screenshot({ path: path.join(OUT, 'nis2_annex1.png'), fullPage: false });

  await browser.close();
  if (failures.length) {
    console.log(`\nFAILED: ${failures.join('; ')}`);
    process.exit(1);
  }
  console.log('\nAll checks passed. Screenshots in artifacts_verify/nis2_reader/');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
