const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(6000);
  const m = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('VERSIONS:', m.replace(/\n{2,}/g,' | ').slice(0, 700));
  const rows = await page.$$eval('tr', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,6));
  rows.forEach((r,i) => console.log(' row', i, r.slice(0,150)));
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-status.png', Buffer.from(data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
