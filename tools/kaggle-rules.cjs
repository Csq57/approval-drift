const { chromium } = require('playwright');
const SITES = [
  ['NFL Big Data Bowl 2027', 'https://www.kaggle.com/competitions/nfl-big-data-bowl-2027/rules'],
  ['Name That LLM', 'https://www.kaggle.com/competitions/name-that-llm/rules'],
];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  for (const [name, url] of SITES) {
    try {
      const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(6000);
      const body = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
      console.log(name, '| status', r && r.status(), '| len', body.length);
      const i = body.toLowerCase().indexOf('eligib');
      console.log('  ELIG:', i > -1 ? body.slice(i, i + 420) : 'not found');
      console.log('  AU:', /australia/i.test(body) ? 'mentions Australia' : 'no AU mention');
    } catch (e) { console.log(name, 'ERR', e.message.slice(0, 60)); }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
