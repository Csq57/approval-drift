const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(1500);
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log(main.replace(/\n{2,}/g, '\n').slice(0, 1800));
  console.log('=== 表单可见输入 ===');
  const inputs = await page.$$eval('input:not([type=hidden]), textarea', els => els.filter(e => e.offsetWidth || e.offsetHeight).map(e => ({ id: e.id||'', name: e.name||'', type: e.type, val: (e.value||'').slice(0,30) })));
  console.log(JSON.stringify(inputs).slice(0, 700));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
