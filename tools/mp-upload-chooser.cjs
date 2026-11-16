const path = require('path');
const { chromium } = require('playwright');
const FILES = [
  path.join(__dirname, '..', 'shots', 'mp-shot-valid.png'),
  path.join(__dirname, '..', 'shots', 'mp-shot-stale.png'),
];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  for (let i = 0; i < 2; i++) {
    const links = page.getByText('upload from computer', { exact: false });
    const cnt = await links.count();
    console.log(`Image ${i + 1}: "upload from computer" 出现 ${cnt} 次`);
    if (i >= cnt) { console.log('超出可用块'); break; }
    const chooserPromise = page.waitForEvent('filechooser', { timeout: 15000 }).catch(() => null);
    await links.nth(i).click({ force: true }).catch(e => console.log('click err', e.message.slice(0, 40)));
    const chooser = await chooserPromise;
    if (chooser) { await chooser.setFiles(FILES[i]); console.log('  file set'); await page.waitForTimeout(7000); }
    else console.log('  没有触发文件选择器');
  }

  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 4)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
