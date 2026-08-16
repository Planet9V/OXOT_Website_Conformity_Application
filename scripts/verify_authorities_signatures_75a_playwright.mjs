import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 7.5a — Authorities and Signatures become real, live.
 *
 *   1. /authorities: record a corrective-action engagement WITHOUT a
 *      prescribed deadline through the dialog; the engine's gap ("period
 *      prescribed by the market surveillance authority is not recorded")
 *      renders — the deadline is captured, never computed;
 *   2. /signatures: the ledger renders real attestation rows with digests;
 *   3. cleanup: the probe engagement is marked completed.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_authorities_signatures_75a_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'http://localhost:8088/api';
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'auth_sign_75a');
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

  // 1. Authorities: record an Art. 54 engagement with no prescribed deadline.
  await page.goto(`${BASE}/authorities`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.locator('[data-testid="record-engagement"]').click();
  await page.waitForTimeout(400);
  // Switch kind to corrective action so the Art. 54(1) deadline gap applies.
  await page.locator('[role="combobox"]').first().click();
  await page.getByRole('option', { name: /corrective action/i }).click();
  await page.locator('input').nth(1).fill('RDI (NL Digital Infrastructure Authority)');
  await page.locator('input').nth(2).fill('NL');
  await page.locator('input[type="date"]').first().fill('2026-08-15');
  await page.getByRole('button', { name: 'Record', exact: true }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'authorities.png'), fullPage: false });

  const gapText = await page.getByText('period prescribed by the market surveillance authority is not recorded', { exact: false }).count();
  console.log(`  ${gapText > 0 ? 'PASS' : 'FAIL'}  Art. 54(1) deadline-not-recorded gap renders from the engine`);
  if (!gapText) failures.push('deadline gap not rendered');

  const feed = await (await fetch(`${API}/conformity/msa/engagements`, { headers: { cookie } })).json();
  const probe = feed.engagements?.find((e) => e.authorityName?.startsWith('RDI'));
  console.log(`  ${probe ? 'PASS' : 'FAIL'}  engagement persisted via the API (id ${probe?.id})`);
  if (!probe) failures.push('engagement not persisted');

  // 2. Signatures: the ledger renders real rows.
  await page.goto(`${BASE}/signatures`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'signatures.png'), fullPage: false });
  const ledgerRows = await page.locator('[data-testid="signatures-ledger"] li').count();
  const apiLedger = await (await fetch(`${API}/conformity/attestations`, { headers: { cookie } })).json();
  const match = apiLedger.total > 0 ? ledgerRows > 0 : true;
  console.log(`  ${match ? 'PASS' : 'FAIL'}  ledger renders (${ledgerRows} rows shown, ${apiLedger.total} in the API)`);
  if (!match) failures.push(`ledger rows=${ledgerRows} api=${apiLedger.total}`);
  const digest = await page.getByText('sha-256', { exact: false }).count();
  console.log(`  ${apiLedger.total === 0 || digest > 0 ? 'PASS' : 'FAIL'}  digests shown per attestation`);
  if (apiLedger.total > 0 && !digest) failures.push('no digests rendered');

  // 3. Cleanup: complete the probe engagement so demo data stays tidy.
  if (probe) {
    await fetch(`${API}/conformity/msa/engagements/${probe.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ completedAt: new Date().toISOString(), notes: 'G6 probe — completed by the verification script.' }),
    });
  }

  await browser.close();
  if (failures.length) {
    console.error(`\nAUTHORITIES/SIGNATURES 7.5a G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nAUTHORITIES/SIGNATURES 7.5a G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
