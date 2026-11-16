const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('atlassian.com')) || context.pages()[0];
  await page.goto('https://marketplace.atlassian.com/manage/vendors/827077427/details', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  console.log('URL:', page.url().slice(0, 90));
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('VENDOR PAGE:', main.replace(/\n{2,}/g,'\n').slice(0, 700));
  const nav = await page.$$eval('a, button', els => els.map(e => ({ t: (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,35), h: e.getAttribute && (e.getAttribute('href')||'') })).filter(x => x.t && x.t.length < 35).slice(0, 25));
  console.log('NAV:', JSON.stringify([...new Set(nav.map(n => n.t))].slice(0, 20)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
