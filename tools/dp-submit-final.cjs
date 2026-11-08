const { chromium } = require('playwright');
const FINAL = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/finalization';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1200, height: 1400 });
  await page.goto(FINAL, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(6000);

  const box = page.locator('#participants_manage_finalization_accepts_terms');
  await box.scrollIntoViewIfNeeded();
  await box.check({ force: true });
  console.log('terms checked:', await box.isChecked());

  const btn = page.locator('#submission-finalization-form button[type=submit]');
  await btn.click({ force: true });
  await page.waitForTimeout(12000);
  console.log('URL after submit:', page.url());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
