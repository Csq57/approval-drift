const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', 'shots');
const URL_DETAILS = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/project_details/edit';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => !/one-atlas-csnw|kaggle|chatgpt|mail\.google|try\/cloud/.test(p.url())) || context.pages()[0];
  await page.setViewportSize({ width: 1200, height: 1600 });
  await page.goto(URL_DETAILS, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  const choose = page.getByRole('button', { name: /Choose files/i }).first();
  console.log('choose button count:', await page.getByRole('button', { name: /Choose files/i }).count());

  const chooserPromise = page.waitForEvent('filechooser', { timeout: 15000 }).catch(() => null);
  if (await choose.count()) await choose.click({ force: true }).catch(() => {});
  const chooser = await chooserPromise;
  if (chooser) {
    await chooser.setFiles([path.join(ROOT, 'gallery-1-valid.png'), path.join(ROOT, 'gallery-2-stale.png')]);
    console.log('files set via chooser');
    await page.waitForTimeout(12000);
  } else {
    console.log('no filechooser event; falling back to direct input');
    await page.locator('input[type=file]').first().setInputFiles(path.join(ROOT, 'gallery-1-valid.png')).catch(e => console.log('direct failed:', e.message.slice(0,60)));
    await page.waitForTimeout(8000);
  }

  const save = page.getByRole('button', { name: /Save\s*&\s*continue/i }).first();
  await save.scrollIntoViewIfNeeded();
  await save.click({ force: true });
  await page.waitForTimeout(10000);
  console.log('after save:', page.url().slice(-40));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
