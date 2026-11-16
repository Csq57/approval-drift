const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('atlassian.com')) || context.pages()[0];
  await page.goto('https://developer.atlassian.com/console/myapps/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('MYAPPS:', main.replace(/\n{2,}/g,'\n').slice(0, 600));
  const links = await page.$$eval('a', els => els.map(e => ({ t: (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,45), h: e.getAttribute('href')||'' })).filter(x => /\/console\/myapps\//.test(x.h)).slice(0, 10));
  console.log('APP LINKS:', JSON.stringify(links, null, 0).slice(0, 700));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
