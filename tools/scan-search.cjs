const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.kaggle.com/competitions?listOption=active&searchQuery=agent%20harness', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const links = await page.$$eval('a', els => els.map(e => e.getAttribute('href')||'').filter(h => /^\/competitions\/[a-z0-9-]{6,}$/i.test(h)));
  console.log('CANDIDATE SLUGS:', JSON.stringify([...new Set(links)].slice(0, 10)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
