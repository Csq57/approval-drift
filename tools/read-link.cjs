const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://developer.atlassian.com/console/myapps/78531246-77fd-4df3-b3e6-981bd449e3d9/manage/distribution', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const values = await page.$$eval('input', els => els.map(e => e.value).filter(v => v && /install/i.test(v)));
  console.log('LINK:', values[0] || 'not found');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
