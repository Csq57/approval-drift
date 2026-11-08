const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const INSTALL = fs.readFileSync(path.join(__dirname, '..', 'install-link.txt'), 'utf8').trim();
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.waitForTimeout(800);

  const ids = await page.$$eval('input:not([type=hidden]):not([type=file]),textarea', els => els.map(e => e.id || e.name).filter(Boolean));
  console.log('IDS:', JSON.stringify(ids));

  await page.locator('#software_video_url').fill('https://youtu.be/UmZMlweUPuQ');
  await page.waitForTimeout(400);
  await page.locator('#software-save').click({ force: true });
  await page.waitForTimeout(7000);
  console.log('after save url:', page.url());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  console.log('video persisted:', JSON.stringify(await page.locator('#software_video_url').inputValue().catch(()=> 'x')));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
