const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.airtasker.com/account/portfolio/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);
  const meta = await page.$eval('#_r_1_control', e => ({
    maxLength: e.maxLength, rows: e.rows, readOnly: e.readOnly, disabled: e.disabled,
    len: (e.value || '').length,
  }));
  console.log('FIELD:', JSON.stringify(meta));
  const btns = await page.$$eval('button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 26));
  console.log('BUTTONS:', JSON.stringify([...new Set(btns)].slice(0, 18)));
  const counter = await page.$$eval('*', els => els.map(e => (e.textContent||'').trim()).filter(x => /^\d+\s*\/\s*\d+$/.test(x)).slice(0, 5));
  console.log('COUNTERS:', JSON.stringify(counter));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
