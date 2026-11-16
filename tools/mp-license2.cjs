const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);

  // click the select control (not the inner input)
  const ctrl = page.locator('#react-select-8-input').first();
  await ctrl.scrollIntoViewIfNeeded().catch(()=>{});
  await ctrl.click({ force: true });
  await page.waitForTimeout(2500);
  const opts = page.locator('[role=option]');
  const count = await opts.count();
  console.log('选项数:', count);
  for (let i = 0; i < count; i++) {
    const t = (await opts.nth(i).textContent()) || '';
    if (/^Commercial - no charge/.test(t.trim())) {
      await opts.nth(i).click({ force: true });
      console.log('已点:', t.trim().slice(0, 30));
      break;
    }
  }
  await page.waitForTimeout(2000);
  const shown = await page.locator('#react-select-8-input').inputValue().catch(() => '?');
  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('当前值:', shown, '| 错误:', JSON.stringify(errs.slice(0, 3)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
