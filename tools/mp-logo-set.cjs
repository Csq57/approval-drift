const path = require('path');
const { chromium } = require('playwright');
const LOGO = path.join(__dirname, '..', 'shots', 'mp-logo.png');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  const files = page.locator('input[type=file]');
  const n = await files.count();
  console.log('file inputs:', n);
  let done = false;
  for (let i = 0; i < n; i++) {
    try { await files.nth(i).setInputFiles(LOGO); await page.waitForTimeout(3000); done = true; break; } catch (e) {}
  }
  console.log('logo 设置:', done);
  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 4)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
