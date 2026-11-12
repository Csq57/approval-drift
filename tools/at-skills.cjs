const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.airtasker.com/account/skills/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);
  const fields = await page.$$eval('input, textarea, select', els => els.map(e => ({
    tag: e.tagName.toLowerCase(), id: e.id, type: e.type || '',
    ph: (e.placeholder||'').slice(0,28), val: (e.value||'').slice(0,50),
    label: (e.labels && e.labels[0] ? e.labels[0].textContent : '').replace(/\s+/g,' ').trim().slice(0,30),
  })).filter(f => f.id && !/clipboard|^ask$/.test(f.id)));
  console.log('SKILL FIELDS:', JSON.stringify(fields, null, 0).slice(0, 1200));
  const chips = await page.$$eval('[class*=chip], [class*=tag], [class*=pill]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x=>x && x.length<30).slice(0, 20));
  console.log('CHIPS:', JSON.stringify([...new Set(chips)]));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
