import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 9.4a — the Cyberbeveiligingswet reader, live:
 *
 *   1. the Library lists the Cbw card; /library/cbw renders the reader with
 *      the Staatsblad provenance line and the transposition banner;
 *   2. the default article (Art. 26, vroegtijdige waarschuwing) shows the
 *      VERBATIM Dutch text, and the Art. 27 72-uur clock phrase is
 *      reachable through search;
 *   3. an amendment article (99) carries its "wijzigt andere wet" marker;
 *   4. the NIS2 reader's banner now links to the Cbw instead of claiming
 *      no transposition is loaded.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_cbw_reader_94a_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'cbw_reader_94a');
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

  // 1. Library card -> reader.
  await page.goto(`${BASE}/library`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const card = await page.getByText('Cyberbeveiligingswet, verbatim (NL)').count();
  console.log(`  ${card ? 'PASS' : 'FAIL'}  Library lists the Cbw card`);
  if (!card) failures.push('Library card missing');

  await page.goto(`${BASE}/library/cbw`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const provenance = await page.getByText('Stb. 2026, 187').count();
  const banner = await page.getByText('binds entities established in the Netherlands').count();
  console.log(`  ${provenance ? 'PASS' : 'FAIL'}  Staatsblad provenance line renders`);
  console.log(`  ${banner ? 'PASS' : 'FAIL'}  transposition banner renders`);
  if (!provenance) failures.push('provenance missing');
  if (!banner) failures.push('banner missing');

  // 2. Default article: Art. 26 verbatim Dutch.
  const art26 = await page.getByText('vroegtijdige waarschuwing over het significante incident').count();
  console.log(`  ${art26 ? 'PASS' : 'FAIL'}  Art. 26 renders its verbatim Dutch text`);
  if (!art26) failures.push('Art. 26 verbatim text missing');
  await page.screenshot({ path: path.join(OUT, 'cbw_reader_art26.png'), fullPage: false });

  // Search reaches the Art. 27 72-uur clock.
  await page.getByPlaceholder('Zoek in de verbatim tekst…').fill('binnen 72 uur');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /Art\. 27/ }).first().click();
  await page.waitForTimeout(500);
  const clock = await page.getByText('binnen 72 uur nadat zij kennis heeft gekregen').count();
  console.log(`  ${clock ? 'PASS' : 'FAIL'}  Art. 27's 72-uur clock phrase renders verbatim`);
  if (!clock) failures.push('72-uur phrase missing');
  await page.screenshot({ path: path.join(OUT, 'cbw_reader_art27_clock.png'), fullPage: false });

  // 3. Amendment marker on Art. 99.
  await page.getByPlaceholder('Zoek in de verbatim tekst…').fill('');
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /Art\. 99/ }).first().click();
  await page.waitForTimeout(500);
  const marker = await page.getByText('wijzigt andere wet').count();
  console.log(`  ${marker ? 'PASS' : 'FAIL'}  Art. 99 carries the amends-other-law marker`);
  if (!marker) failures.push('amendment marker missing');

  // 4. NIS2 reader banner links here.
  await page.goto(`${BASE}/library/nis2`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const stale = await page.getByText('No national transposition measure is loaded').count();
  const link = await page.locator('a[href="/conformity/library/cbw"], a[href="/library/cbw"]').count();
  console.log(`  ${stale === 0 ? 'PASS' : 'FAIL'}  NIS2 banner no longer claims nothing is loaded`);
  console.log(`  ${link ? 'PASS' : 'FAIL'}  NIS2 banner links to the Cbw reader`);
  if (stale) failures.push('stale NIS2 banner');
  if (!link) failures.push('NIS2 banner link missing');
  await page.screenshot({ path: path.join(OUT, 'nis2_banner_updated.png'), fullPage: false });

  await browser.close();
  if (failures.length) {
    console.error(`\nCBW READER 9.4a G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nCBW READER 9.4a G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
