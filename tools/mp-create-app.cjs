const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  const btn = page.getByRole('button', { name: /^Create app$/ }).first();
  console.log('Create app:', await btn.count());
  await btn.click({ force: true });
  await page.waitForTimeout(9000);

  console.log('URL:', page.url().slice(0, 110));
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', main.replace(/\n{2,}/g,' | ').slice(0, 700));
  const fields = await page.$$eval('input, select, textarea', els => els.map(e => ({ id: e.id||'', name: e.name||'', type: e.type||'', ph: e.placeholder||'' })).filter(f => f.id || f.name).slice(0, 20));
  console.log('FIELDS:', JSON.stringify(fields).slice(0, 800));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
