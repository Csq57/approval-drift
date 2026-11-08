const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const INSTALL = fs.readFileSync(path.join(__dirname, '..', 'install-link.txt'), 'utf8').trim();
const BASE = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });

  await page.goto(`${BASE}/project-overview/edit`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4000);
  await page.locator('#participants_manage_project_overview_title').fill('Approval drift');
  await page.locator('#participants_manage_project_overview_tagline').fill(
    'A Confluence macro that tells you when an approval has quietly stopped matching the thing it approved — and shows exactly which field moved.'
  );
  const save1 = page.getByRole('button', { name: /Save\s*&\s*continue/i }).first();
  await save1.scrollIntoViewIfNeeded();
  await save1.click({ force: true });
  await page.waitForTimeout(6000);
  console.log('overview saved ->', page.url());

  await page.goto(`${BASE}/project_details/edit`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4000);
  const desc = await page.locator('#software_description').inputValue().catch(() => '');
  console.log('description length on reload:', desc.length);
  const video = await page.locator('#software_video_url').inputValue().catch(() => '');
  console.log('video value:', video);
  const tag = await page.locator('#software_tag_list').inputValue().catch(() => '');
  console.log('tags:', tag);
  await page.screenshot({ path: 'shots/dp-details-reload.png', fullPage: false });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
