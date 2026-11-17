const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  const cb = page.locator('input[type=checkbox]').last();
  console.log('复选框:', await cb.count(), '| 已选:', await cb.isChecked().catch(()=>'?'));
  await cb.check({ force: true }).catch(async () => { await cb.click({ force: true }); });
  await page.waitForTimeout(1800);
  console.log('勾选后:', await cb.isChecked().catch(()=>'?'));

  const confirm = page.getByRole('button', { name: /^Confirm$/ }).first();
  console.log('Confirm:', await confirm.count(), '| enabled:', await confirm.isEnabled().catch(()=>'?'));
  await confirm.click({ force: true });
  await page.waitForTimeout(14000);

  console.log('URL:', page.url().slice(0, 130));
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('页面:', body.slice(0, 400));
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-done.png', Buffer.from(data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
