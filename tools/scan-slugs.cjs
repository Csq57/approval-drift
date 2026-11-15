const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.kaggle.com/competitions?listOption=active', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const links = await page.$$eval('a', els => els
    .map(e => ({ t: (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,50), h: e.getAttribute('href')||'' }))
    .filter(x => /^\/competitions\//.test(x.h) && x.t && !/\/rules|\/team|\/leaderboard/.test(x.h)));
  const seen = new Set();
  links.slice(0, 40).forEach(l => { if (!seen.has(l.h)) { seen.add(l.h); console.log(l.h, '|', l.t); } });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
