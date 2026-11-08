const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  const sels = await page.$$eval('select', els => els.map(e => ({
    id: e.id,
    label: (e.labels && e.labels[0] ? e.labels[0].textContent : '').replace(/\s+/g,' ').trim().slice(0, 55),
    options: Array.from(e.options).map(o => o.textContent.trim()).slice(0, 12)
  })));
  console.log(JSON.stringify(sels, null, 1).slice(0, 3000));
  const checks = await page.$$eval('input[type=checkbox]', els => els.map(e => ({ id: e.id, label: (e.labels && e.labels[0] ? e.labels[0].textContent : '').replace(/\s+/g,' ').trim().slice(0, 80) })));
  console.log('CHECKS:', JSON.stringify(checks, null, 1).slice(0, 900));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
