const { chromium } = require('playwright');
const ADD = '\n\nMarketplace listing (bonus category: Best Marketplace published app): https://marketplace.atlassian.com/apps/1264724096\nThe app is published on the Atlassian Marketplace under the vendor "Approval Drift". Everything is identical to the installation link above; the listing is the public evidence that the app went through Marketplace review.';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('devpost.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1200);

  const t = page.locator('#participants_submission_requirements_submission_field_values_attributes_8_value');
  const cur = await t.inputValue();
  if (/marketplace\.atlassian\.com\/apps\/1264724096/.test(cur)) { console.log('已存在，跳过'); }
  else { await t.click({ force: true }); await t.fill(cur + ADD); await page.waitForTimeout(1200); console.log('已追加, 新长度:', (await t.inputValue()).length); }

  const save = page.getByRole('button', { name: /Save\s*&\s*continue|Save and continue/i }).first();
  console.log('保存按钮:', await save.count());
  if (await save.count()) { await save.click({ force: true }); await page.waitForTimeout(9000); }
  console.log('URL:', page.url().slice(0, 110));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
