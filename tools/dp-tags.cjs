const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.waitForTimeout(1000);

  const tag = page.locator('#software_tag_list');
  await tag.scrollIntoViewIfNeeded();
  await tag.click({ force: true });
  await tag.type('Confluence', { delay: 60 });
  await page.waitForTimeout(1500);
  const dropdown = await page.$$eval('.select2-results li, .select2-result-label, ul.select2-results__options li', els => els.map(e => e.textContent.trim()).slice(0, 10));
  console.log('DROPDOWN:', JSON.stringify(dropdown));
  await page.screenshot({ path: 'shots/dp-tags.png' });
  const chips = await page.$$eval('.tag', els => els.map(e => e.textContent.trim()).slice(0, 10));
  console.log('CHIPS:', JSON.stringify(chips));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
