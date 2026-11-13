const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto('https://developer.atlassian.com/console/myapps/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('CONSOLE:', t.slice(0, 500));
  const links = await page.$$eval('a', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x=>x && x.length<40).slice(0, 20));
  console.log('LINKS:', JSON.stringify([...new Set(links)]));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
