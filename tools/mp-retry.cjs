const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.goto('https://marketplace.atlassian.com/manage/apps/create', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(12000);
    const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
    const blocked = /Couldn.t load compatible products/i.test(main);
    console.log(`attempt ${attempt}: blocked=${blocked}`);
    if (!blocked) { console.log(main.slice(0, 600)); break; }
    const btn = page.getByRole('button', { name: /Next: Make public/i }).first();
    if (await btn.count()) { await btn.click({ force: true }); await page.waitForTimeout(8000); }
    const after = await page.locator('main, [role=main]').first().innerText().catch(() => '');
    console.log(' after click:', after.slice(0, 320).replace(/\n+/g, ' | '));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
