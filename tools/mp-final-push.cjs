const fs = require('fs');
const { chromium } = require('playwright');
const NOTES = 'First Marketplace release. Approval drift stores the approved values as a content property on the page, recomputes the comparison on every render, and names the field that moved. Includes a Rovo agent that reports what a page was approved against.';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: /^Next$/ }).first().click({ force: true });
  await page.waitForTimeout(10000);
  console.log('进入第 4 步, 按钮:', JSON.stringify(await page.$$eval('button', els => els.map(e => (e.textContent||'').trim()).filter(x => /Submit|Next|Back/i.test(x)).slice(0,4))));

  const rs = page.locator('textarea[name=releaseSummary]').first();
  if (await rs.count()) { await rs.click({force:true}); await rs.fill('Initial release: approval tracking for Confluence with a Rovo agent'); await rs.press('Tab'); console.log('release summary ok'); }
  const ed = page.locator('[contenteditable=true]').first();
  if (await ed.count()) { await ed.click({ force: true }); await page.keyboard.type(NOTES); console.log('notes ok'); }
  await page.waitForTimeout(1000);

  const selects = page.locator('input[id^=react-select]');
  const n = await selects.count();
  for (let i = 0; i < n; i++) {
    await selects.nth(i).click({ force: true }); await page.waitForTimeout(1200);
    const o = page.locator('[role=option]').filter({ hasText: /^Commercial - no charge/ }).first();
    if (await o.count()) { await o.click({ force: true }); console.log('license ok'); break; }
    await page.keyboard.press('Escape').catch(()=>{});
  }
  const doc = page.locator('input[name=documentationUrl]').first();
  if (await doc.count()) { await doc.click({force:true}); await doc.fill('https://github.com/Csq57/approval-drift#readme'); await doc.press('Tab'); console.log('doc ok'); }
  const eula = page.locator('input[name=bonTermsSupported][value=true]').first();
  if (await eula.count()) { await eula.check({ force: true }); console.log('eula yes'); }
  await page.waitForTimeout(1500);

  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0,4)));

  const submit = page.getByRole('button', { name: /^Submit$/ }).first();
  console.log('submit 存在:', await submit.count());
  if (await submit.count()) { await submit.click({ force: true }); await page.waitForTimeout(10000); }

  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-agree2.png', Buffer.from(data, 'base64'));
  const dlgText = await page.$$eval('[role=dialog]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').slice(0,200)));
  console.log('弹窗:', JSON.stringify(dlgText.slice(-1)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
