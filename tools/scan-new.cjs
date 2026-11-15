const { chromium } = require('playwright');
const SITES = [
  ['Reddit Game of the Day', 'https://redditgameofday2026.devpost.com/rules'],
  ['BuildHybridAI', 'https://firebasehybridaihackathon.devpost.com/rules'],
];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  for (const [name, url] of SITES) {
    const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => null);
    await page.waitForTimeout(5000);
    const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    const au = /australia/i.test(t);
    let verdict = 'no AU mention';
    if (au) {
      const i = t.toLowerCase().indexOf('australia');
      const ctx = t.slice(Math.max(0, i - 260), i + 160);
      verdict = /not open to|excluded|ineligible|void/i.test(ctx) ? 'EXCLUDED' : 'check ctx: ' + ctx.slice(0, 200);
    }
    console.log(name, '| HTTP', r && r.status(), '|', verdict);
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
