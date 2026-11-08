const { chromium } = require('playwright');
const LIST = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1800 });
  await page.goto(LIST, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const body = (await page.textContent('body')) || '';
  const t = body.replace(/\s+/g,' ');
  const i = t.indexOf('Approval drift');
  console.log('SNIP:', t.slice(Math.max(0, i - 250), i + 350));
  await page.screenshot({ path: 'shots/dp-list.png', fullPage: false }).catch(()=>{});
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
