const { chromium } = require('playwright');
const FINAL = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/finalization';
const LIST = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1200, height: 1400 });

  await page.goto(FINAL, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(6000);
  const box = page.locator('#participants_manage_finalization_accepts_terms');
  if (await box.count()) {
    if (!(await box.isChecked())) await box.check({ force: true });
    await page.locator('#submission-finalization-form button[type=submit]').click({ force: true });
    await page.waitForTimeout(10000);
  }
  await page.goto(LIST, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const t = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
  console.log('STATUS:', (t.match(/(Submitted|Draft)\s*\d\/5 steps done/) || ['?'])[0]);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
