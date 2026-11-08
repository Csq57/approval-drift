const { chromium } = require('playwright');
const LIST = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(LIST, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const t = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
  const i = t.indexOf('Approval drift');
  console.log('STATUS SNIP:', t.slice(Math.max(0, i-200), i+200));
  console.log('HAS_SUBMITTED:', /Submitted|SUBMITTED/i.test(t));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
