const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();

  // find the control wrapping react-select-3-input
  const ctrl = page.locator('#react-select-3-input').first();
  await ctrl.scrollIntoViewIfNeeded().catch(()=>{});
  await ctrl.click({ force: true });
  await page.waitForTimeout(2000);

  const boxes = await page.$$eval('[role=listbox], [id*=listbox], ul[class*=menu]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean));
  console.log('LISTBOX:', JSON.stringify(boxes).slice(0, 400));

  const opts = await page.$$eval('[role=option]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()));
  console.log('OPTIONS:', JSON.stringify([...new Set(opts)].slice(0, 10)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
