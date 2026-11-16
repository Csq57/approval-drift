const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1500);

  await page.locator('#otp-code-input').fill('19830253');
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /^验证$/ }).first().click({ force: true });
  await page.waitForTimeout(10000);

  console.log('URL:', page.url().slice(0, 100));
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', main.replace(/\n{2,}/g, '\n').slice(0, 700));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
