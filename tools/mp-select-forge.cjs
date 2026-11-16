const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();

  const opt = page.locator('[role=option]', { hasText: /^Forge appApps built on/ }).first();
  console.log('Forge app 选项:', await opt.count());
  if (await opt.count()) await opt.click({ force: true });
  else {
    const alt = page.locator('[role=option]').filter({ hasText: 'Forge app' }).first();
    await alt.click({ force: true });
  }
  await page.waitForTimeout(6000);

  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('==== AFTER SELECT ====');
  console.log(main.replace(/\n{2,}/g, '\n').slice(0, 800));
  const selects = await page.$$eval('input[id*=react-select]', els => els.map(e => e.id));
  console.log('SELECTS:', JSON.stringify(selects));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
