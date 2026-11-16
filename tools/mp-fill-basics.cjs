const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  // 1. tick Confluence
  const conf = page.getByText('Confluence', { exact: true }).first();
  console.log('Confluence 文本节点:', await conf.count());
  await conf.click({ force: true }).catch(async () => {
    const cb = page.locator('input[type=checkbox]').nth(1);
    await cb.check({ force: true });
  });
  await page.waitForTimeout(2000);

  const checked = await page.$$eval('input[type=checkbox]', els => els.map((e,i) => ({ i, checked: e.checked })).filter(x => x.checked));
  console.log('已勾选:', JSON.stringify(checked));

  // 2. app key
  const key = page.locator('#appKey-uid58').first();
  if (await key.count()) { await key.fill('au.csq57.approvaldrift'); await page.waitForTimeout(1500); }
  console.log('App key:', await key.inputValue().catch(() => '?'));

  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  const err = main.match(/(must|invalid|required|error)[^\n]{0,80}/i);
  console.log('校验提示:', err ? err[0] : '(无)');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
