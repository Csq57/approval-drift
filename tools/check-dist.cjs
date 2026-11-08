const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://developer.atlassian.com/console/myapps/78531246-77fd-4df3-b3e6-981bd449e3d9/manage/distribution', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'shots/dist.png', fullPage: true });
  const text = (await page.textContent('body')) || '';
  console.log('STATUS:', (text.match(/Distribution status\s*(\w[\w ]*)/i) || [])[1] || 'unknown');
  const boxes = await page.locator('input[type=checkbox]').count();
  console.log('checkboxes:', boxes);
  const link = text.match(/https:\/\/[^\s]*install[^\s]*/i);
  console.log('install link in page:', link ? link[0] : 'none');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
