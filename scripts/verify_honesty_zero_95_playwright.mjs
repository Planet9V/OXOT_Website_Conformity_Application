import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 9.5 — G4 driven to zero, proven on the live surface that
 * mattered most: the public trust center showed procurement/auditors a
 * "Cryptographic Provenance Hash" that was the SHA-256 of the empty string.
 *
 *   1. /trust renders the honest "not yet published" line and the
 *      empty-string digest appears NOWHERE in the page;
 *   2. the digest also appears nowhere in the served JS bundles — the fake
 *      evidence is out of the shipped artifact, not merely hidden.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_honesty_zero_95_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8088';
const FAKE = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'honesty_zero_95');
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

  // Collect every JS bundle the page loads so the digest can be searched in
  // the served artifact itself.
  const bundles = [];
  page.on('response', async (res) => {
    if (res.url().endsWith('.js') || res.url().includes('.js?')) {
      try { bundles.push(await res.text()); } catch { /* stream gone */ }
    }
  });

  await page.goto(`${BASE}/trust/1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // The hash line lives under the xBOM tab.
  await page.getByText('xBOM Security Integrity').first().click().catch(() => {});
  await page.waitForTimeout(600);

  const honest = await page.getByText('not yet published for this product').count();
  console.log(`  ${honest ? 'PASS' : 'FAIL'}  trust center shows the honest "not yet published" line`);
  if (!honest) failures.push('honest line missing');

  const pageHasFake = (await page.content()).includes(FAKE);
  console.log(`  ${!pageHasFake ? 'PASS' : 'FAIL'}  empty-string digest absent from the rendered page`);
  if (pageHasFake) failures.push('fake digest still rendered');
  await page.screenshot({ path: path.join(OUT, 'trust_center_honest.png'), fullPage: false });

  const bundleHasFake = bundles.some((b) => b.includes(FAKE));
  console.log(`  ${!bundleHasFake ? 'PASS' : 'FAIL'}  empty-string digest absent from ${bundles.length} served JS bundle(s)`);
  if (bundleHasFake) failures.push('fake digest still in a served bundle');

  await browser.close();
  if (failures.length) {
    console.error(`\nHONESTY-ZERO 9.5 G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nHONESTY-ZERO 9.5 G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
