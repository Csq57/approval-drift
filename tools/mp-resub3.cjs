const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.goto('https://marketplace.atlassian.com/manage/apps/1264724096/privacy-and-security', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(11000);
  const persisted = await page.evaluate(() => {
    const names = ['appStoresEUDOutsideAtlassian','appProcessEUDOutsideAtlassian','logEndUserData','isDataResidencySupported','isAppDataController','isAppBusiness'];
    const out = {};
    names.forEach(n => { const rs = [...document.querySelectorAll(`input[name$="${n}"]`)]; out[n] = rs.findIndex(r => r.checked); });
    return out;
  });
  console.log('持久化:', JSON.stringify(persisted));
  const resub = page.locator('a', { hasText: /^Resubmit$/ }).first();
  console.log('Resubmit:', await resub.count());
  if (await resub.count()) { await resub.click({ force: true }); await page.waitForTimeout(12000); }
  const m = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', m.replace(/\n{2,}/g,' | ').slice(0, 380));
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-resub2.png', Buffer.from(data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
