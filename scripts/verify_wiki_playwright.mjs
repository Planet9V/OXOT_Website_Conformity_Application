import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function run() {
  const artifactsDir = "/Users/jimmcknney/.gemini/antigravity-ide/brain/c8897910-33b6-46e4-9440-4c1989b4cbfd";
  const videoDir = path.join(artifactsDir, "tour_videos_wiki");
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  const pw = await import(
    "/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/node_modules/@playwright/test/index.js"
  );
  const chromium = pw.chromium || pw.default?.chromium;

  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1440,900"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  console.log("1. Visiting Public CRA Truth Engine Wiki: http://localhost:8088/wiki/cra");
  await page.goto("http://localhost:8088/wiki/cra", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactsDir, "live_cra_wiki_public_reader.png"), fullPage: false });

  console.log("2. Clicking Recitals tab in Public Wiki");
  const recitalsTabBtn = page.locator('button:has-text("Recitals")');
  if (await recitalsTabBtn.count() > 0) {
    await recitalsTabBtn.first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(artifactsDir, "live_cra_wiki_recitals_view.png"), fullPage: false });
  }

  console.log("3. Clicking Annexes tab in Public Wiki");
  const annexesTabBtn = page.locator('button:has-text("Annexes")');
  if (await annexesTabBtn.count() > 0) {
    await annexesTabBtn.first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(artifactsDir, "live_cra_wiki_annexes_view.png"), fullPage: false });
  }

  console.log("4. Performing live search for 'SBOM'");
  const searchInput = page.locator('input[placeholder*="Search articles"]');
  if (await searchInput.count() > 0) {
    await searchInput.first().fill("SBOM");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(artifactsDir, "live_cra_wiki_search_results.png"), fullPage: false });
  }

  console.log("5. Logging in and visiting Enterprise Single-Tenant CRA Wiki: http://localhost:8088/conformity/wiki");
  await page.goto("http://localhost:8088/conformity/welcome", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const usernameInput = page.locator("#username");
  if (await usernameInput.count() > 0) {
    await usernameInput.fill("oxotdemo");
    await page.locator("#password").fill("oxot2026$");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  }

  await page.goto("http://localhost:8088/conformity/wiki", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(artifactsDir, "live_cra_wiki_enterprise_view.png"), fullPage: false });

  await page.close();
  await context.close();
  await browser.close();

  console.log("Playwright visual capture completed!");

  // Convert video to mp4 and gif
  const videoFiles = fs.readdirSync(videoDir).filter(f => f.endsWith(".webm"));
  if (videoFiles.length > 0) {
    const rawVideo = path.join(videoDir, videoFiles[videoFiles.length - 1]);
    const mp4Path = path.join(artifactsDir, "cra_wiki_tour.mp4");
    const gifPath = path.join(artifactsDir, "cra_wiki_tour.gif");

    console.log(`Converting ${rawVideo} to MP4 and GIF using ffmpeg...`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${rawVideo}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${rawVideo}" -vf "fps=8,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifPath}"`);
    console.log("CRA Wiki visual video and GIF generated successfully!");
  }
}

run().catch(err => {
  console.error("Playwright Wiki test error:", err);
  process.exit(1);
});
