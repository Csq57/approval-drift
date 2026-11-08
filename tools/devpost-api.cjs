const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://devpost.com/hackathons?status=open', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  const data = await page.evaluate(async () => {
    const r = await fetch('/api/hackathons?status[]=open&sort_by=deadline', { headers: { Accept: 'application/json' } });
    return await r.json();
  });
  const list = (data.hackathons || []).map(h => ({
    name: h.title, url: h.url, deadline: h.submission_period_dates,
    prize: h.prize_amount, open: h.open_state
  }));
  console.log('COUNT:', list.length);
  for (const h of list.slice(0, 20)) console.log('|', h.name, '||', h.deadline, '||', (h.prize || '').replace(/<[^>]+>/g, ''), '||', h.url);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
