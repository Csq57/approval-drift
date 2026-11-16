const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();

  const add = page.getByRole('button', { name: /Add product compatibility/i }).first();
  console.log('按钮:', await add.count());
  await add.click({ force: true });
  await page.waitForTimeout(3000);

  const selects = await page.$$eval('select, input[id*=react-select]', els => els.map(e => ({ tag: e.tagName, id: e.id, name: e.name||'' })));
  console.log('控件:', JSON.stringify(selects).slice(0, 500));

  const opts = await page.$$eval('[role=option], select option', els => els.map(e => (e.textContent||e.value||'').trim()).filter(Boolean));
  console.log('可选项:', JSON.stringify([...new Set(opts)].slice(0, 12)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
