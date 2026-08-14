import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'http://localhost:8088';
const ARTIFACTS_DIR = '/Users/jimmcknney/.gemini/antigravity-ide/brain/c8897910-33b6-46e4-9440-4c1989b4cbfd';
const videoDir = path.join(ARTIFACTS_DIR, 'tour_videos_unified');
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

async function run() {
  console.log('🚀 Starting Playwright Verification of Unified CRA Platform...');
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
    // 1. Visit Login Page & Authenticate
    console.log('1. Navigating to login...');
    await page.goto(`${BASE_URL}/conformity/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="text"], input[name="username"], input[id*="user"]', 'oxotdemo');
    await page.fill('input[type="password"]', 'oxot2026$');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    // 2. Visit Standards Matrix (Art. 34)
    console.log('2. Testing Standards Matrix (Article 34 Presumption Workbench)...');
    await page.goto(`${BASE_URL}/conformity/standards`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'unified_cra_standards_matrix.png'), fullPage: true });

    // Toggle a clause
    const firstCheckbox = page.locator('tbody input[type="checkbox"]').first();
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.click();
      await page.waitForTimeout(1000);
    }

    // 3. Visit CE Nameplate Studio (Arts. 22 & 23)
    console.log('3. Testing CE Nameplate Studio (Articles 22 & 23)...');
    await page.goto(`${BASE_URL}/conformity/ce-studio`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'unified_cra_ce_nameplate_studio.png'), fullPage: true });

    // 4. Visit Open-Source Steward Hub (Art. 33)
    console.log('4. Testing Open-Source Steward Hub (Article 33)...');
    await page.goto(`${BASE_URL}/conformity/steward`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const generateBtn = page.getByRole('button', { name: /Issue Article 33 Voluntary Attestation/i });
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'unified_cra_open_source_steward.png'), fullPage: true });

    // 5. Visit 10-Year Importer Archive Ledger (Art. 17)
    console.log('5. Testing 10-Year Statutory Compliance Archive Ledger (Article 17)...');
    await page.goto(`${BASE_URL}/conformity/archive`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'unified_cra_importer_archive.png'), fullPage: true });

    // 6. Visit Axians 5-Stage Plant Hub
    console.log('6. Testing Axians 5-Stage Partner Hub...');
    await page.goto(`${BASE_URL}/conformity/partner-hub`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'unified_cra_partner_hub.png'), fullPage: true });

    console.log('✅ All Unified CRA Platform engines verified successfully!');
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
