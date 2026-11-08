const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://codegeist2026.devpost.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  console.log('TITLE:', await page.title());
  const links = await page.$$eval('a', els => els
    .map(e => ({ t: (e.textContent || '').replace(/\s+/g, ' ').trim(), h: e.href }))
    .filter(x => /submit|enter a|my projects|manage|register/i.test(x.t) || /submit|manage/i.test(x.h))
    .slice(0, 15));
  console.log(JSON.stringify(links, null, 1));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
