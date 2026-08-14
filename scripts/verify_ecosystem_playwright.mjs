import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const conformityNodeModules = '/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/node_modules';
const pw = await import(path.join(conformityNodeModules, '@playwright/test/index.js'));
const chromium = pw.chromium || pw.default?.chromium;

const ARTIFACTS_DIR = '/Users/jimmcknney/.gemini/antigravity-ide/brain/c8897910-33b6-46e4-9440-4c1989b4cbfd';
const TOUR_DIR = path.join(ARTIFACTS_DIR, 'tour_videos_ecosystem');
if (!fs.existsSync(TOUR_DIR)) {
  fs.mkdirSync(TOUR_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Chrome for CRA Multi-Persona Visual Verification...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: TOUR_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  // 1. Visit /partner-scope
  console.log('1. Navigating to /partner-scope...');
  await page.goto('http://localhost:8088/partner-scope', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Switch to BOM Ingestion Tab
  console.log('Clicking BOM Tab...');
  await page.locator('button', { hasText: 'BOM' }).first().click();
  await page.waitForTimeout(600);

  // Paste raw Nozomi CSV
  const rawCsv = `Asset_ID,IP_Address,Vendor,Model,Firmware\n1,10.24.120.45,Siemens,Scalance XC-208,V4.1.2\n2,192.168.1.10,Moxa,EDS-508A,V3.8\n3,172.16.0.5,Hirschmann,RS20-0800,V9.0`;
  await page.fill('textarea', rawCsv);
  await page.waitForTimeout(500);

  // Click Sanitize & Evaluate button
  console.log('Clicking Sanitize & Evaluate...');
  await page.locator('button', { hasText: 'Verwerk' }).or(page.locator('button', { hasText: 'Sanitize' })).first().click();
  await page.waitForTimeout(1500);

  // Capture partner-scope screenshot
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_partner_scope_modernized.png'), fullPage: true });
  console.log('Captured live_partner_scope_modernized.png');

  // 2. Navigate to /conformity/partner-hub and log in
  console.log('2. Navigating to /conformity/partner-hub...');
  await page.goto('http://localhost:8088/conformity/partner-hub', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const usernameInput = page.locator('#username');
  if (await usernameInput.isVisible()) {
    console.log('Authenticating with oxotdemo / oxot2026$ ...');
    await usernameInput.fill('oxotdemo');
    await page.locator('#password').fill('oxot2026$');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2500);
  }

  // Go to partner-hub post login
  await page.goto('http://localhost:8088/conformity/partner-hub', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Tab 1: OEM Suppliers
  console.log('Clicking Tab 1...');
  const tab1 = page.locator('button', { hasText: '1. OEM Supplier Registry' }).first();
  if (await tab1.isVisible()) {
    await tab1.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_partner_hub_tab1_suppliers.png') });
    console.log('Captured Tab 1');
  }

  // Tab 2: Article 21 Wizard
  console.log('Clicking Tab 2...');
  const tab2 = page.locator('button', { hasText: '2. Article 21 Modification Wizard' }).first();
  if (await tab2.isVisible()) {
    await tab2.click();
    await page.waitForTimeout(800);
    await page.locator('button', { hasText: 'Evaluate Article 21 Boundary' }).first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_partner_hub_tab2_article21.png') });
    console.log('Captured Tab 2');
  }

  // Tab 3: Pre-Procurement Scorecard
  console.log('Clicking Tab 3...');
  const tab3 = page.locator('button', { hasText: '3. Pre-Procurement Scorecard' }).first();
  if (await tab3.isVisible()) {
    await tab3.click();
    await page.waitForTimeout(800);
    await page.locator('button', { hasText: 'Run Vendor Evaluation' }).first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_partner_hub_tab3_procurement.png') });
    console.log('Captured Tab 3');
  }

  // Tab 4: Recital 34 SLA Clauses
  console.log('Clicking Tab 4...');
  const tab4 = page.locator('button', { hasText: '4. Recital 34 SLA Clause Pack' }).first();
  if (await tab4.isVisible()) {
    await tab4.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_partner_hub_tab4_clauses.png') });
    console.log('Captured Tab 4');
  }

  // Tab 5: Composite Machine Builder
  console.log('Clicking Tab 5...');
  const tab5 = page.locator('button', { hasText: '5. Composite Machine Builder' }).first();
  if (await tab5.isVisible()) {
    await tab5.click();
    await page.waitForTimeout(800);
    await page.locator('button', { hasText: 'Evaluate Composite Compliance' }).first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_partner_hub_tab5_composite.png') });
    console.log('Captured Tab 5');
  }

  console.log('Finalizing video capture...');
  const videoObj = page.video();
  let videoPath = null;
  if (videoObj) {
    videoPath = await videoObj.path();
  }

  await page.close();
  await context.close();
  await browser.close();

  if (videoPath && fs.existsSync(videoPath)) {
    const finalMp4Path = path.join(ARTIFACTS_DIR, 'partner_ecosystem_tour.mp4');
    const finalGifPath = path.join(ARTIFACTS_DIR, 'partner_ecosystem_tour.gif');

    console.log(`Transcoding ${videoPath} to ${finalMp4Path}...`);
    try {
      execSync(`/opt/homebrew/bin/ffmpeg -y -i "${videoPath}" -c:v libx264 -pix_fmt yuv420p "${finalMp4Path}"`, { stdio: 'inherit' });
      execSync(`/opt/homebrew/bin/ffmpeg -y -i "${videoPath}" -vf "fps=8,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${finalGifPath}"`, { stdio: 'inherit' });
      console.log('Visual tour generated successfully!');
    } catch (e) {
      console.error('FFmpeg transcode error:', e);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
