const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();

  const opt = page.locator('[role=option]').filter({ hasText: /^Approval drift$/ }).first();
  console.log('目标选项:', await opt.count());
  await opt.click({ force: true });
  await page.waitForTimeout(5000);

  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('==== 当前表单 ====');
  console.log(main.replace(/\n{2,}/g, '\n').slice(0, 700));

  // fill app name
  const name = page.locator('#appName-uid21', { hasText: '' }).first();
  const nameAlt = page.locator('input[name=appName]').first();
  const target = (await name.count()) ? name : nameAlt;
  await target.fill('Approval drift');
  await page.waitForTimeout(1200);
  console.log('已填 App name:', await target.inputValue().catch(() => '?'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
