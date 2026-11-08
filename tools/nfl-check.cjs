const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.kaggle.com/competitions/nfl-big-data-bowl-2027', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  const body = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
  console.log('LEN:', body.length);
  const kws = ['deadline', 'Deadline', 'Prize', 'prize', 'Evaluation', 'metric', 'Timeline', 'January', 'February'];
  for (const k of kws) {
    const i = body.indexOf(k);
    if (i > -1 && i < 12000) console.log(`[${k}]`, body.slice(i, i + 260));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
