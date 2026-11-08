const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  console.log('URL:', page.url());
  console.log('TITLE:', await page.title());
  const buttons = await page.$$eval('a,button', els => els
    .map(e => ({ t: (e.textContent || '').replace(/\s+/g, ' ').trim(), h: e.href || '' }))
    .filter(x => x.t && x.t.length < 40)
    .slice(0, 25));
  console.log(JSON.stringify(buttons, null, 0).slice(0, 1200));
  await page.screenshot({ path: 'shots/devpost-manage.png', fullPage: false });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
