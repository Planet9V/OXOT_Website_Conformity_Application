import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 9.3b — the notified-body door AND its key, live end to end:
 *
 *   1. the product file (manufacturer role) shows the Auditor access panel;
 *      an admin issues an expiring token through the dialog;
 *   2. the issued portal link opens the external portal and loads the
 *      workspace for that assessment;
 *   3. an RFI submitted in the portal appears in the org-side inbox, is
 *      answered there, and the answer is visible back through the portal;
 *   4. revoking in the panel closes the door (the same link now refuses).
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_auditor_track_93b_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'http://localhost:8088/api';
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'auditor_track_93b');
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const failures = [];
  const login = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  });
  const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
  const jsonHeaders = { 'Content-Type': 'application/json', cookie };

  // Own the fixtures: a manufacturer product with one CRA assessment.
  const product = await (await fetch(`${API}/conformity/products`, {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ name: 'G6 Auditor Track Probe', productType: 'hardware', orgRole: 'manufacturer' }),
  })).json();
  const assessment = await (await fetch(`${API}/conformity/assessments`, {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ productId: product.id, regulationKey: 'cra' }),
  })).json();
  const assessmentId = assessment.assessment?.id ?? assessment.id;

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

  // 1. Issue a token through the panel.
  await page.goto(`${BASE}/products/${product.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const panel = page.locator('[data-testid="auditor-access-panel"]');
  await panel.scrollIntoViewIfNeeded().catch(() => {});
  const hasPanel = await panel.count();
  console.log(`  ${hasPanel ? 'PASS' : 'FAIL'}  Auditor access panel renders in the product file`);
  if (!hasPanel) failures.push('panel missing');

  await page.locator('[data-testid="auditor-access-issue"]').click();
  await page.waitForTimeout(400);
  await page.fill('#aa-email', 'auditor@nb-probe.example');
  await page.fill('#aa-nb-name', 'Probe Notified Body');
  await page.fill('#aa-nb-number', '9876');
  await page.fill('#aa-days', '14');
  await page.locator('[data-testid="auditor-access-issue-confirm"]').click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'token_issued.png'), fullPage: false });

  const grants = await (await fetch(`${API}/conformity/assessments/${assessmentId}/auditor-access`, { headers: { cookie } })).json();
  const grant = grants.access?.[0];
  console.log(`  ${grant ? 'PASS' : 'FAIL'}  token persisted (grant ${grant?.id}, expires ${grant?.expiresAt?.slice(0, 10)})`);
  if (!grant) failures.push('no grant persisted');

  // 2. The portal link opens the workspace.
  if (grant) {
    await page.goto(`${BASE}/auditor-portal?token=${grant.accessToken}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const workspaceLoaded = await page.getByText('G6 Auditor Track Probe').count();
    console.log(`  ${workspaceLoaded ? 'PASS' : 'FAIL'}  portal workspace loads with the issued token`);
    if (!workspaceLoaded) failures.push('workspace did not load');
    await page.screenshot({ path: path.join(OUT, 'portal_workspace.png'), fullPage: false });

    // 3. Submit an RFI via the portal API (the portal's own endpoint), then
    // answer it in the org panel.
    const submitted = await (await fetch(`${API}/conformity/auditor/rfis`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: grant.accessToken, question: 'G6 probe: provide the Annex VII technical file index.', severity: 'rfi' }),
    })).json();
    const rfiOk = Boolean(submitted.rfi?.id);
    console.log(`  ${rfiOk ? 'PASS' : 'FAIL'}  RFI submitted through the portal`);
    if (!rfiOk) failures.push('rfi submit failed');

    await page.goto(`${BASE}/products/${product.id}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.locator('[data-testid="auditor-access-panel"]').scrollIntoViewIfNeeded();
    const rfiShown = await page.getByText('G6 probe: provide the Annex VII technical file index.').count();
    console.log(`  ${rfiShown ? 'PASS' : 'FAIL'}  RFI appears in the org inbox`);
    if (!rfiShown) failures.push('rfi not in inbox');

    await page.getByRole('button', { name: 'Respond' }).first().click();
    await page.waitForTimeout(300);
    await page.locator('[data-testid="auditor-access-panel"] textarea').fill('Index attached under evidence E-9.');
    await page.getByRole('button', { name: 'Record response' }).click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, 'rfi_answered.png'), fullPage: false });

    const portalView = await (await fetch(`${API}/conformity/auditor/workspace?token=${grant.accessToken}`)).json();
    const answered = (portalView.rfis ?? []).find((r) => r.id === submitted.rfi.id);
    const answerSeen = answered?.manufacturerResponse === 'Index attached under evidence E-9.';
    console.log(`  ${answerSeen ? 'PASS' : 'FAIL'}  the answer is visible through the portal`);
    if (!answerSeen) failures.push(`portal sees: ${JSON.stringify(answered?.manufacturerResponse)}`);

    // 4. Revoke closes the door.
    await page.getByRole('button', { name: 'Revoke' }).first().click();
    await page.waitForTimeout(1200);
    const closed = await fetch(`${API}/conformity/auditor/workspace?token=${grant.accessToken}`);
    console.log(`  ${closed.status === 403 ? 'PASS' : 'FAIL'}  revoked token refused (HTTP ${closed.status})`);
    if (closed.status !== 403) failures.push(`revoked token got ${closed.status}`);
    await page.screenshot({ path: path.join(OUT, 'revoked.png'), fullPage: false });
  }

  // Clean up the probe product (cascades assessment, access, RFIs).
  await fetch(`${API}/conformity/products/${product.id}`, { method: 'DELETE', headers: { cookie } });

  await browser.close();
  if (failures.length) {
    console.error(`\nAUDITOR TRACK 9.3b G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nAUDITOR TRACK 9.3b G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
