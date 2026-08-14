import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const artifactsDir = '/Users/jimmcknney/.gemini/antigravity-ide/brain/c8897910-33b6-46e4-9440-4c1989b4cbfd';
const videoDir = path.join(artifactsDir, 'tour_videos_axians');
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

async function run() {
  console.log('Starting Playwright test for upgraded Axians 5-Stage CRA Pipeline...');
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

  // 1. Visit Login Page & Authenticate
  console.log('1. Navigating to login...');
  await page.goto('http://localhost:8088/conformity/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="text"], input[name="username"], input[id*="user"]', 'oxotdemo');
  await page.fill('input[type="password"]', 'oxot2026$');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // 2. Navigate to Partner Hub (Axians Operational Pipeline)
  console.log('2. Navigating to Partner Hub (Stage 1: Plants)...');
  await page.goto('http://localhost:8088/conformity/partner-hub', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(artifactsDir, 'axians_pipeline_stage1_plants.png'), fullPage: true });

  // 3. Test Stage 2: Article 21 Clearance & Safe Harbor Execution
  console.log('3. Testing Stage 2: Article 21...');
  await page.click('#tab-stage-2-article21');
  await page.waitForTimeout(800);
  await page.click('text="Execute Article 21 Statutory Clearance"');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(artifactsDir, 'axians_pipeline_stage2_art21.png'), fullPage: true });

  // 4. Test Statutory Live Context Flyout
  console.log('4. Testing Statutory Flyout Drawer...');
  await page.click('button:has-text("Ref: Recital 34")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactsDir, 'axians_pipeline_statutory_drawer.png'), fullPage: true });
  await page.click('#close-statutory-drawer');
  await page.waitForTimeout(800);

  // 5. Test Stage 3: Vendor Radar & Duty to Refrain
  console.log('5. Testing Stage 3: Vendor Radar...');
  await page.click('#tab-stage-3-procurement');
  await page.waitForTimeout(800);
  await page.click('text="Screen Vendor Component"');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(artifactsDir, 'axians_pipeline_stage3_vendor.png'), fullPage: true });

  // 6. Test Stage 4: Annex VII File Builder
  console.log('6. Testing Stage 4: Annex VII File...');
  await page.click('#tab-stage-4-annex7');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactsDir, 'axians_pipeline_stage4_annex7.png'), fullPage: true });

  // 7. Test Stage 5: 24h CSIRT Incident Hub
  console.log('7. Testing Stage 5: 24h CSIRT Hub...');
  await page.click('#tab-stage-5-csirt');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Transmit 24h Early Warning")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(artifactsDir, 'axians_pipeline_stage5_csirt.png'), fullPage: true });

  // Close page to save video
  await page.close();
  await context.close();
  await browser.close();

  // Convert webm to mp4 and gif
  const videos = fs.readdirSync(videoDir).filter((f) => f.endsWith('.webm'));
  if (videos.length > 0) {
    const latestVideo = path.join(videoDir, videos[videos.length - 1]);
    const mp4Path = path.join(artifactsDir, 'axians_pipeline_tour.mp4');
    const gifPath = path.join(artifactsDir, 'axians_pipeline_tour.gif');

    console.log(`Converting ${latestVideo} to MP4 and GIF...`);
    try {
      execSync(`ffmpeg -y -i "${latestVideo}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`);
      execSync(`ffmpeg -y -i "${latestVideo}" -vf "fps=10,scale=1000:-1:flags=lanczos" -c:v gif "${gifPath}"`);
      console.log('Converted video successfully!');
    } catch (ffmpegErr) {
      console.warn('FFmpeg conversion warning:', ffmpegErr.message);
    }
  }

  console.log('Playwright test completed successfully!');
}

run().catch((err) => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
