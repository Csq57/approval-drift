const { chromium } = require('playwright');
const URL = 'https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/2026-11-08+17+13';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(10000);
  const frames = page.frames();
  console.log('frames:', frames.length);
  for (const f of frames) console.log(' -', JSON.stringify(f.url()).slice(0, 140));
  const titles = await page.evaluate(() => Array.from(document.querySelectorAll('iframe')).map(i => i.title || i.src.slice(0,80)));
  console.log('iframe titles:', JSON.stringify(titles));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
