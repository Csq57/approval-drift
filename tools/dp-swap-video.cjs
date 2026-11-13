const { chromium } = require('playwright');
const NEW = 'https://youtu.be/SiZS2QPHffs';
const FINAL = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/finalization';
const LIST = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('devpost.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1200, height: 1400 });

  await page.goto('https://devpost.com/software/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  const f = page.locator('#software_video_url');
  console.log('old:', await f.inputValue());
  await f.fill(NEW);
  await page.locator('#software-save').click({ force: true });
  await page.waitForTimeout(8000);
  console.log('saved, url now:', page.url());

  await page.goto('https://devpost.com/software/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  console.log('readback:', await page.locator('#software_video_url').inputValue());

  await page.goto(FINAL, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(6000);
  const box = page.locator('#participants_manage_finalization_accepts_terms');
  if (await box.count() && !(await box.isChecked())) await box.check({ force: true });
  const sub = page.locator('#submission-finalization-form button[type=submit]');
  if (await sub.count()) { await sub.click({ force: true }); await page.waitForTimeout(10000); }

  await page.goto(LIST, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('STATUS:', (t.match(/(Submitted|Draft)\s*\d\/5 steps done/) || ['?'])[0]);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
