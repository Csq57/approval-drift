const { chromium } = require('playwright');
const FINAL = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/finalization';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(FINAL, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(9000);
  const html = await page.content();
  const i = html.indexOf('Submit project');
  console.log('LEN:', html.length, 'idx:', i);
  console.log('AROUND:', html.slice(Math.max(0, i - 1500), i + 400).replace(/\s+/g, ' ').slice(0, 1800));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
