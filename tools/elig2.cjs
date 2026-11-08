const { chromium } = require('playwright');
const SITES = [
  ['Meta VR Start', 'https://start-developer-competition-26.devpost.com/'],
  ['UGREEN AI NAS', 'https://ugreenhackathon.devpost.com/'],
];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  for (const [name, url] of SITES) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000);
      const body = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
      const i = body.indexOf('Who can participate');
      const snip = body.slice(i, i + 420);
      console.log(name, '::', snip);
      console.log('AU_EXCLUDED:', /Australia/i.test(snip));
      console.log('---');
    } catch (e) { console.log(name, 'ERR', e.message.slice(0, 50)); }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
