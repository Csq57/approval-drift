const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.waitForTimeout(1000);
  const main = await page.locator('main').textContent().catch(async () => await page.textContent('body'));
  console.log('MAIN:', (main||'').replace(/\s+/g,' ').slice(0, 1200));
  const errs = await page.$$eval('.error, .field_with_errors, .error-message, .alert, .flash, li.error', els => els.map(e => e.textContent.replace(/\s+/g,' ').trim()).filter(Boolean).slice(0, 8));
  console.log('ERRORS:', JSON.stringify(errs));
  await page.screenshot({ path: 'shots/dp-final.png', fullPage: true }).catch(()=>{});
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
