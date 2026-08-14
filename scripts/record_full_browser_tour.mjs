import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const conformityNodeModules = '/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/node_modules';
const pw = await import(path.join(conformityNodeModules, '@playwright/test/index.js'));
const chromium = pw.chromium || pw.default?.chromium;

const ARTIFACTS_DIR = '/Users/jimmcknney/.gemini/antigravity-ide/brain/c8897910-33b6-46e4-9440-4c1989b4cbfd';
const VIDEOS_DIR = path.join(ARTIFACTS_DIR, 'tour_videos');

if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

async function runTour() {
  console.log('Launching Chrome with video capture enabled...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEOS_DIR,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();

  console.log('1. Navigating to Partner Scope Cockpit...');
  await page.goto('http://localhost:8088/partner-scope', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  console.log('2. Interacting with Industry Verticals...');
  const verticalButtons = page.locator('div[role="button"], button');
  const discreteBtn = page.locator('text=Discrete Manufacturing').first();
  const chemBtn = page.locator('text=Chemical, Pharma').first();
  const energyBtn = page.locator('text=Energy, Utilities').first();
  const logisticsBtn = page.locator('text=Logistics, Ports').first();

  if (await discreteBtn.isVisible()) {
    await discreteBtn.click();
    await page.waitForTimeout(1000);
  }
  if (await chemBtn.isVisible()) {
    await chemBtn.click();
    await page.waitForTimeout(1000);
  }
  if (await energyBtn.isVisible()) {
    await energyBtn.click();
    await page.waitForTimeout(1000);
  }
  if (await logisticsBtn.isVisible()) {
    await logisticsBtn.click();
    await page.waitForTimeout(1000);
  }

  console.log('3. Navigating to Hardware Presets Tab...');
  const hardwareTab = page.locator('text=2. Hardware Presets').first();
  if (await hardwareTab.isVisible()) {
    await hardwareTab.click();
    await page.waitForTimeout(1500);
  }

  console.log('4. Navigating to Commercial Plan & Copilot Tab...');
  const copilotTab = page.locator('text=4. Commercial Plan & Copilot').first();
  if (await copilotTab.isVisible()) {
    await copilotTab.click();
    await page.waitForTimeout(2000);
  }

  console.log('5. Navigating to Partner Hub...');
  await page.goto('http://localhost:8088/conformity/partner-hub', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const usernameInput = page.locator('#username');
  if (await usernameInput.isVisible()) {
    console.log('6. Authenticating with Single-Tenant Credentials...');
    await usernameInput.fill('oxotdemo');
    await page.locator('#password').fill('oxot2026$');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2500);
  }

  console.log('7. Exploring Partner Hub Workbench...');
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(1500);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(1000);

  console.log('Finalizing video recording...');
  const videoObj = page.video();
  let videoPath = null;
  if (videoObj) {
    videoPath = await videoObj.path();
  }

  await context.close();
  await browser.close();

  if (videoPath && fs.existsSync(videoPath)) {
    const finalMp4Path = path.join(ARTIFACTS_DIR, 'partner_engine_tour.mp4');
    const finalGifPath = path.join(ARTIFACTS_DIR, 'partner_engine_tour.gif');

    console.log('Converting video to MP4 and GIF using ffmpeg...');
    try {
      execSync(`/opt/homebrew/bin/ffmpeg -y -i "${videoPath}" -c:v libx264 -pix_fmt yuv420p "${finalMp4Path}"`, { stdio: 'inherit' });
      execSync(`/opt/homebrew/bin/ffmpeg -y -i "${videoPath}" -vf "fps=8,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${finalGifPath}"`, { stdio: 'inherit' });
      console.log(`Successfully generated:\n- ${finalMp4Path}\n- ${finalGifPath}`);
    } catch (e) {
      console.error('ffmpeg conversion error:', e);
    }
  }

  console.log('All steps completed successfully!');
}

runTour().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
