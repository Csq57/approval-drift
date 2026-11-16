const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);

  for (let i = 1; i <= 3; i++) {
    const next = page.getByRole('button', { name: /^Next$/ }).first();
    if (!(await next.count())) { console.log('无 Next，停在第', i, '步'); break; }
    await next.click({ force: true });
    await page.waitForTimeout(9000);
    const dlg = await page.$$eval('[role=dialog]', els => (els[0] ? els[0].textContent : '') || '');
    const t = dlg.replace(/\s+/g, ' ');
    const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
    console.log(`step ${i + 1}: 错误=${JSON.stringify(errs.slice(0,3))} | ${t.slice(0, 220)}`);
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
