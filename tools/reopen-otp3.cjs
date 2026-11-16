const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developer.atlassian.com')) || context.pages()[0];
  await page.goto('https://id.atlassian.com/step-up/start?continue=https%3A%2F%2Fmarketplace.atlassian.com%2Fmanage%2Fvendors%2F827077427%2Fdetails', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  await page.bringToFront();
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('URL:', page.url().slice(0, 95));
  console.log('PAGE:', main.replace(/\n{2,}/g, ' | ').slice(0, 240));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
