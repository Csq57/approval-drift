const fs = require('fs');
const { chromium } = require('playwright');
const NOTES = 'First Marketplace release. Approval drift keeps an approval honest: it stores the approved values as a content property on the page, recomputes the comparison on every render, and names the field that moved. Includes a Rovo agent that reports what a page was approved against, who approved it and when.';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.getByRole('button', { name: /^Next$/ }).first().click({ force: true });
  await page.waitForTimeout(10000);

  // release summary
  const rs = page.locator('textarea[name=releaseSummary]').first();
  if (await rs.count()) { await rs.click({force:true}); await rs.fill('Initial release: approval tracking for Confluence with a Rovo agent'); await rs.press('Tab'); }
  await page.waitForTimeout(800);

  // release notes (contenteditable)
  const ed = page.locator('[contenteditable=true]').first();
  if (await ed.count()) { await ed.click({ force: true }); await page.keyboard.type(NOTES); }
  await page.waitForTimeout(1200);

  // license
  const selects = page.locator('input[id^=react-select]');
  const n = await selects.count();
  let licDone = false;
  for (let i = 0; i < n; i++) {
    await selects.nth(i).click({ force: true });
    await page.waitForTimeout(1400);
    const o = page.locator('[role=option]').filter({ hasText: /^Commercial - no charge/ }).first();
    if (await o.count()) { await o.click({ force: true }); licDone = true; break; }
    await page.keyboard.press('Escape').catch(()=>{});
    await page.waitForTimeout(400);
  }
  console.log('license:', licDone);

  const doc = page.locator('input[name=documentationUrl]').first();
  if (await doc.count()) { await doc.click({force:true}); await doc.fill('https://github.com/Csq57/approval-drift#readme'); await doc.press('Tab'); }
  await page.waitForTimeout(1500);

  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-ver-final.png', Buffer.from(data, 'base64'));
  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 5)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
