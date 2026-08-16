import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 10.3 — the AI Act, Machinery Regulation and RED readers, live:
 *
 *   1. the Library lists all three new cards;
 *   2. each reader renders its verbatim probe article (AI Art. 6
 *      classification; MR Art. 10 manufacturer obligations; RED Art. 3
 *      essential requirements);
 *   3. RED — a DIRECTIVE — carries the transposition caveat banner; the two
 *      regulations carry the direct-applicability framing;
 *   4. regression: the CRA and NIS2 readers still render.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_three_acts_103_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'three_acts_103');
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

  // 1. Library cards.
  await page.goto(`${BASE}/library`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const cards =
    (await page.getByText('AI Act, verbatim').count()) &&
    (await page.getByText('Machinery Regulation, verbatim').count()) &&
    (await page.getByText('Radio Equipment Directive, verbatim').count());
  console.log(`  ${cards ? 'PASS' : 'FAIL'}  Library lists the three new act cards`);
  if (!cards) failures.push('cards missing');
  await page.screenshot({ path: path.join(OUT, 'library_cards.png'), fullPage: false });

  // 2 + 3. Each reader: probe article + framing banner.
  const checks = [
    { url: 'ai-act', probe: 'Classification rules for high-risk AI systems', banner: 'directly applicable', shot: 'ai_act_reader.png' },
    { url: 'machinery', probe: 'Obligations of manufacturers of machinery and related products', banner: 'directly applicable', shot: 'machinery_reader.png' },
    { url: 'red', probe: 'Essential requirements', banner: 'national measure governs', shot: 'red_reader.png' },
  ];
  for (const c of checks) {
    await page.goto(`${BASE}/library/${c.url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const probe = await page.getByText(c.probe).count();
    const banner = await page.getByText(c.banner, { exact: false }).count();
    console.log(`  ${probe ? 'PASS' : 'FAIL'}  /${c.url} renders its verbatim probe article`);
    console.log(`  ${banner ? 'PASS' : 'FAIL'}  /${c.url} carries its honesty framing banner`);
    if (!probe) failures.push(`${c.url} probe missing`);
    if (!banner) failures.push(`${c.url} banner missing`);
    await page.screenshot({ path: path.join(OUT, c.shot), fullPage: false });
  }

  // 4. Regression: CRA + NIS2 readers.
  await page.goto(`${BASE}/library/nis2`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const nis2Ok = await page.getByText('NIS2 is a directive').count();
  await page.goto(`${BASE}/library/statute`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const craOk = (await page.locator('body').textContent())?.includes('2024/2847');
  console.log(`  ${nis2Ok && craOk ? 'PASS' : 'FAIL'}  regression: CRA and NIS2 readers render`);
  if (!nis2Ok || !craOk) failures.push(`regression nis2=${nis2Ok} cra=${craOk}`);

  await browser.close();
  if (failures.length) {
    console.error(`\nTHREE ACTS 10.3 G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nTHREE ACTS 10.3 G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
