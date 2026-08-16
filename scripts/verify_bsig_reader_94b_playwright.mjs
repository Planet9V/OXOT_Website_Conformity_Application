import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 9.4b — the BSI-Gesetz reader, live:
 *
 *   1. the Library lists the BSIG card; /library/bsig renders the reader
 *      with the consolidation disclosure AND the verbatim amendment trail;
 *   2. the default section (§ 32 Meldepflichten) shows the VERBATIM German
 *      24-Stunden clock; search reaches § 30 risk management;
 *   3. the Anlagen render;
 *   4. the NIS2 reader's banner names BOTH loaded transpositions.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_bsig_reader_94b_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'bsig_reader_94b');
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
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  if (await page.locator('input[type="password"]').count()) {
    await page.fill('input[type="text"], input[name="username"], input[id*="user"]', process.env.ADMIN_USERNAME);
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
  }

  // 1. Library card -> reader with disclosure + amendment trail.
  await page.goto(`${BASE}/library`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const card = await page.getByText('BSI-Gesetz, verbatim (DE)').count();
  console.log(`  ${card ? 'PASS' : 'FAIL'}  Library lists the BSIG card`);
  if (!card) failures.push('Library card missing');

  await page.goto(`${BASE}/library/bsig`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const disclosure = await page.getByText('CONSOLIDATED text from gesetze-im-internet.de').count();
  const trail = await page.getByText('Geändert durch Art. 4 G v. 11.3.2026').count();
  console.log(`  ${disclosure ? 'PASS' : 'FAIL'}  consolidation disclosure renders`);
  console.log(`  ${trail ? 'PASS' : 'FAIL'}  verbatim amendment trail renders`);
  if (!disclosure) failures.push('disclosure missing');
  if (!trail) failures.push('amendment trail missing');

  // 2. § 32 default: the 24-Stunden clock, verbatim German.
  const clock = await page.getByText('unverzüglich, spätestens jedoch innerhalb von 24 Stunden nach Kenntniserlangung').count();
  console.log(`  ${clock ? 'PASS' : 'FAIL'}  § 32's 24-Stunden clock renders verbatim`);
  if (!clock) failures.push('§32 clock missing');
  await page.screenshot({ path: path.join(OUT, 'bsig_reader_s32.png'), fullPage: false });

  await page.getByPlaceholder('Im Wortlaut suchen…').fill('Risikomanagement');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /§ 30/ }).first().click();
  await page.waitForTimeout(500);
  const risk = await page.getByText('geeignete, verhältnismäßige und wirksame technische und organisatorische Maßnahmen').count();
  console.log(`  ${risk ? 'PASS' : 'FAIL'}  § 30 renders its verbatim risk-management text`);
  if (!risk) failures.push('§30 text missing');

  // 3. Anlagen.
  await page.getByRole('button', { name: 'Anlagen', exact: true }).click();
  await page.waitForTimeout(500);
  const anlage = await page.locator('[data-testid="bsig-reader-body"]').textContent();
  const anlageOk = Boolean(anlage && anlage.length > 200);
  console.log(`  ${anlageOk ? 'PASS' : 'FAIL'}  Anlage renders (${anlage?.length ?? 0} chars)`);
  if (!anlageOk) failures.push('Anlage empty');
  await page.screenshot({ path: path.join(OUT, 'bsig_reader_anlage.png'), fullPage: false });

  // 4. NIS2 banner names both transpositions.
  await page.goto(`${BASE}/library/nis2`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const both =
    (await page.locator('a[href*="/library/cbw"]').count()) > 0 &&
    (await page.locator('a[href*="/library/bsig"]').count()) > 0;
  console.log(`  ${both ? 'PASS' : 'FAIL'}  NIS2 banner links both the Cbw and the BSIG`);
  if (!both) failures.push('NIS2 banner links incomplete');
  await page.screenshot({ path: path.join(OUT, 'nis2_banner_both.png'), fullPage: false });

  await browser.close();
  if (failures.length) {
    console.error(`\nBSIG READER 9.4b G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nBSIG READER 9.4b G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
