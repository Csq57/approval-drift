const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.waitForTimeout(2000);
  await page.locator('text=Visibility').last().click({ force: true }).catch(() => {});
  await page.waitForTimeout(4000);

  const radios = page.locator('tp-yt-paper-radio-button');
  const n = await radios.count();
  for (let i = 0; i < n; i++) {
    const txt = ((await radios.nth(i).textContent()) || '').replace(/\s+/g, ' ').trim();
    console.log(i, JSON.stringify(txt.slice(0, 24)));
  }
  if (n >= 3) {
    await radios.nth(2).click({ force: true });
    await page.waitForTimeout(3000);
    console.log('clicked index 2');
  }
  const save = page.getByRole('button', { name: /^Save$/ }).first();
  if (await save.count()) { await save.click({ force: true }); await page.waitForTimeout(10000); console.log('saved'); }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
