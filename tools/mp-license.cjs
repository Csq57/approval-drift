const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);

  const lic = page.locator('#react-select-7-input, [id*=license]').first();
  await lic.click({ force: true });
  await page.waitForTimeout(2000);
  const opts = await page.$$eval('[role=option]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()));
  console.log('License 选项:', JSON.stringify([...new Set(opts)].slice(0, 10)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
