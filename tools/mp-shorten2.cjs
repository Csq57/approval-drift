const { chromium } = require('playwright');
const SUMMARY = 'An approval is a claim about specific facts. Approval drift stores the approved values on the page and recomputes the comparison on every render, naming the field that moved. It is a pure function with tests; no model sits in the loop.';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  console.log('长度:', SUMMARY.length);

  const s = page.locator('#summary-uid263').first();
  await s.click({ force: true });
  await s.fill(SUMMARY);
  await page.waitForTimeout(1500);
  const err = await page.$$eval('[class*=error], [role=alert]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => /must be|required/i.test(x)));
  console.log('错误:', JSON.stringify(err.slice(0, 3)));

  const next = page.getByRole('button', { name: /^Next$/ }).first();
  await next.click({ force: true });
  await page.waitForTimeout(10000);
  console.log('URL:', page.url().slice(0, 110));
  const m = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('TEXT:', m.replace(/\n{2,}/g, ' | ').slice(0, 400));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
