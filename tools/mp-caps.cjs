const fs = require('fs');
const { chromium } = require('playwright');
const CAPS = [
  'Approved and matching: the panel stays green while the page still says exactly what was approved.',
  'Stale: raising the amount from 1,600 to 1,850 turns the panel red and names the field and the direction.',
];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();

  const caps = page.locator('input[type=text][id*=caption], textarea[id*=caption], input[name*=caption]');
  const n = await caps.count();
  for (let i = 0; i < n && i < CAPS.length; i++) {
    await caps.nth(i).fill(CAPS[i]);
    await caps.nth(i).press('Tab');
    await page.waitForTimeout(1200);
  }
  console.log('captions 填入:', n);

  const next = page.getByRole('button', { name: /^Next$/ }).first();
  await next.click({ force: true });
  await page.waitForTimeout(10000);
  console.log('URL:', page.url().slice(0, 115));
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-version2.png', Buffer.from(data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
