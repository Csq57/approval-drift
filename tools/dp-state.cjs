const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);
  const body = (await page.textContent('body')) || '';
  const loggedIn = !/Log in|Sign up/i.test(body.slice(0, 2000)) || /My projects|Log out|Dashboard/i.test(body);
  console.log('LOGGED_IN:', loggedIn);
  console.log('URL:', page.url());
  const actions = await page.$$eval('a,button', els => els
    .map(e => ({ t: (e.textContent || '').replace(/\s+/g, ' ').trim(), h: e.href || '' }))
    .filter(x => /submit|create|start|project/i.test(x.t) && x.t.length < 45)
    .slice(0, 12));
  console.log(JSON.stringify(actions));
  await page.screenshot({ path: 'shots/dp-1.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
