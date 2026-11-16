const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('step-up')) || pages.find(p => p.url().includes('marketplace.atlassian.com'));
  if (!page) page = pages[0];

  await page.setViewportSize({ width: 1400, height: 950 });
  await page.goto('https://id.atlassian.com/step-up/start?continue=https%3A%2F%2Fmarketplace.atlassian.com%2Fmanage%2Fvendors%2F827077427', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  await page.bringToFront();

  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('URL:', page.url().slice(0, 100));
  console.log('PAGE:', main.replace(/\n{2,}/g, ' | ').slice(0, 260));

  const otp = page.locator('#otp-code-input');
  if (await otp.count()) { await otp.click({ force: true }).catch(() => {}); console.log('已聚焦输入框'); }

  // make sure the OS window is on top too
  await page.evaluate(() => window.focus()).catch(() => {});
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
