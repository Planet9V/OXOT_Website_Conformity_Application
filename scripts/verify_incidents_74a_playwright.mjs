import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 7.4a — the Incidents destination, live.
 *
 *   1. /incidents renders the workspace incident list from the new endpoint,
 *      with act badges and the three Art. 14 clock chips per incident;
 *   2. the NIS2 Art. 23 gap is stated on the surface;
 *   3. a row links into the assessment workbench where submissions live.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_incidents_74a_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'http://localhost:8088/api';
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'incidents_74a');
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const failures = [];
  const login = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  });
  const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
  const feed = await (await fetch(`${API}/conformity/incidents`, { headers: { cookie } })).json();
  console.log(`  workspace feed: ${feed.total} incident(s)`);
  if (typeof feed.total !== 'number' || !Array.isArray(feed.incidents)) {
    failures.push('feed shape wrong');
  }

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

  await page.goto(`${BASE}/incidents`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'incidents_destination.png'), fullPage: true });

  const heading = await page.getByRole('heading', { name: 'Incidents' }).count();
  const nis2Gap = await page.getByText('NIS2 Art. 23 incidents are not modelled yet').count();
  console.log(`  ${heading > 0 ? 'PASS' : 'FAIL'}  destination heading renders`);
  console.log(`  ${nis2Gap > 0 ? 'PASS' : 'FAIL'}  NIS2 gap stated on the surface`);
  if (!heading) failures.push('heading missing');
  if (!nis2Gap) failures.push('NIS2 gap statement missing');

  if (feed.total > 0) {
    const chips = await page.locator('span', { hasText: /^24h/ }).count();
    const badge = await page.locator('a[href*="/assessments/"]').count();
    console.log(`  ${chips > 0 ? 'PASS' : 'FAIL'}  clock chips render (${chips} × 24h)`);
    console.log(`  ${badge > 0 ? 'PASS' : 'FAIL'}  rows link into the workbench (${badge})`);
    if (!chips) failures.push('no clock chips');
    if (!badge) failures.push('no workbench links');
  } else {
    const empty = await page.getByText('No incidents are recorded').count();
    console.log(`  ${empty > 0 ? 'PASS' : 'FAIL'}  honest empty state (workspace has no incidents)`);
    if (!empty) failures.push('no honest empty state');
  }

  await browser.close();
  if (failures.length) {
    console.error(`\nINCIDENTS 7.4a G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nINCIDENTS 7.4a G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
