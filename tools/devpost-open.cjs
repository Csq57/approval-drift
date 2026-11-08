const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto('https://devpost.com/hackathons?status=open', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  const cards = await page.$$eval('#open-hackathons .hackathon-tile, .hackathons-container .tile, li.hackathon-tile', els => els.map(e => {
    const t = (sel) => (e.querySelector(sel)?.textContent || '').replace(/\s+/g, ' ').trim();
    return {
      name: t('h3, .main-title'),
      prize: t('.prize-amount, .submission-period, .prize'),
      dates: t('.submission-period, .date-range, time'),
      url: e.querySelector('a')?.href || ''
    };
  }).filter(c => c.name));
  console.log('COUNT:', cards.length);
  for (const c of cards.slice(0, 22)) console.log('|', c.name, '||', c.dates || c.prize, '||', c.url);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
