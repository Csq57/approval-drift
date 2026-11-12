const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1200 });
  await page.goto('https://www.airtasker.com/account/public-profile', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  const heads = await page.$$eval('h1,h2,h3,h4', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x=>x).slice(0, 20));
  console.log('SECTIONS:', JSON.stringify(heads));
  const btns = await page.$$eval('button, a', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 32));
  console.log('CTAS:', JSON.stringify([...new Set(btns)].slice(0, 24)));
  const inputs = await page.$$eval('input, textarea', els => els.map(e => ({ id: e.id, ph: (e.placeholder||'').slice(0,30), len: (e.value||'').length })));
  console.log('INPUTS:', JSON.stringify(inputs).slice(0, 500));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
