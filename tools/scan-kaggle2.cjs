const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.kaggle.com/competitions?listOption=active', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(10000);
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const s = body.indexOf('Active');
  const chunk = body.slice(s, s + 2400);
  const items = chunk.split(/(?=[A-Z][a-z])/).join('');
  console.log('KAGGLE:', chunk.slice(0, 1800));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
