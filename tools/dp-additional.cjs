const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.waitForTimeout(1500);
  console.log('URL:', page.url());
  const body = (await page.textContent('body')) || '';
  const idx = body.indexOf('Additional');
  console.log('TEXT:', body.replace(/\s+/g,' ').slice(Math.max(0, idx-200), idx + 1200));
  const fields = await page.$$eval('input:not([type=hidden]),textarea,select', els => els.map(e => ({
    tag: e.tagName, type: e.type, id: e.id, name: e.name,
    label: (e.labels && e.labels[0] ? e.labels[0].textContent : '').replace(/\s+/g,' ').trim().slice(0, 60),
    opts: e.tagName === 'SELECT' ? Array.from(e.options).map(o => o.textContent.trim()).slice(0, 8) : undefined
  })).filter(f => f.id !== 'ask' && !/clipboard/.test(f.id)));
  console.log('FIELDS:', JSON.stringify(fields, null, 1).slice(0, 1800));
  await page.screenshot({ path: 'shots/dp-additional.png', fullPage: true });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
