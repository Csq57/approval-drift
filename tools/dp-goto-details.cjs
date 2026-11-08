const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726/project-details', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  const ta = await page.$$eval('textarea', els => els.map(e => ({ id: e.id, name: e.name, len: (e.value||'').length })));
  console.log('TEXTAREAS:', JSON.stringify(ta));
  const ids = await page.$$eval('input:not([type=hidden]):not([type=file])', els => els.map(e => e.id).filter(Boolean));
  console.log('INPUT_IDS:', JSON.stringify(ids));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
