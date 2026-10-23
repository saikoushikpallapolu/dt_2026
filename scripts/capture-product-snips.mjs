import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('scripts/slides_assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Copy the uploaded team photo
const teamPhotoSrc = 'C:/Users/saiko/.gemini/antigravity-ide/brain/3a84fc56-7bbb-4089-af83-6586facec08c/.user_uploaded/media_1792782987270.png';
if (fs.existsSync(teamPhotoSrc)) {
  fs.copyFileSync(teamPhotoSrc, path.join(outDir, 'team_cpdt.png'));
  console.log('Copied team picture to slides_assets/team_cpdt.png');
}

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

const page = await context.newPage();

try {
  // 1. Capture Directory / Home
  console.log('Capturing Directory...');
  await page.goto('http://localhost:5174/directory', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'product_directory.png') });

  // 2. Capture Prasanna Mam's Placard
  console.log('Capturing Placard...');
  await page.goto('http://localhost:5174/faculty/prasanna', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'product_placard.png') });

  // 3. Login as Professor and capture Workspace
  console.log('Capturing Professor Workspace...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'prasanna@vnr.demo');
  await page.fill('input[type="password"]', 'DemoPass123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/faculty/dashboard');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'product_workspace.png') });

  // 4. Mobile View of Placard
  console.log('Capturing Mobile Placard...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/faculty/prasanna', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'product_mobile_placard.png') });

  // 5. Mobile QR Scanner
  console.log('Capturing Mobile QR Scanner...');
  await page.goto('http://localhost:5174/scan', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'product_mobile_scanner.png') });

  console.log('All product screenshots captured successfully!');
} catch (err) {
  console.error('Error capturing screenshots:', err);
} finally {
  await browser.close();
}
