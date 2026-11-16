const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  const sel = page.locator('#react-select-3-input').first();
  await sel.click({ force: true });
  await page.waitForTimeout(2500);
  const opts = await page.$$eval('[class*=option], [id*=option], [role=option]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x=>x && x.length<40));
  console.log('上传类型选项:', JSON.stringify([...new Set(opts)].slice(0, 10)));
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('页面提示:', main.replace(/\n{2,}/g,' | ').slice(0, 400));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
