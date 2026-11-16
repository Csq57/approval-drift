const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);

  const btn = page.getByRole('button', { name: /^Submit$/ }).first();
  console.log('enabled:', await btn.isEnabled(), '| visible:', await btn.isVisible());
  const box = await btn.boundingBox();
  console.log('位置:', JSON.stringify(box));

  await btn.click();
  console.log('clicked (no force)');
  await page.waitForTimeout(6000);
  console.log('URL after:', page.url().slice(0, 120));
  const dialogs = await page.$$eval('[role=dialog]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,120)));
  console.log('弹窗:', JSON.stringify(dialogs.slice(0, 3)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
