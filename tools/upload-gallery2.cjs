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

  for (const f of ['gallery-1-valid.png', 'gallery-2-stale.png']) {
    const input = page.locator('#imageFileInput').first();
    await input.setInputFiles(path.join(ROOT, f));
    console.log('uploaded', f);
    await page.waitForTimeout(12000);
  }

  const save = page.locator('#software-save');
  await save.click({ force: true });
  await page.waitForTimeout(9000);
  console.log('saved ->', page.url());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
