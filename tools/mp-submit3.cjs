const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  // EULA radio: first "Yes" radio after the EULA label
  const radios = page.locator('input[name=bonTermsSupported]');
  const cnt = await radios.count();
  console.log('EULA radios:', cnt, '| values:', JSON.stringify(await radios.evaluateAll(els => els.map(e => e.value))));
  if (cnt) {
    const yes = page.locator('input[name=bonTermsSupported][value=true]').first();
    if (await yes.count()) { await yes.check({ force: true }); console.log('EULA = Yes'); }
    else { await radios.first().check({ force: true }); console.log('EULA = first'); }
  }
  await page.waitForTimeout(2000);

  const btn = page.getByRole('button', { name: /^Submit$/ }).first();
  console.log('Submit enabled:', await btn.isEnabled().catch(()=>'?'));
  await btn.click({ force: true });
  await page.waitForTimeout(14000);

  console.log('URL:', page.url().slice(0, 130));
  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 6)));
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-after-submit.png', Buffer.from(data, 'base64'));
  console.log('saved');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
