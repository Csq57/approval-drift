const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  for (const slug of ['restock-agent', 'approval-drift']) {
    await page.goto('https://devpost.com/software/' + slug, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    const m = t.match(/Submitted to[^|]{0,90}/i);
    console.log(slug, '=>', m ? m[0].trim() : 'NO SUBMITTED LINE');
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
