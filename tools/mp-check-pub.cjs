const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);

  const cb = page.locator('[role=dialog] input[type=checkbox]').first();
  console.log('勾选框:', await cb.count());
  if (await cb.count()) { await cb.check({ force: true }).catch(async () => { await cb.click({ force: true }); }); }
  await page.waitForTimeout(1500);
  const confirm = page.getByRole('button', { name: /^Confirm$/ }).first();
  console.log('Confirm enabled:', await confirm.isEnabled().catch(()=>'?'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
