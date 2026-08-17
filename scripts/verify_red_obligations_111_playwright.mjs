import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 11.1 — the RED obligation seed, live:
 *
 *   1. the Organisation page declares RED through the real Switch;
 *   2. the obligations API then returns the Art 3(3)(d)/(e)/(f) cyber
 *      essential requirements and the Art 15 traceability duty, and every
 *      RED row's appliesTo intersects a declared role;
 *   3. Home's persona cockpit shows the `red · N` act badge for the
 *      manufacturer role, with RED's own role vocabulary;
 *   4. cleanup: RED's declaration is restored to what it was.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_red_obligations_111_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'red_obligations_111');
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

  // Record prior state so cleanup restores rather than assumes.
  const before = await apiGet('/conformity/org/profile');
  const priorRed = before.regulations.find((r) => r.key === 'red')?.isDeclared ?? false;
  const manufacturerDeclared = before.roles.find((r) => r.key === 'manufacturer')?.isDeclared ?? false;
  if (!manufacturerDeclared) {
    console.log('  FAIL  demo org does not declare manufacturer — probe assumes it does');
    failures.push('no manufacturer role');
  }

  // 1. Declare RED through the real UI.
  await page.goto(`${BASE}/organisation`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const redSwitch = page.getByLabel('Declare RED');
  if (!priorRed) {
    await redSwitch.click();
    await page.waitForTimeout(1000);
  }
  const declaredNow = (await apiGet('/conformity/org/profile')).regulations.find((r) => r.key === 'red')?.isDeclared;
  console.log(`  ${declaredNow ? 'PASS' : 'FAIL'}  RED declared through the Organisation page`);
  if (!declaredNow) failures.push('red not declared');
  await page.screenshot({ path: path.join(OUT, 'organisation_red_declared.png'), fullPage: false });

  // 2. The obligations register now carries the RED rows.
  const obligations = await apiGet('/conformity/org/obligations');
  const red = obligations.obligations.filter((o) => o.regulationKey === 'red');
  const refCodes = new Set(red.map((o) => o.refCode));
  const cyber = ['Art 3(3)(d)', 'Art 3(3)(e)', 'Art 3(3)(f)'].every((r) => refCodes.has(r));
  console.log(`  ${cyber ? 'PASS' : 'FAIL'}  Art 3(3)(d)/(e)/(f) present (${red.length} RED obligations)`);
  if (!cyber) failures.push('cyber essential requirements missing');
  const art15 = refCodes.has('Art 15');
  console.log(`  ${art15 ? 'PASS' : 'FAIL'}  Art 15 traceability duty present`);
  if (!art15) failures.push('Art 15 missing');
  const declaredRoles = obligations.declaredRoles;
  const scoped = red.every((o) => o.appliesTo.some((a) => declaredRoles.includes(a)));
  console.log(`  ${scoped ? 'PASS' : 'FAIL'}  every RED row applies to a declared role`);
  if (!scoped) failures.push('unscoped RED row');
  const terms = new Set(red.flatMap((o) => o.roleTerms));
  console.log(`  ${terms.has('manufacturer') ? 'PASS' : 'FAIL'}  RED speaks its own vocabulary (${[...terms].join(', ')})`);
  if (!terms.has('manufacturer')) failures.push('role term missing');

  // 3. Home cockpit shows the act badge.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const badge = await page.getByText(/red · \d+/).count();
  console.log(`  ${badge ? 'PASS' : 'FAIL'}  Home cockpit shows the red act badge`);
  if (!badge) failures.push('cockpit badge missing');
  await page.screenshot({ path: path.join(OUT, 'home_cockpit_red.png'), fullPage: true });

  // 4. Restore RED to its prior declaration.
  if (!priorRed) {
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
  console.log('\nAll checks passed. Screenshots in artifacts_verify/red_obligations_111/');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
