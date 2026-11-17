const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('atlassian.com')) || context.pages()[0];
  await page.goto('https://marketplace.atlassian.com/manage/apps/1264724096/details', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(10000);
  const m = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('STATUS PAGE:', m.replace(/\n{2,}/g,' | ').slice(0, 600));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
