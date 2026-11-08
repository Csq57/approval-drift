const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ABOUT = fs.readFileSync(path.join(__dirname, '..', 'devpost-about.md'), 'utf8');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.goto('https://devpost.com/software/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4500);
  await page.locator('#software_description').fill(ABOUT);
  console.log('desc chars:', ABOUT.length);

  // Rovo tag
  const tagInput = page.locator('.select2-input').first();
  if (await tagInput.count()) {
    await tagInput.click({ force: true });
    await tagInput.type('Rovo', { delay: 55 });
    await page.waitForTimeout(900);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
  }

  await page.locator('#software-save').click({ force: true });
  await page.waitForTimeout(7000);
  console.log('saved ->', page.url());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
