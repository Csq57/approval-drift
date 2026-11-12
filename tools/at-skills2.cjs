const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.airtasker.com/account/skills/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);
  const boxes = await page.$$eval('input[type=checkbox]', els => els.map(e => ({
    checked: e.checked,
    text: (e.closest('label') || e.parentElement || {}).textContent?.replace(/\s+/g,' ').trim().slice(0, 60) || '',
    parent: (e.parentElement?.parentElement?.textContent || '').replace(/\s+/g,' ').trim().slice(0, 70),
  })));
  boxes.forEach((b, i) => console.log(i, '| checked:', b.checked, '|', b.text || b.parent));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
