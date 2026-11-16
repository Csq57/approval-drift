const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(2000);
  const rows = await page.$$eval('tr', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0, 10));
  console.log('ROWS:');
  rows.forEach((r, i) => console.log(' ', i, r.slice(0, 160)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
