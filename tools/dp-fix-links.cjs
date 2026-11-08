const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const INSTALL = fs.readFileSync(path.join(__dirname, '..', 'install-link.txt'), 'utf8').trim();
const URL_DETAILS = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/project_details/edit';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });

  await page.goto(URL_DETAILS, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4500);

  await page.locator('#software_video_url').fill('https://youtu.be/UmZMlweUPuQ');
  await page.locator('#software_urls_attributes_0_url').fill(INSTALL);
  console.log('video:', await page.locator('#software_video_url').inputValue());
  console.log('url len:', (await page.locator('#software_urls_attributes_0_url').inputValue()).length);

  const save = page.getByRole('button', { name: /Save\s*&\s*continue/i }).first();
  await save.scrollIntoViewIfNeeded();
  await save.click({ force: true });
  await page.waitForTimeout(8000);
  console.log('after save:', page.url());

  await page.goto(URL_DETAILS, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  console.log('VERIFY video:', JSON.stringify(await page.locator('#software_video_url').inputValue().catch(()=> 'x')));
  console.log('VERIFY url len:', (await page.locator('#software_urls_attributes_0_url').inputValue().catch(()=> '')).length);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
