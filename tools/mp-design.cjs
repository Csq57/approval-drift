const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  const next = page.getByRole('button', { name: /^Next$/ }).first();
  await next.click({ force: true });
  await page.waitForTimeout(9000);
  console.log('URL:', page.url().slice(0, 120));
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-design.png', Buffer.from(data, 'base64'));
  const m = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('TEXT:', m.replace(/\n{2,}/g, ' | ').slice(0, 600));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
