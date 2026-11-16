const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);
  const resend = page.getByRole('button', { name: /重新发送/ }).first();
  console.log('重发按钮:', await resend.count());
  await resend.click({ force: true });
  await page.waitForTimeout(6000);
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', main.replace(/\n{2,}/g, ' | ').slice(0, 300));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
