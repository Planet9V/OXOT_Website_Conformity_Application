import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * G6 for task 7.2 — the role-aware Home, live.
 *
 *   1. member jack (teamRole engineering_lead) sees the "Your work" panel
 *      scoped to his role, with the routing-default disclaimer;
 *   2. the admin session (not a team member) sees the honest neutral notice
 *      and NO scoped panel.
 *
 * Run:  set -a; source .env; set +a; node scripts/verify_home_72_playwright.mjs
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8088/conformity';
const OUT = path.join(__dirname, '..', 'artifacts_verify', 'home_72');
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const pw = await import(
    path.join(__dirname, '..', 'artifacts/conformity/node_modules/@playwright/test/index.js')
  );
  const chromium = pw.chromium || pw.default?.chromium;
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const failures = [];

  async function login(user, pass, name) {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    if (await page.locator('input[type="password"]').count()) {
      await page.fill('input[type="text"], input[name="username"], input[id*="user"]', user);
      await page.fill('input[type="password"]', pass);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, `home_${name}.png`), fullPage: false });
    return page;
  }

  // 1. Member with a team role sees their scoped panel.
  const jack = await login('jack', 'Password123!', 'jack_engineering_lead');
  const panel = await jack.locator('[data-testid="your-work"]').count();
  const roleBadge = await jack.getByText('Engineering lead').count();
  const disclaimer = await jack.getByText('not a statutory assignment').count();
  if (!(panel > 0 && roleBadge > 0 && disclaimer > 0)) {
    failures.push(`jack: panel=${panel} badge=${roleBadge} disclaimer=${disclaimer}`);
  }
  console.log(`  ${panel && roleBadge && disclaimer ? 'PASS' : 'FAIL'}  jack sees engineering-scoped Your work`);
  await jack.context().close();

  // 2. Admin is not a team member: neutral notice, no scoped panel.
  const admin = await login(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, 'admin_neutral');
  const adminPanel = await admin.locator('[data-testid="your-work"]').count();
  const notice = await admin.getByText('not a team member').count();
  if (!(adminPanel === 0 && notice > 0)) {
    failures.push(`admin: panel=${adminPanel} (want 0) notice=${notice} (want >0)`);
  }
  console.log(`  ${adminPanel === 0 && notice > 0 ? 'PASS' : 'FAIL'}  admin sees the neutral notice, no scoped panel`);
  await admin.context().close();

  await browser.close();
  if (failures.length) {
    console.error(`\nHOME 7.2 G6 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\nHOME 7.2 G6 passed. Screenshots in ${OUT}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
