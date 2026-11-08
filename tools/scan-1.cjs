const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://devpost.com/hackathons?status=open', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2000);

  const data = await page.evaluate(async () => {
    const out = [];
    for (const sort of ['deadline', 'prize']) {
      const r = await fetch(`/api/hackathons?status[]=open&sort_by=${sort}`, { headers: { Accept: 'application/json' } });
      const j = await r.json();
      for (const h of (j.hackathons || [])) {
        out.push({ title: h.title, url: h.url, dates: h.submission_period_dates, prize: (h.prize_amount || '').replace(/<[^>]+>/g, '') });
      }
    }
    return out;
  });

  const seen = new Set();
  const rows = data.filter(h => { if (seen.has(h.url)) return false; seen.add(h.url); return true; });
  console.log('TOTAL OPEN:', rows.length);
  const big = rows.filter(h => { const n = parseInt((h.prize||'').replace(/[^0-9]/g,'')); return n >= 20000; });
  console.log('PRIZE>=20k:', big.length);
  for (const h of big) console.log('|', h.title, '||', h.dates, '||', h.prize, '||', h.url);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
