const { chromium } = require('playwright');
const URL = 'https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/Approval+drift+demo';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('one-atlas-csnw')) || context.pages()[0];
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(11000);
  const f = page.frameLocator('iframe[title*="Embedded app content"]');
  const amount = f.locator('#f-amount');
  await amount.waitFor({ state: 'visible', timeout: 60000 });

  await amount.fill('1850');
  await page.waitForTimeout(2200);
  await page.screenshot({ path: 'shots/gallery-green.png' });
  console.log('green:', (await f.locator('#status h2').textContent() || '').trim());

  await amount.fill('2100');
  await page.waitForTimeout(1800);
  await page.screenshot({ path: 'shots/gallery-stale.png' });
  console.log('stale:', (await f.locator('#status h2').textContent() || '').trim());

  // leave the demo page coherent again
  await amount.fill('1850');
  await page.waitForTimeout(2200);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
