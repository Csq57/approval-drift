const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://codegeist2026.devpost.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('MENTIONS Marketplace:', /marketplace/i.test(t));
  const idx = [];
  let i = -1;
  while ((i = t.toLowerCase().indexOf('marketplace', i + 1)) > -1 && idx.length < 6) idx.push(i);
  idx.forEach(k => console.log('  ...', t.slice(Math.max(0, k - 220), k + 220)));
  console.log('--- PRIZES ---');
  const p = t.indexOf('Prizes');
  console.log(t.slice(p > -1 ? p : 0, (p > -1 ? p : 0) + 1400));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
