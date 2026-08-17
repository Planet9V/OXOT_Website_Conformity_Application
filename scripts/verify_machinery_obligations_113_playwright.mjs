import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 11.3 — the corrected + extended Machinery obligation seed, live:
 *
 *   1. the Organisation page declares the Machinery Regulation via the real
 *      Switch;
 *   2. the obligations API serves the cyber EHSRs at their REAL statutory
 *      addresses (1.1.9, 1.2.1, 1.2.1(d), 1.2.1(f)) — and none of the three
 *      misnumbered rows 11.3 removed — plus the Art 10 chain, Art 21 DoC and
 *      Art 19 traceability;
 *   3. Home's cockpit shows the `machinery · N` badge under the manufacturer
 *      lens;
 *   4. cleanup: the declaration is restored.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_machinery_obligations_113_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'machinery_obligations_113');
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

  const apiGet = (p) => page.evaluate(async (u) => (await fetch(u)).json(), `/api${p}`);

  const before = await apiGet('/conformity/org/profile');
  const prior = before.regulations.find((r) => r.key === 'machinery')?.isDeclared ?? false;

  // 1. Declare via the real UI.
  await page.goto(`${BASE}/organisation`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  if (!prior) {
    await page.getByLabel('Declare Machinery').click();
    await page.waitForTimeout(1000);
  }
  const declaredNow = (await apiGet('/conformity/org/profile')).regulations.find((r) => r.key === 'machinery')?.isDeclared;
  console.log(`  ${declaredNow ? 'PASS' : 'FAIL'}  Machinery declared through the Organisation page`);
  if (!declaredNow) failures.push('not declared');

  // 2. Corrected statutory addresses.
  const obligations = await apiGet('/conformity/org/obligations');
  const mach = obligations.obligations.filter((o) => o.regulationKey === 'machinery');
  const refCodes = new Set(mach.map((o) => o.refCode));
  const wanted = ['Annex III 1.1.9', 'Annex III 1.2.1', 'Annex III 1.2.1(d)', 'Annex III 1.2.1(f)', 'Annex IV', 'Art 21', 'Art 10(3)', 'Art 19'];
  const missing = wanted.filter((r) => !refCodes.has(r));
  console.log(`  ${missing.length === 0 ? 'PASS' : 'FAIL'}  corrected refCodes present (${mach.length} machinery obligations${missing.length ? '; missing ' + missing.join(', ') : ''})`);
  if (missing.length) failures.push('rows missing');
  const gone = ['Annex II', 'Annex III 1.2.1(a)', 'Annex III 1.2.1(b)', 'Annex III 1.2.1(c)'].filter((r) => refCodes.has(r));
  console.log(`  ${gone.length === 0 ? 'PASS' : 'FAIL'}  misnumbered rows removed${gone.length ? ' — still present: ' + gone.join(', ') : ''}`);
  if (gone.length) failures.push('stale rows survive');

  // 3. Cockpit badge.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const badge = await page.getByText(/machinery · \d+/).count();
  console.log(`  ${badge ? 'PASS' : 'FAIL'}  cockpit shows the machinery act badge`);
  if (!badge) failures.push('badge missing');
  await page.screenshot({ path: path.join(OUT, 'home_cockpit_machinery.png'), fullPage: false });

  // 4. Restore.
  if (!prior) {
    await page.evaluate(async () => {
      await fetch('/api/conformity/org/regulations/machinery', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isDeclared: false }),
      });
    });
    const after = await apiGet('/conformity/org/profile');
    const restored = after.regulations.find((r) => r.key === 'machinery')?.isDeclared === false;
    console.log(`  ${restored ? 'PASS' : 'FAIL'}  Machinery declaration restored`);
    if (!restored) failures.push('cleanup failed');
  }

  await browser.close();
  if (failures.length) {
    console.log(`\nFAILED: ${failures.join('; ')}`);
    process.exit(1);
  }
  console.log('\nAll checks passed. Screenshot in artifacts_verify/machinery_obligations_113/');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
