const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.airtasker.com/account/edit/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  const links = await page.$$eval('a, button', els => els
    .map(e => ({ t: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30), href: e.getAttribute('href') || '' }))
    .filter(x => x.t && (/(edit|edit profile|view profile|about|skills|简介|编辑)/i.test(x.t) || /\/users\//.test(x.href))));
  console.log('CANDIDATES:', JSON.stringify(links.slice(0, 15)));
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = body.indexOf('SONGQUAN');
  console.log('SNIP:', body.slice(Math.max(0, i - 100), i + 400));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
