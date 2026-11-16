const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1500);

  // scroll the compatibility section into view
  await page.getByText('Compatible Atlassian apps', { exact: false }).first().scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(1500);

  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-form.png', Buffer.from(data, 'base64'));
  console.log('screenshot saved');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
