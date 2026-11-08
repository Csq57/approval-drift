const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());

  await page.goto('https://qnx.devpost.com/rules', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('LEN:', t.length);
  console.log('MENTIONS_AU:', /Australia/i.test(t));
  for (const kw of ['excluded', 'not eligible', 'residents of', 'sanction']) {
    const i = t.toLowerCase().indexOf(kw.toLowerCase());
    if (i > -1) console.log(`[${kw}]`, t.slice(Math.max(0, i - 80), i + 400), '\n');
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
