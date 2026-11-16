const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(1500);
  const main = await page.locator('main, [role=main]').first().innerText().catch(async () => await page.locator('form').first().innerText().catch(() => ''));
  console.log('FORM TEXT:', (main || '(none)').replace(/\n{2,}/g, '\n').slice(0, 900));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
