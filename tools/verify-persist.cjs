const { chromium } = require('playwright');
const URL = 'https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/Approval+drift+demo';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const frame = page.frameLocator('iframe[title*="Embedded app content"]');
  const amount = frame.locator('#f-amount');
  await amount.waitFor({ state: 'visible', timeout: 60000 });
  console.log('1) 首次加载 amount =', await amount.inputValue());

  await amount.fill('1850');
  await page.waitForTimeout(2500);   // debounce is 900ms

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const f2 = page.frameLocator('iframe[title*="Embedded app content"]');
  const a2 = f2.locator('#f-amount');
  await a2.waitFor({ state: 'visible', timeout: 60000 });
  console.log('2) 刷新后 amount =', await a2.inputValue());
  const status = await f2.locator('#status h2').textContent().catch(() => '(none)');
  console.log('3) 状态 =', (status || '').trim());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
