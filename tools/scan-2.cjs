const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());

  await page.goto('https://qnx.devpost.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  let t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = t.indexOf('QNX');
  console.log('QNX ABOUT:', t.slice(Math.max(0, i), i + 700));

  await page.goto('https://www.kaggle.com/competitions?listOption=active', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const s = body.indexOf('Active');
  console.log('\nKAGGLE:', body.slice(s, s + 2200));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
