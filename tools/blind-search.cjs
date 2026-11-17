const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--incognito'] });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('https://marketplace.atlassian.com/search?query=approval%20drift', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);
  const items = await page.$$eval('a', els => els.map(e => ({ t: (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,60), h: e.getAttribute('href')||'' })).filter(x => /\/apps\//.test(x.h)).slice(0, 8));
  console.log('搜索结果:', JSON.stringify(items, null, 1).slice(0, 900));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = t.indexOf('Approval drift');
  console.log('包含 Approval drift:', i > -1, '| 上下文:', i > -1 ? t.slice(Math.max(0,i-80), i+120) : '');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
