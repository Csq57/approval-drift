const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => !/one-atlas-csnw|kaggle|chatgpt|mail\.google|try\/cloud/.test(p.url())) || context.pages()[0];
  await page.goto('https://devpost.com/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(async () => {
    await page.goto('https://devpost.com/software/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  });
  await page.waitForTimeout(6000);
  const info = await page.$$eval('img', els => els.map(e => ({ alt: e.alt, src: (e.src||'').slice(-30) })).filter(x => /software_photos/.test(x.src) || x.alt));
  console.log(JSON.stringify(info, null, 1).slice(0, 800));
  const captionFields = await page.locator('input[name*="caption" i], textarea[name*="caption" i]').count();
  console.log('caption fields:', captionFields);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
