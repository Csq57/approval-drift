const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  console.log('URL:', page.url());
  console.log('TITLE:', await page.title());
  const body = (await page.textContent('body')) || '';
  console.log('SNIP:', body.replace(/\s+/g, ' ').slice(0, 300));
  await page.screenshot({ path: 'shots/dp-now.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
