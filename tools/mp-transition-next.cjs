const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  const next = page.getByRole('button', { name: /^Next$/ }).first();
  console.log('Next:', await next.count());
  await next.click({ force: true });
  await page.waitForTimeout(14000);
  console.log('URL:', page.url().slice(0, 130));
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('TEXT:', body.replace(/\s{2,}/g, ' ').slice(0, 1200));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
