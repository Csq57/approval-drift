const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => !/one-atlas-csnw|kaggle|chatgpt|mail\.google|try\/cloud/.test(p.url())) || context.pages()[0];
  await page.goto('https://devpost.com/software/approval-drift', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);
  const imgs = await page.$$eval('img', els => els.map(e => e.src).filter(s => /software_photos/.test(s)));
  console.log('GALLERY IMAGES:', imgs.length);
  imgs.slice(0, 5).forEach((s, i) => console.log(' ', i + 1, s.slice(-40)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
