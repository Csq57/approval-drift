const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.waitForTimeout(1500);
  const fields = await page.$$eval('input:not([type=hidden]),textarea,select', els => els.map(e => ({
    tag: e.tagName, type: e.type, id: e.id, name: e.name,
    label: (e.labels && e.labels[0] ? e.labels[0].textContent : '').replace(/\s+/g,' ').trim().slice(0,50),
    val: (e.value||'').slice(0,40)
  })).filter(f => f.id !== 'ask' && !/clipboard/.test(f.id) && f.type !== 'file'));
  console.log(JSON.stringify(fields, null, 1).slice(0, 2500));
  const btns = await page.$$eval('button, input[type=submit]', els => els.map(e => (e.textContent||e.value||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,8));
  console.log('BTNS:', JSON.stringify(btns));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
