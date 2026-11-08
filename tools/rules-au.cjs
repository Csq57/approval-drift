const { chromium } = require('playwright');
const SITES = [
  ['Meta VR Start', 'https://start-developer-competition-26.devpost.com/rules'],
  ['UGREEN', 'https://ugreenhackathon.devpost.com/rules'],
  ['Kiroween (control)', 'https://kiroween.devpost.com/rules'],
];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  for (const [name, url] of SITES) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(4000);
      const body = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
      const m = body.match(/A(ustralia)/i);
      console.log(name, '| mentions Australia:', !!m);
      if (m) {
        const i = body.toLowerCase().indexOf('australia');
        console.log('   CONTEXT:', body.slice(Math.max(0,i-160), i+120));
      }
    } catch (e) { console.log(name, 'ERR', e.message.slice(0, 50)); }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
