const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('step-up')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1500);

  const resend = page.getByRole('button', { name: /重新发送/ }).first();
  if (await resend.count()) { await resend.click({ force: true }); console.log('已点重新发送'); }
  await page.waitForTimeout(7000);

  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', main.replace(/\n{2,}/g, ' | ').slice(0, 300));
  const toast = await page.locator('[role=alert]').first().innerText().catch(() => '');
  console.log('提示:', (toast || '(无提示)').replace(/\s+/g, ' ').slice(0, 120));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
