import path from 'path';
import fs from 'fs';
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

/**
 * G6 for task 10.1 — portable evidence storage, live on the docker stack
 * (where file evidence could NEVER work before — the Replit sidecar does
 * not exist here):
 *
 *   1. request-url returns the local backend's relative one-time URL; the
 *      PUT lands the bytes; attaching evidence fingerprints the STORED
 *      bytes (sha256 must match what was sent);
 *   2. the workbench renders the evidence count; screenshot reviewed;
 *   3. the download endpoint returns byte-identical content;
 *   4. the file lives on the VOLUME and survives an api-container
 *      restart — the property container-local disk never had;
 *   5. regression: Products and Home still render (the seam touched five
 *      consumers; the customer experience must be undisturbed).
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_portable_storage_101_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORIGIN = 'http://localhost:8088';
const API = `${ORIGIN}/api`;
const BASE = `${ORIGIN}/conformity`;
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'portable_storage_101');
fs.mkdirSync(OUT, { recursive: true });

const FILE_BYTES = Buffer.from(`G6 portable-storage probe ${Date.now()} — bytes that must round-trip exactly.`);
const FILE_SHA256 = createHash('sha256').update(FILE_BYTES).digest('hex');

async function run() {
  const failures = [];
  const login = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  });
  const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
  const jsonHeaders = { 'Content-Type': 'application/json', cookie };

  // Fixtures: product + assessment.
  const product = await (await fetch(`${API}/conformity/products`, {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ name: 'G6 Portable Storage Probe', productType: 'software', orgRole: 'manufacturer' }),
  })).json();
  const assessment = await (await fetch(`${API}/conformity/assessments`, {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ productId: product.id, regulationKey: 'cra' }),
  })).json();
  const assessmentId = assessment.assessment?.id ?? assessment.id;

  // 1. request-url → local relative URL → PUT → attach with hash proof.
  const reqUrl = await (await fetch(`${API}/storage/uploads/request-url`, {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ name: 'probe.txt', size: FILE_BYTES.byteLength, contentType: 'text/plain' }),
  })).json();
  const isLocalUrl = typeof reqUrl.uploadURL === 'string' && reqUrl.uploadURL.startsWith('/api/storage/uploads/local/');
  console.log(`  ${isLocalUrl ? 'PASS' : 'FAIL'}  local backend minted a relative one-time URL (${String(reqUrl.uploadURL).slice(0, 60)})`);
  if (!isLocalUrl) failures.push(`uploadURL: ${JSON.stringify(reqUrl).slice(0, 150)}`);

  const put = await fetch(`${ORIGIN}${reqUrl.uploadURL}`, {
    method: 'PUT',
    headers: { 'content-type': 'text/plain', cookie },
    body: FILE_BYTES,
  });
  console.log(`  ${put.ok ? 'PASS' : 'FAIL'}  PUT landed (HTTP ${put.status})`);
  if (!put.ok) failures.push(`PUT ${put.status}`);

  const attached = await (await fetch(`${API}/conformity/assessments/${assessmentId}/evidence`, {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({
      requirementRefCode: 'CRA-ER-01',
      title: 'Portable storage probe evidence',
      evidenceType: 'test_report',
      url: '',
      objectPath: reqUrl.objectPath,
      fileName: 'probe.txt',
      note: '10.1 G6 probe',
    }),
  })).json();
  const hashOk = attached.fileHash === FILE_SHA256;
  console.log(`  ${hashOk ? 'PASS' : 'FAIL'}  server fingerprinted the STORED bytes (sha256 ${String(attached.fileHash).slice(0, 12)}…)`);
  if (!hashOk) failures.push(`fileHash ${attached.fileHash} != ${FILE_SHA256}`);

  // 3. Download returns byte-identical content.
  const dl = await fetch(`${API}/conformity/evidence/${attached.id}/download`, { headers: { cookie } });
  const dlBytes = Buffer.from(await dl.arrayBuffer());
  const dlOk = dl.ok && createHash('sha256').update(dlBytes).digest('hex') === FILE_SHA256;
  console.log(`  ${dlOk ? 'PASS' : 'FAIL'}  download returns byte-identical content (HTTP ${dl.status}, ${dlBytes.length} bytes)`);
  if (!dlOk) failures.push('download bytes differ');

  // 4. On the volume, and survives an api restart.
  const onVolume = execFileSync('docker', ['compose', 'exec', '-T', 'api', 'sh', '-c', 'ls /data/objects/private/uploads | wc -l'],
    { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
  console.log(`  ${Number(onVolume) >= 1 ? 'PASS' : 'FAIL'}  bytes live on the volume (${onVolume} object(s))`);
  if (Number(onVolume) < 1) failures.push('nothing on the volume');

  execFileSync('docker', ['compose', 'restart', 'api'], { cwd: path.join(__dirname, '..') });
  for (let i = 0; i < 30; i++) {
    try { const r = await fetch(`${API}/conformity/summary`); if (r.ok) break; } catch { /* booting */ }
    await new Promise((r) => setTimeout(r, 2000));
  }
  const login2 = await fetch(`${API}/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  });
  const cookie2 = login2.headers.get('set-cookie')?.split(';')[0] ?? '';
  const dl2 = await fetch(`${API}/conformity/evidence/${attached.id}/download`, { headers: { cookie: cookie2 } });
  const dl2Bytes = Buffer.from(await dl2.arrayBuffer());
  const persistOk = dl2.ok && createHash('sha256').update(dl2Bytes).digest('hex') === FILE_SHA256;
  console.log(`  ${persistOk ? 'PASS' : 'FAIL'}  evidence SURVIVES an api-container restart (HTTP ${dl2.status})`);
  if (!persistOk) failures.push('evidence lost across restart');

  // 2 + 5. UI: workbench shows the evidence count; existing surfaces render.
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
  await page.goto(`${BASE}/assessments/${assessmentId}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const bodyText = await page.locator('body').textContent();
  // The Stat renders value ABOVE its uppercase label: "1EVIDENCE".
  const evidenceShown = /1\s*EVIDENCE/i.test(bodyText ?? '');
  console.log(`  ${evidenceShown ? 'PASS' : 'FAIL'}  workbench shows the evidence count`);
  if (!evidenceShown) failures.push('workbench evidence count missing');
  await page.screenshot({ path: path.join(OUT, 'workbench_evidence.png'), fullPage: false });

  await page.goto(`${BASE}/products`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const productsOk = await page.getByText('G6 Portable Storage Probe').count();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const homeOk = await page.getByText('Conformity Operations').count();
  console.log(`  ${productsOk && homeOk ? 'PASS' : 'FAIL'}  regression: Products and Home render normally`);
  if (!productsOk || !homeOk) failures.push(`regression: products=${productsOk} home=${homeOk}`);
  await page.screenshot({ path: path.join(OUT, 'home_regression.png'), fullPage: false });
  await browser.close();

  // Clean up probe fixtures.
  await fetch(`${API}/conformity/products/${product.id}`, { method: 'DELETE', headers: { cookie: cookie2 } });

  if (failures.length) {
    console.error(`\nPORTABLE STORAGE 10.1 G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nPORTABLE STORAGE 10.1 G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
