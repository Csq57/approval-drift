const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.goto('https://marketplace.atlassian.com/manage/vendors/827077427/addons', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('APPS PAGE:', main.replace(/\n{2,}/g,' | ').slice(0, 600));
  const btns = await page.$$eval('button, a', els => els.map(e => ({ t: (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,32), h: e.getAttribute&&(e.getAttribute('href')||'') })).filter(x => x.t && /create|new app|add app/i.test(x.t + ' ' + x.h)));
  console.log('CREATE CTAs:', JSON.stringify(btns).slice(0, 500));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
