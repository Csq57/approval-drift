const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://devpost.com/submissions', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const rows = t.match(/(Restock[^|]{0,40}|Approval[^|]{0,40}|(Submitted|Draft)[^|]{0,30})/g) || [];
  console.log('SUBMISSIONS PAGE:', rows.slice(0, 12).join(' | '));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
