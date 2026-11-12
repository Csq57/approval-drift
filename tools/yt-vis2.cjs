const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.waitForTimeout(2000);

  const navVis = page.locator('text=Visibility').last();
  console.log('nav Visibility:', await page.locator('text=Visibility').count());
  await navVis.click({ force: true }).catch(() => {});
  await page.waitForTimeout(4000);

  const radios = await page.$$eval('tp-yt-paper-radio-button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,18)));
  console.log('radios:', JSON.stringify(radios));

  const pub = page.locator('tp-yt-paper-radio-button', { hasText: /^Public$/ }).first();
  console.log('public count:', await pub.count());
  if (await pub.count()) { await pub.click({ force: true }); await page.waitForTimeout(3000); console.log('clicked Public'); }

  const save = page.getByRole('button', { name: /^Save$/ }).first();
  if (await save.count()) { await save.click({ force: true }); await page.waitForTimeout(9000); console.log('saved'); }

  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('STATE:', t.slice(0, 180));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
