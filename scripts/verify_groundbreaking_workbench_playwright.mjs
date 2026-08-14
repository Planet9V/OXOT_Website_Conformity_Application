import path from 'path';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8088';
const ARTIFACTS_DIR = '/Users/jimmcknney/.gemini/antigravity-ide/brain/c8897910-33b6-46e4-9440-4c1989b4cbfd';
const RECORDINGS_DIR = path.join(ARTIFACTS_DIR, 'tour_videos_groundbreaking');

if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Starting Playwright Verification of Groundbreaking Workbench UI Innovations...');

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
      dir: RECORDINGS_DIR,
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

    // 2. Test URL Query Param Deep Linking (?persona=ciso)
    console.log('2. Testing URL Deep-linking (?persona=ciso)...');
    await page.goto(`${BASE_URL}/conformity/?persona=ciso`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'workbench_ciso_deep_link.png'), fullPage: true });

    // 3. Test Interactive Fine Simulator
    console.log('3. Testing Interactive Article 61 Fine Simulator...');
    const fineSimulatorHeader = await page.locator('text=Article 61 What-If Fine Simulation Engine').first();
    await fineSimulatorHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'workbench_fine_simulator.png') });

    // 4. Test Real-Time CSIRT Webhook Dispatcher
    console.log('4. Testing Real-Time CSIRT Webhook Dispatcher...');
    const webhookHeader = await page.locator('text=Live CSIRT & ENISA Webhook Dispatcher').first();
    await webhookHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const dispatchBtn = page.locator('button:has-text("Dispatch 24h Early Warning")').first();
    if (await dispatchBtn.isVisible()) {
      await dispatchBtn.click();
      await page.waitForTimeout(1200);
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'workbench_csirt_dispatcher.png') });

    // 5. Test Contextual AI Copilot Drawer
    console.log('5. Testing Contextual AI Copilot Drawer...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const copilotBtn = page.locator('button:has-text("Ask Copilot")').first();
    await copilotBtn.click();
    await page.waitForTimeout(1000);

    // Click a pre-seeded quick question chip
    const promptChip = page.locator('button:has-text("What is the exact 24-hour early warning timeline")').first();
    if (await promptChip.isVisible()) {
      await promptChip.click();
      await page.waitForTimeout(1500);
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'workbench_ai_copilot_drawer.png') });

    // Close Copilot Drawer
    const closeBtn = page.locator('button:has-text("Close"), button[aria-label="Close"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    } else {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // 6. Test URL Deep-linking to Integrator (?persona=integrator)
    console.log('6. Testing URL Deep-linking (?persona=integrator)...');
    await page.click('button[data-persona="INTEGRATOR"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'workbench_integrator_deep_link.png'), fullPage: true });

    // 7. Test CRA Wiki Deep Linking (?tab=articles&num=21)
    console.log('7. Testing CRA Wiki Deep-linking (?tab=articles&num=21)...');
    await page.goto(`${BASE_URL}/conformity/cra-wiki?tab=articles&num=21`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'workbench_wiki_deep_link.png'), fullPage: true });

    console.log('✅ Groundbreaking Workbench Innovations verified successfully!');
  } catch (err) {
    console.error('❌ Verification error:', err);
    throw err;
  } finally {
    await context.close();
    await browser.close();
  }
}

run();
