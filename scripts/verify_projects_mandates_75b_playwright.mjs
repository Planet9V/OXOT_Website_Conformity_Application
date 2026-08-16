import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 7.5b — Projects (Art. 24 engine) and Mandates, live.
 *
 *   1. /projects: create a project by recording its first policy version
 *      through the dialog; the register lists it; the engine's legal
 *      position (Art. 64(10)(b) fines exemption stated with its limits)
 *      renders;
 *   2. Organisation: record a mandate with NO tasks granted; the engine's
 *      defect reporting renders (stored as written, reported as defective);
 *   3. the old /steward API is gone (404), /projects serves the new page.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_projects_mandates_75b_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'http://localhost:8088/api';
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'projects_mandates_75b');
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const failures = [];
  const login = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  });
  const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
  if (!cookie) throw new Error('admin login failed');

  // 3 first: the old steward API must be gone.
  const old = await fetch(`${API}/steward/attestation`, { headers: { cookie } });
  console.log(`  ${old.status === 404 ? 'PASS' : 'FAIL'}  old /api/steward is retired (HTTP ${old.status})`);
  if (old.status !== 404) failures.push(`old steward API answered ${old.status}`);

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

  // 1. Projects: new project -> first policy version through the dialog.
  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'New project' }).click();
  await page.waitForTimeout(300);
  await page.getByPlaceholder('e.g. openplc-runtime').fill('g6-probe-project');
  await page.getByRole('button', { name: 'Open project' }).click();
  await page.waitForTimeout(800);
  const legal = await page.getByText('exempts open-source software stewards from the administrative fines', { exact: false }).count();
  console.log(`  ${legal > 0 ? 'PASS' : 'FAIL'}  Art. 64(10)(b) legal position renders with its limits`);
  if (!legal) failures.push('legal position missing');

  await page.locator('[data-testid="new-policy-version"]').click();
  await page.waitForTimeout(400);
  await page.locator('textarea').first().fill('Coordinated vulnerability disclosure within 90 days; security patches backported to the two most recent minor releases.');
  await page.getByRole('button', { name: 'Record version' }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'project_detail.png'), fullPage: false });

  const proj = await (await fetch(`${API}/conformity/steward/g6-probe-project`, { headers: { cookie } })).json();
  const okPolicy = proj.policy?.current?.version === 1;
  console.log(`  ${okPolicy ? 'PASS' : 'FAIL'}  policy v1 persisted (version ${proj.policy?.current?.version})`);
  if (!okPolicy) failures.push('policy not persisted');

  const reg = await (await fetch(`${API}/conformity/steward`, { headers: { cookie } })).json();
  const listed = reg.projects?.some((p) => p.name === 'g6-probe-project');
  console.log(`  ${listed ? 'PASS' : 'FAIL'}  project appears in the register`);
  if (!listed) failures.push('project not in register');

  // 2. Organisation: record a mandate with no tasks -> defects render.
  await page.goto(`${BASE}/organisation`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.locator('[data-testid="record-mandate"]').click();
  await page.waitForTimeout(400);
  const dialog = page.locator('[role="dialog"]');
  await dialog.locator('input').first().fill('Shenzhen NovaTech Co. Ltd');
  await dialog.locator('input').nth(1).fill('OXOT B.V.');
  await dialog.getByRole('button', { name: 'Yes' }).click();
  await dialog.getByRole('button', { name: 'Record as written' }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'mandates.png'), fullPage: false });

  const mand = await (await fetch(`${API}/conformity/mandates`, { headers: { cookie } })).json();
  const probe = mand.mandates?.find((m) => m.appointingManufacturer?.startsWith('Shenzhen NovaTech'));
  const okDefects = Boolean(probe && probe.assessment.defects.length > 0);
  console.log(`  ${probe ? 'PASS' : 'FAIL'}  mandate persisted (id ${probe?.id})`);
  console.log(`  ${okDefects ? 'PASS' : 'FAIL'}  stored as written, reported defective (${probe?.assessment.defects.length} defect(s))`);
  if (!probe) failures.push('mandate not persisted');
  if (!okDefects) failures.push('no defects reported for a taskless mandate');

  await browser.close();
  if (failures.length) {
    console.error(`\nPROJECTS/MANDATES 7.5b G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nPROJECTS/MANDATES 7.5b G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
