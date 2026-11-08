const { chromium } = require('playwright');
const FINAL = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/finalization';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.goto(FINAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const btn = page.getByRole('button', { name: /Submit project/i }).first();
  console.log('submit button count:', await page.getByRole('button', { name: /Submit project/i }).count());
  await btn.scrollIntoViewIfNeeded();
  await btn.click({ force: true });
  await page.waitForTimeout(10000);
  console.log('after submit URL:', page.url());
  const body = (await page.textContent('body')) || '';
  console.log('MSG:', body.replace(/\s+/g,' ').match(/(submitted|Submission|SUBMITTED|success)[^.]{0,80}/i)?.[0] || 'none');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
