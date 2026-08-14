import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'http://localhost:8088';
const ARTIFACTS_DIR = '/Users/jimmcknney/.gemini/antigravity-ide/brain/c8897910-33b6-46e4-9440-4c1989b4cbfd';
const videoDir = path.join(ARTIFACTS_DIR, 'tour_videos_persona');
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

async function run() {
  console.log('🚀 Starting Playwright Verification of Persona Cockpit & UI Transformations...');
  const pw = await import(
    '/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/node_modules/@playwright/test/index.js'
  );
  const chromium = pw.chromium || pw.default?.chromium;

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  try {
    // 1. Login
    console.log('1. Navigating to login...');
    await page.goto(`${BASE_URL}/conformity/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="text"], input[name="username"], input[id*="user"]', 'oxotdemo');
    await page.fill('input[type="password"]', 'oxot2026$');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    // 2. Main Dashboard with Persona Cockpit
    console.log('2. Testing CommandCenter with Persona Cockpit (Integrator default)...');
    await page.goto(`${BASE_URL}/conformity/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'persona_cockpit_integrator.png'), fullPage: true });

    // 3. Switch to OEM Manufacturer Persona
    console.log('3. Switching to OEM Manufacturer Persona...');
    await page.click('button[data-persona="MANUFACTURER"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'persona_cockpit_manufacturer.png'), fullPage: true });

    // 4. Switch to Open-Source Steward Persona
    console.log('4. Switching to Open-Source Steward Persona...');
    await page.click('button[data-persona="STEWARD"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'persona_cockpit_steward.png'), fullPage: true });

    // 5. Switch to EU Importer Persona
    console.log('5. Switching to EU Importer Persona...');
    await page.click('button[data-persona="IMPORTER"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'persona_cockpit_importer.png'), fullPage: true });

    // 6. Switch to Plant CISO Persona
    console.log('6. Switching to Plant Owner & Industrial CISO Persona...');
    await page.click('button[data-persona="PLANT_CISO"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'persona_cockpit_ciso.png'), fullPage: true });

    // 7. Switch to Notified Body Auditor Persona
    console.log('7. Switching to Notified Body Auditor Persona...');
    await page.click('button[data-persona="AUDITOR"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'persona_cockpit_auditor.png'), fullPage: true });

    console.log('✅ All Persona Cockpits verified successfully!');
  } catch (err) {
    console.error('❌ Verification error:', err);
    throw err;
  } finally {
    await context.close();
    await browser.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
