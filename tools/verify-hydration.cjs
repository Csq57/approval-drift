const { chromium } = require('playwright');
const URL = 'https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/Approval+drift+demo';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('one-atlas-csnw')) || context.pages()[0];
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(11000);
  const f = page.frameLocator('iframe[title*="Embedded app content"]');
  const amount = f.locator('#f-amount');
  console.log('A) 加载后 amount =', await amount.inputValue());

  await amount.fill('1850');
  await page.waitForTimeout(2500);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(11000);
  const f2 = page.frameLocator('iframe[title*="Embedded app content"]');
  const a2 = f2.locator('#f-amount');
  console.log('B) 刷新后 amount =', await a2.inputValue());
  console.log('C) 状态 =', ((await f2.locator('#status h2').textContent().catch(()=>'')) || '').trim());

  // 再等一轮，确认没有异步回写把值改回默认
  await page.waitForTimeout(4000);
  console.log('D) 4 秒后 amount =', await a2.inputValue());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
