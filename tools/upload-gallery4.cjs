const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', 'shots');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => !/one-atlas-csnw|kaggle|chatgpt|mail\.google|try\/cloud/.test(p.url())) || context.pages()[0];
  await page.setViewportSize({ width: 1200, height: 1600 });

  for (const f of ['gallery-1-valid.png', 'gallery-2-stale.png']) {
    await page.goto('https://devpost.com/software/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    await page.locator('#imageFileInput').first().setInputFiles(path.join(ROOT, f));
    await page.waitForTimeout(2500);
    const submitted = await page.evaluate(() => {
      const input = document.querySelector('#imageFileInput');
      const form = input && input.closest('form');
      if (!form) return 'no-form';
      form.submit();
      return 'submitted:' + (form.getAttribute('action') || '');
    });
    console.log(f, '->', submitted);
    await page.waitForTimeout(14000);
  }

  await page.goto('https://devpost.com/software/approval-drift', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  const imgs = await page.$$eval('img', els => els.map(e => e.src).filter(s => /software_photos/.test(s)));
  console.log('GALLERY NOW:', imgs.length);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
