const { chromium } = require('playwright');
const LIST = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions';
const FINAL = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/finalization';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1800 });

  await page.goto(LIST, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const t = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
  console.log('STEPS:', (t.match(/\d\/5 steps done/) || ['?'])[0]);

  await page.goto(FINAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const btn = page.getByRole('button', { name: /Submit project/i }).first();
  await btn.scrollIntoViewIfNeeded();
  await btn.click({ force: true });
  await page.waitForTimeout(10000);
  console.log('after submit URL:', page.url());
  const errs = await page.$$eval('.error, .field_with_errors, .error-message', els => els.map(e => e.textContent.replace(/\s+/g,' ').trim()).slice(0,5));
  console.log('ERRORS:', JSON.stringify(errs));

  await page.goto(LIST, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const t2 = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
  const i = t2.indexOf('Approval drift');
  console.log('LIST SNIP:', t2.slice(Math.max(0,i-160), i+120));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
