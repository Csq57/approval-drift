const { chromium } = require('playwright');
const URL_DETAILS = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/project_details/edit';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.goto(URL_DETAILS, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4500);

  await page.locator('#software_video_url').fill('https://youtu.be/UmZMlweUPuQ');
  await page.waitForTimeout(500);
  const save = page.getByRole('button', { name: /Save\s*&\s*continue/i }).first();
  await save.scrollIntoViewIfNeeded();
  await save.click({ force: true });
  await page.waitForTimeout(9000);
  console.log('url after save:', page.url());
  const errs = await page.$$eval('.error, .field_with_errors, .error-message, .flash', els => els.map(e => e.textContent.replace(/\s+/g,' ').trim()).slice(0,6));
  console.log('ERRORS:', JSON.stringify(errs));
  const body = (await page.textContent('body'))||'';
  const m = body.replace(/\s+/g,' ').match(/(can't be blank|is invalid|required)[^.]{0,60}/gi);
  console.log('MSG:', JSON.stringify(m ? m.slice(0,5) : null));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
