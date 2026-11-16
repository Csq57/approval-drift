const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log('PAGES:', pages.length);
  pages.forEach(p => console.log('  ', p.url().slice(0, 85)));

  const page = pages[0] || (await context.newPage());
  await page.goto('https://developer.atlassian.com/console/myapps/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  console.log('AFTER NAV:', page.url().slice(0, 90));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('LOGGED IN?', !/登录以继续|Sign in to continue|Log in to continue/i.test(t));
  console.log('BODY:', t.slice(0, 220));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
