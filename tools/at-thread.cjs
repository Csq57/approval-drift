const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('https://www.airtasker.com/messages/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  const items = await page.$$eval('a, [role=link], li, div[class*=conversation]', els => els
    .map(e => ({ t: (e.textContent || '').replace(/\s+/g,' ').trim().slice(0, 70), h: e.getAttribute && (e.getAttribute('href') || '') }))
    .filter(x => /Excel|Rajesh|Maths/i.test(x.t)).slice(0, 10));
  console.log('THREADS:', JSON.stringify(items, null, 0).slice(0, 800));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
