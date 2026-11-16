const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);

  await page.locator('#releaseSummary-uid1454').fill('Initial release: approval tracking for Confluence with a Rovo agent');
  await page.waitForTimeout(800);

  const lic = page.locator('#react-select-8-input').first();
  await lic.click({ force: true });
  await page.waitForTimeout(2000);
  const opts = await page.$$eval('[role=option]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()));
  console.log('License:', JSON.stringify([...new Set(opts)].slice(0, 8)));

  await page.locator('#documentationUrl-uid1458').fill('https://github.com/Csq57/approval-drift#readme');
  const priv = await page.locator('#privacyUrl-uid1460').inputValue();
  console.log('privacy 现值:', priv);
  if (!priv || priv.length < 20) await page.locator('#privacyUrl-uid1460').fill('https://github.com/Csq57/approval-drift/blob/master/PRIVACY.md');

  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
