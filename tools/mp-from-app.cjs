const { chromium } = require('playwright');
const APP = 'cb87d8c6-a02f-4a6c-a22a-aaefefde5d74';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developer.atlassian.com') || p.url().includes('marketplace')) || context.pages()[0];
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto(`https://developer.atlassian.com/console/myapps/${APP}/distribution`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', main.replace(/\n{2,}/g, '\n').slice(0, 700));
  const links = await page.$$eval('a', els => els.map(e => ({ t: (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40), h: e.getAttribute('href')||'' })).filter(x => /marketplace|listing/i.test(x.h + x.t)));
  console.log('MP LINKS:', JSON.stringify([...new Set(links.map(l => l.h + ' :: ' + l.t))].slice(0, 8)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
