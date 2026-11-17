const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('mail.google.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1400, height: 950 });
  await page.goto('https://mail.google.com/mail/u/0/#search/marketplace+OR+review+OR+rejected+newer_than:2d', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(10000);
  const rows = await page.$$eval('tr.zA', els => els.slice(0, 8).map(e => (e.textContent||'').replace(/\s+/g,' ').trim().slice(0, 150)));
  console.log('最近邮件:');
  rows.forEach((r,i) => console.log(' ', i, r));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
