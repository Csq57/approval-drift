const { chromium } = require('playwright');
const URL = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/additional-info/edit';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('devpost.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1200, height: 1400 });
  const r = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  await page.waitForTimeout(8000);
  console.log('HTTP', r && r.status(), '| URL:', page.url().slice(0, 90));
  const fields = await page.$$eval('input, textarea, select', els => els.map(e => ({ id: e.id||'', name: e.name||'', type: e.type, val: (e.value||'').slice(0,60) })).filter(f => f.id || f.name));
  console.log('FIELDS:', JSON.stringify(fields).slice(0, 900));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
