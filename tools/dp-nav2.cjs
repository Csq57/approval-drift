const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726/project-overview', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);
  const ta = await page.$$eval('textarea', els => els.map(e => ({ id: e.id, len: (e.value||'').length })));
  console.log('OVERVIEW textareas:', JSON.stringify(ta));
  const title = await page.locator('#participants_manage_project_overview_title').inputValue().catch(()=> 'n/a');
  const tag = await page.locator('#participants_manage_project_overview_tagline').inputValue().catch(()=> 'n/a');
  console.log('title:', JSON.stringify(title), 'tagline:', JSON.stringify(String(tag).slice(0,60)));

  // click through to details
  await page.getByText('Project details', { exact: true }).first().click({ force: true }).catch(()=>{});
  await page.waitForTimeout(5000);
  console.log('after click URL:', page.url());
  const ta2 = await page.$$eval('textarea', els => els.map(e => ({ id: e.id, len: (e.value||'').length })));
  console.log('DETAILS textareas:', JSON.stringify(ta2));
  const ids = await page.$$eval('input:not([type=hidden]):not([type=file])', els => els.map(e => e.id).filter(Boolean));
  console.log('DETAILS inputs:', JSON.stringify(ids));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
