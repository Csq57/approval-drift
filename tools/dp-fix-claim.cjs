const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('devpost.com')) || context.pages()[0];
  await page.goto('https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/additional-info/edit', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  const t = page.locator('#participants_submission_requirements_submission_field_values_attributes_8_value');
  const cur = await t.inputValue();
  const cleaned = cur.replace(/\n\nMarketplace listing[\s\S]*$/m, '');
  await t.click({ force: true });
  await t.fill(cleaned);
  await page.waitForTimeout(1200);
  console.log('原长度:', cur.length, '-> 现长度:', (await t.inputValue()).length);
  console.log('是否仍含 marketplace 链接:', /marketplace\.atlassian\.com\/apps/.test(await t.inputValue()));
  const save = page.getByRole('button', { name: /Save\s*&\s*continue|Save and continue/i }).first();
  if (await save.count()) { await save.click({ force: true }); await page.waitForTimeout(8000); console.log('已保存'); }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
