const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.goto('https://marketplace.atlassian.com/manage/apps/1264724096/privacy-and-security', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(11000);
  const state = await page.evaluate(() => {
    const names = ['appStoresEUDOutsideAtlassian','appProcessEUDOutsideAtlassian','logEndUserData','isDataResidencySupported','isAppDataController','isAppBusiness'];
    const out = {};
    names.forEach(n => {
      const rs = [...document.querySelectorAll(`input[name$="${n}"]`)];
      out[n] = { count: rs.length, checkedIdx: rs.findIndex(r => r.checked) };
    });
    return out;
  });
  console.log('持久化检查:', JSON.stringify(state));
  const btns = await page.$$eval('a, button', els => els.map(e => (e.textContent||'').trim()).filter(x => /save|resubmit/i.test(x) && x.length < 25));
  console.log('按钮:', JSON.stringify([...new Set(btns)]));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
