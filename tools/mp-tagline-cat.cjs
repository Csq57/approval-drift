const { chromium } = require('playwright');
const TAG = 'Knows the moment an approval no longer matches the page it was approved on';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1200);

  const tag = page.locator('#tagLine-uid262').first();
  await tag.click({ force: true });
  await tag.fill(TAG);
  await tag.press('Tab');
  await page.waitForTimeout(1500);
  console.log('tagline 现在:', JSON.stringify(await tag.inputValue()));

  // categories
  const cat = page.locator('#react-select-5-input').first();
  await cat.click({ force: true });
  await page.waitForTimeout(2000);
  const opts = await page.$$eval('[role=option]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()));
  console.log('分类选项:', JSON.stringify([...new Set(opts)].slice(0, 20)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
