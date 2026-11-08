const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://start-developer-competition-26.devpost.com/rules', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const body = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
  for (const kw of ['ELIGIBILITY', 'Eligibility', 'not eligible', 'residents of', 'Italy', 'Quebec', 'Brazil']) {
    const i = body.indexOf(kw);
    if (i > -1) console.log(kw, '->', body.slice(i, i + 500));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
