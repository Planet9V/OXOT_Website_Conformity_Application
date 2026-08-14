import path from 'path';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8088';
const ARTIFACTS_DIR = '/Users/jimmcknney/.gemini/antigravity-ide/brain/c8897910-33b6-46e4-9440-4c1989b4cbfd';
const RECORDINGS_DIR = path.join(ARTIFACTS_DIR, 'tour_videos_complete_ecosystem');

if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

async function run() {
  console.log('🎬 Starting Full Platform Tour: (1) Website, (2) CRA Conformity App, (3) Partner Hub...');

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
    // ==========================================
    // PILLAR 1: THE PUBLIC WEBSITE (oxot-web)
    // ==========================================
    console.log('🌐 PILLAR 1: Touring Public Website...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_1_website_hero.png') });

    // Smooth scroll through the website
    await page.evaluate(() => window.scrollBy({ top: 800, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_1_website_services.png') });

    await page.evaluate(() => window.scrollBy({ top: 1200, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_1_website_frameworks.png') });

    await page.evaluate(() => window.scrollBy({ top: 1200, behavior: 'smooth' }));
    await page.waitForTimeout(1000);

    // ==========================================
    // PILLAR 2: CRA CONFORMITY APP (conformity)
    // ==========================================
    console.log('🛡️ PILLAR 2: Touring CRA Conformity App...');
    await page.goto(`${BASE_URL}/conformity/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="text"], input[name="username"], input[id*="user"]', 'oxotdemo');
    await page.fill('input[type="password"]', 'oxot2026$');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    // Command Center Overview
    await page.goto(`${BASE_URL}/conformity/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_2_command_center.png'), fullPage: true });

    // Open Contextual AI Copilot Drawer
    console.log('   Testing AI Copilot Drawer...');
    const copilotBtn = page.locator('button[data-tour="copilot-btn"]').first();
    if (await copilotBtn.isVisible()) {
      await copilotBtn.click();
      await page.waitForTimeout(1000);
      const questionChip = page.locator('button:has-text("Does modifying this SCADA HMI script")').first();
      if (await questionChip.isVisible()) {
        await questionChip.click();
        await page.waitForTimeout(1500);
      }
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_2_ai_copilot_drawer.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Switch to CISO Persona & View Fine Simulator + CSIRT Dispatcher
    console.log('   Switching to CISO Persona for Fine Simulator...');
    await page.click('button[data-persona="PLANT_CISO"]');
    await page.waitForTimeout(1000);
    const fineSimulatorEl = page.locator('text=Article 61 What-If Fine Simulation Engine').first();
    await fineSimulatorEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_2_fine_simulator.png') });

    // Tour Products Catalog
    console.log('   Touring Products Catalog & Assessment...');
    await page.goto(`${BASE_URL}/conformity/products`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_2_products_catalog.png') });

    // Tour Product Portfolio
    console.log('   Touring Product Portfolio Fleet Management...');
    await page.goto(`${BASE_URL}/conformity/product-portfolio`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_2_product_portfolio.png') });

    // Tour CRA Statutory Wiki
    console.log('   Touring CRA Statutory Wiki...');
    await page.goto(`${BASE_URL}/conformity/wiki`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_2_cra_wiki.png') });

    // Tour Auditor Portal
    console.log('   Touring Notified Body Auditor Portal...');
    await page.goto(`${BASE_URL}/conformity/auditor-portal`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_2_auditor_portal.png') });

    // ==========================================
    // PILLAR 3: THE PARTNER HUB (partner-hub)
    // ==========================================
    console.log('🏭 PILLAR 3: Touring Industrial Partner Hub...');
    await page.goto(`${BASE_URL}/conformity/partner-hub`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // Tab 1: Customer Plant Inventory
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_3_partner_tab1_plants.png') });

    // Tab 2: Article 21 Safe Harbor Wizard
    console.log('   Checking Tab 2: Article 21 Safe Harbor...');
    const tab2 = page.locator('button[role="tab"]:has-text("Article 21 Safe Harbor")').first();
    if (await tab2.isVisible()) {
      await tab2.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_3_partner_tab2_art21.png') });
    }

    // Tab 3: Upstream OEM Vendor Radar
    console.log('   Checking Tab 3: Vendor Radar...');
    const tab3 = page.locator('button[role="tab"]:has-text("Vendor Hardware Radar")').first();
    if (await tab3.isVisible()) {
      await tab3.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_3_partner_tab3_vendor_radar.png') });
    }

    // Tab 4: Procurement Contract Clauses
    console.log('   Checking Tab 4: Procurement Clauses...');
    const tab4 = page.locator('button[role="tab"]:has-text("Procurement Clauses")').first();
    if (await tab4.isVisible()) {
      await tab4.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_3_partner_tab4_clauses.png') });
    }

    // Tab 5: Composite CE Plant Risk
    console.log('   Checking Tab 5: Composite CE Plant Risk & Webhooks...');
    const tab5 = page.locator('button[role="tab"]:has-text("Composite CE Risk")').first();
    if (await tab5.isVisible()) {
      await tab5.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_pillar_3_partner_tab5_composite_radar.png') });
    }

    console.log('🎉 Full 3-Pillar Platform Tour completed successfully!');
  } catch (err) {
    console.error('❌ Tour error:', err);
    throw err;
  } finally {
    await context.close();
    await browser.close();
  }
}

run();
