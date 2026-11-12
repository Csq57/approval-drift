const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('https://www.airtasker.com/account/portfolio/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = body.indexOf('SONGQUAN');
  console.log('PORTFOLIO PAGE:', body.slice(Math.max(0, i), i + 500));
  const btns = await page.$$eval('button, a', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 30 && /add|create|new|upload|编辑|上傳|添加/i.test(x)));
  console.log('ACTIONS:', JSON.stringify([...new Set(btns)].slice(0, 12)));

  await page.goto('https://www.airtasker.com/account/skills/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  const sk = await page.$$eval('button, a, label', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 40));
  console.log('SKILLS UI:', JSON.stringify([...new Set(sk)].slice(0, 25)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
