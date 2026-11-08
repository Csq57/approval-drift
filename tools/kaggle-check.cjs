const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[1] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1200 });
  await page.goto('https://www.kaggle.com/competitions?listOption=active', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const rows = await page.$$eval('table tr, .competition-list__item, div[role=row]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(t => /\$|prize|Award/i.test(t)).slice(0, 12));
  console.log('ROWS:', JSON.stringify(rows, null, 1).slice(0, 1500));
  const body = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
  const i = body.indexOf('Active');
  console.log('SNIP:', body.slice(i, i + 1500));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
