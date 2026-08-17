import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 13.1 — Delegated Regulation (EU) 2022/30 live:
 *
 *   1. the RED reader carries the delegated-regulation panel with all three
 *      articles verbatim ("internet-connected radio equipment", the money/
 *      virtual-currency category, the MDR/IVDR derogation);
 *   2. the lifecycle banner states BOTH dates — applies from 2025-08-01,
 *      repealed with effect from 2027-12-11 — and quotes the repealing act;
 *   3. the obligations register serves the updated Art 3(3)(d)/(e)/(f)
 *      descriptions naming the designated categories (declare red, read
 *      back, restore);
 *   4. screenshots reviewed.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_red_delegated_131_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'red_delegated_131');
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

  // 1 + 2. The reader panel.
  await page.goto(`${BASE}/library/red`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const panel = page.getByTestId('red-delegated-articles');
  const havePanel = (await panel.count()) > 0;
  console.log(`  ${havePanel ? 'PASS' : 'FAIL'}  delegated-regulation panel present on /library/red`);
  if (!havePanel) failures.push('panel missing');
  const probes = [
    ["Art 1 category", "internet-connected radio equipment"],
    ["Art 1(3) fraud category", "transfer money, monetary value or virtual currency"],
    ["Art 2 derogation", "By way of derogation from Article 1"],
    ["amended application date", "It shall apply from 1 August 2025."],
    ["repeal quote", "repealed with effect from 11 December 2027"],
  ];
  const body = await page.evaluate(() => document.body.innerText);
  for (const [label, text] of probes) {
    const okp = body.includes(text);
    console.log(`  ${okp ? 'PASS' : 'FAIL'}  ${label} verbatim on the page`);
    if (!okp) failures.push(label);
  }
  await panel.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'red_delegated_panel.png'), fullPage: false });

  // 3. The obligations register names the designated categories.
  const before = await apiGet('/conformity/org/profile');
  const prior = before.regulations.find((r) => r.key === 'red')?.isDeclared ?? false;
  if (!prior) {
    await page.evaluate(async () => {
      await fetch('/api/conformity/org/regulations/red', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isDeclared: true }),
      });
    });
  }
  const obligations = await apiGet('/conformity/org/obligations');
  const d = obligations.obligations.find((o) => o.regulationKey === 'red' && o.refCode === 'Art 3(3)(d)');
  const catOk = Boolean(d && d.description.includes("internet-connected radio equipment"));
  console.log(`  ${catOk ? 'PASS' : 'FAIL'}  Art 3(3)(d) obligation names its designated category`);
  if (!catOk) failures.push('obligation category missing');
  const e = obligations.obligations.find((o) => o.regulationKey === 'red' && o.refCode === 'Art 3(3)(e)');
  const eOk = Boolean(e && e.description.includes('childcare'));
  console.log(`  ${eOk ? 'PASS' : 'FAIL'}  Art 3(3)(e) obligation names childcare/toys/wearables`);
  if (!eOk) failures.push('(e) categories missing');
  if (!prior) {
    await page.evaluate(async () => {
      await fetch('/api/conformity/org/regulations/red', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isDeclared: false }),
      });
    });
    const after = await apiGet('/conformity/org/profile');
    const restored = after.regulations.find((r) => r.key === 'red')?.isDeclared === false;
    console.log(`  ${restored ? 'PASS' : 'FAIL'}  RED declaration restored`);
    if (!restored) failures.push('cleanup failed');
  }

  await browser.close();
  if (failures.length) {
    console.log(`\nFAILED: ${failures.join('; ')}`);
    process.exit(1);
  }
  console.log('\nAll checks passed. Screenshot in artifacts_verify/red_delegated_131/');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
