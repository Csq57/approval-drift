const { chromium } = require('playwright');
const BASE = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1800 });

  await page.goto(`${BASE}/project-overview`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const t = await page.locator('#participants_manage_project_overview_title').inputValue().catch(()=> '');
  const g = await page.locator('#participants_manage_project_overview_tagline').inputValue().catch(()=> '');
  console.log('title:', JSON.stringify(t), 'tagline len:', g.length);
  const btns = await page.$$eval('button, input[type=submit]', els => els.map(e => (e.textContent||e.value||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,10));
  console.log('BTNS:', JSON.stringify(btns));
  const save = page.getByRole('button', { name: /Save|Continue|Next|Update/i }).first();
  await save.scrollIntoViewIfNeeded();
  await save.click({ force: true });
  await page.waitForTimeout(7000);
  console.log('after save:', page.url());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
