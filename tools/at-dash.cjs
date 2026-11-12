const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  for (const u of ['https://www.airtasker.com/au/dashboard/', 'https://www.airtasker.com/au/profile/']) {
    const r = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
    await page.waitForTimeout(4000);
    const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    console.log(u, '| HTTP', r && r.status(), '| final', page.url().slice(0, 70));
    console.log('   ->', t.slice(0, 160));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
