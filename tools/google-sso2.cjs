const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('accounts.google.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1500);

  const acct = page.locator('[data-identifier="0814chensongquan@gmail.com"]').first();
  console.log('账号节点:', await acct.count());
  if (await acct.count()) await acct.click({ force: true });
  await page.waitForTimeout(9000);

  console.log('URL:', page.url().slice(0, 110));
  let t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('BODY:', t.slice(0, 240));

  // possible consent screen
  for (const name of [/^(Continue|Allow|允许|继续)$/]) {
    const b = page.getByRole('button', { name }).first();
    if (await b.count()) { await b.click({ force: true }); console.log('clicked consent'); await page.waitForTimeout(9000); }
  }
  console.log('FINAL URL:', page.url().slice(0, 110));
  t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('CONSOLE?', /myapps|Developer Space|Create app|应用/i.test(t));
  console.log('HEAD:', t.slice(0, 260));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
