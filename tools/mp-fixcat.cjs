const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(800);

  // remove the stray third category chip
  const chips = page.locator('[class*=multi-value]');
  const n = await chips.count();
  console.log('分类 chip 数:', n);
  if (n > 2) {
    const del = chips.nth(n - 1).locator('[class*=remove], svg, [role=button]').first();
    if (await del.count()) { await del.click({ force: true }); }
    else { await chips.nth(n - 1).click({ force: true }); await page.keyboard.press('Backspace'); }
    await page.waitForTimeout(1500);
  }
  const labels = await page.$$eval('[class*=multi-value]', els => els.map(e => (e.textContent||'').trim()));
  console.log('现在分类:', JSON.stringify(labels));

  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0,3)));

  const next = page.getByRole('button', { name: /^Next$/ }).first();
  await next.click({ force: true });
  await page.waitForTimeout(9000);
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-pd3.png', Buffer.from(data, 'base64'));
  console.log('saved');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
