const fs = require('fs');
const { chromium } = require('playwright');
const URL = 'https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/Approval+drift+demo';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('one-atlas-csnw')) || context.pages()[0];
  await page.setViewportSize({ width: 1440, height: 900 });
  const client = await context.newCDPSession(page);

  const shot = async (name) => {
    const { data } = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(`shots/${name}.png`, Buffer.from(data, 'base64'));
    console.log('saved', name);
  };

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(11000);
  const f = page.frameLocator('iframe[title*="Embedded app content"]');
  const amount = f.locator('#f-amount');
  await amount.waitFor({ state: 'visible', timeout: 60000 });

  await amount.fill('1850');
  await page.waitForTimeout(2200);
  await shot('gallery-green');
  console.log('green:', (await f.locator('#status h2').textContent() || '').trim());

  await amount.fill('2100');
  await page.waitForTimeout(1800);
  await shot('gallery-stale');
  console.log('stale:', (await f.locator('#status h2').textContent() || '').trim());

  await amount.fill('1850');
  await page.waitForTimeout(2000);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
