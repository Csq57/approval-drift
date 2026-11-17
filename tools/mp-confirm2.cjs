const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  const inDlg = await page.evaluate(() => {
    const dlg = [...document.querySelectorAll('[role=dialog]')].find(d => /Publisher Agreement/i.test(d.textContent || ''));
    if (!dlg) return 'no dialog';
    const cb = dlg.querySelector('input[type=checkbox]');
    if (!cb) return 'no checkbox';
    cb.click();
    return 'clicked:' + cb.checked;
  });
  console.log('协议勾选:', inDlg);
  await page.waitForTimeout(2000);

  const st = await page.evaluate(() => {
    const dlg = [...document.querySelectorAll('[role=dialog]')].find(d => /Publisher Agreement/i.test(d.textContent || ''));
    const cb = dlg && dlg.querySelector('input[type=checkbox]');
    const btns = dlg ? [...dlg.querySelectorAll('button')].map(b => ({ t: b.textContent.trim(), dis: b.disabled })) : [];
    return { checked: cb ? cb.checked : null, btns };
  });
  console.log('状态:', JSON.stringify(st));

  const confirm = page.getByRole('button', { name: /^Confirm$/ }).first();
  if (await confirm.count() && await confirm.isEnabled().catch(()=>false)) {
    await confirm.click({ force: true });
    console.log('已点 Confirm');
    await page.waitForTimeout(15000);
  }
  console.log('URL:', page.url().slice(0, 130));
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('页面:', body.slice(0, 300));
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-done.png', Buffer.from(data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
