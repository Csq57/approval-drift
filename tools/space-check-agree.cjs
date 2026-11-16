const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developer-space')) || context.pages()[0];
  const cb = page.locator('input[type=checkbox]').first();
  const accept = page.getByRole('button', { name: /Accept & publish/i }).first();
  console.log('accept 按钮存在:', await accept.count(), '| 之前是否可点:', await accept.isEnabled().catch(() => '?'));
  if (await cb.count() && !(await cb.isChecked())) {
    await cb.check({ force: true }).catch(async () => { await cb.click({ force: true }); });
    await page.waitForTimeout(1500);
  }
  console.log('勾选后 accept 可点:', await accept.isEnabled().catch(() => '?'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
