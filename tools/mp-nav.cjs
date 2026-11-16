const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(1500);
  console.log('URL:', page.url().slice(0, 100));
  const nav = await page.$$eval('a', els => els.map(e => ({ t: (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,32), h: e.getAttribute('href')||'' }))
    .filter(x => x.h && /manage\//.test(x.h)));
  const uniq = []; const seen = new Set();
  nav.forEach(n => { const k = n.h; if (!seen.has(k)) { seen.add(k); uniq.push(n); } });
  console.log('NAV:', JSON.stringify(uniq.slice(0, 20), null, 0).slice(0, 1200));
  const btns = await page.$$eval('button, a[role=button]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x=>x && x.length<30));
  console.log('BTNS:', JSON.stringify([...new Set(btns)].slice(0, 15)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
