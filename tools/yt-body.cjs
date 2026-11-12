const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('bpcKyQ9qhKE')) || context.pages()[0];
  await page.waitForTimeout(5000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('LEN', t.length);
  console.log('HAS Visibility:', /Visibility/i.test(t));
  console.log('BODY:', t.slice(0, 700));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
