const path = require('path');
const { chromium } = require('playwright');
const A = path.join(__dirname, '..', 'shots', 'mp-shot-valid.png');
const B = path.join(__dirname, '..', 'shots', 'mp-shot-stale.png');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1200);

  const blocks = page.locator('text=Additional images').first();
  await blocks.scrollIntoViewIfNeeded().catch(() => {});

  const files = page.locator('input[type=file]');
  const n = await files.count();
  console.log('file inputs:', n);
  // the last two are usually the image dropzones we just added
  await files.nth(n - 2).setInputFiles(A);
  await page.waitForTimeout(5000);
  await files.nth(n - 1).setInputFiles(B);
  await page.waitForTimeout(6000);

  // captions
  const caps = page.locator('textarea, input[type=text]').filter({ hasNot: page.locator('[id*=appName]') });
  const capInputs = await page.$$eval('input[type=text][id*=caption], textarea[id*=caption], input[name*=caption]', els => els.length);
  console.log('caption 字段:', capInputs);

  const imgs = await page.$$eval('img', els => els.filter(e => e.offsetWidth > 100).length);
  console.log('预览图数量:', imgs);
  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 3)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
