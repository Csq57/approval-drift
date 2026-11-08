const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.goto('https://devpost.com/software/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  await page.locator('#software_urls_attributes_0_url').fill('https://github.com/Csq57/approval-drift');
  await page.waitForTimeout(400);
  await page.locator('#software-save').click({ force: true });
  await page.waitForTimeout(7000);
  console.log('after save:', page.url());

  await page.goto('https://devpost.com/software/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);
  console.log('url0 now:', await page.locator('#software_urls_attributes_0_url').inputValue().catch(()=> 'n/a'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
