const path = require('path');
const { chromium } = require('playwright');
const SHOTS = [
  path.join(__dirname, '..', 'shots', 'gallery-1-valid.png'),
  path.join(__dirname, '..', 'shots', 'gallery-2-stale.png'),
];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  for (let i = 0; i < SHOTS.length; i++) {
    const add = page.getByRole('button', { name: /Add another image/i }).first();
    if (await add.count()) { await add.click({ force: true }); await page.waitForTimeout(2500); }
    const files = page.locator('input[type=file]');
    const n = await files.count();
    console.log(`round ${i + 1} file inputs:`, n);
    if (n) { await files.nth(n - 1).setInputFiles(SHOTS[i]); await page.waitForTimeout(6000); }
  }
  const imgs = await page.$$eval('img', els => els.filter(e => e.offsetWidth > 60).length);
  console.log('页面图片数:', imgs);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
