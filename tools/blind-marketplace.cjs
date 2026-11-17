const fs = require('fs');
const { chromium } = require('playwright');
const LINK = fs.readFileSync('install-link.txt', 'utf8').trim();
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--incognito'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();

  // 1. Marketplace listing as a stranger
  const r1 = await page.goto('https://marketplace.atlassian.com/apps/1264724096', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  await page.waitForTimeout(8000);
  const mp = await page.evaluate(() => ({
    title: document.title,
    text: (document.body.innerText || '').replace(/\n{2,}/g, '\n').slice(0, 500),
    ctas: [...document.querySelectorAll('a,button')].map(e => (e.textContent || '').trim()).filter(x => x && x.length < 30 && /get|try|install|free|buy/i.test(x)).slice(0, 6),
  }));
  console.log('--- MARKETPLACE (HTTP', r1 && r1.status(), ') ---');
  console.log('title:', mp.title);
  console.log('text:', mp.text.slice(0, 400));
  console.log('CTAs:', JSON.stringify(mp.ctas));
  await page.screenshot({ path: 'shots/blind-marketplace.png' }).catch(() => {});

  // 2. install link as a stranger
  const r2 = await page.goto(LINK, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  await page.waitForTimeout(5000);
  console.log('--- INSTALL LINK (HTTP', r2 && r2.status(), ') ---');
  console.log('final URL:', page.url().slice(0, 100));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
