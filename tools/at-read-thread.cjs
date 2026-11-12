const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.airtasker.com/messages/20620066/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = body.indexOf('Amanda');
  console.log('THREAD:', body.slice(Math.max(0, i - 200), i + 1200));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
