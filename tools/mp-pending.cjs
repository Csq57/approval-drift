const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.goto('https://marketplace.atlassian.com/manage/apps/1264724096/versions', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(10000);
  const rows = await page.$$eval('tr', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0, 8));
  rows.forEach((r,i) => console.log(' row', i, r.slice(0, 180)));
  const m = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  const pend = m.indexOf('pending');
  console.log('PENDING CTX:', pend > -1 ? m.slice(Math.max(0,pend-160), pend+200).replace(/\n+/g,' | ') : 'none');
  const links = await page.$$eval('a', els => els.map(e => ({ t: (e.textContent||'').trim().slice(0,40), h: e.getAttribute('href')||'' })).filter(x => /review|status|ticket|approval/i.test(x.t + x.h)).slice(0, 6));
  console.log('相关链接:', JSON.stringify(links));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
