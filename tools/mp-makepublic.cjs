const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);

  const btn = page.getByRole('button', { name: /^Make public$/ }).first();
  console.log('Make public:', await btn.count(), '| enabled:', await btn.isEnabled().catch(()=>'?'));
  await btn.click({ force: true });
  await page.waitForTimeout(10000);

  console.log('URL:', page.url().slice(0, 120));
  const dialogs = await page.$$eval('[role=dialog]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim().slice(0, 200)));
  console.log('弹窗:', JSON.stringify(dialogs.slice(0, 3)));
  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 5)));
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-makepublic.png', Buffer.from(data, 'base64'));
  console.log('saved');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
