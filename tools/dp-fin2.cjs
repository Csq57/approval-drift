const { chromium } = require('playwright');
const FINAL = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/finalization';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1200, height: 1400 });
  await page.goto(FINAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);
  await page.screenshot({ path: 'shots/fin.png' });
  const html = await page.evaluate(() => {
    const el = document.querySelector('form') || document.body;
    return el.innerText.replace(/\s+/g, ' ').slice(0, 800);
  });
  console.log('FORM TEXT:', html);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
