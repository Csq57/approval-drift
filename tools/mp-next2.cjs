const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  const btn = page.getByRole('button', { name: /Next: Make public/i }).first();
  await btn.click({ force: true });
  await page.waitForTimeout(14000);
  console.log('URL:', page.url().slice(0, 120));
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('==== PAGE ====');
  console.log(main.replace(/\n{2,}/g, '\n').slice(0, 1200));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
