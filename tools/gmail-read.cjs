const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('mail.google.com')) || context.pages()[0];
  await page.bringToFront();
  const row = page.locator('tr.zA').first();
  await row.click({ force: true });
  await page.waitForTimeout(7000);
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = body.indexOf('Thanks for');
  console.log('邮件正文:', body.slice(Math.max(0, i - 60), i + 900));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
