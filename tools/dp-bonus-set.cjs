const { chromium } = require('playwright');
const URL_ADD = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/additional-info/edit';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.goto(URL_ADD, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const P = 'participants_submission_requirements_submission_field_values_attributes';

  const sel = page.locator(`#${P}_13_value`);
  const opts = await sel.locator('option').allTextContents();
  const pick = opts.find(o => /Best Agents/i.test(o));
  await sel.selectOption({ label: pick });
  console.log('bonus ->', pick);

  const save = page.getByRole('button', { name: /Save\s*&\s*continue/i }).first();
  await save.scrollIntoViewIfNeeded();
  await save.click({ force: true });
  await page.waitForTimeout(8000);
  console.log('after save:', page.url());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
