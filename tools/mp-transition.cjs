const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(10000);
  console.log('URL:', page.url().slice(0, 130));
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('==== PAGE ====');
  console.log(main.replace(/\n{2,}/g, '\n').slice(0, 1500));
  const btns = await page.$$eval('button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x=>x && x.length<40));
  console.log('BUTTONS:', JSON.stringify([...new Set(btns)].slice(0, 15)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
