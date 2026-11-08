const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', 'shots');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => !/one-atlas-csnw|kaggle|chatgpt|mail\.google|try\/cloud/.test(p.url())) || context.pages()[0];
  await page.setViewportSize({ width: 1200, height: 1400 });
  await page.goto('https://devpost.com/software/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const inputs = await page.$$('input[type=file]');
  console.log('file inputs:', inputs.length);
  const gallery = page.locator('#imageFileInput').first();
  if (await gallery.count()) {
    await gallery.setInputFiles([
      path.join(ROOT, 'gallery-1-valid.png'),
      path.join(ROOT, 'gallery-2-stale.png'),
    ]);
    console.log('uploaded 2 images');
    await page.waitForTimeout(9000);
  } else console.log('no #imageFileInput');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
