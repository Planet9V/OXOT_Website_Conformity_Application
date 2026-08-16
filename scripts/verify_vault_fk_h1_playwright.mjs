import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

/**
 * G6 for hygiene batch H1 — the portfolio demo tables are gone and the
 * document vault is keyed to the REAL registry with a working FK:
 *
 *   1. the four demo tables no longer exist in the live database;
 *   2. a document uploaded for a conformity product persists and lists;
 *   3. deleting the product CASCADES the document away (the FK is real);
 *   4. an upload for a nonexistent product id is REFUSED (FK violation),
 *      not silently accepted into an ambiguous keyspace;
 *   5. the vault modal still renders in the product file.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_vault_fk_h1_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'http://localhost:8088/api';
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'vault_fk_h1');
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const failures = [];

  // 1. Demo tables gone (live database).
  const tables = execFileSync('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', 'oxot', '-d', 'oxot', '-tAc',
    "select table_name from information_schema.tables where table_name in ('cra_portfolio_products','cra_product_releases','cra_enterprise_customers','cra_customer_deployments')"],
    { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
  console.log(`  ${tables === '' ? 'PASS' : 'FAIL'}  the four demo tables are gone (${tables || 'none found'})`);
  if (tables !== '') failures.push(`tables remain: ${tables}`);

  const login = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  });
  const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
  const jsonHeaders = { 'Content-Type': 'application/json', cookie };

  // 2. Upload for a real conformity product.
  const product = await (await fetch(`${API}/conformity/products`, {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ name: 'H1 Vault FK Probe', productType: 'software', orgRole: 'manufacturer' }),
  })).json();
  const upload = await (await fetch(`${API}/portfolio/products/${product.id}/documents`, {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({
      title: 'H1 probe document',
      originalFileName: 'h1-probe.md',
      fileContentText: 'probe content for the FK check',
      uploadedBy: 'H1 G6 probe',
    }),
  })).json();
  const docId = upload.document?.id;
  console.log(`  ${docId ? 'PASS' : 'FAIL'}  upload persisted for conformity product ${product.id} (doc ${docId})`);
  if (!docId) failures.push(`upload failed: ${JSON.stringify(upload).slice(0, 120)}`);

  const list = await (await fetch(`${API}/portfolio/products/${product.id}/documents`, { headers: { cookie } })).json();
  const listed = (list.documents ?? []).some((d) => d.id === docId);
  console.log(`  ${listed ? 'PASS' : 'FAIL'}  document lists in the vault`);
  if (!listed) failures.push('document not listed');

  // 5. The modal renders (surface check + screenshot) BEFORE the delete.
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
  await page.goto(`${BASE}/products/${product.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const vaultButton = page.getByRole('button', { name: /Open Document Vault/i }).first();
  await vaultButton.click().catch(() => {});
  await page.waitForTimeout(1000);
  const modalShows = await page.getByText('H1 probe document').count();
  console.log(`  ${modalShows ? 'PASS' : 'FAIL'}  vault modal renders the uploaded document`);
  if (!modalShows) failures.push('modal did not show the document');
  await page.screenshot({ path: path.join(OUT, 'vault_modal.png'), fullPage: false });
  await browser.close();

  // 3. Cascade: deleting the product removes the document.
  await fetch(`${API}/conformity/products/${product.id}`, { method: 'DELETE', headers: { cookie } });
  const after = execFileSync('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', 'oxot', '-d', 'oxot', '-tAc',
    `select count(*) from cra_product_documents where id = ${Number(docId) || 0}`],
    { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
  console.log(`  ${after === '0' ? 'PASS' : 'FAIL'}  deleting the product cascaded the document (rows left: ${after})`);
  if (after !== '0') failures.push(`cascade failed: ${after} row(s) remain`);

  // 4. Upload against a nonexistent product id is refused.
  const bad = await fetch(`${API}/portfolio/products/999999/documents`, {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({
      title: 'orphan probe', originalFileName: 'x.md', fileContentText: 'x', uploadedBy: 'probe',
    }),
  });
  console.log(`  ${bad.status === 404 ? 'PASS' : 'FAIL'}  upload for a nonexistent product refused cleanly (HTTP ${bad.status}, want 404)`);
  if (bad.status !== 404) failures.push(`orphan upload got ${bad.status}, want 404`);

  if (failures.length) {
    console.error(`\nVAULT FK H1 G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nVAULT FK H1 G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
