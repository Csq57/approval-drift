const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  const r = await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  await page.waitForTimeout(8000);
  console.log('HTTP:', r && r.status(), '| URL:', page.url().slice(0, 80));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('SIGNED IN?', /Channel content|Dashboard|Create|Analytics/i.test(t));
  console.log('HEAD:', t.slice(0, 200));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
