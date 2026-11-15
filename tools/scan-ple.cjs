const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  for (const slug of ['physical-engineerings-last-exam', 'physical-engineers-last-exam']) {
    const r = await page.goto('https://www.kaggle.com/competitions/' + slug, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null);
    await page.waitForTimeout(5000);
    const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    console.log(slug, '| HTTP', r && r.status(), '| len', t.length, '|', t.slice(0, 100));
    if (t.length > 1500) {
      const i = t.indexOf('February');
      console.log('  SNIP:', t.slice(0, 400));
      break;
    }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
