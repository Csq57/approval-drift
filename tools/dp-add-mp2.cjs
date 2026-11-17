const { chromium } = require('playwright');
const ADD = '\n\nMarketplace submission (bonus category: Best Marketplace published app)\nApproval drift was submitted to the Atlassian Marketplace for review on 17 November 2026, under the vendor "Approval Drift" (Marketplace app ID 1264724096). Atlassian reviews every app before it becomes publicly listed.\nVendor profile: https://marketplace.atlassian.com/vendors/827077427\nThe listing itself resolves at https://marketplace.atlassian.com/apps/1264724096 once that review completes; while it is in review the public URL returns not-found, which is expected.';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('devpost.com')) || context.pages()[0];
  await page.goto('https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/additional-info/edit', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  const t = page.locator('#participants_submission_requirements_submission_field_values_attributes_8_value');
  const cur = await t.inputValue();
  const base = cur.replace(/\n\nMarketplace submission[\s\S]*$/m, '');
  await t.click({ force: true });
  await t.fill(base + ADD);
  await page.waitForTimeout(1200);
  console.log('新长度:', (await t.inputValue()).length);
  const save = page.getByRole('button', { name: /Save\s*&\s*continue|Save and continue/i }).first();
  if (await save.count()) { await save.click({ force: true }); await page.waitForTimeout(8000); console.log('saved'); }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
