const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);
  const v = page.getByText('2.0.0', { exact: true }).first();
  console.log('2.0.0 可点:', await v.count());
  await v.click({ force: true }).catch(() => {});
  await page.waitForTimeout(7000);
  console.log('URL:', page.url().slice(0, 120));
  const m = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', m.replace(/\n{2,}/g, ' | ').slice(0, 700));
  const btns = await page.$$eval('button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 40));
  console.log('BUTTONS:', JSON.stringify([...new Set(btns)].slice(0, 16)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
