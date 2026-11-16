const fs = require('fs');
const { chromium } = require('playwright');
const NOTES = 'First Marketplace release. Approval drift keeps an approval honest: it stores the values that were approved as a content property on the Confluence page, recomputes the comparison on every render, and names the field that moved and in which direction. Includes a Rovo agent that reports what a page was approved against, who approved it and when. The verdict is a pure function covered by automated tests.';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);

  const opt = page.locator('[role=option]').filter({ hasText: /^Commercial - no charge/ }).first();
  if (await opt.count()) { await opt.click({ force: true }); console.log('license = Commercial - no charge'); }
  await page.waitForTimeout(1500);

  const eds = page.locator('[contenteditable=true]');
  const n = await eds.count();
  console.log('contenteditable 数:', n);
  if (n) {
    await eds.first().click({ force: true });
    await page.keyboard.type(NOTES);
    await page.waitForTimeout(1200);
    console.log('release notes 长度:', (await eds.first().innerText().catch(()=>'')).length);
  }

  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-ver2.png', Buffer.from(data, 'base64'));
  console.log('saved');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
