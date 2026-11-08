const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => !/one-atlas-csnw|kaggle|chatgpt|mail\.google|atlassian\.com\/try/.test(p.url())) || context.pages()[0];
  await page.setViewportSize({ width: 1400, height: 1000 });

  await page.goto('https://admin.atlassian.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('ADMIN:', t.slice(0, 400));

  // try the deactivated site directly to see the exact state it reports
  const r = await page.goto('https://chensongquan0814.atlassian.net/wiki/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => null);
  await page.waitForTimeout(4000);
  console.log('OLD SITE HTTP:', r && r.status(), '| URL:', page.url().slice(0, 70));
  const t2 = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('OLD SITE TEXT:', t2.slice(0, 300));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
