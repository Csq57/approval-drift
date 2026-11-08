const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1200 });
  await page.goto('https://devpost.com/hackathons?status=open&sort=prize', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const start = body.indexOf('Sort:');
  console.log(body.slice(start, start + 4200));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
