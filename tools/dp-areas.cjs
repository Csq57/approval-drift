const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('devpost.com')) || context.pages()[0];
  await page.waitForTimeout(1500);
  const areas = await page.$$eval('textarea', els => els.map(e => ({ id: e.id, name: e.name, len: (e.value||'').length, head: (e.value||'').slice(0,140) })));
  console.log('TEXTAREAS:', JSON.stringify(areas, null, 1).slice(0, 1200));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
