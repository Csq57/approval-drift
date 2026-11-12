const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.airtasker.com/account/edit/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  const menu = await page.$$eval('a', els => els.map(e => ({ t: (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26), h: e.getAttribute('href')||'' })).filter(x => x.h.startsWith('/')));
  const uniq = [];
  const seen = new Set();
  for (const m of menu) { const k = m.t + m.h; if (!seen.has(k) && m.t) { seen.add(k); uniq.push(m); } }
  console.log(JSON.stringify(uniq.slice(0, 26), null, 0).slice(0, 1600));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
