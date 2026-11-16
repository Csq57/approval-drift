const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(1500);
  const inputs = await page.$$eval('input', els => els.map(e => ({
    id: e.id, name: e.name, type: e.type, vis: !!(e.offsetWidth || e.offsetHeight),
    aria: e.getAttribute('aria-label')||'', ph: e.placeholder||'',
  })));
  console.log('INPUTS:', JSON.stringify(inputs, null, 0).slice(0, 900));
  const btns = await page.$$eval('button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x=>x && x.length<20));
  console.log('BUTTONS:', JSON.stringify([...new Set(btns)]));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
