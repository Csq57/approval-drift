const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.goto('https://marketplace.atlassian.com/manage/apps/create', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(14000);
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('==== FORM TEXT ====');
  console.log(main.replace(/\n{2,}/g, '\n').slice(0, 1400));
  console.log('==== ERROR? ====', /Couldn.t load compatible products/i.test(main));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
