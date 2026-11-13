const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1500, height: 980 });
  await page.goto('https://studio.youtube.com/video/bpcKyQ9qhKE/edit', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(14000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('STATE:', t.slice(0, 260));
  console.log('URL:', page.url().slice(0, 70));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
