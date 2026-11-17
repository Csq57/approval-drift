const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);

  const save = page.getByRole('button', { name: /Save and preview/i }).first();
  if (await save.count()) { await save.click({ force: true }); console.log('已点 Save and preview'); await page.waitForTimeout(9000); }
  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('保存后错误:', JSON.stringify(errs.slice(0, 4)));

  const resub = page.locator('a', { hasText: /^Resubmit$/ }).first();
  console.log('Resubmit 链:', await resub.count());
  if (await resub.count()) { await resub.click({ force: true }); console.log('已点 Resubmit'); await page.waitForTimeout(12000); }

  const m = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', m.replace(/\n{2,}/g,' | ').slice(0, 450));
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-resubmit.png', Buffer.from(data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
