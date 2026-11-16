const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(800);
  const sels = await page.$$eval('select', els => els.map(e => ({ id: e.id||'', name: e.name||'', opts: Array.from(e.options).map(o => o.text.trim()).slice(0, 8) })));
  console.log('SELECTS:', JSON.stringify(sels).slice(0, 700));
  const inputs = await page.$$eval('input:not([type=hidden]):not([type=file]), textarea', els => els.filter(e => e.offsetWidth||e.offsetHeight).map(e => ({ id: e.id||'', name: e.name||'', type: e.type, val: (e.value||'').slice(0,20) })));
  console.log('INPUTS:', JSON.stringify(inputs).slice(0, 700));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
