const path = require('path');
const { chromium } = require('playwright');
const F = path.join(__dirname, '..', 'shots', 'mp-shot-stale.png');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  const link = page.getByText('upload from computer', { exact: false }).first();
  console.log('剩余链接:', await page.getByText('upload from computer', { exact: false }).count());
  const cp = page.waitForEvent('filechooser', { timeout: 15000 }).catch(() => null);
  await link.click({ force: true });
  const chooser = await cp;
  if (chooser) { await chooser.setFiles(F); console.log('第二张已上传'); await page.waitForTimeout(7000); }

  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 4)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
