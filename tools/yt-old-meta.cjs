const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.youtube.com/watch?v=UmZMlweUPuQ', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);
  const title = await page.locator('h1 yt-formatted-string').first().textContent().catch(() => '');
  console.log('TITLE:', (title || '').trim());
  // expand description
  const more = page.locator('#expand').first();
  if (await more.count()) await more.click({ force: true }).catch(()=>{});
  await page.waitForTimeout(2500);
  const desc = await page.locator('#description-inline-expander').first().textContent().catch(() => '');
  console.log('DESC:', (desc || '').replace(/\s+/g, ' ').slice(0, 900));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
