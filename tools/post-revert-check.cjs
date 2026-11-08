const { chromium } = require('playwright');
const URL = 'https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/Approval+drift+demo';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('one-atlas-csnw')) || context.pages()[0];
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(11000);
  const f = page.frameLocator('iframe[title*="Embedded app content"]');
  const amount = f.locator('#f-amount');
  console.log('amount:', await amount.inputValue().catch(() => 'n/a'));
  console.log('status:', (await f.locator('#status h2').textContent().catch(() => 'n/a') || '').trim());
  const probe = await page.evaluate(() => document.body.dataset.actionProbe || 'absent');
  console.log('probe残留:', probe.slice(0, 40));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
