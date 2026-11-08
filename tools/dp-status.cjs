const { chromium } = require('playwright');
const BASE = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });

  await page.goto(`${BASE}/project_details/edit`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const d = await page.locator('#software_description').inputValue().catch(()=> '');
  const v = await page.locator('#software_video_url').inputValue().catch(()=> '');
  const u = await page.locator('#software_urls_attributes_0_url').inputValue().catch(()=> '');
  const chips = await page.$$eval('.tag, .select2-search-choice', els => els.map(e => e.textContent.trim()));
  console.log('DETAILS desc:', d.length, 'video:', JSON.stringify(v), 'url:', u.slice(0,40), 'chips:', JSON.stringify(chips));

  await page.goto(`${BASE}/finalization`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const body = (await page.textContent('body')) || '';
  console.log('FINAL TEXT:', body.replace(/\s+/g,' ').slice(0, 700));
  const btns = await page.$$eval('button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,10));
  console.log('BTNS:', JSON.stringify(btns));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
