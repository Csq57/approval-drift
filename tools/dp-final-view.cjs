const { chromium } = require('playwright');
const FINAL = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/finalization';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1800 });
  await page.goto(FINAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  const sec = await page.locator('form, .finalization, main, #content').first().textContent().catch(async()=> await page.textContent('body'));
  console.log('TEXT:', (sec||'').replace(/\s+/g,' ').slice(0, 1000));
  const inputs = await page.$$eval('input,textarea,select', els => els.map(e => ({ tag: e.tagName, type: e.type, id: e.id, checked: e.checked, label: (e.labels&&e.labels[0]?e.labels[0].textContent:'').replace(/\s+/g,' ').trim().slice(0,60) })).filter(f => f.type !== 'hidden').slice(0, 15));
  console.log('INPUTS:', JSON.stringify(inputs, null, 1).slice(0, 1200));
  await page.screenshot({ path: 'shots/dp-finalization.png', fullPage: true }).catch(()=>{});
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
