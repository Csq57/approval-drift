const { chromium } = require('playwright');
const BASE = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1800 });

  await page.goto(`${BASE}/project_details/edit`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  console.log('wizard video:', JSON.stringify(await page.locator('#software_video_url').inputValue().catch(()=> 'x')));
  await page.locator('#software_video_url').fill('https://youtu.be/UmZMlweUPuQ');
  await page.waitForTimeout(300);
  const save = page.getByRole('button', { name: /Save\s*&\s*continue/i }).first();
  await save.scrollIntoViewIfNeeded();
  await save.click({ force: true });
  await page.waitForTimeout(7000);
  console.log('after save:', page.url());

  await page.goto(`${BASE}/project_details/edit`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);
  console.log('video persisted in wizard:', JSON.stringify(await page.locator('#software_video_url').inputValue().catch(()=> 'x')));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
