const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1000 });
  const r = await page.goto('https://www.airtasker.com/au/', { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(e => null);
  await page.waitForTimeout(6000);
  console.log('HTTP:', r && r.status(), '| URL:', page.url().slice(0, 80));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('LOGIN?', /log ?in|sign ?in|登录/i.test(t));
  console.log('ACCOUNT?', /my tasks|dashboard|profile|我的/i.test(t));
  console.log('HEAD:', t.slice(0, 300));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
