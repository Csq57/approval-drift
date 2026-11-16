const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 60000 });
  const context = browser.contexts()[0];
  const page = await context.newPage();
  await page.setViewportSize({ width: 1400, height: 950 });
  await page.goto('https://id.atlassian.com/step-up/start?continue=https%3A%2F%2Fmarketplace.atlassian.com%2Fmanage%2Fvendors%2F827077427%2Fdetails', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  await page.bringToFront();
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('URL:', page.url().slice(0, 100));
  console.log('PAGE:', main.replace(/\n{2,}/g, ' | ').slice(0, 260));
  const otp = page.locator('#otp-code-input');
  console.log('输入框:', await otp.count());
  if (await otp.count()) { await otp.click({ force: true }).catch(() => {}); console.log('已聚焦'); }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
