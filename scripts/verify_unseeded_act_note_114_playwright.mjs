import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 11.4 — a declared act with no seeded content is named, live:
 *
 *   1. GDPR (a known regulation with zero requirement rows) is declared
 *      through the real Organisation-page Switch;
 *   2. the obligations API names it in regulationsWithoutSeededContent;
 *   3. Home's cockpit renders the honesty note ("Zero here means
 *      un-modelled, not compliant");
 *   4. cleanup: the GDPR declaration is restored.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_unseeded_act_note_114_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'unseeded_act_note_114');
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
  const prior = before.regulations.find((r) => r.key === 'gdpr')?.isDeclared ?? false;

  // 1. Declare GDPR via the real UI.
  await page.goto(`${BASE}/organisation`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  if (!prior) {
    await page.getByLabel('Declare GDPR').click();
    await page.waitForTimeout(1000);
  }

  // 2. The API names the content gap.
  const obligations = await apiGet('/conformity/org/obligations');
  const named = (obligations.regulationsWithoutSeededContent ?? []).includes('gdpr');
  console.log(`  ${named ? 'PASS' : 'FAIL'}  API names gdpr as declared-but-unseeded`);
  if (!named) failures.push('api does not name the gap');

  // 3. The cockpit renders the note.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const note = await page.getByText(/Zero here means\s+un-modelled, not compliant/).count()
    || await page.getByText(/un-modelled, not compliant/).count();
  console.log(`  ${note ? 'PASS' : 'FAIL'}  cockpit shows the un-modelled-act note`);
  if (!note) failures.push('cockpit note missing');
  await page.screenshot({ path: path.join(OUT, 'home_cockpit_unseeded_note.png'), fullPage: false });

  // 4. Restore.
  if (!prior) {
    await page.evaluate(async () => {
      await fetch('/api/conformity/org/regulations/gdpr', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isDeclared: false }),
      });
    });
    const after = await apiGet('/conformity/org/profile');
    const restored = after.regulations.find((r) => r.key === 'gdpr')?.isDeclared === false;
    console.log(`  ${restored ? 'PASS' : 'FAIL'}  GDPR declaration restored`);
    if (!restored) failures.push('cleanup failed');
  }

  await browser.close();
  if (failures.length) {
    console.log(`\nFAILED: ${failures.join('; ')}`);
    process.exit(1);
  }
  console.log('\nAll checks passed. Screenshot in artifacts_verify/unseeded_act_note_114/');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
