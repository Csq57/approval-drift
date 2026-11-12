const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('https://www.airtasker.com/messages/20620066/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = body.indexOf('Amanda B. (Customer)');
  const j = body.indexOf('Quick favour');
  console.log('--- thread tail ---');
  console.log(body.slice(Math.max(0, j - 200)).slice(0, 1200));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
