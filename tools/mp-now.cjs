const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com') || p.url().includes('atlassian.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1400, height: 950 });
  await page.goto('https://marketplace.atlassian.com/manage/apps/1264724096/versions/2000000/transition', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(10000);
  await page.bringToFront();
  console.log('URL:', page.url().slice(0, 120));
  const btns = await page.$$eval('button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x=>x && x.length<26));
  console.log('BUTTONS:', JSON.stringify([...new Set(btns)].slice(0, 12)));
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-now.png', Buffer.from(data, 'base64'));
  console.log('saved');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
