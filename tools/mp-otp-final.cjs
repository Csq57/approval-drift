const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('step-up')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  await page.locator('#otp-code-input').fill('33656128');
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: /^验证$/ }).first().click({ force: true });
  await page.waitForTimeout(12000);

  console.log('URL:', page.url().slice(0, 110));
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', main.replace(/\n{2,}/g, ' | ').slice(0, 500));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
