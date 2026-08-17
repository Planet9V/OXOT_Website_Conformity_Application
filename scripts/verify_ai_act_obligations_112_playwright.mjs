import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 11.2 — the verified + extended AI Act obligation seed, live:
 *
 *   1. the Organisation page declares the AI Act through the real Switch;
 *   2. the obligations API returns the provider chapter (Art 16(b)–22),
 *      registration and transparency for the manufacturer, and Art 26
 *      deployer duties for the operator — in the Act's own vocabulary
 *      (provider / deployer);
 *   3. Home's persona cockpit shows the `ai_act · N` badge under both the
 *      manufacturer and the operator lens;
 *   4. cleanup: the AI Act declaration is restored to what it was.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_ai_act_obligations_112_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'ai_act_obligations_112');
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
  const priorAi = before.regulations.find((r) => r.key === 'ai_act')?.isDeclared ?? false;
  const roles = new Set(before.roles.filter((r) => r.isDeclared).map((r) => r.key));
  if (!roles.has('manufacturer') || !roles.has('operator')) {
    console.log('  FAIL  probe assumes the demo org declares manufacturer and operator');
    failures.push('missing demo roles');
  }

  // 1. Declare the AI Act through the real UI.
  await page.goto(`${BASE}/organisation`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  if (!priorAi) {
    await page.getByLabel('Declare AI Act').click();
    await page.waitForTimeout(1000);
  }
  const declaredNow = (await apiGet('/conformity/org/profile')).regulations.find((r) => r.key === 'ai_act')?.isDeclared;
  console.log(`  ${declaredNow ? 'PASS' : 'FAIL'}  AI Act declared through the Organisation page`);
  if (!declaredNow) failures.push('ai_act not declared');

  // 2. Provider chapter + deployer duties, in the Act's own words.
  const obligations = await apiGet('/conformity/org/obligations');
  const ai = obligations.obligations.filter((o) => o.regulationKey === 'ai_act');
  const refCodes = new Set(ai.map((o) => o.refCode));
  const provider = ['Art 16(b)', 'Art 18', 'Art 19', 'Art 20', 'Art 21', 'Art 22', 'Art 47', 'Art 49', 'Art 50', 'Art 73'].filter((r) => !refCodes.has(r));
  console.log(`  ${provider.length === 0 ? 'PASS' : 'FAIL'}  provider chapter present (${ai.length} AI Act obligations${provider.length ? '; missing ' + provider.join(', ') : ''})`);
  if (provider.length) failures.push('provider rows missing');
  const art26 = ai.find((o) => o.refCode === 'Art 26');
  const deployerOk = Boolean(art26 && art26.roleTerms.includes('deployer'));
  console.log(`  ${deployerOk ? 'PASS' : 'FAIL'}  Art 26 deployer duties present with the Act's own term`);
  if (!deployerOk) failures.push('deployer vocabulary missing');
  const providerTerm = ai.some((o) => o.roleTerms.includes('provider'));
  console.log(`  ${providerTerm ? 'PASS' : 'FAIL'}  manufacturer spoken of as "provider"`);
  if (!providerTerm) failures.push('provider term missing');

  // 3. Cockpit badge under both lenses.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const mfrBadge = await page.getByText(/ai_act · \d+/).count();
  console.log(`  ${mfrBadge ? 'PASS' : 'FAIL'}  cockpit shows the ai_act badge (manufacturer lens)`);
  if (!mfrBadge) failures.push('manufacturer badge missing');
  await page.screenshot({ path: path.join(OUT, 'home_cockpit_ai_manufacturer.png'), fullPage: false });
  const operatorTab = page.getByText(/Operator \/ asset owner/).first();
  if (await operatorTab.count()) {
    await operatorTab.click();
    await page.waitForTimeout(800);
    const opBadge = await page.getByText(/ai_act · \d+/).count();
    console.log(`  ${opBadge ? 'PASS' : 'FAIL'}  cockpit shows the ai_act badge (operator lens)`);
    if (!opBadge) failures.push('operator badge missing');
    await page.screenshot({ path: path.join(OUT, 'home_cockpit_ai_operator.png'), fullPage: false });
  } else {
    console.log('  FAIL  operator lens not found on the cockpit');
    failures.push('operator lens missing');
  }

  // 4. Restore the prior declaration.
  if (!priorAi) {
    await page.evaluate(async () => {
      await fetch('/api/conformity/org/regulations/ai_act', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isDeclared: false }),
      });
    });
    const after = await apiGet('/conformity/org/profile');
    const restored = after.regulations.find((r) => r.key === 'ai_act')?.isDeclared === false;
    console.log(`  ${restored ? 'PASS' : 'FAIL'}  AI Act declaration restored`);
    if (!restored) failures.push('cleanup failed');
  }

  await browser.close();
  if (failures.length) {
    console.log(`\nFAILED: ${failures.join('; ')}`);
    process.exit(1);
  }
  console.log('\nAll checks passed. Screenshots in artifacts_verify/ai_act_obligations_112/');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
