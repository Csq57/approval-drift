const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://codegeist2026.devpost.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  const body = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
  const i = body.indexOf('Who can participate');
  console.log('ELIGIBILITY:', body.slice(i, i + 600));
  console.log('AUSTRALIA_MENTIONED:', /Australia/i.test(body));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
