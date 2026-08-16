import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * G6 for task 7.1 — the nine-destination shell, live.
 *
 * Asserts, against the running stack on localhost:8088:
 *   1. every destination renders the app (no 404, header nav present);
 *   2. every retired path redirects to its destination;
 *   3. the two placeholder destinations state their gap explicitly.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_shell_71_playwright.mjs
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'shell_71');
fs.mkdirSync(OUT, { recursive: true });

const DESTINATIONS = [
  { path: '/', name: 'home' },
  { path: '/incidents', name: 'incidents' },
  { path: '/authorities', name: 'authorities', placeholder: true },
  { path: '/signatures', name: 'signatures', placeholder: true },
  { path: '/products', name: 'products' },
  { path: '/projects', name: 'projects' },
  { path: '/organisation', name: 'organisation' },
  { path: '/library', name: 'library' },
  { path: '/settings', name: 'settings', adminOnly: true },
];

const REDIRECTS = [
  ['/overview', '/'],
  ['/psirt', '/incidents'],
  ['/steward', '/projects'],
  ['/open-source-steward', '/projects'],
  ['/org-profile', '/organisation'],
  ['/team', '/settings'],
  ['/wiki', '/library'],
  ['/cra-wiki', '/library'],
  ['/standards-matrix', '/standards'],
  ['/ce-nameplate-studio', '/ce-studio'],
  ['/importer-archive', '/archive'],
  ['/blogs', '/podcast-studio'],
];

async function run() {
  const pw = await import(
    path.join(__dirname, '..', 'artifacts/conformity/node_modules/@playwright/test/index.js')
  );
  const chromium = pw.chromium || pw.default?.chromium;
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900'],
  });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const failures = [];

  // Sign in as admin so the Settings destination is visible too.
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) throw new Error('ADMIN_USERNAME / ADMIN_PASSWORD not in env — source .env first');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  if (await page.locator('input[type="password"]').count()) {
    await page.fill('input[type="text"], input[name="username"], input[id*="user"]', user);
    await page.fill('input[type="password"]', pass);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
  }

  for (const d of DESTINATIONS) {
    await page.goto(`${BASE}${d.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const notFound = await page.getByText('404 — Page not found').count();
    const navPresent = await page.locator('[data-testid="nav-home"]').count();
    const ok = notFound === 0 && navPresent > 0;
    let placeholderOk = true;
    if (d.placeholder) {
      placeholderOk = (await page.getByText('What will live here').count()) > 0;
    }
    await page.screenshot({ path: path.join(OUT, `dest_${d.name}.png`), fullPage: false });
    const verdict = ok && placeholderOk ? 'PASS' : 'FAIL';
    if (verdict === 'FAIL') failures.push(`${d.path}: 404=${notFound} nav=${navPresent} placeholder=${placeholderOk}`);
    console.log(`  ${verdict}  destination ${d.path}`);
  }

  for (const [from, to] of REDIRECTS) {
    await page.goto(`${BASE}${from}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const url = new URL(page.url()).pathname.replace(/^\/conformity/, '') || '/';
    const ok = to === '/' ? url === '/' : url.startsWith(to);
    if (!ok) failures.push(`redirect ${from} -> got ${url}, wanted ${to}`);
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  redirect ${from} -> ${url}`);
  }

  await browser.close();
  if (failures.length) {
    console.error(`\nSHELL 7.1 G6 FAILED — ${failures.length} failure(s):`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nSHELL 7.1 G6 passed — ${DESTINATIONS.length} destinations, ${REDIRECTS.length} redirects. Screenshots in ${OUT}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
