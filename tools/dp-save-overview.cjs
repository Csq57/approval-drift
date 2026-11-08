const { chromium } = require('playwright');
const BASE = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });

  await page.goto(`${BASE}/project-overview`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);
  await page.locator('#participants_manage_project_overview_title').fill('Approval drift');
  await page.locator('#participants_manage_project_overview_tagline').fill(
    'A Confluence macro that tells you when an approval has quietly stopped matching the thing it approved — and shows exactly which field moved.'
  );
  const save = page.getByRole('button', { name: /Save|Continue|Next/i }).first();
  await save.scrollIntoViewIfNeeded();
  await save.click({ force: true });
  await page.waitForTimeout(6000);
  console.log('after overview save:', page.url());

  await page.goto(`${BASE}/project_details/edit`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const desc = await page.locator('#software_description').inputValue().catch(() => '');
  const video = await page.locator('#software_video_url').inputValue().catch(() => '');
  const tags = await page.locator('#software_tag_list').inputValue().catch(() => '');
  const url0 = await page.locator('#software_urls_attributes_0_url').inputValue().catch(() => '');
  console.log('desc:', desc.length, 'video:', video, 'tags:', JSON.stringify(tags), 'url0:', url0 ? url0.slice(0, 40) + '...' : '');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
