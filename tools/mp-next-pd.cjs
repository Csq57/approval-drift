const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.getByRole('button', { name: /^Next$/ }).first().click({ force: true });
  await page.waitForTimeout(9000);
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-pd2.png', Buffer.from(data, 'base64'));
  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 4)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
